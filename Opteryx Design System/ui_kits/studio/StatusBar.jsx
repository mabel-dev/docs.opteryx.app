/* StatusBar.jsx — Always-visible footer with panel toggle rails on both edges.
   Click an icon to open that panel. Click the currently-active icon to collapse. */
const SB_ICON = '../../assets/icons/';

const DatasetsIcon = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <ellipse cx="8" cy="3.5" rx="5" ry="1.8"/>
    <path d="M3 3.5v4c0 1 2.2 1.8 5 1.8s5-.8 5-1.8v-4"/>
    <path d="M3 7.5v4c0 1 2.2 1.8 5 1.8s5-.8 5-1.8v-4"/>
  </svg>
);
const RecentIcon = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.5 1.5"/>
  </svg>
);
const DetailsIcon = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="6"/><path d="M8 11V7.5"/>
    <circle cx="8" cy="5" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
);
const HelpIcon = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="6"/>
    <path d="M6 6.5a2 2 0 014 0c0 1-1 1.5-2 2.2M8 11.5v.01"/>
  </svg>
);
const UploadIcon = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 10V3"/><path d="M5 6l3-3 3 3"/>
    <path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2"/>
  </svg>
);
const AssistantIcon = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1l1.3 3.5L13 6l-3.7 1.5L8 11l-1.3-3.5L3 6l3.7-1.5z"/>
    <circle cx="12.5" cy="12" r="1.3"/>
  </svg>
);

function RailBtn({ active, title, onClick, children }) {
  return (
    <button
      className={"rail-btn" + (active ? ' active' : '')}
      onClick={onClick}
      title={title}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function StatusBar({ leftView, onToggleLeft, rightView, onToggleRight }) {
  const leftTabs = [
    { id: 'datasets', label: 'Datasets', svg: DatasetsIcon },
    { id: 'recent',   label: 'Recent queries', svg: RecentIcon },
  ];
  const rightTabs = [
    { id: 'help',      label: 'Help',      svg: HelpIcon },
    { id: 'upload',    label: 'Upload',    svg: UploadIcon },
    { id: 'assistant', label: 'Assistant', svg: AssistantIcon },
  ];
  return (
    <footer className="status-bar">
      <div className="rail left">
        {leftTabs.map(t => (
          <RailBtn key={t.id} active={leftView === t.id} title={t.label} onClick={() => onToggleLeft(t.id)}>
            {t.svg}
          </RailBtn>
        ))}
      </div>

      <span className="status-pill ok">
        <span className="dot" />
        Connected
      </span>
      <span className="sep">·</span>
      <span className="mono">benchmarks.clickbench</span>

      <div className="spacer" />

      <span className="mono">Ln 8, Col 14</span>
      <span className="sep">·</span>
      <span className="mono">1–1,000 of 58,909,392 rows</span>
      <span className="sep">·</span>
      <span>412 ms · 1.2 GB scanned</span>

      <div className="spacer" />

      <div className="rail right">
        {rightTabs.map(t => (
          <RailBtn key={t.id} active={rightView === t.id} title={t.label} onClick={() => onToggleRight(t.id)}>
            {t.svg}
          </RailBtn>
        ))}
      </div>
    </footer>
  );
}

function AiOverlay({ question, onClose, onInsert }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="ai-card" onClick={e => e.stopPropagation()}>
        <div className="ai-card-head">
          <img src={SB_ICON + 'stars.svg'} />
          <h4>Drafted from: "{question}"</h4>
        </div>
        <div className="ai-card-body">
          <p>Here's a query that counts events by country for the last 30 days. Review before running — the engine will scan ~1.2 GB across 30 partitions.</p>
          <pre>
{`SELECT country,
       COUNT(*) AS events,
       APPROX_DISTINCT(user_id) AS users
FROM events
WHERE event_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY country
ORDER BY events DESC
LIMIT 25;`}
          </pre>
        </div>
        <div className="ai-card-foot">
          <button className="btn btn-ghost" onClick={onClose}>Discard</button>
          <button className="btn btn-primary" onClick={onInsert}>Insert into editor</button>
        </div>
      </div>
    </div>
  );
}

window.StatusBar = StatusBar;
window.AiOverlay = AiOverlay;
