import ClipoLogo from './ClipoLogo.jsx';

const externalLinks = [
  ['Portfolio', 'https://pappudutta.netlify.app/'],
  ['GitHub Profile', 'https://github.com/pappudutta'],
  ['Source Code', 'https://github.com/pappudutta/clipo'],
  ['Report an Issue', 'https://github.com/pappudutta/clipo/issues'],
];

export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-ink-500 bg-ink-800">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:px-6 md:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
        <div>
          <ClipoLogo />
          <p className="mt-4 max-w-xl text-xl leading-relaxed text-arcade-muted">
            A local-first video clipping tool built to make creating and exporting video segments simple.
          </p>
          <p className="mt-5 font-pixel text-[8px] uppercase text-arcade-muted">
            © {year} Clipo. Built for local workflows.
          </p>
        </div>
        <div>
          <h2 className="font-pixel text-[9px] uppercase text-arcade-yellow">Project links</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            {externalLinks.map(([label, href]) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-arcade-text transition hover:text-arcade-cyan focus-visible:text-arcade-cyan"
                >
                  {label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href="/roadmap"
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate('roadmap');
                }}
                className="text-xl text-arcade-text transition hover:text-arcade-cyan focus-visible:text-arcade-cyan"
              >
                Roadmap &amp; Contribute
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
