 'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useMemo } from 'react'
import navJson from '../../nav.json'

// Convert nav.json structure into the sidebar format used in this component
const buildNav = (navArray: any[]) => {
  const resolved: Array<{ title: string, items: any[] }> = []

  const toHref = (mdPath: string) => {
    // Strip .md and prefix with /docs/
    const cleaned = mdPath.replace(/\.md$/i, '')
    return '/docs/' + cleaned
  }

  const resolveNode = (node: any): any => {
    // node is an object with single key
    const key = Object.keys(node)[0]
    const val = node[key]
    if (typeof val === 'string') {
      return { href: toHref(val), title: key }
    }
    if (Array.isArray(val)) {
      const items = val.map((child: any) => {
        const childKey = Object.keys(child)[0]
        const childVal = child[childKey]
        if (typeof childVal === 'string') return { href: toHref(childVal), title: childKey }
        // nested array -> submenu
        if (Array.isArray(childVal)) {
          return { title: childKey, items: childVal.map((c: any) => resolveNode(c)) }
        }
        return null
      }).filter(Boolean)
      return { title: key, items }
    }
    return null
  }

  for (const entry of navArray) {
    const title = Object.keys(entry)[0]
    const value = entry[title]
    if (typeof value === 'string') {
      // single file -> treat as section with single item
      resolved.push({ title, items: [{ href: toHref(value), title }] })
    } else if (Array.isArray(value)) {
      // build items
      const items = value.map((elem: any) => {
        const k = Object.keys(elem)[0]
        const v = elem[k]
        if (typeof v === 'string') return { href: toHref(v), title: k }
        if (Array.isArray(v)) {
          return { title: k, items: v.map((c: any) => resolveNode(c)) }
        }
        return null
      }).filter(Boolean)
      resolved.push({ title, items })
    }
  }

  return resolved
}

const nav = buildNav(navJson)

export default function DocsSidebar(){
  const pathname = usePathname()
  
  // L1 sections always visible, L2 subsections expandable
  const [expandedL2, setExpandedL2] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    nav.forEach(section => {
      section.items.forEach((item: any) => {
          if (item.items) {
          // Auto-expand L2 if current page is in it
          const key = `${section.title}::${item.title}`
          initial[key] = item.items.some((sub: any) => sub.href === pathname)
        }
      })
    })
    return initial
  })

  const toggleL2 = (sectionTitle: string, itemTitle: string) => {
    const key = `${sectionTitle}::${itemTitle}`
    setExpandedL2(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const renderL2Item = (sectionTitle: string, item: any) => {
    const isActive = item.href === pathname
    const key = `${sectionTitle}::${item.title}`
    const isExpanded = expandedL2[key]
    
    if (item.items) {
      // L2 with children (expandable)
      return (
        <div key={item.title} className="mb-1">
          <button
            onClick={() => toggleL2(sectionTitle, item.title)}
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
              {item.items.map((subItem: any) => {
                if (subItem.items) {
                  // Nested submenu (L3 with children - shouldn't happen but handle gracefully)
                  return (
                    <li key={subItem.title} className="text-xs text-gray-600 mt-2 mb-1">
                      {subItem.title}
                    </li>
                  )
                }
                return (
                  <li key={subItem.href || subItem.title}>
                    {subItem.href ? (
                      <Link 
                        href={subItem.href} 
                        className={`block rounded px-2 py-1 text-sm transition-colors ${
                          subItem.href === pathname
                            ? 'bg-opteryx-teal/10 text-opteryx-teal' 
                            : 'text-gray-700 hover:text-opteryx-navy hover:bg-gray-100'
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    ) : (
                      <span className="block px-2 py-1 text-sm text-gray-600">
                        {subItem.title}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )
    }
    
    // L2 direct link
    if (!item.href) {
      // Handle items without href (shouldn't happen but be defensive)
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
        {nav.map(section => (
          <div key={section.title} className="mb-4">
            {/* L1 heading - always visible, not clickable */}
            <div className="font-bold text-gray-900 mb-2 px-2">
              {section.title}
            </div>
            {/* L2 items - always visible */}
            <div className="space-y-0.5">
              {section.items.map((item: any) => renderL2Item(section.title, item))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
