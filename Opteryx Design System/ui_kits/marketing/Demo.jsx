/* Demo.jsx — code window + a floating mini-BI-dashboard visual so it's not
   text-and-code only. */
function Demo() {
  return (
    <section className="block">
      <div className="wrap demo">
        <div className="demo-copy">
          <h2>SQL you already know. Pricing that doesn't surprise you.</h2>
          <p>Write standard SQL against your object storage. Planning is deterministic; execution is cost-aware and transparent.</p>
          <ul>
            <li>Per-query scan metrics, before you commit</li>
            <li>Partition-pruning and predicate pushdown by default</li>
            <li>Read-only — the engine never mutates your data</li>
            <li>Compatible with Tableau, Power BI, Looker</li>
          </ul>
        </div>

        <div className="demo-stack">
          <div className="code-window">
            <div className="chrome">
              <span className="dot r" /><span className="dot y" /><span className="dot g" />
              <span className="name">monthly_revenue.sql</span>
            </div>
            <pre>
<span className="cmt">{'-- Monthly revenue by plan, last quarter'}</span>{'\n'}
<span className="kw">SELECT</span>{' '}<span className="fn">DATE_TRUNC</span>(<span className="str">'month'</span>, created_at) <span className="kw">AS</span> month,{'\n'}
       plan,{'\n'}
       <span className="fn">SUM</span>(amount_usd) <span className="kw">AS</span> revenue_usd{'\n'}
<span className="kw">FROM</span> analytics.revenue_attribution{'\n'}
<span className="kw">WHERE</span> created_at {'>='} <span className="fn">CURRENT_DATE</span> - <span className="kw">INTERVAL</span> <span className="str">'90 days'</span>{'\n'}
<span className="kw">GROUP BY</span> month, plan{'\n'}
<span className="kw">ORDER BY</span> month <span className="kw">DESC</span>, revenue_usd <span className="kw">DESC</span>;{'\n'}
{'\n'}
<span className="cmt">-- 12 rows returned · scanned {'247 MB · 284 ms'}</span>
            </pre>
          </div>

          <DashTile />
        </div>
      </div>
    </section>
  );
}

function DashTile() {
  const bars = [
    { plan: 'Enterprise', v: 142, c: 'var(--opteryx-navy)' },
    { plan: 'Team',       v: 86,  c: 'var(--opteryx-teal)' },
    { plan: 'Starter',    v: 48,  c: 'var(--opteryx-orange)' },
  ];
  const max = 150;
  return (
    <div className="dash-tile">
      <div className="dash-head">
        <div className="dash-title">Revenue · last quarter</div>
        <div className="dash-sub mono">$1.24M · +18% QoQ</div>
      </div>
      <div className="dash-bars">
        {bars.map(b => (
          <div className="dash-row" key={b.plan}>
            <div className="dash-label">{b.plan}</div>
            <div className="dash-track">
              <div className="dash-fill" style={{ width: `${(b.v/max)*100}%`, background: b.c }} />
            </div>
            <div className="dash-val mono">${b.v}k</div>
          </div>
        ))}
      </div>
      <div className="dash-foot">
        <span className="tag">DirectQuery · Power BI</span>
      </div>
    </div>
  );
}

window.Demo = Demo;
