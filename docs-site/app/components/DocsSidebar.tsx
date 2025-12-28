import Link from 'next/link'

const nav = [
  { title: 'Introduction', items: [
    { href: '/docs/introduction/what-is-opteryx', title: 'What is Opteryx' },
    { href: '/docs/introduction/when-to-use', title: 'When to use Opteryx' }
  ]},
  { title: 'Getting Started', items: [
    { href: '/docs/getting-started/registration', title: 'Registration' },
    { href: '/docs/getting-started/first-query', title: 'First query' },
    { href: '/docs/getting-started/reading-data', title: 'Reading data' }
  ]},
  { title: 'Core Concepts', items: [
    { href: '/docs/core-concepts/execution-model', title: 'Execution model' },
    { href: '/docs/core-concepts/morsels-vectors', title: 'Morsels & vectors' },
    { href: '/docs/core-concepts/cost-model', title: 'Cost model' },
    { href: '/docs/core-concepts/storage-formats', title: 'Storage & formats' }
  ]},
  { title: 'SQL Reference', items: [
    { href: '/docs/sql-reference/supported-sql', title: 'Supported SQL' },
    { href: '/docs/sql-reference/functions', title: 'Functions' },
    { href: '/docs/sql-reference/semantics-edge-cases', title: 'Semantics & edge cases' }
  ]},
  { title: 'API Reference', href: '/docs/api-reference' },
  { title: 'Architecture', items: [
    { href: '/docs/architecture/planner', title: 'Planner' },
    { href: '/docs/architecture/optimizer', title: 'Optimizer' },
    { href: '/docs/architecture/execution-engine', title: 'Execution engine' },
    { href: '/docs/architecture/internal-components', title: 'Internal components' }
  ]},
  { title: 'Operations', items: [
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
  return (
    <aside className="docs-sidebar hidden md:block md:sticky md:top-16 md:w-64 lg:w-72">
      <nav className="p-4">
        {nav.map(section => (
          <div key={section.title} className="mb-4">
            <div className="text-sm font-semibold mb-2">{section.title}</div>
            {section.items ? (
              <ul className="space-y-1 text-sm">
                {section.items.map(i => (
                  <li key={i.href}>
                    <Link href={i.href} className="text-gray-700 hover:text-opteryx-navy block rounded-md px-2 py-1">{i.title}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                <Link href={section.href} className="text-gray-700 hover:text-opteryx-navy block rounded-md px-2 py-1">{section.title}</Link>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
