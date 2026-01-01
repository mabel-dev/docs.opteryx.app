'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

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
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    // Auto-expand section if current page is in it
    Object.fromEntries(nav.map(section => [
      section.title, 
      section.items.some((item: any) => 
        item.href === pathname || 
        (item.items && item.items.some((sub: any) => sub.href === pathname))
      )
    ]))
  )

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }))
  }

  const renderItem = (item: any, level = 0) => {
    const isActive = item.href === pathname
    
    if (item.items) {
      // Nested submenu (always expanded)
      return (
        <div key={item.title} className={`${level > 0 ? 'ml-2 mt-1' : ''}`}>
          <div className={`text-xs ${level > 0 ? 'font-medium text-gray-600' : 'font-semibold'} mb-1 cursor-default`}>
            {item.title}
          </div>
          <ul className="space-y-0.5 text-sm border-l border-gray-200 ml-2 pl-3">
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
      <Link 
        href={item.href} 
        className={`block rounded px-2 py-1 text-sm transition-colors ${
          isActive 
            ? 'bg-opteryx-teal/10 text-opteryx-teal font-medium' 
            : 'text-gray-700 hover:text-opteryx-navy hover:bg-gray-100'
        }`}
      >
        {item.title}
      </Link>
    )
  }

  return (
    <aside className="docs-sidebar hidden md:block md:w-64 lg:w-72 border-r border-gray-200 overflow-y-auto sticky top-0 h-screen pt-4">
      <nav className="px-4 pb-8">
        {nav.map(section => {
          const isExpanded = expandedSections[section.title]
          return (
            <div key={section.title} className="mb-3">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-1 hover:text-opteryx-teal transition-colors"
              >
                {section.title}
                <svg 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {isExpanded && (
                <ul className="space-y-0.5 text-sm mt-1">
                  {section.items.map((item: any) => (
                    <li key={item.href || item.title}>
                      {renderItem(item)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
