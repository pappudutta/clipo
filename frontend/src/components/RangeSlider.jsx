import { useEffect, useRef, useState } from 'react';
import { formatMMSS } from '../lib/time.js';

const HIT = 14; // px: how close a press must be to grab a handle

/**
 * Drag bar to pick the clip range.
 *  - drag a handle to move the start or end
 *  - drag the cyan bar to move the whole selection
 *  - click an empty spot to move the nearest handle there
 * start / end are whole seconds. onChange(start, end, which)
 */
export default function RangeSlider({ duration, start, end, onChange, getCurrentTime }) {
  const trackRef = useRef(null);
  const drag = useRef(null);
  const [now, setNow] = useState(0);
  const active = duration > 0;

  // playhead
  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => setNow(getCurrentTime()), 250);
    return () => clearInterval(id);
  }, [active, getCurrentTime]);

  const s = Math.min(start, end);
  const e = Math.max(start, end);
  const pct = (t) => (active ? Math.min(100, Math.max(0, (t / duration) * 100)) : 0);

  const timeAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return Math.round(f * duration);
  };

  function apply(mode, t) {
    if (mode === 'start') onChange(Math.max(0, Math.min(t, e - 1)), e, 'start');
    else if (mode === 'end') onChange(s, Math.min(duration, Math.max(t, s + 1)), 'end');
    else {
      const len = drag.current.len;
      const ns = Math.max(0, Math.min(t - drag.current.offset, duration - len));
      onChange(ns, ns + len, 'range');
    }
  }

  function onPointerDown(ev) {
    if (!active) return;
    ev.preventDefault();
    const r = trackRef.current.getBoundingClientRect();
    const x = ev.clientX - r.left;
    const sx = (s / duration) * r.width;
    const ex = (e / duration) * r.width;
    const ds = Math.abs(x - sx);
    const de = Math.abs(x - ex);
    const t = timeAt(ev.clientX);

    let mode;
    if (ds <= HIT || de <= HIT) mode = ds <= de ? 'start' : 'end';
    else if (x > sx && x < ex) mode = 'range';
    else mode = ds < de ? 'start' : 'end';

    drag.current = { mode, offset: t - s, len: e - s };
    ev.currentTarget.setPointerCapture(ev.pointerId);
    apply(mode, t);
  }

  const onPointerMove = (ev) => {
    if (drag.current) apply(drag.current.mode, timeAt(ev.clientX));
  };
  const endDrag = () => {
    drag.current = null;
  };

  const onKey = (which) => (ev) => {
    const step = ev.shiftKey ? 10 : 1;
    let d = 0;
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') d = -step;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') d = step;
    if (!d) return;
    ev.preventDefault();
    if (which === 'start') onChange(Math.max(0, Math.min(s + d, e - 1)), e, 'start');
    else onChange(s, Math.min(duration, Math.max(e + d, s + 1)), 'end');
  };

  const handle = (which, t) => (
    <div
      key={which}
      role="slider"
      tabIndex={0}
      aria-label={which === 'start' ? 'Clip start' : 'Clip end'}
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={t}
      aria-valuetext={formatMMSS(t)}
      onKeyDown={onKey(which)}
      className="absolute top-1/2 h-9 w-4 -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-arcade-yellow shadow-pixel-sm"
      style={{ left: `${pct(t)}%` }}
    >
      <span className="absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 bg-black/60" />
    </div>
  );

  return (
    <div>
      <div className="mx-2">
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`relative h-11 select-none ${active ? 'cursor-pointer' : 'opacity-50'}`}
          style={{ touchAction: 'none' }}
        >
          <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 border-2 border-ink-500 bg-ink-900" />
          {active && (
            <>
              <div
                className="pixel-blocks absolute top-1/2 h-3 -translate-y-1/2 bg-arcade-cyan/90"
                style={{ left: `${pct(s)}%`, width: `${Math.max(0.4, pct(e) - pct(s))}%` }}
              />
              <div
                className="absolute bottom-1 top-1 w-0.5 bg-arcade-pink"
                style={{ left: `${pct(now)}%` }}
              />
              {handle('start', s)}
              {handle('end', e)}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-xl leading-none text-arcade-muted">
        <span>00:00</span>
        <span className="text-arcade-cyan">CLIP {formatMMSS(e - s)}</span>
        <span>{active ? formatMMSS(duration) : '--:--'}</span>
      </div>
    </div>
  );
}
