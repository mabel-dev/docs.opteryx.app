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
  '/docs/reference/api/authentication-api': ['Reference', 'API Reference', 'Authentication API'],
  '/docs/reference/api/jobs-api': ['Reference', 'API Reference', 'Jobs API'],
  '/docs/reference/api/authorization-api': ['Reference', 'API Reference', 'Authorization API'],
  '/docs/reference/api/metadata-api': ['Reference', 'API Reference', 'Metadata API'],
  '/docs/reference/api/policy-api': ['Reference', 'API Reference', 'Policy API'],
  '/docs/reference/api/upload-api': ['Reference', 'API Reference', 'Upload API'],
  '/docs/reference/sql/functions/cast': ['Reference', 'SQL Language Reference', 'Functions', 'CAST'],
  '/docs/reference/sql/functions/try_cast': ['Reference', 'SQL Language Reference', 'Functions', 'TRY_CAST'],
  '/docs/reference/sql/functions/current_date': ['Reference', 'SQL Language Reference', 'Functions', 'current_date'],
  '/docs/reference/sql/functions/varchar': ['Reference', 'SQL Language Reference', 'Functions', 'VARCHAR'],
  '/docs/reference/sql/functions/integer': ['Reference', 'SQL Language Reference', 'Functions', 'INTEGER'],
  '/docs/reference/python/sqlalchemy': ['Reference', 'Python Integration', 'SQLAlchemy'],
  '/docs/reference/sql/statements/select': ['Reference', 'SQL Language Reference', 'Statements', 'SELECT'],
  '/docs/reference/sql/statements/where': ['Reference', 'SQL Language Reference', 'Statements', 'WHERE'],
  '/docs/reference/sql/statements/group-by': ['Reference', 'SQL Language Reference', 'Statements', 'GROUP BY'],
  '/docs/reference/sql/statements/having': ['Reference', 'SQL Language Reference', 'Statements', 'HAVING'],
  '/docs/reference/sql/statements/order-by': ['Reference', 'SQL Language Reference', 'Statements', 'ORDER BY'],
  '/docs/reference/sql/statements/limit': ['Reference', 'SQL Language Reference', 'Statements', 'LIMIT / OFFSET'],
  '/docs/reference/sql/statements/with': ['Reference', 'SQL Language Reference', 'Statements', 'WITH (CTE)'],
  '/docs/reference/sql/statements/distinct': ['Reference', 'SQL Language Reference', 'Statements', 'DISTINCT'],
  '/docs/reference/sql/statements/union': ['Reference', 'SQL Language Reference', 'Statements', 'UNION / INTERSECT / EXCEPT'],
  '/docs/reference/sql/statements/insert': ['Reference', 'SQL Language Reference', 'Statements', 'INSERT'],
  '/docs/reference/sql/statements/update': ['Reference', 'SQL Language Reference', 'Statements', 'UPDATE'],
  '/docs/reference/sql/statements/delete': ['Reference', 'SQL Language Reference', 'Statements', 'DELETE'],
  '/docs/reference/sql/statements/explain': ['Reference', 'SQL Language Reference', 'Statements', 'EXPLAIN'],
  '/docs/reference/sql/statements/create-view': ['Reference', 'SQL Language Reference', 'Statements', 'CREATE VIEW'],
  '/docs/reference/sql/statements/alter-view': ['Reference', 'SQL Language Reference', 'Statements', 'ALTER VIEW'],
  '/docs/reference/sql/statements/drop-view': ['Reference', 'SQL Language Reference', 'Statements', 'DROP VIEW'],
  '/docs/reference/sql/statements/analyze-table': ['Reference', 'SQL Language Reference', 'Statements', 'ANALYZE TABLE'],
  '/docs/reference/sql/statements/comment': ['Reference', 'SQL Language Reference', 'Statements', 'COMMENT'],
  '/docs/reference/sql/statements/at': ['Reference', 'SQL Language Reference', 'Statements', 'AT (Time Travel)'],
  
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
