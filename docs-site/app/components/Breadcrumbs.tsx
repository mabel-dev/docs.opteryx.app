'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const pathToTitle: Record<string, string[]> = {
  '/docs/introduction/what-is-opteryx': ['Introduction', 'What is Opteryx'],
  '/docs/introduction/when-to-use': ['Introduction', 'When to use Opteryx'],
  '/docs/introduction/design-principles': ['Introduction', 'Design principles'],
  '/docs/getting-started/installation': ['Getting Started', 'Installation'],
  '/docs/getting-started/first-query': ['Getting Started', 'First query'],
  '/docs/getting-started/reading-data': ['Getting Started', 'Reading data'],
  '/docs/core-concepts/execution-model': ['Core Concepts', 'Execution model'],
  '/docs/core-concepts/morsels-vectors': ['Core Concepts', 'Morsels & vectors'],
  '/docs/core-concepts/cost-model': ['Core Concepts', 'Cost model'],
  '/docs/core-concepts/storage-formats': ['Core Concepts', 'Storage & formats'],
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
  '/docs/architecture/planner': ['Architecture', 'Planner'],
  '/docs/architecture/optimizer': ['Architecture', 'Optimizer'],
  '/docs/architecture/execution-engine': ['Architecture', 'Execution engine'],
  '/docs/architecture/internal-components': ['Architecture', 'Internal components'],
  '/docs/operations/running-locally': ['Operations', 'Running locally'],
  '/docs/operations/cloud-model': ['Operations', 'Cloud model'],
  '/docs/operations/security-permissions': ['Operations', 'Security & permissions'],
  '/docs/roadmap-guarantees/stability-promises': ['Roadmap & Guarantees', 'Stability promises'],
  '/docs/roadmap-guarantees/compatibility': ['Roadmap & Guarantees', 'Compatibility'],
  '/docs/roadmap-guarantees/known-limits': ['Roadmap & Guarantees', 'Known limits'],
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = pathToTitle[pathname] || []

  if (breadcrumbs.length === 0) return null

  // Define which breadcrumb items have actual pages (not just structural)
  const hasPage = (crumb: string, index: number): boolean => {
    // First level pages exist for all sections
    if (index === 0) return true
    // "SQL Language Reference" and "Advanced topics" are structural only
    if (crumb === 'SQL Language Reference' || crumb === 'Advanced topics') return false
    // All other intermediate pages exist
    return true
  }

  // Build cumulative path for each breadcrumb level
  const buildBreadcrumbPath = (index: number): string => {
    const parts = breadcrumbs.slice(0, index + 1)
    
    // Map breadcrumb segments to URL segments
    const urlSegments: string[] = []
    parts.forEach((part, i) => {
      const slug = part.toLowerCase()
        .replace(/\s+&\s+/g, '-')
        .replace(/\s+/g, '-')
      
      if (i === 0) {
        // First level maps directly to docs section
        if (part === 'Introduction') urlSegments.push('introduction')
        else if (part === 'Getting Started') urlSegments.push('getting-started')
        else if (part === 'Core Concepts') urlSegments.push('core-concepts')
        else if (part === 'Reference') urlSegments.push('reference')
        else if (part === 'Architecture') urlSegments.push('architecture')
        else if (part === 'Operations') urlSegments.push('operations')
        else if (part === 'Roadmap & Guarantees') urlSegments.push('roadmap-guarantees')
      } else if (i === 1 && parts[0] === 'Reference') {
        // Reference → SQL Language Reference maps to sql/
        if (part === 'SQL Language Reference') urlSegments.push('sql')
      } else if (i === 2 && parts[0] === 'Reference' && parts[1] === 'SQL Language Reference') {
        // Third level under Reference → SQL maps to specific page
        if (part === 'Advanced topics') urlSegments.push('advanced')
        else urlSegments.push(slug)
      } else {
        urlSegments.push(slug)
      }
    })
    
    return `/docs/${urlSegments.join('/')}`
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 pb-3 border-b border-gray-200">
      <Link href="/docs" className="hover:text-opteryx-teal hover:underline transition-colors">
        Docs
      </Link>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        const isClickable = hasPage(crumb, index)
        const href = buildBreadcrumbPath(index)
        
        return (
          <div key={index} className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {isLast ? (
              <span className="text-gray-900 font-medium">{crumb}</span>
            ) : isClickable ? (
              <Link href={href} className="text-gray-600 hover:text-opteryx-teal hover:underline transition-colors">
                {crumb}
              </Link>
            ) : (
              <span className="text-gray-600">{crumb}</span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
