import Link from 'next/link'

const sections = [
  { href: '/docs/getting-started/quick-start', title: 'Quick start' },
  { href: '/docs/getting-started/installation', title: 'Installation' },
  { href: '/docs/architecture/execution-engine', title: 'Execution engine' },
  { href: '/docs/core-concepts/execution-model', title: 'Execution model' },
  { href: '/docs/operations/security-permissions', title: 'Security & permissions' },
  { href: '/docs/about', title: 'About' }
]

export default function DocsSidebar(){
  return (
    <aside className="docs-sidebar hidden md:block md:sticky md:top-16 md:w-64 lg:w-72">
      <nav className="p-4">
        <div className="text-sm font-semibold mb-3">Documentation</div>
        <ul className="space-y-2">
          {sections.map(s => (
            <li key={s.href}>
              <Link href={s.href} className="text-gray-700 hover:text-opteryx-navy block rounded-md px-2 py-1">{s.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
