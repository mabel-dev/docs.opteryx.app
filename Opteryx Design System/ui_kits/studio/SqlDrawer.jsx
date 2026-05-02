/* SqlDrawer.jsx — Right panel content only. Switcher lives in the status bar. */
const DR_ICON = '../../assets/icons/';

const REF = {
  'Query Basics': [
    'Use SELECT … FROM … to read from a dataset.',
    'Add WHERE to filter, ORDER BY to sort, LIMIT to cap results.',
    'Aggregate with COUNT, SUM, AVG, MIN, MAX alongside GROUP BY.',
  ],
  'Useful Tips': [
    'Results scroll horizontally when columns exceed their minimum width.',
    'Use the Results, Details, and Execution Plan tabs to inspect output.',
    'Upload prepares files first; commit wiring comes later.',
  ],
};

const FUNCTIONS = [
  { kw: 'ABS',                desc: 'Absolute value.' },
  { kw: 'APPROX_DISTINCT',    desc: 'HyperLogLog distinct count.' },
  { kw: 'ARRAY_CONTAINS',     desc: 'Test if array contains item.' },
  { kw: 'ARRAY_CONTAINS_ALL', desc: 'Test if array contains all items from set.' },
  { kw: 'COUNT',              desc: 'Row count.' },
  { kw: 'DATE_TRUNC',         desc: 'Bucket timestamp to unit.' },
];

function DrawerPanelHeader({ title }) {
  return <div className="panel-header"><span>{title}</span></div>;
}

function HelpPanel() {
  return (
    <>
      <DrawerPanelHeader title="Help" />
      <div className="panel-body right">
        <div className="help-section">
          <h4>Language reference</h4>
          {Object.entries(REF).map(([grp, items]) => (
            <div key={grp} className="help-group">
              <h5>{grp}</h5>
              {items.map((t, i) => <p key={i} className="help-line">{t}</p>)}
            </div>
          ))}
        </div>
        <div className="help-divider" />
        <div className="help-section">
          <h4>Function reference</h4>
          <div className="panel-search">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4.35-4.35"/></svg>
            <input placeholder="Search functions" />
          </div>
          <div className="fn-list">
            {FUNCTIONS.map(f => (
              <div key={f.kw} className="fn-item">
                <div className="fn-item-head">
                  <span className="kw">{f.kw}</span>
                  <span className="fn-expand">+</span>
                </div>
                <div className="fn-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function UploadPanel() {
  return (
    <>
      <DrawerPanelHeader title="Upload" />
      <div className="panel-body right">
        <div className="upload-drop">
          <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}>
            <path d="M8 11V3"/><path d="M5 6l3-3 3 3"/>
            <path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2"/>
          </svg>
          <div className="upload-headline">Drop a Parquet, CSV, or JSON file</div>
          <div className="upload-sub">or <span className="link-ish">browse</span> to select</div>
        </div>
        <div className="upload-note">
          Files are prepared for ingest in the browser. Auth and commit wiring is part of the next release.
        </div>
      </div>
    </>
  );
}

function AssistantPanel({ ask, onChange, onAsk }) {
  return (
    <>
      <DrawerPanelHeader title="Assistant" />
      <div className="panel-body right">
        <form className="ask-bar-inline" onSubmit={e => { e.preventDefault(); onAsk(); }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" style={{color:'var(--opteryx-teal)'}}>
            <path d="M8 1l1.3 3.5L13 6l-3.7 1.5L8 11l-1.3-3.5L3 6l3.7-1.5z"/>
          </svg>
          <input value={ask} onChange={e => onChange(e.target.value)} placeholder="Ask about this data…" />
          <button type="submit" className="send" aria-label="Send">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8h10"/><path d="M8 4l4 4-4 4"/></svg>
          </button>
        </form>
        <div className="assistant-hint">
          Try: "top 10 countries by event volume last 30 days" or "join events to users and show retention".
        </div>
      </div>
    </>
  );
}

function SqlDrawer({ activeView, ask, onAskChange, onAsk }) {
  if (activeView === 'help')      return <HelpPanel />;
  if (activeView === 'upload')    return <UploadPanel />;
  if (activeView === 'assistant') return <AssistantPanel ask={ask} onChange={onAskChange} onAsk={onAsk} />;
  return null;
}

window.SqlDrawer = SqlDrawer;
