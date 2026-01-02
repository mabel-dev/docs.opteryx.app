'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const pathToTitle: Record<string, string[]> = {
  '/docs/getting-started/registration': ['Getting Started', 'Logging in'],
  '/docs/getting-started/quick-start': ['Getting Started', 'Site tour'],
  '/docs/getting-started/reading-data': ['Getting Started', 'Load and query data'],
  '/docs/core-concepts/storage-formats': ['Core Concepts', 'Data structure'],
  '/docs/core-concepts/access-and-permissions': ['Core Concepts', 'Access & permissions'],
  '/docs/core-concepts/cost-model': ['Core Concepts', 'Cost model'],
  '/docs/reference/sql/supported-sql': ['Reference', 'SQL Language Reference', 'SQL overview'],
  '/docs/reference/sql/data-types': ['Reference', 'SQL Language Reference', 'Data types'],
  '/docs/reference/sql/functions': ['Reference', 'SQL Language Reference', 'Functions'],
  '/docs/reference/sql/aggregates': ['Reference', 'SQL Language Reference', 'Aggregates'],
  '/docs/reference/sql/statements': ['Reference', 'SQL Language Reference', 'Statements'],
  '/docs/reference/sql/joins': ['Reference', 'SQL Language Reference', 'Joins'],
  '/docs/reference/sql/advanced/engine-configuration': ['Reference', 'SQL Language Reference', 'Advanced topics', 'Engine configuration'],
  '/docs/reference/sql/advanced/information-schema': ['Reference', 'SQL Language Reference', 'Advanced topics', 'Information schema'],
  '/docs/reference/sql/advanced/null-semantics': ['Reference', 'SQL Language Reference', 'Advanced topics', 'NULL semantics'],
  '/docs/reference/sql/advanced/query-optimization': ['Reference', 'SQL Language Reference', 'Advanced topics', 'Query optimization'],
  '/docs/reference/sql/advanced/time-travel': ['Reference', 'SQL Language Reference', 'Advanced topics', 'Time travel'],
  '/docs/reference/sql/advanced/temp-tables': ['Reference', 'SQL Language Reference', 'Advanced topics', 'Temporary tables'],
  '/docs/reference/sql/advanced/working-with-ips': ['Reference', 'SQL Language Reference', 'Advanced topics', 'Working with IPs'],
  '/docs/reference/sql/advanced/working-with-lists': ['Reference', 'SQL Language Reference', 'Advanced topics', 'Working with lists'],
  '/docs/reference/sql/advanced/working-with-structs': ['Reference', 'SQL Language Reference', 'Advanced topics', 'Working with structs'],
  '/docs/reference/sql/advanced/working-with-timestamps': ['Reference', 'SQL Language Reference', 'Advanced topics', 'Working with timestamps'],
  
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = pathToTitle[pathname] || []

  if (breadcrumbs.length === 0) return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 pb-3 border-b border-gray-200">
      <Link href="/docs" className="hover:text-opteryx-teal hover:underline transition-colors">
        Docs
      </Link>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        
        return (
          <div key={index} className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {isLast ? (
              <span className="text-gray-900 font-medium">{crumb}</span>
            ) : (
              <span className="text-gray-600">{crumb}</span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
