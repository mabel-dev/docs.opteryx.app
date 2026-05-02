/* Results.jsx — Results / Details / Execution Plan / Charts.
   No local footer — row counts and scan info live in the status bar. */
const R_ICON = '../../assets/icons/';

const COLUMNS = [
  { name: 'country',     type: 'varchar',  icon: 'type-varchar.svg' },
  { name: 'events',      type: 'integer',  icon: 'type-integer.svg',   num: true, fmt: v => v.toLocaleString('en-US') },
  { name: 'users',       type: 'integer',  icon: 'type-integer.svg',   num: true, fmt: v => v.toLocaleString('en-US') },
  { name: 'share_pct',   type: 'decimal',  icon: 'type-decimal.svg',   num: true, fmt: v => v.toFixed(1) + '%' },
  { name: 'first_event', type: 'timestamp',icon: 'type-timestamp.svg' },
];
const ROWS = [
  ['United States',  2_394_118,  418_204, 38.2, '2026-03-18 00:00:04'],
  ['United Kingdom',  812_557,   128_009, 13.0, '2026-03-18 00:00:11'],
  ['Germany',         644_201,   101_887, 10.3, '2026-03-18 00:00:07'],
  ['France',          482_917,    77_104,  7.7, '2026-03-18 00:00:09'],
  ['Canada',          401_388,    62_550,  6.4, '2026-03-18 00:00:02'],
  ['Netherlands',     287_941,    44_118,  4.6, '2026-03-18 00:00:14'],
  ['Australia',       241_007,    38_822,  3.8, '2026-03-18 00:00:06'],
  ['Spain',           198_443,    31_559,  3.2, '2026-03-18 00:00:05'],
  ['Japan',           186_901,    29_004,  3.0, null],
  ['Brazil',          154_883,    24_617,  2.5, '2026-03-18 00:00:19'],
];

function ResultsTabs({ active, onChange }) {
  const tabs = [
    { id: 'results', label: 'Results' },
    { id: 'details', label: 'Details' },
    { id: 'plan',    label: 'Execution plan' },
    { id: 'charts',  label: 'Charts' },
  ];
  return (
    <div className="results-tabs">
      {tabs.map(t => (
        <button key={t.id} className={"result-tab" + (active === t.id ? ' active' : '')} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
      <div className="spacer" />
      <button className="icon-btn" title="Export"><img src={R_ICON + 'download.svg'} /></button>
    </div>
  );
}

function ResultsTable() {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th className="row-num-head">#</th>
            {COLUMNS.map(c => (
              <th key={c.name}>
                <div className="th-inner">
                  <img src={R_ICON + c.icon} />
                  <span>{c.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr key={i}>
              <td className="num-cell row-num">{i+1}</td>
              {row.map((cell, j) => {
                if (cell == null) return <td key={j} className="null">NULL</td>;
                const c = COLUMNS[j];
                return (
                  <td key={j} className={c.num ? 'num-cell' : ''}>
                    {c.fmt ? c.fmt(cell) : cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExecutionPlan() {
  const Node = ({ title, stats, teal }) => (
    <div className={"plan-node" + (teal ? ' accent' : '')}>
      <div className="plan-title">{title}</div>
      <div className="plan-stats">{stats}</div>
    </div>
  );
  const Arrow = () => (
    <svg width="16" height="18" viewBox="0 0 16 18" className="plan-arrow">
      <line x1="8" y1="0" x2="8" y2="12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 10 L8 16 L12 10" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
  return (
    <div className="plan-wrap">
      <Node title="LIMIT 25" stats="10 rows · 0.1 ms" />
      <Arrow />
      <Node title="ORDER BY events DESC" stats="25 rows · 2.4 ms" />
      <Arrow />
      <Node title="HASH AGGREGATE" stats="country · 25 groups · 38 ms" teal />
      <Arrow />
      <Node title="FILTER event_type IN (…)" stats="6.27M → 4.10M rows · 72 ms" />
      <Arrow />
      <Node title="SCAN events (Parquet)" stats="partitions: 30 · 1.2 GB · 284 ms" teal />
    </div>
  );
}

function Details() {
  const rows = [
    ['Query ID', 'qr_7f3b91c2-3f44-4a21'],
    ['Started',  '18 Apr 2026, 14:02:11 UTC'],
    ['Duration', '412 ms'],
    ['Scanned',  '1.2 GB · 30 partitions'],
    ['Rows in',  '6,271,048'],
    ['Rows out', '25'],
    ['Compute',  '0.032 DWU'],
    ['Cache',    'partial (28%)'],
  ];
  return (
    <div className="details-wrap">
      <table className="details-table">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td className="k">{k}</td>
              <td className="v">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Results({ tab, onChangeTab }) {
  return (
    <div className="results">
      <ResultsTabs active={tab} onChange={onChangeTab} />
      {tab === 'results' && <ResultsTable />}
      {tab === 'plan'    && <ExecutionPlan />}
      {tab === 'details' && <Details />}
      {tab === 'charts'  && (
        <div className="empty-tab">Chart rendering coming to Studio soon.</div>
      )}
    </div>
  );
}

window.Results = Results;
