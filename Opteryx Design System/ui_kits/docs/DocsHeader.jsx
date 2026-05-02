/* DocsHeader.jsx — Opteryx Documentation top header. */
function DocsHeader() {
  return (
    <header className="docs-header">
      <div className="docs-header-inner">
        <a href="#" className="docs-logo">
          <img src="../../assets/opteryx-icon.svg" alt="" />
          <span>Opteryx Documentation</span>
        </a>
        <nav className="docs-nav">
          <a href="#">Guides</a>
          <a href="#">Blog</a>
          <a href="#">Releases</a>
        </nav>
        <div className="docs-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="6"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input placeholder="Search" />
        </div>
        <a href="#" className="docs-cta">Try Opteryx</a>
      </div>
    </header>
  );
}

window.DocsHeader = DocsHeader;
