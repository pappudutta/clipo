const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("../config");
const { friendlyYtDlpError } = require("../utils/youtube");

class ClipError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/* --------------------------- cookie configuration ---------------------- */

// backend/src/services/clipService.js
// Two levels up from this file is the backend directory.
const BACKEND_ROOT = path.resolve(__dirname, "../..");

function getCookiesFile() {
  // Support both the existing config property and the requested .env name.
  const configuredPath = config.cookiesFile || process.env.YT_COOKIES_FILE;

  if (!configuredPath) return null;

  // Absolute paths remain absolute.
  // Relative paths are resolved from the backend directory.
  const resolvedPath = path.isAbsolute(configuredPath)
    ? path.normalize(configuredPath)
    : path.resolve(BACKEND_ROOT, configuredPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new ClipError(
      `YouTube cookies file was not found: ${resolvedPath}. Check YT_COOKIES_FILE in backend/.env.`,
      500,
    );
  }

  try {
    fs.accessSync(resolvedPath, fs.constants.R_OK);
  } catch {
    throw new ClipError(
      "YouTube cookies file exists but cannot be read. Check file permissions.",
      500,
    );
  }

  return resolvedPath;
}

/* ------------------------------- formats -------------------------------- */

const FORMATS = {
  mp4: { ext: "mp4", audio: false },
  "mp4-h264": { ext: "mp4", audio: false },
  webm: { ext: "webm", audio: false },
  mkv: { ext: "mkv", audio: false },
  mp3: { ext: "mp3", audio: true },
  m4a: { ext: "m4a", audio: true },
};

/** yt-dlp arguments for a format id. cap = max video height in px (0 = no cap). */

function formatArgs(format, cap) {
  const h = cap > 0 ? `[height<=${cap}]` : "";

  // Prefer YouTube's original audio track.
  // Keep an unfiltered fallback for videos without this metadata.
  const originalAudio = "(ba[language_preference>=?10]/ba)";

  switch (format) {
    case "mp3":
      return [
        "-f",
        `${originalAudio}/b`,
        "-x",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0",
      ];

    case "m4a":
      return [
        "-f",
        "ba[language_preference>=?10][ext=m4a]/ba[language_preference>=?10]/ba[ext=m4a]/ba/b",
        "-x",
        "--audio-format",
        "m4a",
        "--audio-quality",
        "0",
      ];

    case "webm":
      return [
        "-f",
        `bv*${h}[ext=webm]+(ba[language_preference>=?10][ext=webm]/ba[ext=webm])/b${h}[ext=webm]`,
        "-S",
        "res,fps,vcodec:vp9,acodec:opus,br",
        "--merge-output-format",
        "webm",
      ];

    case "mkv":
      return [
        "-f",
        `bv*${h}+${originalAudio}/b${h}`,
        "-S",
        "res,fps,br",
        "--merge-output-format",
        "mkv",
      ];

    case "mp4-h264":
      return [
        "-f",
        `bv*${h}[vcodec^=avc1]+(ba[language_preference>=?10][ext=m4a]/ba[language_preference>=?10]/ba[ext=m4a]/ba)/bv*${h}+ba/b${h}`,
        "-S",
        "res,fps,br",
        "--merge-output-format",
        "mp4",
      ];

    default:
      return [
        "-f",
        `bv*${h}+${originalAudio}/b${h}`,
        "-S",
        "res,fps,br",
        "--merge-output-format",
        "mp4",
      ];
  }
}

const jobs = new Map();
const queue = [];
let running = 0;

/* ---------------------------- process helper ---------------------------- */

function run(cmd, args, { onLine, timeoutMs, maxStorageBytes } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let storageExceeded = false;

    const timer = timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill("SIGKILL");
        }, timeoutMs)
      : null;

    const storageTimer = maxStorageBytes
      ? setInterval(() => {
          try {
            if (getStorageUsageBytes() >= maxStorageBytes) {
              storageExceeded = true;
              child.kill("SIGKILL");
            }
          } catch (err) {
            console.error("[storage monitor]", err);
          }
        }, 500)
      : null;

    const clearTimers = () => {
      if (timer) clearTimeout(timer);
      if (storageTimer) clearInterval(storageTimer);
    };

    const handle = (chunk, isErr) => {
      const output = chunk.toString();

      if (isErr) {
        stderr = (stderr + output).slice(-10000);
      } else {
        stdout += output;
      }

      if (onLine) {
        output.split(/[\r\n]+/).forEach(line => {
          if (line) onLine(line);
        });
      }
    };

    child.stdout.on("data", chunk => handle(chunk, false));
    child.stderr.on("data", chunk => handle(chunk, true));

    child.on("error", err => {
      clearTimers();

      reject(
        err.code === "ENOENT"
          ? new ClipError(`"${cmd}" is not installed or not on PATH.`, 500)
          : err,
      );
    });

    child.on("close", code => {
      clearTimers();

      resolve({
        code,
        stdout,
        stderr,
        timedOut,
        storageExceeded,
      });
    });
  });
}

/* ---------------------------- yt-dlp arguments ------------------------- */

function baseArgs() {
  const args = [
    "--no-playlist",
    "--no-warnings",
    "--no-color",
    "--remote-components",
    "ejs:github",
  ];

  if (config.ffmpegPath) {
    args.push("--ffmpeg-location", config.ffmpegPath);
  }

  // Apply the same cookie file to metadata requests and video downloads.
  const cookiesFile = getCookiesFile();

  if (cookiesFile) {
    args.push("--cookies", cookiesFile);
  }

  return args;
}

/* ------------------------------ video info ------------------------------ */

const infoCache = new Map();
const infoRequests = new Map();
const INFO_TTL_MS = 10 * 60 * 1000;

async function fetchVideoInfo(videoUrl) {
  const hit = infoCache.get(videoUrl);

  if (hit && Date.now() - hit.at < INFO_TTL_MS) {
    return hit.data;
  }

  const { code, stdout, stderr, timedOut } = await run(
    config.ytDlpPath,
    [...baseArgs(), "--skip-download", "-J", videoUrl],
    { timeoutMs: 60_000 },
  );

  if (timedOut) {
    throw new ClipError("Timed out while reading video info.", 504);
  }

  if (code !== 0) {
    throw new ClipError(friendlyYtDlpError(stderr), 422);
  }

  try {
    const info = JSON.parse(stdout);

    const heights = [
      ...new Set(
        (info.formats || [])
          .filter(
            format =>
              format.vcodec && format.vcodec !== "none" && format.height,
          )
          .map(format => format.height),
      ),
    ].sort((a, b) => b - a);

    const data = {
      title: info.title || "YouTube video",
      duration: Number(info.duration) || 0,
      isLive: Boolean(info.is_live) || info.live_status === "is_live",
      heights,
    };

    infoCache.set(videoUrl, {
      at: Date.now(),
      data,
    });

    return data;
  } catch {
    throw new ClipError("Could not read video information.", 502);
  }
}

async function getVideoInfo(videoUrl) {
  const existingRequest = infoRequests.get(videoUrl);

  if (existingRequest) {
    return existingRequest;
  }

  const request = fetchVideoInfo(videoUrl);
  infoRequests.set(videoUrl, request);

  try {
    return await request;
  } finally {
    infoRequests.delete(videoUrl);
  }
}

/* ------------------------------ job handling ---------------------------- */

function publicJob(job) {
  return {
    id: job.id,
    status: job.status,
    progress: Math.round(job.progress),
    videoId: job.videoId,
    title: job.title,
    start: job.start,
    end: job.end,
    size: job.size,
    format: job.format,
    error: job.error,
  };
}

function createJob({
  videoId,
  videoUrl,
  start,
  end,
  quality = 0,
  format = "mp4",
}) {
  const id = crypto.randomUUID();

  const job = {
    id,
    videoId,
    videoUrl,
    start,
    end,
    quality,
    format,
    status: "queued",
    progress: 0,
    title: null,
    size: null,
    error: null,
    file: null,
    createdAt: Date.now(),
    finishedAt: null,
  };

  jobs.set(id, job);
  queue.push(id);
  pump();

  return job;
}

function getJob(id) {
  return jobs.get(id) || null;
}

function canAcceptJob() {
  cleanupExpiredJobs();

  const queueAvailable = running + queue.length < config.maxTotalJobs;

  const storageAvailable = getStorageUsageBytes() < config.maxStorageBytes;

  return queueAvailable && storageAvailable;
}

function pump() {
  while (running < config.maxConcurrentJobs && queue.length) {
    const job = jobs.get(queue.shift());

    if (!job) continue;

    running += 1;

    processJob(job)
      .catch(err => fail(job, err))
      .finally(() => {
        running -= 1;
        pump();
      });
  }
}

function fail(job, err) {
  job.status = "error";

  job.error =
    err instanceof ClipError
      ? err.message
      : "Unexpected server error while cutting the clip.";

  job.finishedAt = Date.now();

  if (!(err instanceof ClipError)) {
    console.error("[job]", job.id, err);
  }

  removeTempFiles(job.id);
}

function removeTempFiles(id) {
  try {
    for (const file of fs.readdirSync(config.clipsDir)) {
      if (file.startsWith(id)) {
        fs.rmSync(path.join(config.clipsDir, file), { force: true });
      }
    }
  } catch {
    // Ignore cleanup errors.
  }
}

function cleanupExpiredJobs(now = Date.now()) {
  for (const [id, job] of jobs) {
    if (job.finishedAt && now - job.finishedAt > config.clipTtlMs) {
      removeTempFiles(id);
      jobs.delete(id);
    }
  }
}

function getStorageUsageBytes() {
  let total = 0;

  for (const file of fs.readdirSync(config.clipsDir)) {
    const filePath = path.join(config.clipsDir, file);

    try {
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        total += stat.size;
      }
    } catch {
      // Ignore files that disappear during inspection.
    }
  }

  return total;
}

/* ------------------------------ process job ----------------------------- */

async function processJob(job) {
  // 1. Validate against real video metadata.
  job.status = "fetching";

  const info = await getVideoInfo(job.videoUrl);
  job.title = info.title;

  if (info.isLive) {
    throw new ClipError("Live streams cannot be clipped.", 422);
  }

  if (info.duration && job.start >= info.duration) {
    throw new ClipError(
      `Start time (${job.start}s) is beyond the video length (${Math.floor(info.duration)}s).`,
    );
  }

  if (info.duration && job.end > info.duration + 1) {
    throw new ClipError(
      `End time (${job.end}s) exceeds the video length (${Math.floor(info.duration)}s).`,
    );
  }

  // 2. Download only the requested section.
  job.status = "downloading";

  const clipLen = job.end - job.start;
  const outTemplate = path.join(config.clipsDir, `${job.id}.%(ext)s`);

  let streamIdx = 0;

  const spec = FORMATS[job.format] || FORMATS.mp4;
  const expectedStreams = spec.audio ? 1 : 2;

  const onLine = line => {
    if (/\[download\]\s+Destination:/.test(line)) {
      streamIdx += 1;
    }

    let frac = null;

    const pct = line.match(/\[download\]\s+([\d.]+)%/);

    const ff = line.match(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/);

    if (pct) {
      frac = parseFloat(pct[1]) / 100;
    } else if (ff) {
      frac = (+ff[1] * 3600 + +ff[2] * 60 + parseFloat(ff[3])) / clipLen;
    }

    if (frac !== null && Number.isFinite(frac)) {
      const idx = Math.max(streamIdx, 1) - 1;

      const overall = ((idx + Math.min(frac, 1)) / expectedStreams) * 95;

      job.progress = Math.max(job.progress, Math.min(overall, 95));
    }
  };

  const args = [
    ...baseArgs(),
    "--newline",
    "--download-sections",
    `*${job.start}-${job.end}`,

    ...(config.accurateCuts && !spec.audio
      ? ["--force-keyframes-at-cuts"]
      : []),

    ...formatArgs(
      job.format,
      Math.min(
        job.quality > 0 ? job.quality : config.maxHeight,
        config.maxHeight,
      ),
    ),

    "--concurrent-fragments",
    "4",
    "--no-mtime",
    "-o",
    outTemplate,
    job.videoUrl,
  ];

  const { code, stderr, timedOut, storageExceeded } = await run(
    config.ytDlpPath,
    args,
    {
      onLine,
      timeoutMs: config.jobTimeoutMs,
      maxStorageBytes: config.maxStorageBytes,
    },
  );

  if (storageExceeded) {
    throw new ClipError(
      "Clipo storage limit reached. Please try again later.",
      507,
    );
  }
  if (timedOut) {
    throw new ClipError("Processing took too long and was cancelled.", 504);
  }

  if (code !== 0) {
    throw new ClipError(friendlyYtDlpError(stderr), 422);
  }

  if (timedOut) {
    throw new ClipError("Processing took too long and was cancelled.", 504);
  }

  if (code !== 0) {
    throw new ClipError(friendlyYtDlpError(stderr), 422);
  }

  // 3. Locate the output.
  const file = path.join(config.clipsDir, `${job.id}.${spec.ext}`);

  if (!fs.existsSync(file)) {
    throw new ClipError("Clip was not produced. Please try again.", 500);
  }

  job.file = file;
  job.size = fs.statSync(file).size;
  job.progress = 100;
  job.status = "done";
  job.finishedAt = Date.now();
}

/* -------------------------------- cleanup ------------------------------- */

function startCleanup() {
  fs.mkdirSync(config.clipsDir, {
    recursive: true,
  });

  // Wipe leftovers from previous runs.
  for (const file of fs.readdirSync(config.clipsDir)) {
    fs.rmSync(path.join(config.clipsDir, file), {
      force: true,
      recursive: true,
    });
  }

  setInterval(() => {
    const now = Date.now();

    for (const [id, job] of jobs) {
      if (job.finishedAt && now - job.finishedAt > config.clipTtlMs) {
        removeTempFiles(id);
        jobs.delete(id);
      }
    }
  }, 60_000).unref();
}

/* --------------------------- dependency check --------------------------- */

async function checkDependencies() {
  const check = async (label, cmd, args) => {
    try {
      const result = await run(cmd, args, { timeoutMs: 15_000 });

      const version = (result.stdout || result.stderr).split("\n")[0];

      console.log(`✔ ${label}: ${version}`);
    } catch {
      console.warn(
        `✖ ${label} not found (looked for "${cmd}"). Install it before cutting clips.`,
      );
    }
  };

  await check("yt-dlp", config.ytDlpPath, ["--version"]);

  let ff = "ffmpeg";

  if (config.ffmpegPath) {
    try {
      ff = fs.statSync(config.ffmpegPath).isDirectory()
        ? path.join(config.ffmpegPath, "ffmpeg")
        : config.ffmpegPath;
    } catch {
      // Fall back to PATH.
    }
  }

  await check("ffmpeg", ff, ["-version"]);

  // Report cookie configuration without exposing cookie contents.
  try {
    const cookiesFile = getCookiesFile();

    if (cookiesFile) {
      console.log("✔ YouTube cookies: configured and readable");
    } else {
      console.warn(
        "⚠ YouTube cookies: not configured. Some YouTube videos may require authentication.",
      );
    }
  } catch (err) {
    console.error(`✖ YouTube cookies: ${err.message}`);
  }
}

module.exports = {
  FORMATS,
  getVideoInfo,
  createJob,
  getJob,
  publicJob,
  startCleanup,
  checkDependencies,
  canAcceptJob,
  ClipError,
};
