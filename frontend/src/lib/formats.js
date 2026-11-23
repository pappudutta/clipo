// Must match the keys of FORMATS in backend/src/services/clipService.js
export const FORMATS = [
  { id: 'mp4', label: 'MP4 · Best quality', short: 'MP4', audio: false },
  { id: 'mp4-h264', label: 'MP4 · H.264 (compatible)', short: 'MP4 H.264', audio: false },
  { id: 'webm', label: 'WebM · VP9 + Opus', short: 'WEBM', audio: false },
  { id: 'mkv', label: 'MKV · Best (any codec)', short: 'MKV', audio: false },
  { id: 'mp3', label: 'MP3 · Audio only', short: 'MP3', audio: true },
  { id: 'm4a', label: 'M4A · Audio only', short: 'M4A', audio: true },
];

export const getFormat = (id) => FORMATS.find((f) => f.id === id) || FORMATS[0];
