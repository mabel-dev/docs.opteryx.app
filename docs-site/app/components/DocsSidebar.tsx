'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { sidebarNav, type DocsNavItem } from '@/app/lib/docsNav'

export default function DocsSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const itemContainsPath = (item: DocsNavItem, path: string): boolean => {
    if (item.href === path) {
      return true
    }

    if (!item.items) {
      return false
    }

    return item.items.some((child) => itemContainsPath(child, path))
  }

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {}

    sidebarNav.forEach((section) => {
      section.items.forEach((item) => {
        if (!item.items) {
          return
        }

        const level2Key = `${section.title}::${item.title}`
        if (itemContainsPath(item, pathname)) {
          initialExpanded[level2Key] = true
        }

        item.items.forEach((child) => {
          if (!child.items) {
            return
          }

          const level3Key = `${section.title}::${item.title}::${child.title}`
          if (itemContainsPath(child, pathname)) {
            initialExpanded[level3Key] = true
          }
        })
      })
    })

    setExpandedItems((prev) => ({ ...initialExpanded, ...prev }))
  }, [pathname])

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const renderNestedItem = (parentKey: string, item: DocsNavItem) => {
    if (!item.items) {
      if (!item.href) {
        return (
          <span className="block px-2 py-1 text-sm text-gray-600">
            {item.title}
          </span>
        )
      }

      const isActive = item.href === pathname
      return (
        <Link
          href={item.href}
          className={`block rounded px-2 py-1 text-sm transition-colors ${
            isActive
              ? 'bg-opteryx-teal/10 text-opteryx-teal'
              : 'text-gray-700 hover:text-opteryx-navy hover:bg-gray-100'
          }`}
        >
          {item.title}
        </Link>
      )
    }

    const key = `${parentKey}::${item.title}`
    const isExpanded = !!expandedItems[key]
    const isActive = item.href === pathname

    return (
      <div>
        <div className={`flex items-center rounded ${isActive ? 'bg-opteryx-teal/10' : ''}`}>
          {item.href ? (
            <Link
              href={item.href}
              className={`flex-1 block px-2 py-1 text-sm transition-colors ${
                isActive
                  ? 'text-opteryx-teal'
                  : 'text-gray-700 hover:text-opteryx-navy hover:bg-gray-100'
              }`}
            >
              {item.title}
            </Link>
          ) : (
            <span className="flex-1 block px-2 py-1 text-sm text-gray-700">{item.title}</span>
          )}
          <button
            onClick={() => toggleItem(key)}
            className={`px-2 py-1 transition-colors ${isActive ? 'text-opteryx-teal' : 'hover:text-opteryx-teal'}`}
          >
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {isExpanded && (
          <ul className="space-y-0.5 mt-1 ml-3 border-l border-gray-200 pl-3">
            {item.items.map((child) => (
              <li key={child.href || child.title}>{renderNestedItem(key, child)}</li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  const renderLevel2Item = (sectionTitle: string, item: DocsNavItem) => {
    const isActive = item.href === pathname

    if (item.items) {
      const key = `${sectionTitle}::${item.title}`
      const isExpanded = !!expandedItems[key]

      return (
        <div key={item.title} className="mb-1">
          <button
            onClick={() => toggleItem(key)}
            className="w-full flex items-center justify-between text-sm text-gray-800 px-2 py-1 hover:text-opteryx-teal transition-colors rounded"
          >
            {item.title}
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isExpanded && (
            <ul className="space-y-0.5 mt-1 ml-3 border-l border-gray-200 pl-3">
              {item.items.map((subItem) => (
                <li key={subItem.href || subItem.title}>{renderNestedItem(key, subItem)}</li>
              ))}
            </ul>
          )}
        </div>
      )
    }

    if (!item.href) {
      return (
        <div key={item.title} className="px-2 py-1 text-sm text-gray-600">
          {item.title}
        </div>
      )
    }

    return (
      <Link
        key={item.title}
        href={item.href}
        className={`block rounded px-2 py-1 text-sm transition-colors ${
          isActive
            ? 'bg-opteryx-teal/10 text-opteryx-teal'
            : 'text-gray-800 hover:text-opteryx-navy hover:bg-gray-100'
        }`}
      >
        {item.title}
      </Link>
    )
  }

  return (
    <aside className="docs-sidebar hidden md:block md:w-64 lg:w-72 border-r border-gray-200 overflow-y-auto sticky top-0 h-screen pt-4">
      <nav className="px-4 pb-8">
        {sidebarNav.map((section) => (
          <div key={section.title} className="mb-4">
            <div className="font-bold text-gray-900 mb-2 px-2">{section.title}</div>
            <div className="space-y-0.5">
              {section.items.map((item) => renderLevel2Item(section.title, item))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
