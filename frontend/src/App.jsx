import { useEffect, useRef, useState } from 'react';
import { List } from 'lucide-react';
import AppHeader from './components/AppHeader.jsx';
import CommunitySection from './components/CommunitySection.jsx';
import Footer from './components/Footer.jsx';
import RoadmapPage from './components/RoadmapPage.jsx';
import UrlBar from './components/UrlBar.jsx';
import PlayerPanel from './components/PlayerPanel.jsx';
import SidePanel from './components/SidePanel.jsx';
import { useYouTubePlayer } from './hooks/useYouTubePlayer.js';
import { createClip, getClip, getFormats } from './lib/api.js';
import { getFormat } from './lib/formats.js';
import { extractVideoId, formatTime } from './lib/time.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FALLBACK_HEIGHTS = [2160, 1440, 1080, 720, 480, 360];

export default function App() {
  const routeForPath = () => window.location.pathname === '/roadmap' ? 'roadmap' : 'home';
  const [page, setPage] = useState(routeForPath);
  const [urlInput, setUrlInput] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [urlError, setUrlError] = useState('');

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(30);
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('best');
  const [heights, setHeights] = useState([]);
  const [qualityLoading, setQualityLoading] = useState(false);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [clips, setClips] = useState([]);
  const [clipsOpen, setClipsOpen] = useState(false);
  const counter = useRef(0);
  const seekTimer = useRef(null);

  const { containerRef, duration, error: playerError, getCurrentTime, previewRange, seekTo } =
    useYouTubePlayer(videoId);

  const fmt = getFormat(format);

  useEffect(() => {
    const onPopState = () => setPage(routeForPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (next) => {
    const path = next === 'roadmap' ? '/roadmap' : '/';
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ------------------------------ URL handling ----------------------------- */

  // Every keystroke / paste: as soon as the link is valid, load it automatically
  function handleUrlChange(value) {
    setUrlInput(value);
    const id = extractVideoId(value);
    if (id) {
      setUrlError('');
      if (id !== videoId) {
        setVideoId(id);
        setFormError('');
      }
    }
  }

  // After paste / Enter / blur: complain only if there is text and it is not valid
  function handleUrlFinal(value) {
    const v = value.trim();
    if (v && !extractVideoId(v)) setUrlError('That doesn’t look like a valid YouTube video link.');
  }

  /* --------------------------- per-video set up ---------------------------- */

  // Default selection once the real duration is known
  useEffect(() => {
    if (duration > 0) {
      setStart(0);
      setEnd(Math.min(30, Math.floor(duration)));
    }
  }, [duration, videoId]);

  // Which resolutions does this video really offer?
  useEffect(() => {
    if (!videoId) return undefined;
    let cancelled = false;
    setQuality('best');
    setHeights([]);
    setQualityLoading(true);
    getFormats(videoId)
      .then((d) => !cancelled && setHeights(d.heights?.length ? d.heights : FALLBACK_HEIGHTS))
      .catch(() => !cancelled && setHeights(FALLBACK_HEIGHTS))
      .finally(() => !cancelled && setQualityLoading(false));
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  /* ------------------------------ time controls ---------------------------- */

  const queueSeek = (t) => {
    clearTimeout(seekTimer.current);
    seekTimer.current = setTimeout(() => seekTo(t), 80);
  };

  // From the drag bar
  function handleRange(s, e, which) {
    setStart(s);
    setEnd(e);
    queueSeek(which === 'end' ? Math.max(0, e - 1) : s);
  }

  const clampTime = (t) => Math.max(0, duration > 0 ? Math.min(duration, t) : t);
  function handleStartChange(v) {
    setStart(clampTime(v));
    queueSeek(clampTime(v));
  }
  function handleEndChange(v) {
    setEnd(clampTime(v));
    queueSeek(Math.max(0, clampTime(v) - 1));
  }
  const setStartNow = () => handleStartChange(Math.floor(getCurrentTime()));
  const setEndNow = () => handleEndChange(Math.floor(getCurrentTime()));

  const handlePreview = () => end > start && previewRange(start, end);

  /* --------------------------------- cutting ------------------------------- */

  const patchClip = (localId, patch) =>
    setClips((list) => list.map((c) => (c.localId === localId ? { ...c, ...patch } : c)));

  async function pollJob(localId, jobId) {
    let failures = 0;
    for (;;) {
      await sleep(1000);
      try {
        const job = await getClip(jobId);
        failures = 0;
        patchClip(localId, {
          status: job.status,
          progress: job.progress,
          size: job.size,
          error: job.error,
          videoTitle: job.title,
        });
        if (job.status === 'done' || job.status === 'error') return;
      } catch (err) {
        failures += 1;
        if (failures >= 3) {
          patchClip(localId, { status: 'error', error: err.message });
          return;
        }
      }
    }
  }

  async function handleSubmit() {
    setFormError('');
    if (!videoId) return;
    if (end <= start) return setFormError('End time must be after the start time.');
    if (duration && start >= duration)
      return setFormError(`Start is beyond the video length (${formatTime(duration)}).`);
    if (duration && end > duration + 0.5)
      return setFormError(`End exceeds the video length (${formatTime(duration)}).`);

    counter.current += 1;
    const localId = `local-${counter.current}`;
    const q = fmt.audio ? 'best' : quality;
    const meta = fmt.audio ? fmt.short : `${q === 'best' ? 'BEST' : `${q}p`} ${fmt.short}`;

    setClips((list) => [
      {
        localId,
        number: counter.current,
        jobId: null,
        videoId,
        videoTitle: null,
        start,
        end,
        meta,
        status: 'queued',
        progress: 0,
        size: null,
        error: null,
      },
      ...list,
    ]);
    setClipsOpen(true); // slide-over on small screens; the column is always visible on large ones
    setSubmitting(true);

    try {
      const { id } = await createClip({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        start,
        end,
        quality: q,
        format,
      });
      patchClip(localId, { jobId: id });
      setSubmitting(false);
      await pollJob(localId, id);
    } catch (err) {
      patchClip(localId, { status: 'error', error: err.message });
      setSubmitting(false);
    }
  }

  /* --------------------------------- layout -------------------------------- */

  const home = (
    <main className="flex flex-1 flex-col">
      {/* One address box: centered on its own at first, pinned to the top once a video loads */}
      <div
        className={
          videoId
            ? 'flex shrink-0 items-start gap-3 p-3 pb-2'
            : 'flex min-h-[calc(100dvh-4rem)] items-center justify-center p-4'
        }
      >
        <div className={videoId ? 'min-w-0 flex-1' : 'w-full max-w-xl'}>
          <UrlBar
            value={urlInput}
            onChange={handleUrlChange}
            onFinal={handleUrlFinal}
            error={urlError}
            big={!videoId}
          />
        </div>
        {videoId && (
          <button
            onClick={() => setClipsOpen(true)}
            className="flex h-12 shrink-0 items-center gap-2 border-2 border-arcade-yellow px-3 font-pixel text-[10px] uppercase text-arcade-yellow transition hover:bg-arcade-yellow hover:text-ink-900 lg:hidden"
          >
            <List size={16} /> {clips.length}
          </button>
        )}
      </div>

      {videoId && (
        <div className="flex min-h-[650px] flex-1 gap-4 p-3 pt-1">
          <PlayerPanel
            containerRef={containerRef}
            playerError={playerError}
            duration={duration}
            start={start}
            end={end}
            onRange={handleRange}
            onStartChange={handleStartChange}
            onEndChange={handleEndChange}
            onSetStartNow={setStartNow}
            onSetEndNow={setEndNow}
            getCurrentTime={getCurrentTime}
            format={format}
            onFormatChange={setFormat}
            isAudio={fmt.audio}
            quality={quality}
            onQualityChange={setQuality}
            qualityOptions={heights}
            qualityLoading={qualityLoading}
            onPreview={handlePreview}
            onSubmit={handleSubmit}
            submitting={submitting}
            formError={formError}
          />
          <SidePanel clips={clips} open={clipsOpen} onClose={() => setClipsOpen(false)} />
        </div>
      )}
      <CommunitySection onNavigate={navigate} />
    </main>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader page={page} onNavigate={navigate} />
      {page === 'roadmap' ? <RoadmapPage onNavigate={navigate} /> : home}
      <Footer onNavigate={navigate} />
    </div>
  );
}
