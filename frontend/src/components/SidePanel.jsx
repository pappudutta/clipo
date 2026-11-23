import { Scissors, X } from 'lucide-react';
import ClipItem from './ClipItem.jsx';

/** Clips list. A fixed column on large screens, a slide-over drawer on small ones. */
export default function SidePanel({ clips, open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/70 lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-30 flex w-[min(92vw,360px)] flex-col border-l-2 border-ink-500 bg-ink-800 transition-transform duration-200 lg:static lg:z-auto lg:w-80 lg:shrink-0 lg:translate-x-0 lg:border-2 lg:shadow-pixel ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b-2 border-ink-500 px-3 py-3">
          <h2 className="font-pixel text-[10px] uppercase text-arcade-yellow">
            Clips{clips.length > 0 && <span className="ml-2 text-arcade-cyan">{clips.length}</span>}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close clips"
            className="text-arcade-muted hover:text-arcade-text lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {clips.length === 0 ? (
            <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-3 text-center text-arcade-muted">
              <Scissors size={32} />
              <p className="font-pixel text-[9px] uppercase leading-relaxed">
                No clips yet
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {clips.map((c) => (
                <ClipItem key={c.localId} clip={c} />
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
