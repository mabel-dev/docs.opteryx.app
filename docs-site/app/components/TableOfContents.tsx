'use client'
import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract H2 and H3 headings from the document
    const extractHeadings = () => {
      const elements = Array.from(document.querySelectorAll('article h2, article h3'))
      const headingData: Heading[] = elements.map((elem) => ({
        id: elem.id,
        text: elem.textContent || '',
        level: parseInt(elem.tagName[1])
      }))
      setHeadings(headingData)

      // Set active ID to first heading if available
      if (headingData.length > 0 && !activeId) {
        setActiveId(headingData[0].id)
      }
    }

    // Run after a short delay to ensure DOM is fully rendered
    setTimeout(extractHeadings, 100)

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -66%' }
    )

    const elements = document.querySelectorAll('article h2, article h3')
    elements.forEach((elem) => observer.observe(elem))
    
    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <aside className="hidden xl:block xl:w-64 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pb-8 pt-4">
      <div className="pl-6 pr-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">On this page</h4>
        <nav>
          <ul className="space-y-2 text-sm border-l border-gray-200">
            {headings.map((heading) => (
              <li key={heading.id} className={heading.level === 3 ? 'ml-4' : ''}>
                <a
                  href={`#${heading.id}`}
                  className={`block py-1 px-3 border-l-2 -ml-px transition-colors ${
                    activeId === heading.id
                      ? 'border-opteryx-teal text-opteryx-teal font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
