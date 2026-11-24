const express = require("express");
const rateLimit = require("express-rate-limit");
const config = require("../config");
const { extractVideoId } = require("../utils/youtube");
const {
  FORMATS,
  createJob,
  getJob,
  publicJob,
  canAcceptJob,
} = require("../services/clipService");

const router = express.Router();

const createLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a minute and try again." },
});

const fmt = s => {
  const t = Math.floor(s);
  const m = Math.floor(t / 60);
  return `${m}m${String(t % 60).padStart(2, "0")}s`;
};

// POST /api/clips  { url, start, end }  ->  202 { id }
router.post("/", createLimiter, (req, res) => {
  const { url, start, end, quality, format } = req.body || {};

  const videoId = extractVideoId(url);
  if (!videoId)
    return res
      .status(400)
      .json({ error: "Please provide a valid YouTube video URL." });

  const s = Number(start);
  const e = Number(end);
  if (!Number.isFinite(s) || !Number.isFinite(e))
    return res
      .status(400)
      .json({ error: "Start and end must be numbers (seconds)." });
  if (s < 0)
    return res.status(400).json({ error: "Start time cannot be negative." });
  if (e <= s)
    return res
      .status(400)
      .json({ error: "End time must be greater than start time." });
  if (e - s > config.maxClipSeconds)
    return res.status(400).json({
      error: `Clips can be at most ${config.maxClipSeconds} seconds long.`,
    });

  const fmtId = format || "mp4";
  if (typeof fmtId !== "string" || !Object.hasOwn(FORMATS, fmtId))
    return res.status(400).json({ error: "Unsupported file format selected." });

  let q = 0; // 0 = best available
  if (
    quality !== undefined &&
    quality !== null &&
    quality !== "" &&
    quality !== "best"
  ) {
    q = Number(quality);
    if (!Number.isInteger(q) || q < 100 || q > 4320)
      return res.status(400).json({ error: "Invalid quality selected." });
  }

  // Reject new jobs when the processing queue is full.
  if (!canAcceptJob()) {
    return res.status(503).json({
      error: "Clipo is currently busy. Please try again later.",
    });
  }

  const job = createJob({
    videoId,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    start: Math.round(s * 100) / 100,
    end: Math.round(e * 100) / 100,
    quality: q,
    format: fmtId,
  });

  res.status(202).json({ id: job.id });
});

// GET /api/clips/:id  ->  job status
router.get("/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job)
    return res.status(404).json({ error: "Clip not found or expired." });
  res.json(publicJob(job));
});

// GET /api/clips/:id/download  ->  the MP4 file
router.get("/:id/download", (req, res) => {
  const job = getJob(req.params.id);
  if (!job || job.status !== "done" || !job.file)
    return res.status(404).json({ error: "Clip not found or not ready." });

  const safeTitle =
    (job.title || "clip")
      .replace(/[^\w\s.-]/g, "")
      .trim()
      .slice(0, 80) || "clip";
  const filename = `${safeTitle} (${fmt(job.start)}-${fmt(job.end)}).${(FORMATS[job.format] || FORMATS.mp4).ext}`;

  res.setHeader("Cache-Control", "no-store");
  res.download(job.file, filename, err => {
    if (err && !res.headersSent)
      res.status(404).json({ error: "File no longer available." });
  });
});

module.exports = router;
