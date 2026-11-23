import { useRef, useState } from 'react';
import { ClipboardPaste } from 'lucide-react';

/**
 * Address box with a PASTE button inside it.
 * onChange(value) fires on every change; onFinal(value) fires after a paste / Enter / blur.
 */
export default function UrlBar({ value, onChange, onFinal, error, big }) {
  const inputRef = useRef(null);
  const [clipError, setClipError] = useState('');

  async function pasteFromClipboard() {
    setClipError('');
    try {
      const text = (await navigator.clipboard.readText()).trim();
      onChange(text);
      onFinal(text);
    } catch {
      setClipError('Clipboard blocked by the browser. Click the box and press Ctrl+V.');
      inputRef.current?.focus();
    }
  }

  const message = clipError || error;

  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          aria-label="YouTube link"
          placeholder="Paste a YouTube link…"
          onChange={(e) => {
            setClipError('');
            onChange(e.target.value);
          }}
          onPaste={(e) => {
            const text = e.clipboardData?.getData('text')?.trim();
            if (text) onFinal(text);
          }}
          onBlur={(e) => onFinal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onFinal(e.target.value)}
          onFocus={(e) => e.target.select()}
          className={`w-full border-2 bg-ink-800 pl-4 pr-32 font-term text-2xl text-arcade-text caret-arcade-cyan shadow-pixel outline-none placeholder:text-arcade-muted/70 ${
            big ? 'h-16' : 'h-12'
          } ${
            message
              ? 'border-arcade-pink'
              : 'border-ink-500 focus:border-arcade-cyan'
          }`}
        />
        <button
          type="button"
          onClick={pasteFromClipboard}
          className={`absolute right-2 flex items-center gap-2 border-2 border-black bg-arcade-yellow px-3 font-pixel text-[10px] uppercase text-ink-900 shadow-pixel-sm transition hover:brightness-110 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
            big ? 'top-3 h-9' : 'top-2 h-7'
          }`}
        >
          <ClipboardPaste size={14} /> Paste
        </button>
      </div>
      {message && <p className="mt-2 text-xl leading-tight text-arcade-pink">{message}</p>}
    </div>
  );
}
