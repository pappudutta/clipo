export default function ClipoLogo({ compact = false }) {
  return (
    <span
      className={`clipo-logo ${compact ? 'clipo-logo-compact' : ''}`}
      aria-label="Clipo"
    >
      <span className="clipo-logo-text" aria-hidden="true">&lt;Clipo...&gt;</span>
    </span>
  );
}
