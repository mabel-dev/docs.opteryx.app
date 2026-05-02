/* Pillars.jsx — three pillars, each now with a distinctive abstract illustration. */
function Pillars() {
  const items = [
    {
      title: 'Predictable behavior',
      body: 'Deterministic planning and cost-aware execution mean your dashboards return the same answer at the same price, every time.',
      art: <PredictableArt />,
    },
    {
      title: 'Governance built-in',
      body: 'Fine-grained access tokens, per-query audit, and row-level policies that your security and compliance teams can trust.',
      art: <GovernanceArt />,
    },
    {
      title: 'Your data, your control',
      body: 'Read-only over your own object storage. Parquet, S3, GCS — we never copy or move it. You keep the keys.',
      art: <StorageArt />,
    },
  ];
  return (
    <section id="product" className="block">
      <div className="wrap">
        <div className="section-head">
          <div className="label">Why Opteryx</div>
          <h2>Enterprise analytics that deliver dependable results.</h2>
          <p>Three commitments we hold ourselves to — and you can measure us on.</p>
        </div>
        <div className="pillars">
          {items.map(p => (
            <article key={p.title} className="pillar">
              <div className="pillar-art">{p.art}</div>
              <div className="pillar-body">
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Abstract SVG illustrations for each pillar -------------------- */

function PredictableArt() {
  // Three identical chart curves stacked = "same answer every time"
  return (
    <svg viewBox="0 0 260 120" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="pr-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="var(--opteryx-teal)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--opteryx-teal)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* baseline grid */}
      {[30, 60, 90].map(y => (
        <line key={y} x1="10" x2="250" y1={y} y2={y} stroke="rgba(7,121,124,0.12)" strokeDasharray="2 4" />
      ))}
      {[0,1,2].map(i => {
        const offset = i * 2;
        return (
          <g key={i} opacity={0.4 + i * 0.3}>
            <polyline
              fill="none" stroke="var(--opteryx-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              points={`10,${86+offset} 50,${70+offset} 90,${74+offset} 130,${52+offset} 170,${40+offset} 210,${34+offset} 250,${24+offset}`}
            />
          </g>
        );
      })}
      {/* markers on top curve */}
      {[[10,90],[50,74],[90,78],[130,56],[170,44],[210,38],[250,28]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke="var(--opteryx-teal)" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function GovernanceArt() {
  // Layered shield with permission lattice
  return (
    <svg viewBox="0 0 260 120" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="latt" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 5 L10 5 M5 0 L5 10" stroke="rgba(31,46,97,0.12)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="10" y="10" width="240" height="100" fill="url(#latt)" rx="8" />
      {/* shield */}
      <path d="M130 24 L170 38 V70 Q170 90 130 102 Q90 90 90 70 V38 Z"
            fill="#fff" stroke="var(--opteryx-navy)" strokeWidth="1.5" />
      <path d="M130 24 L170 38 V70 Q170 90 130 102 Z" fill="rgba(31,46,97,0.08)" />
      <path d="M113 64 L126 76 L148 52" fill="none" stroke="var(--opteryx-teal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* small lock/key glyphs either side */}
      <g transform="translate(28,44)">
        <rect x="0" y="8" width="18" height="14" rx="2" fill="#fff" stroke="var(--opteryx-navy)" strokeWidth="1.3" />
        <path d="M4 8 V5 Q4 0 9 0 Q14 0 14 5 V8" fill="none" stroke="var(--opteryx-navy)" strokeWidth="1.3" />
      </g>
      <g transform="translate(210,46)">
        <circle cx="7" cy="10" r="6" fill="#fff" stroke="var(--opteryx-orange)" strokeWidth="1.4" />
        <path d="M13 10 H26 M22 7 V13 M26 7 V13" stroke="var(--opteryx-orange)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function StorageArt() {
  // Warehouse arrow pointing at stacked storage cylinders
  return (
    <svg viewBox="0 0 260 120" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="cylg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="var(--opteryx-teal)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--opteryx-teal)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Left: Opteryx reader node */}
      <g>
        <rect x="18" y="38" width="72" height="44" rx="8" fill="#fff" stroke="var(--opteryx-teal)" strokeWidth="1.5" />
        <text x="54" y="56" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--opteryx-teal)" fontWeight="700">OPTERYX</text>
        <text x="54" y="70" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted)">read-only</text>
      </g>
      {/* Arrow */}
      <g stroke="var(--opteryx-orange)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M95 60 L148 60" />
        <path d="M142 55 L148 60 L142 65" />
      </g>
      {/* Right: three stacked cylinders (your object store) */}
      <g transform="translate(160,18)">
        {[0,1,2].map(i => {
          const y = i * 22;
          return (
            <g key={i}>
              <ellipse cx="40" cy={y+10} rx="40" ry="6" fill="var(--opteryx-teal)" opacity="0.15" />
              <rect x="0" y={y+10} width="80" height="18" fill="url(#cylg)" stroke="var(--opteryx-teal)" strokeOpacity="0.5" strokeWidth="1" />
              <ellipse cx="40" cy={y+28} rx="40" ry="6" fill="#fff" stroke="var(--opteryx-teal)" strokeOpacity="0.5" strokeWidth="1" />
            </g>
          );
        })}
        <text x="40" y="96" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--muted)">your S3 / GCS</text>
      </g>
    </svg>
  );
}

window.Pillars = Pillars;
