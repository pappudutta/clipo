import { Crosshair } from 'lucide-react';

export default function TimeInput({ label, value, onChange, onSetNow, invalid }) {
  return (
    <label className="block flex-1">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="flex">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0 or 0:00"
          className={`w-full min-w-0 rounded-l-lg border bg-slate-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 ${
            invalid
              ? 'border-red-500 focus:ring-red-500/40'
              : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500/40'
          }`}
        />
        <button
          type="button"
          title="Use current player time"
          onClick={onSetNow}
          className="rounded-r-lg border border-l-0 border-slate-700 bg-slate-700 px-3 text-slate-300 transition hover:bg-brand-600 hover:text-white"
        >
          <Crosshair size={16} />
        </button>
      </div>
    </label>
  );
}
