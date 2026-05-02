/* Header.jsx — minimal: logo + env, avatar on the right. */

function StudioBrandMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="300 310 1420 1420">
      <rect fill="#07797C" x="300" y="310" width="1420" height="1420" rx="165" ry="165" />
      <g fill="#FFFFFF">
        <polygon points="718.6,837.06 651.19,666.76 392.74,628.06 555.18,887.01 555.56,887.61 776.33,1077.22 759.67,900.82" />
        <path d="M1403.02,1110.35l-359.82-96.07l194.34-111.64l276.03-220.13l0.54-0.43l77.43-112.13l-500.94,91.17l-1.67,0.31L891.97,900.04l25.22-196.91l-21.44-90.03l-128.98,83.28l-36.69,100.49l81.83-24.91L778.25,917l-0.17,0.74L795.03,1097L987,1208.71l-10.81-53.46l90.16,127.83l-4.67,106.63c-19.2,0.56-34.64,16.35-34.64,35.68v4.66h29.31l0,0.01h43.78l57.89-234.19l256.95-17.4l1.31-0.09l190.99-135.08L1403.02,1110.35z" />
        <path d="M899.89,1191.19l34.94,89.51l-59.53,108.99h-7.97c-19.68,0-35.7,16.01-35.7,35.7v4.66h65.6l105.18-152.6l-9.51-46.37L899.89,1191.19z" />
      </g>
    </svg>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = React.useState(() => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.getAttribute('data-theme') || 'light';
  });
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('opteryx-theme', theme); } catch (e) {}
  }, [theme]);
  const isDark = theme === 'dark';
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={'theme-track ' + (isDark ? 'dark' : 'light')}>
        <span className="theme-knob">
          {isDark ? (
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 9.5 A5.5 5.5 0 1 1 6.5 3 a4.5 4.5 0 0 0 6.5 6.5 z"/>
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="3"/>
              <path d="M8 1.5 V3 M8 13 v1.5 M1.5 8 H3 M13 8 h1.5 M3.3 3.3 L4.4 4.4 M11.6 11.6 L12.7 12.7 M3.3 12.7 L4.4 11.6 M11.6 4.4 L12.7 3.3"/>
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}

function Header() {
  return (
    <header className="ide-header">
      <div className="ide-logo">
        <StudioBrandMark />
        <span className="name">Opteryx Studio</span>
      </div>
      <span className="env-chip">Rework</span>
      <div style={{flex:1}} />
      <ThemeToggle />
      <div className="user-chip">
        <span className="avatar">JJ</span>
      </div>
    </header>
  );
}

function SystemWarning({ children, onDismiss }) {
  return (
    <div className="sys-warning" role="status">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2l6.5 11.5h-13z"/>
        <path d="M8 6.5v3.2"/>
        <circle cx="8" cy="11.6" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
      <span className="sys-warning-text">{children}</span>
      <button className="sys-warning-dismiss" onClick={onDismiss} aria-label="Dismiss">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
      </button>
    </div>
  );
}

window.Header = Header;
window.SystemWarning = SystemWarning;
