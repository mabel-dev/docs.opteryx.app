/* DocsSidebar.jsx — Left navigation: grouped headings with nested items. */
const NAV = [
  {
    group: 'Getting Started',
    items: [
      { label: 'Logging in' },
      { label: 'Site tour' },
      { label: 'Load and query data' },
    ],
  },
  {
    group: 'Core Concepts',
    items: [
      { label: 'Access and permissions' },
      { label: 'Cost model' },
    ],
  },
  {
    group: 'Reference',
    items: [
      { label: 'API Reference', expanded: true, children: [
        { label: 'Authentication API' },
        { label: 'Jobs API' },
        { label: 'Policy API' },
        { label: 'Upload API' },
      ]},
      { label: 'SQL Language Reference', expanded: true, children: [
        { label: 'Data Types', active: true, expanded: true, children: [
          { label: 'ARRAY', mono: true },
          { label: 'BLOB', mono: true },
          { label: 'BOOLEAN', mono: true },
          { label: 'DATE', mono: true },
          { label: 'DECIMAL', mono: true },
          { label: 'DOUBLE', mono: true },
          { label: 'INTEGER', mono: true },
          { label: 'INTERVAL', mono: true },
          { label: 'JSONB', mono: true },
          { label: 'NULL', mono: true },
          { label: 'TIME', mono: true },
          { label: 'TIMESTAMP', mono: true },
        ]},
      ]},
    ],
  },
];

function Chev({ open }) {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
         stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
         style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}>
      <path d="M4 6 L8 10 L12 6" />
    </svg>
  );
}

function NavItem({ item, depth }) {
  const hasChildren = item.children && item.children.length;
  return (
    <>
      <a
        href="#"
        className={
          "nav-item" +
          (item.active ? ' active' : '') +
          (item.mono ? ' mono' : '') +
          ` d${depth}`
        }
        onClick={e => e.preventDefault()}
      >
        <span className="nav-label">{item.label}</span>
        {hasChildren && <Chev open={item.expanded} />}
      </a>
      {hasChildren && item.expanded && (
        <div className="nav-children">
          {item.children.map(c => <NavItem key={c.label} item={c} depth={depth+1} />)}
        </div>
      )}
    </>
  );
}

function DocsSidebar() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const active = ref.current && ref.current.querySelector('.nav-item.active');
    if (active && active.offsetTop > 0) {
      ref.current.scrollTop = Math.max(0, active.offsetTop - 80);
    }
  }, []);
  return (
    <aside className="docs-sidebar" ref={ref}>
      <nav>
        {NAV.map(group => (
          <div key={group.group} className="nav-group">
            <div className="nav-group-title">{group.group}</div>
            {group.items.map(i => <NavItem key={i.label} item={i} depth={1} />)}
          </div>
        ))}
      </nav>
    </aside>
  );
}

window.DocsSidebar = DocsSidebar;
