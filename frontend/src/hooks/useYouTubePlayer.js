import { useCallback, useEffect, useRef, useState } from 'react';

let apiPromise = null;

function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previous) previous();
        resolve(window.YT);
      };
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    });
  }
  return apiPromise;
}

const ERROR_MESSAGES = {
  2: 'Invalid YouTube video ID.',
  5: 'The player hit an HTML5 error. Try reloading.',
  100: 'Video not found or it is private.',
  101: 'The owner disabled embedding for this video, so it cannot be previewed here.',
  150: 'The owner disabled embedding for this video, so it cannot be previewed here.',
};

export function useYouTubePlayer(videoId) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const previewTimer = useRef(null);
  const enabled = Boolean(videoId); // the player container only exists once a video is loaded
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  // Create the player once the container is on screen
  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || playerRef.current || !containerRef.current) return;
      // YT replaces the element we give it, so give it a throwaway child
      const host = document.createElement('div');
      containerRef.current.appendChild(host);
      playerRef.current = new YT.Player(host, {
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => !cancelled && setReady(true),
          onError: (e) =>
            setError(ERROR_MESSAGES[e.data] || 'The video could not be loaded.'),
        },
      });
    });
    return () => {
      cancelled = true;
      clearInterval(previewTimer.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = null;
      setReady(false);
    };
  }, [enabled]);

  // Load a new video whenever the ID changes
  useEffect(() => {
    if (!ready || !videoId) return undefined;
    const player = playerRef.current;
    setError('');
    setDuration(0);
    clearInterval(previewTimer.current);
    player.cueVideoById(videoId);

    let tries = 0;
    const poll = setInterval(() => {
      const d = player.getDuration?.() || 0;
      if (d > 0) {
        setDuration(d);
        clearInterval(poll);
      } else if (++tries > 40) {
        clearInterval(poll);
      }
    }, 500);
    return () => clearInterval(poll);
  }, [ready, videoId]);

  const getCurrentTime = useCallback(() => playerRef.current?.getCurrentTime?.() || 0, []);

  const previewRange = useCallback((start, end) => {
    const p = playerRef.current;
    if (!p) return;
    clearInterval(previewTimer.current);
    p.seekTo(start, true);
    p.playVideo();
    previewTimer.current = setInterval(() => {
      if (p.getCurrentTime() >= end || p.getPlayerState() === 0) {
        p.pauseVideo();
        clearInterval(previewTimer.current);
      }
    }, 150);
  }, []);

  // Jump to a time without starting playback (used while dragging the range bar)
  const seekTo = useCallback((t) => {
    const p = playerRef.current;
    if (!p?.seekTo) return;
    clearInterval(previewTimer.current);
    const state = p.getPlayerState?.();
    p.seekTo(t, true);
    if (state === 5 || state === -1) p.pauseVideo?.(); // cued / unstarted
  }, []);

  return { containerRef, ready, duration, error, getCurrentTime, previewRange, seekTo };
}
