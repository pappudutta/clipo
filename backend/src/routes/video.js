const express = require('express');
const rateLimit = require('express-rate-limit');
const { getVideoInfo, ClipError } = require('../services/clipService');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a minute and try again.' },
});

// GET /api/video/:id/formats -> { title, duration, heights: [2160, 1440, 1080, ...] }
router.get('/:id/formats', limiter, async (req, res) => {
  const id = req.params.id;
  if (!/^[\w-]{11}$/.test(id)) return res.status(400).json({ error: 'Invalid video ID.' });
  try {
    const info = await getVideoInfo(`https://www.youtube.com/watch?v=${id}`);
    res.json({ title: info.title, duration: info.duration, heights: info.heights });
  } catch (err) {
    const known = err instanceof ClipError;
    res
      .status(known ? err.status : 500)
      .json({ error: known ? err.message : 'Could not read video information.' });
  }
});

module.exports = router;
