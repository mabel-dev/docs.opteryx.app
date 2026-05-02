/* DocsTOC.jsx — Right "On this page" rail. */
const TOC = [
  { id: 'numeric',     label: 'Numeric types' },
  { id: 'temporal',    label: 'Temporal types' },
  { id: 'collection',  label: 'Collection types' },
  { id: 'callouts',    label: 'Callouts' },
  { id: 'tables',      label: 'Tables' },
  { id: 'parameters',  label: 'Parameter table' },
  { id: 'lists',       label: 'Lists' },
  { id: 'code',        label: 'Code blocks' },
  { id: 'steps',       label: 'Steps' },
  { id: 'tags',        label: 'Tags & methods' },
  { id: 'quotes',      label: 'Blockquote' },
];

function DocsTOC({ active, onSelect }) {
  return (
    <aside className="docs-toc">
      <div className="toc-title">On this page</div>
      <nav>
        {TOC.map(item => (
          <a
            key={item.id}
            href={'#' + item.id}
            className={'toc-item' + (active === item.id ? ' active' : '')}
            onClick={e => { e.preventDefault(); onSelect && onSelect(item.id); }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

window.DocsTOC = DocsTOC;
