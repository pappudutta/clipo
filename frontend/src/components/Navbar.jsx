import { Scissors, User } from 'lucide-react';

const LINKS = ['API', 'Clips', 'Pricing', 'Privacy', 'Contact Us'];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
            <Scissors size={18} />
          </span>
          <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            Clipo
          </span>
        </a>

        <nav className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l}>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-600"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <button
            aria-label="User profile"
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600 ring-2 ring-white transition hover:bg-brand-500 hover:text-white"
          >
            <User size={18} />
          </button>
        </nav>
      </div>
    </header>
  );
}
