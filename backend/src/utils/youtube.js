/**
 * Extracts an 11-char video ID from the common YouTube URL formats.
 * Returns null if the input is not a valid YouTube video URL.
 */
function extractVideoId(input) {
  if (typeof input !== 'string' || !input.trim()) return null;
  const raw = input.trim();
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withScheme);
    const host = url.hostname.replace(/^(www|m)\./, '');
    let id = null;

    if (host === 'youtu.be') {
      id = url.pathname.slice(1).split('/')[0];
    } else if (host === 'youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') {
        id = url.searchParams.get('v');
      } else {
        const m = url.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]{11})/);
        if (m) id = m[2];
      }
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Turns noisy yt-dlp stderr into a message safe to show to users. */
function friendlyYtDlpError(stderr = '') {
  const s = String(stderr);
  if (/requested format is not available/i.test(s))
    return 'That format or quality is not available for this video. Try another one.';
  if (/private video/i.test(s)) return 'This video is private.';
  if (/confirm your age|age-restricted|inappropriate for some users/i.test(s))
    return 'This video is age-restricted and cannot be processed.';
  if (/not a bot|sign in to confirm/i.test(s))
    return 'YouTube requested bot verification. Set YT_COOKIES_FILE on the server and retry.';
  if (/video unavailable|has been removed|no longer available|does not exist/i.test(s))
    return 'This video is unavailable or has been removed.';
  if (/not available in your country|blocked it in your country|geo/i.test(s))
    return 'This video is not available in the server’s region.';
  if (/live event|is live|premiere/i.test(s))
    return 'Live streams and premieres cannot be clipped until they finish.';
  if (/ffmpeg|ffprobe/i.test(s) && /not found|not installed/i.test(s))
    return 'FFmpeg is not installed on the server.';

  const line = s.split('\n').reverse().find((l) => l.includes('ERROR'));
  return line
    ? line.replace(/^.*ERROR:\s*/, '').slice(0, 200)
    : 'Could not process this video. Please try again.';
}

module.exports = { extractVideoId, friendlyYtDlpError };
