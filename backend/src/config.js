const path = require("path");
const dotenv = require("dotenv");

const BACKEND_ROOT = path.resolve(__dirname, "..");

// Load environment variables from backend/.env
dotenv.config({
  path: path.join(BACKEND_ROOT, ".env"),
});

// Resolve cookies path relative to the backend folder
const cookieSetting = process.env.YT_COOKIES_FILE || "";

const cookiesFile = cookieSetting
  ? path.isAbsolute(cookieSetting)
    ? path.normalize(cookieSetting)
    : path.resolve(BACKEND_ROOT, cookieSetting)
  : "";

module.exports = {
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  // Temporary clips directory
  clipsDir: path.resolve(BACKEND_ROOT, "clips"),

  // Binaries
  ytDlpPath: process.env.YT_DLP_PATH || "yt-dlp",
  ffmpegPath: process.env.FFMPEG_PATH || "",

  // YouTube cookies
  cookiesFile,

  // Limits
  maxClipSeconds: Number(process.env.MAX_CLIP_SECONDS) || 600,
  maxHeight: Number(process.env.MAX_HEIGHT) || 1080,
  accurateCuts: process.env.ACCURATE_CUTS === "1",
  maxConcurrentJobs: Number(process.env.MAX_CONCURRENT_JOBS) || 1,
  maxTotalJobs: Math.max(1, Number(process.env.MAX_TOTAL_JOBS) || 2),
  maxStorageBytes:
    (Number(process.env.MAX_STORAGE_GB) || 2) * 1024 * 1024 * 1024,
  maxStorageBytes:
    (Number(process.env.MAX_STORAGE_GB) || 2) * 1024 * 1024 * 1024,
  jobTimeoutMs: (Number(process.env.JOB_TIMEOUT_MINUTES) || 20) * 60 * 1000,

  // Automatic cleanup
  clipTtlMs: (Number(process.env.CLIP_TTL_MINUTES) || 60) * 60 * 1000,
};
