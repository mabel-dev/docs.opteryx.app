'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { docsBreadcrumbsByPath, inferBreadcrumbsFromPath } from '@/app/lib/docsNav'

export default function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = docsBreadcrumbsByPath[pathname] || inferBreadcrumbsFromPath(pathname)

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 pb-3 border-b border-gray-200">
      <Link href="/docs" className="hover:text-opteryx-teal hover:underline transition-colors">
        Docs
      </Link>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1

        return (
          <div key={`${crumb}-${index}`} className="flex items-center space-x-2">
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
