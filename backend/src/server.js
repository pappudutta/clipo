const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const clipsRouter = require('./routes/clips');
const videoRouter = require('./routes/video');
const { startCleanup, checkDependencies } = require('./services/clipService');

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/clips', clipsRouter);
app.use('/api/video', videoRouter);

// In production, serve the built React app from the same server
const dist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// 404 for unknown API routes
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed')
    return res.status(400).json({ error: 'Invalid JSON body.' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

startCleanup();
app.listen(config.port, async () => {
  console.log(`Clipo API listening on http://localhost:${config.port}`);
  await checkDependencies();
});
