/* Editor.jsx — tabs, toolbar (Run left; secondary actions right), editor. */
const ED_ICON = '../../assets/icons/';

function Tabs({ active, onChange }) {
  const tabs = [
    { id: 'q1', name: 'events_recent.sql' },
    { id: 'q2', name: 'revenue_attribution.sql' },
  ];
  return (
    <div className="tabs">
      {tabs.map(t => (
        <div key={t.id} className={"tab" + (active === t.id ? ' active' : '')} onClick={() => onChange(t.id)}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M3 2h6l4 4v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M9 2v4h4"/></svg>
          <span>{t.name}</span>
          <button className="tab-close" aria-label="Close tab" onClick={e => e.stopPropagation()}>
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
          </button>
        </div>
      ))}
      <button className="tab-add" title="New query">
        <svg width="11" height="11" viewBox="0 0 16 16" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
      </button>
    </div>
  );
}

function Toolbar({ onRun, running }) {
  return (
    <div className="toolbar">
      <button className="btn btn-orange" onClick={onRun} disabled={running}>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M4 3l9 5-9 5z"/></svg>
        {running ? 'Running…' : 'Run'}
        <span className="kbd">⌘↵</span>
      </button>
      <span className="chip">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><ellipse cx="8" cy="3.5" rx="5" ry="1.8"/><path d="M3 3.5v9c0 1 2.2 1.8 5 1.8s5-.8 5-1.8v-9"/><path d="M3 8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8"/></svg>
        benchmarks
      </span>
      <span className="chip">Row limit · 1,000</span>
      <div className="spacer" />
      <button className="btn btn-ghost" title="Format SQL (Shift+Alt+F)">Format</button>
      <span className="tool-sep" />
      <button className="icon-btn" title="Copy"><img src={ED_ICON + 'action-copy.svg'} /></button>
      <button className="icon-btn" title="Bookmark"><img src={ED_ICON + 'bookmark.svg'} /></button>
      <button className="icon-btn" title="Download"><img src={ED_ICON + 'download.svg'} /></button>
    </div>
  );
}

function Editor() {
  return (
    <div className="editor">
      <div className="ln"><span><span className="cmt">-- 30-day event volume by country</span></span></div>
      <div className="ln"><span><span className="kw">SELECT</span> country, <span className="fn">COUNT</span>(*) <span className="kw">AS</span> events,</span></div>
      <div className="ln"><span>&nbsp;&nbsp;<span className="fn">APPROX_DISTINCT</span>(user_id) <span className="kw">AS</span> users</span></div>
      <div className="ln"><span><span className="kw">FROM</span> events</span></div>
      <div className="ln"><span><span className="kw">WHERE</span> event_date <span className="kw">&gt;=</span> <span className="str">'2026-03-18'</span></span></div>
      <div className="ln"><span>&nbsp;&nbsp;<span className="kw">AND</span> event_type <span className="kw">IN</span> (<span className="str">'pageview'</span>, <span className="str">'click'</span>)</span></div>
      <div className="ln"><span><span className="kw">GROUP BY</span> country</span></div>
      <div className="ln"><span><span className="kw">ORDER BY</span> events <span className="kw">DESC</span></span></div>
      <div className="ln"><span><span className="kw">LIMIT</span> <span className="num">25</span>;</span></div>
    </div>
  );
}

window.EditorTabs = Tabs;
window.EditorToolbar = Toolbar;
window.Editor = Editor;
