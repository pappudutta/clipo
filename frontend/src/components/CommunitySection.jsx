import { ArrowRight, Code2, HeartHandshake } from 'lucide-react';

const opportunities = [
  'Improve the user interface',
  'Fix bugs and improve reliability',
  'Propose useful features',
  'Improve documentation and testing',
];

export default function CommunitySection({ onNavigate }) {
  return (
    <section className="border-t-2 border-ink-500 bg-ink-800 px-4 py-14 sm:px-6" aria-labelledby="community-title">
      <div className="mx-auto grid max-w-7xl gap-8 border-2 border-ink-500 bg-ink-900 p-5 shadow-pixel sm:p-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-4 flex items-center gap-3 text-arcade-cyan">
            <HeartHandshake size={24} aria-hidden="true" />
            <span className="font-pixel text-[9px] uppercase">Open source</span>
          </div>
          <h2 id="community-title" className="font-pixel text-lg leading-relaxed text-arcade-yellow sm:text-xl">
            Help Build Clipo
          </h2>
          <p className="mt-5 max-w-2xl text-2xl leading-relaxed text-arcade-text">
            Clipo is an evolving open-source project. Developers, designers, testers and documentation contributors are welcome to help improve it.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://github.com/pappudutta/clipo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 border-2 border-black bg-arcade-yellow px-4 font-pixel text-[9px] uppercase text-ink-900 shadow-pixel-sm transition hover:brightness-110 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <Code2 size={16} /> Contribute on GitHub
            </a>
            <a
              href="/roadmap"
              onClick={(event) => {
                event.preventDefault();
                onNavigate('roadmap');
              }}
              className="flex h-12 items-center justify-center gap-2 border-2 border-arcade-cyan px-4 font-pixel text-[9px] uppercase text-arcade-cyan transition hover:bg-arcade-cyan hover:text-ink-900"
            >
              Explore the Roadmap <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <ul className="grid content-center gap-3">
          {opportunities.map((item) => (
            <li key={item} className="border-l-2 border-arcade-pink bg-ink-800 px-4 py-3 text-xl text-arcade-text">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
