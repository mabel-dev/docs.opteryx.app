import Link from 'next/link'

const nav = [
  { title: 'Introduction', items: [
    { href: '/docs/introduction/what-is-opteryx', title: 'What is Opteryx' },
    { href: '/docs/introduction/when-to-use', title: 'When to use Opteryx' },
    { href: '/docs/introduction/design-principles', title: 'Design principles' }
  ]},
  { title: 'Getting Started', items: [
    { href: '/docs/getting-started/installation', title: 'Installation' },
    { href: '/docs/getting-started/first-query', title: 'First query' },
    { href: '/docs/getting-started/reading-data', title: 'Reading data' }
  ]},
  { title: 'Core Concepts', items: [
    { href: '/docs/core-concepts/execution-model', title: 'Execution model' },
    { href: '/docs/core-concepts/morsels-vectors', title: 'Morsels & vectors' },
    { href: '/docs/core-concepts/cost-model', title: 'Cost model' },
    { href: '/docs/core-concepts/storage-formats', title: 'Storage & formats' }
  ]},
  { title: 'Reference', items: [
    { href: '/docs/reference/sql/supported-sql', title: 'SQL overview' },
    { href: '/docs/reference/sql/data-types', title: 'Data types' },
    { href: '/docs/reference/sql/functions', title: 'Functions' },
    { href: '/docs/reference/sql/aggregates', title: 'Aggregates' },
    { href: '/docs/reference/sql/statements', title: 'Statements' },
    { href: '/docs/reference/sql/joins', title: 'Joins' },
    { title: 'Advanced topics', items: [
      { href: '/docs/reference/sql/advanced/engine-configuration', title: 'Engine configuration' },
      { href: '/docs/reference/sql/advanced/information-schema', title: 'Information schema' },
      { href: '/docs/reference/sql/advanced/null-semantics', title: 'NULL semantics' },
      { href: '/docs/reference/sql/advanced/query-optimization', title: 'Query optimization' },
      { href: '/docs/reference/sql/advanced/time-travel', title: 'Time travel' },
      { href: '/docs/reference/sql/advanced/temp-tables', title: 'Temporary tables' },
      { href: '/docs/reference/sql/advanced/working-with-ips', title: 'Working with IPs' },
      { href: '/docs/reference/sql/advanced/working-with-lists', title: 'Working with lists' },
      { href: '/docs/reference/sql/advanced/working-with-structs', title: 'Working with structs' },
      { href: '/docs/reference/sql/advanced/working-with-timestamps', title: 'Working with timestamps' }
    ]}
  ]},
  { title: 'Architecture', items: [
    { href: '/docs/architecture/planner', title: 'Planner' },
    { href: '/docs/architecture/optimizer', title: 'Optimizer' },
    { href: '/docs/architecture/execution-engine', title: 'Execution engine' },
    { href: '/docs/architecture/internal-components', title: 'Internal components' }
  ]},
  { title: 'Operations', items: [
    { href: '/docs/operations/running-locally', title: 'Running locally' },
    { href: '/docs/operations/cloud-model', title: 'Cloud model' },
    { href: '/docs/operations/security-permissions', title: 'Security & permissions' }
  ]},
  { title: 'Roadmap & Guarantees', items: [
    { href: '/docs/roadmap-guarantees/stability-promises', title: 'Stability promises' },
    { href: '/docs/roadmap-guarantees/compatibility', title: 'Compatibility' },
    { href: '/docs/roadmap-guarantees/known-limits', title: 'Known limits' }
  ]}
]

export default function DocsSidebar(){
  const renderItem = (item: any, level = 0) => {
    if (item.items) {
      // Nested submenu
      return (
        <div key={item.title} className={`${level > 0 ? 'ml-2 mt-1' : ''}`}>
          <div className={`text-xs ${level > 0 ? 'font-medium text-gray-600' : 'font-semibold'} mb-1`}>
            {item.title}
          </div>
          <ul className="space-y-1 text-sm">
            {item.items.map((subItem: any) => (
              <li key={subItem.href || subItem.title}>
                {renderItem(subItem, level + 1)}
              </li>
            ))}
          </ul>
        </div>
      )
    }
    // Regular link
    return (
      <Link href={item.href} className="text-gray-700 hover:text-opteryx-navy block rounded-md px-2 py-1">
        {item.title}
      </Link>
    )
  }

  return (
    <aside className="docs-sidebar hidden md:block md:sticky md:top-16 md:w-64 lg:w-72">
      <nav className="p-4">
        {nav.map(section => (
          <div key={section.title} className="mb-4">
            <div className="text-sm font-semibold mb-2">{section.title}</div>
            <ul className="space-y-1 text-sm">
              {section.items.map((item: any) => (
                <li key={item.href || item.title}>
                  {renderItem(item)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
