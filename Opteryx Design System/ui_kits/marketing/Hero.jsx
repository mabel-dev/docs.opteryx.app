/* Hero.jsx — hero with an abstract data-visual panel on the right.
   Visual: a faux "query-result → chart" tableau: mini bar chart,
   an accent pill, a soft ribbon of dots, and a floating metric card. */
function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" />
            Now in preview · 30-day free trial
          </div>
          <h1>Enterprise analytics with <em>control, safety, and confidence.</em></h1>
          <p className="lede">
            Opteryx is a cloud data warehouse built for dependable results, clear governance,
            and straightforward data ownership. Zero-ops consumption — no infrastructure to manage.
          </p>
          <div className="hero-cta">
            <a href="#waitlist" className="btn-navy">Start for free</a>
            <a href="#demo" className="btn-secondary">Watch demo</a>
          </div>
          <div className="hero-meta">
            <span><CheckIcon />Predictable behavior</span>
            <span><CheckIcon />Governance built-in</span>
            <span><CheckIcon />Your data, your control</span>
          </div>
        </div>

        <div className="hero-visual">
          <HeroArtwork />
        </div>
      </div>
    </section>
  );
}

function HeroArtwork() {
  const bars = [38, 54, 46, 72, 64, 88, 78, 96, 84, 108, 92, 118];
  const max = Math.max(...bars);
  return (
    <div className="hero-art">
      {/* background ribbon of dots */}
      <svg className="ribbon" viewBox="0 0 360 360" aria-hidden="true">
        <defs>
          <pattern id="dotgrid" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.1" fill="rgba(7,121,124,0.18)" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="40%" r="60%">
            <stop offset="0%"  stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="fadeMask">
            <rect width="360" height="360" fill="url(#fade)" />
          </mask>
        </defs>
        <rect width="360" height="360" fill="url(#dotgrid)" mask="url(#fadeMask)" />
      </svg>

      {/* main "panel" card with a chart + caption */}
      <div className="art-card main">
        <div className="art-card-head">
          <span className="dotlet teal" />
          <span className="art-title">country_events · last 30 days</span>
          <span className="art-meta mono">412 ms</span>
        </div>
        <div className="art-chart">
          <svg viewBox="0 0 300 120" preserveAspectRatio="none">
            {bars.map((h, i) => {
              const w = 16;
              const gap = 8;
              const x = i * (w + gap) + 4;
              const y = 120 - (h / max) * 110;
              const accent = i === 7;
              return (
                <rect key={i}
                  x={x} y={y} width={w} height={(h / max) * 110}
                  rx="2"
                  fill={accent ? 'var(--opteryx-orange)' : 'var(--opteryx-teal)'}
                  opacity={accent ? 1 : 0.82}
                />
              );
            })}
          </svg>
        </div>
        <div className="art-card-foot">
          <span className="legend"><span className="sw teal" />events</span>
          <span className="legend"><span className="sw orange" />peak day</span>
        </div>
      </div>

      {/* top-right metric tile */}
      <div className="art-card metric">
        <div className="art-metric-label">Rows scanned</div>
        <div className="art-metric-val mono">58,909,392</div>
        <div className="art-sparkline">
          <svg viewBox="0 0 120 32" preserveAspectRatio="none">
            <polyline
              fill="none" stroke="var(--opteryx-teal)" strokeWidth="2"
              points="0,24 12,20 24,22 36,14 48,18 60,10 72,12 84,6 96,9 108,4 120,7"
            />
            <polyline
              fill="rgba(7,121,124,0.12)" stroke="none"
              points="0,32 0,24 12,20 24,22 36,14 48,18 60,10 72,12 84,6 96,9 108,4 120,7 120,32"
            />
          </svg>
        </div>
      </div>

      {/* bottom-left pill */}
      <div className="art-pill">
        <span className="pulse" />
        <span>query.ok · 0.032 DWU</span>
      </div>

      {/* orange blob accent */}
      <svg className="blob" viewBox="0 0 200 200" aria-hidden="true">
        <path d="M40,90 Q60,30 130,40 Q190,80 160,140 Q110,190 60,160 Q10,130 40,90 Z"
              fill="var(--opteryx-orange)" opacity="0.10" />
      </svg>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--opteryx-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4L6 11L3 8" />
    </svg>
  );
}

window.Hero = Hero;
