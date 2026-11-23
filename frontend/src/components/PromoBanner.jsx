import { Sparkles } from 'lucide-react';

export default function PromoBanner() {
  return (
    <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-4 py-4 text-center text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 sm:flex-row">
        <Sparkles size={20} className="hidden sm:block" />
        <p className="text-sm font-extrabold uppercase tracking-wide sm:text-base">
          Unlock 4K clips! Sign up today and enjoy a 7-day free trial.
        </p>
        <button className="rounded-full bg-white px-5 py-1.5 text-sm font-bold text-brand-700 shadow transition hover:bg-brand-50">
          Start free trial
        </button>
      </div>
    </div>
  );
}
