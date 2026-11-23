import { useRef } from 'react';
import { Crosshair } from 'lucide-react';

const digits = (s) => s.replace(/\D/g, '');

/**
 * MM:SS time box with a fixed colon. Click, type digits, done.
 * value is whole seconds; onChange receives whole seconds.
 */
export default function TimeField({ label, value, onChange, onSetNow, invalid, max }) {
  const ssRef = useRef(null);
  const mm = Math.floor(value / 60);
  const ss = value % 60;
  const limit = max > 0 ? max : 359999;
  const emit = (t) => onChange(Math.max(0, Math.min(limit, t)));

  // Keep only the last typed digits so overtyping a padded "05" works naturally
  const onMinutes = (e) => {
    const d = digits(e.target.value).slice(-3);
    emit((d ? Number(d) : 0) * 60 + ss);
  };
  const onSeconds = (e) => {
    const d = digits(e.target.value).slice(-2);
    emit(mm * 60 + Math.min(59, d ? Number(d) : 0));
  };

  const keys = (unit) => (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      emit(value + (e.key === 'ArrowUp' ? 1 : -1) * unit);
    } else if ((e.key === ':' || e.key === '.' || e.key === ',') && unit === 60) {
      e.preventDefault();
      ssRef.current?.focus();
    }
  };

  const field =
    'w-full min-w-0 bg-transparent text-center font-term text-3xl text-arcade-cyan outline-none';
  const grab = {
    onFocus: (e) => e.target.select(),
    onMouseUp: (e) => e.preventDefault(), // keep the selection after clicking in
  };

  return (
    <div>
      <span className="mb-1.5 block font-pixel text-[9px] uppercase text-arcade-muted">{label}</span>
      <div
        className={`flex h-[46px] items-stretch border-2 bg-ink-900 ${
          invalid ? 'border-arcade-pink' : 'border-ink-500 focus-within:border-arcade-cyan'
        }`}
      >
        <input
          type="text"
          inputMode="numeric"
          aria-label={`${label} minutes`}
          value={String(mm).padStart(2, '0')}
          onChange={onMinutes}
          onKeyDown={keys(60)}
          className={`${field} w-12 flex-1`}
          {...grab}
        />
        <span className="select-none self-center font-term text-3xl leading-none text-arcade-muted">
          :
        </span>
        <input
          ref={ssRef}
          type="text"
          inputMode="numeric"
          aria-label={`${label} seconds`}
          value={String(ss).padStart(2, '0')}
          onChange={onSeconds}
          onKeyDown={keys(1)}
          className={`${field} w-10 flex-1`}
          {...grab}
        />
        <button
          type="button"
          title="Use current player time"
          aria-label={`Set ${label} to current time`}
          onClick={onSetNow}
          className="border-l-2 border-ink-500 px-2 text-arcade-muted transition hover:bg-arcade-cyan hover:text-ink-900"
        >
          <Crosshair size={16} />
        </button>
      </div>
    </div>
  );
}
