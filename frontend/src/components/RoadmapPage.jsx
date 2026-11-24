import { ArrowLeft, Check, ExternalLink, GitPullRequest, Lightbulb, Wrench } from 'lucide-react';

const supportedFeatures = [
  'YouTube video URL input and browser-based preview',
  'Start and end time selection, plus selected-range preview',
  'Available video quality selection',
  'MP4, MP4 H.264, WebM, MKV, MP3 and M4A exports',
  'Processing progress and completed-clip downloads',
  'Local frontend and backend operation with temporary output cleanup',
];

const contributionAreas = [
  ['Frontend Development', 'React components, UI improvements, responsiveness and accessibility.'],
  ['Backend Development', 'Express API, job management and media processing.'],
  ['Live Clipping', 'Research and future rolling capture and clipping.'],
  ['Twitch Integration', 'Official OAuth and authorized API workflows.'],
  ['Testing and Reliability', 'Regression testing, error handling and Windows compatibility.'],
  ['Documentation', 'Installation guides, troubleshooting and contributor guides.'],
  ['Design', 'User experience, animations and interface improvements.'],
];

const setupCommands = [
  ['Install dependencies', 'npm install', 'npm run install:all'],
  ['Develop', 'npm run dev'],
  ['Build frontend', 'npm run build'],
  ['Run local production server', 'npm start'],
];

function Section({ title, eyebrow, children }) {
  return (
    <section className="py-10 sm:py-14">
      <p className="font-pixel text-[9px] uppercase text-arcade-cyan">{eyebrow}</p>
      <h2 className="mt-3 font-pixel text-lg leading-relaxed text-arcade-yellow sm:text-xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ExternalButton({ href, children, secondary = false }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-12 items-center justify-center gap-2 border-2 px-4 font-pixel text-[9px] uppercase transition ${
        secondary
          ? 'border-arcade-cyan text-arcade-cyan hover:bg-arcade-cyan hover:text-ink-900'
          : 'border-black bg-arcade-yellow text-ink-900 shadow-pixel-sm hover:brightness-110'
      }`}
    >
      {children} <ExternalLink size={15} />
    </a>
  );
}

export default function RoadmapPage({ onNavigate }) {
  return (
    <main className="px-4 pb-16 pt-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            onNavigate('home');
          }}
          className="inline-flex items-center gap-2 font-pixel text-[9px] uppercase text-arcade-cyan transition hover:text-arcade-yellow"
        >
          <ArrowLeft size={16} /> Back to Clipo
        </a>

        <div className="mt-7 border-2 border-ink-500 bg-ink-800 p-6 shadow-pixel sm:p-10">
          <p className="font-pixel text-[9px] uppercase text-arcade-pink">Roadmap &amp; Contribute</p>
          <h1 className="mt-4 font-pixel text-xl leading-relaxed text-arcade-yellow sm:text-2xl">Build the Future of Clipo</h1>
          <p className="mt-6 max-w-3xl text-2xl leading-relaxed text-arcade-text">
            Clipo is a local-first video clipping application built with React, Node.js, yt-dlp and FFmpeg. The goal is to keep video clipping accessible, reliable and useful while remaining lightweight and locally controlled.
          </p>
          <p className="mt-4 max-w-3xl text-xl leading-relaxed text-arcade-muted">
            If you build interfaces, improve reliability, test Windows workflows or write documentation, there is a place to contribute.
          </p>
        </div>

        <Section eyebrow="Available today" title="What Clipo Currently Supports">
          <ul className="grid gap-3 sm:grid-cols-2">
            {supportedFeatures.map((feature) => (
              <li key={feature} className="flex gap-3 border-2 border-ink-500 bg-ink-800 p-4 text-xl leading-relaxed text-arcade-text">
                <Check className="mt-1 shrink-0 text-arcade-cyan" size={18} /> {feature}
              </li>
            ))}
          </ul>
        </Section>

        <Section eyebrow="Planned and under consideration" title="Development Roadmap">
          <div className="grid gap-5">
            <article className="border-2 border-arcade-pink bg-ink-800 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-pixel text-sm leading-relaxed text-arcade-text">Live Clip Mode</h3>
                <span className="border border-arcade-pink px-2 py-1 font-pixel text-[8px] uppercase text-arcade-pink">Planned</span>
              </div>
              <p className="mt-4 text-xl leading-relaxed text-arcade-text">Allow users to capture and clip authorized live video streams while a broadcast is running.</p>
              <p className="mt-3 text-xl leading-relaxed text-arcade-muted">The proposed workflow includes live detection, authorized capture, a configurable rolling buffer and timeline, segment export, reconnection handling, disk-space safeguards, cancellation and clear recording status. It must remain resource-efficient for an 8 GB Windows PC.</p>
            </article>
            <article className="border-2 border-arcade-cyan bg-ink-800 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-pixel text-sm leading-relaxed text-arcade-text">Authorized Twitch Integration</h3>
                <span className="border border-arcade-cyan px-2 py-1 font-pixel text-[8px] uppercase text-arcade-cyan">Under consideration</span>
              </div>
              <p className="mt-4 text-xl leading-relaxed text-arcade-text">Explore an official Twitch integration for authorized broadcaster clipping workflows.</p>
              <p className="mt-3 text-xl leading-relaxed text-arcade-muted">Potential work includes official OAuth, minimal scopes, secure server-side credentials, account connect/disconnect, authorized broadcaster details, official clip endpoints, token-expiry handling and documented platform restrictions. It will not bypass access controls or download arbitrary VODs.</p>
            </article>
          </div>
        </Section>

        <Section eyebrow="Ways to help" title="Contribution Opportunities">
          <div className="grid gap-4 md:grid-cols-2">
            {contributionAreas.map(([title, description]) => (
              <article key={title} className="border-2 border-ink-500 bg-ink-800 p-5">
                <Wrench className="text-arcade-pink" size={20} />
                <h3 className="mt-4 font-pixel text-[10px] leading-relaxed text-arcade-text">{title}</h3>
                <p className="mt-3 text-xl leading-relaxed text-arcade-muted">{description}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section eyebrow="Start here" title="How to Contribute">
          <ol className="grid gap-3 text-xl leading-relaxed text-arcade-text sm:grid-cols-2">
            {[
              'Visit the repository, read the README and inspect the project.',
              'Open an issue before beginning a large feature and explain the proposed improvement.',
              'Fork the repository or create an appropriate development branch.',
              'Implement the change, run checks and the production build.',
              'Submit a pull request with a clear description.',
            ].map((step, index) => (
              <li key={step} className="flex gap-4 border-l-2 border-arcade-yellow bg-ink-800 px-4 py-3">
                <span className="font-pixel text-[10px] text-arcade-yellow">0{index + 1}</span>{step}
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <ExternalButton href="https://github.com/pappudutta/clipo">Repository</ExternalButton>
            <ExternalButton href="https://github.com/pappudutta/clipo/issues" secondary>Issues</ExternalButton>
            <ExternalButton href="https://github.com/pappudutta" secondary>GitHub Profile</ExternalButton>
          </div>
        </Section>

        <Section eyebrow="Run locally" title="Development Setup">
          <p className="max-w-3xl text-xl leading-relaxed text-arcade-muted">Requires Node.js 18.11+, Python with yt-dlp, FFmpeg on PATH, and Deno (recommended for YouTube support). Never commit or publish <code className="text-arcade-cyan">.env</code> files, cookies, API keys or tokens.</p>
          <div className="mt-5 grid gap-4">
            {setupCommands.map(([label, ...commands]) => (
              <article key={label} className="border-2 border-ink-500 bg-ink-800 p-4">
                <h3 className="font-pixel text-[9px] uppercase text-arcade-text">{label}</h3>
                {commands.map((command) => <code key={command} className="mt-3 block overflow-x-auto bg-ink-900 px-3 py-2 text-lg text-arcade-cyan">{command}</code>)}
              </article>
            ))}
          </div>
          <p className="mt-5 text-xl leading-relaxed text-arcade-muted">Use focused feature branches, keep changes reviewable, and run the production build before opening a pull request.</p>
        </Section>

        <Section eyebrow="How we build" title="Project Principles">
          <div className="grid gap-3 sm:grid-cols-2">
            {['Lightweight and resource-efficient', 'Local-first architecture', 'Clean frontend/backend separation', 'Security-conscious credential handling', 'Respect for copyright and platform terms', 'Accessible, responsive and documented development'].map((principle) => (
              <p key={principle} className="border-2 border-ink-500 bg-ink-800 p-4 text-xl text-arcade-text">{principle}</p>
            ))}
          </div>
        </Section>

        <section className="border-2 border-arcade-yellow bg-ink-800 p-6 text-center shadow-pixel sm:p-10">
          <Lightbulb className="mx-auto text-arcade-yellow" size={28} />
          <h2 className="mt-5 font-pixel text-lg leading-relaxed text-arcade-text">Your Ideas Can Help Shape Clipo</h2>
          <p className="mx-auto mt-5 max-w-2xl text-xl leading-relaxed text-arcade-muted">Have an idea, found a bug or want to contribute? Join the project and help improve the next generation of Clipo.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ExternalButton href="https://github.com/pappudutta/clipo"><GitPullRequest size={15} /> Explore Clipo on GitHub</ExternalButton>
            <ExternalButton href="https://github.com/pappudutta/clipo/issues" secondary>Report an Issue</ExternalButton>
          </div>
        </section>
      </div>
    </main>
  );
}
