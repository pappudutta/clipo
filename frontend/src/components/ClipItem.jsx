import { CircleAlert, CloudDownload, Film } from 'lucide-react';
import { useState } from 'react';
import { downloadUrl } from '../lib/api.js';
import { formatBytes, formatTime } from '../lib/time.js';

const STATUS_LABEL = {
  queued: 'QUEUED',
  fetching: 'READING INFO',
  downloading: 'CUTTING',
};

export default function ClipItem({ clip }) {
  const [imgFailed, setImgFailed] = useState(false);
  const processing = !['done', 'error'].includes(clip.status);

  return (
    <li className="border-2 border-ink-500 bg-ink-900 p-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-[45px] w-20 shrink-0 items-center justify-center overflow-hidden border-2 border-ink-500 bg-ink-700 text-arcade-muted">
          {!imgFailed ? (
            <img
              src={`https://i.ytimg.com/vi/${clip.videoId}/mqdefault.jpg`}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <Film size={20} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl leading-none text-arcade-text">
            Clip {clip.number} - {formatTime(clip.start)}
          </p>
          <p className="mt-1 truncate text-lg leading-none text-arcade-muted">
            {clip.videoTitle || 'YouTube video'}
          </p>
          <p className="mt-1 truncate text-lg leading-none text-arcade-cyan">
            {clip.meta}
            {clip.status === 'done' && ` · ${formatBytes(clip.size)}`}
          </p>
        </div>

        {clip.status === 'done' && (
          <a
            href={downloadUrl(clip.jobId)}
            download
            title="Download"
            aria-label="Download clip"
            className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-arcade-yellow text-ink-900 shadow-pixel-sm transition hover:brightness-110 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <CloudDownload size={20} />
          </a>
        )}
        {clip.status === 'error' && (
          <CircleAlert size={22} className="shrink-0 text-arcade-pink" />
        )}
      </div>

      {processing && (
        <div className="mt-2.5">
          <div className="h-4 overflow-hidden border-2 border-ink-500 bg-ink-800 p-[2px]">
            {clip.progress > 0 ? (
              <div
                className="pixel-blocks h-full transition-all duration-500"
                style={{ width: `${clip.progress}%` }}
              />
            ) : (
              <div className="pixel-blocks animate-indeterminate h-full w-1/3" />
            )}
          </div>
          <div className="mt-1.5 flex justify-between font-pixel text-[8px] uppercase text-arcade-muted">
            <span>{STATUS_LABEL[clip.status] || 'WORKING'}</span>
            {clip.progress > 0 && <span>{clip.progress}%</span>}
          </div>
        </div>
      )}

      {clip.status === 'error' && (
        <p className="mt-2 border-2 border-arcade-pink bg-arcade-pink/10 px-2 py-1 text-lg leading-tight text-arcade-pink">
          {clip.error}
        </p>
      )}
    </li>
  );
}
