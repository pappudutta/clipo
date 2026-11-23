const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, options);
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status}).`);
  return data;
}

/** quality: 'best' or a max height in px. format: a key from lib/formats.js */
export function createClip({ url, start, end, quality, format }) {
  return request('/api/clips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, start, end, quality, format }),
  });
}

export function getClip(id) {
  return request(`/api/clips/${id}`);
}

/** Returns { title, duration, heights: [2160, 1080, ...] } */
export function getFormats(videoId) {
  return request(`/api/video/${videoId}/formats`);
}

export const downloadUrl = (id) => `${BASE}/api/clips/${id}/download`;
