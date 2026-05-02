/* Sidebar.jsx — Left panel content only. The switcher lives in the status bar. */
const SIDEBAR_ICON = '../../assets/icons/';

const DATASETS = [
  {
    name: 'benchmarks',
    kids: [
      { name: 'clickbench', rows: '58.9M', cols: 105, partitions: 30, size: '12.4 GB',
        updated: '2 hours ago', desc: 'Standard analytical benchmark dataset; 99 columns of mixed types.' },
      { name: 'tpch', rows: '6.0M', cols: 16, partitions: 8, size: '725 MB',
        updated: 'yesterday', desc: 'TPC-H scale-factor 1 — line items, orders, parts.' },
    ],
  },
  {
    name: 'mitre',
    kids: [
      { name: 'attack', rows: '12.4K', cols: 22, partitions: 1, size: '4.1 MB',
        updated: '3 days ago', desc: 'MITRE ATT&CK techniques, tactics, and mitigations.' },
    ],
  },
  {
    name: 'opteryx',
    kids: [
      { name: 'ops', rows: '1.8M', cols: 14, partitions: 12, size: '188 MB',
        updated: '14 min ago', desc: 'Internal operations telemetry; partitioned by day.' },
      { name: 'test', rows: '500', cols: 8, partitions: 1, size: '42 KB',
        updated: 'last week', desc: 'Synthetic fixture for engine integration tests.' },
    ],
  },
  {
    name: 'opteryx_store',
    kids: [
      { name: 'test', rows: '120', cols: 6, partitions: 1, size: '12 KB',
        updated: 'last week', desc: 'Catalog test fixture.' },
    ],
  },
];

const ALL_DATASETS = DATASETS.flatMap(db => db.kids.map(s => ({ ...s, qualified: db.name + '.' + s.name })));

/* Recent queries — each carries an absolute moment so we can bucket them. */
const RECENTS = [
  { sql: 'SELECT COUNT(*) FROM events WHERE event_date > CURRENT_DATE - 7',
    bucket: 'today', when: '2 min ago', ms: 412, scan: '1.2 GB', rows: 1 },
  { sql: "SELECT user_id, SUM(revenue) FROM revenue_attrib GROUP BY 1 ORDER BY 2 DESC",
    bucket: 'today', when: '18 min ago', ms: 418, scan: '882 MB', rows: 24109 },
  { sql: "SELECT * FROM users WHERE created_at > '2026-01-01' LIMIT 100",
    bucket: 'today', when: '1 hr ago', ms: 12, scan: '4.4 MB', rows: 100 },
  { sql: "SELECT region, AVG(latency_ms) FROM ops.requests WHERE day = CURRENT_DATE - 1 GROUP BY 1",
    bucket: 'yesterday', when: 'yesterday, 18:42', ms: 188, scan: '212 MB', rows: 14 },
  { sql: "SELECT t.technique_id, t.name FROM mitre.attack t WHERE t.tactic = 'persistence'",
    bucket: 'yesterday', when: 'yesterday, 09:11', ms: 8, scan: '120 KB', rows: 47 },
  { sql: "SELECT date_trunc('hour', ts), COUNT(*) FROM clickbench WHERE day BETWEEN '2026-04-14' AND '2026-04-20' GROUP BY 1",
    bucket: 'week', when: 'Tue, 14:02', ms: 904, scan: '4.1 GB', rows: 168 },
  { sql: "SHOW TABLES IN benchmarks",
    bucket: 'week', when: 'Mon, 11:30', ms: 4, scan: '—', rows: 2 },
  { sql: "SELECT COUNT(DISTINCT user_id) FROM events WHERE event_date BETWEEN '2026-03-01' AND '2026-03-31'",
    bucket: 'earlier', when: 'Mar 28', ms: 612, scan: '2.8 GB', rows: 1 },
  { sql: "EXPLAIN SELECT * FROM tpch.lineitem WHERE l_shipdate < '1998-12-01'",
    bucket: 'earlier', when: 'Mar 14', ms: 6, scan: '—', rows: 22 },
];

const BUCKET_LABELS = { today: 'Today', yesterday: 'Yesterday', week: 'This week', earlier: 'Earlier' };
const BUCKET_ORDER = ['today', 'yesterday', 'week', 'earlier'];

/* ---- Header chrome ---------------------------------------------------- */

function HeaderIconBtn({ title, onClick, children }) {
  return (
    <button className="panel-header-btn" title={title} onClick={onClick} type="button">
      {children}
    </button>
  );
}

const SearchGlyph = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="6"/><path d="M21 21l-4.35-4.35"/></svg>
);
const RefreshGlyph = (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 7a5.5 5.5 0 0 0-9.6-2.7"/>
    <path d="M2.5 9a5.5 5.5 0 0 0 9.6 2.7"/>
    <path d="M13.5 2.5V5h-2.5"/>
    <path d="M2.5 13.5V11h2.5"/>
  </svg>
);

function SidebarPanelHeader({ title, actions }) {
  return (
    <div className="panel-header">
      <span>{title}</span>
      {actions ? <div className="panel-header-actions">{actions}</div> : null}
    </div>
  );
}

/* ---- Dataset details (lower split) ------------------------------------ */

function DatasetDetails({ dataset }) {
  if (!dataset) {
    return (
      <div className="ds-details empty">
        Select a dataset to see its row count, columns, and partitions.
      </div>
    );
  }
  return (
    <div className="ds-details">
      <div className="ds-details-head">
        <span className="ds-details-name">{dataset.qualified}</span>
        <span className="ds-details-kind">table</span>
      </div>
      <div className="ds-details-desc">{dataset.desc}</div>
      <dl className="ds-details-grid">
        <div><dt>Rows</dt><dd>{dataset.rows}</dd></div>
        <div><dt>Columns</dt><dd>{dataset.cols}</dd></div>
        <div><dt>Partitions</dt><dd>{dataset.partitions}</dd></div>
        <div><dt>Size</dt><dd>{dataset.size}</dd></div>
        <div className="ds-details-row"><dt>Updated</dt><dd>{dataset.updated}</dd></div>
      </dl>
    </div>
  );
}

/* ---- Datasets panel --------------------------------------------------- */

function DatasetsPanel({ activeTable, onSelectTable }) {
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 700);
  };
  const active = ALL_DATASETS.find(d => d.qualified === activeTable);

  return (
    <>
      <SidebarPanelHeader
        title="Datasets"
        actions={
          <HeaderIconBtn title="Refresh datasets" onClick={onRefresh}>
            <span className={refreshing ? 'spin' : ''}>{RefreshGlyph}</span>
          </HeaderIconBtn>
        }
      />
      <div className="panel-body split">
        <div className="split-top">
          <div className="panel-search">
            {SearchGlyph}
            <input placeholder="Filter datasets" />
          </div>
          <div className="tree">
            {DATASETS.map(db => (
              <React.Fragment key={db.name}>
                <div className="tree-row root"><span>{db.name}</span></div>
                {db.kids.map(s => {
                  const q = db.name + '.' + s.name;
                  return (
                    <div
                      key={q}
                      className={"tree-row leaf" + (activeTable === q ? ' active' : '')}
                      onClick={() => onSelectTable(q)}
                    >
                      <img src={SIDEBAR_ICON + 'chevron-right.svg'} className="chev" />
                      <span>{s.name}</span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="split-bottom">
          <div className="split-bottom-head">Details</div>
          <DatasetDetails dataset={active} />
        </div>
      </div>
    </>
  );
}

/* ---- Recent queries panel -------------------------------------------- */

function RecentRow({ r, onShowPreview, onHidePreview }) {
  const rowRef = React.useRef(null);
  const handleEnter = () => {
    const el = rowRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    onShowPreview(r, rect);
  };
  return (
    <div
      className="recent-row"
      tabIndex={0}
      ref={rowRef}
      onMouseEnter={handleEnter}
      onMouseLeave={onHidePreview}
      onFocus={handleEnter}
      onBlur={onHidePreview}
    >
      <span className="sql">{r.sql}</span>
    </div>
  );
}

function RecentPreviewCard({ preview }) {
  if (!preview) return null;
  const { r, rect } = preview;
  /* Position to the right of the row, vertically centred. Flip to left if not enough room. */
  const cardW = 340;
  const margin = 8;
  let left = rect.right + margin;
  if (left + cardW > window.innerWidth - 8) left = Math.max(8, rect.left - cardW - margin);
  let top = rect.top + rect.height / 2;
  /* clamp so it stays in viewport */
  const approxH = 180;
  if (top - approxH / 2 < 8) top = approxH / 2 + 8;
  if (top + approxH / 2 > window.innerHeight - 8) top = window.innerHeight - approxH / 2 - 8;
  return (
    <div className="recent-popover" style={{ left, top, width: cardW, transform: 'translateY(-50%)' }} role="tooltip">
      <pre className="recent-popover-sql">{r.sql}</pre>
      <div className="recent-popover-meta">
        <span><b>{r.ms.toLocaleString()} ms</b></span>
        <span>{r.scan} scanned</span>
        <span>{r.rows.toLocaleString()} {r.rows === 1 ? 'row' : 'rows'}</span>
        <span className="muted">{r.when}</span>
      </div>
    </div>
  );
}

function RecentPanel() {
  const [q, setQ] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);
  const [preview, setPreview] = React.useState(null);
  const onRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 700);
  };
  const showPreview = React.useCallback((r, rect) => setPreview({ r, rect }), []);
  const hidePreview = React.useCallback(() => setPreview(null), []);

  const filtered = RECENTS.filter(r => r.sql.toLowerCase().includes(q.toLowerCase()));
  const buckets = BUCKET_ORDER
    .map(b => ({ id: b, label: BUCKET_LABELS[b], items: filtered.filter(r => r.bucket === b) }))
    .filter(b => b.items.length);

  return (
    <>
      <SidebarPanelHeader
        title="Recent queries"
        actions={
          <HeaderIconBtn title="Refresh history" onClick={onRefresh}>
            <span className={refreshing ? 'spin' : ''}>{RefreshGlyph}</span>
          </HeaderIconBtn>
        }
      />
      <div className="panel-body" onScroll={hidePreview}>
        <div className="panel-search">
          {SearchGlyph}
          <input placeholder="Search queries" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="recent-list">
          {buckets.length === 0 ? (
            <div className="empty-panel">No queries match.</div>
          ) : buckets.map(b => (
            <div key={b.id} className="recent-bucket">
              <div className="recent-bucket-head">{b.label}</div>
              {b.items.map((r, i) => (
                <RecentRow key={b.id + i} r={r} onShowPreview={showPreview} onHidePreview={hidePreview} />
              ))}
            </div>
          ))}
        </div>
      </div>
      {ReactDOM.createPortal(<RecentPreviewCard preview={preview} />, document.body)}
    </>
  );
}

function Sidebar({ activeView, activeTable, onSelectTable }) {
  if (activeView === 'datasets') return <DatasetsPanel activeTable={activeTable} onSelectTable={onSelectTable} />;
  if (activeView === 'recent')   return <RecentPanel />;
  return null;
}

window.Sidebar = Sidebar;
