import { ChevronDown } from 'lucide-react';

export default function PixelSelect({ label, value, onChange, disabled, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-pixel text-[9px] uppercase text-arcade-muted">{label}</span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-[46px] w-full cursor-pointer appearance-none truncate border-2 border-ink-500 bg-ink-900 pl-3 pr-9 font-term text-2xl text-arcade-text outline-none focus:border-arcade-cyan disabled:cursor-not-allowed disabled:opacity-50"
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-arcade-cyan"
        />
      </div>
    </label>
  );
}
