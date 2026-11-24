import { Map, Scissors } from 'lucide-react';
import ClipoLogo from './ClipoLogo.jsx';

export default function AppHeader({ page, onNavigate }) {
  const go = (next) => (event) => {
    event.preventDefault();
    onNavigate(next);
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink-500 bg-ink-900/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-3 py-3 sm:px-5">
        <a href="/" onClick={go('home')} className="min-w-0 focus-visible:outline-none">
          <ClipoLogo compact />
        </a>
        <nav aria-label="Primary navigation" className="flex shrink-0 items-center gap-2">
          <a
            href="/"
            onClick={go('home')}
            aria-current={page === 'home' ? 'page' : undefined}
            className={`hidden border-2 px-3 py-2 font-pixel text-[8px] uppercase transition sm:block ${
              page === 'home'
                ? 'border-arcade-yellow bg-arcade-yellow text-ink-900'
                : 'border-ink-500 text-arcade-text hover:border-arcade-cyan hover:text-arcade-cyan'
            }`}
          >
            Clipper
          </a>
          <a
            href="/roadmap"
            onClick={go('roadmap')}
            aria-current={page === 'roadmap' ? 'page' : undefined}
            className={`flex items-center gap-2 border-2 px-3 py-2 font-pixel text-[8px] uppercase transition ${
              page === 'roadmap'
                ? 'border-arcade-cyan bg-arcade-cyan text-ink-900'
                : 'border-ink-500 text-arcade-text hover:border-arcade-cyan hover:text-arcade-cyan'
            }`}
          >
            {page === 'roadmap' ? <Scissors size={14} /> : <Map size={14} />}
            <span className="hidden sm:inline">{page === 'roadmap' ? 'Back to Clipo' : 'Roadmap'}</span>
            <span className="sm:hidden">{page === 'roadmap' ? 'Back' : 'Map'}</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
