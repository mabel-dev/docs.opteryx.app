'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface Heading { id: string; text: string; level: number }

export default function BlogPostTOC() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    const extract = () => {
      const els = Array.from(document.querySelectorAll('article h2, article h3'))
      const data = els.map(el => ({ id: el.id, text: el.textContent || '', level: parseInt(el.tagName[1]) }))
      setHeadings(data)
      if (data.length && !activeId) setActiveId(data[0].id)
    }
    setTimeout(extract, 100)
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) }),
      { rootMargin: '-100px 0px -66%' }
    )
    document.querySelectorAll('article h2, article h3').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [pathname])

  if (!headings.length) return <div />

  return (
    <aside className="post-toc">
      <div className="toc-title">On this page</div>
      <nav>
        {headings.map(h => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`toc-item${h.level === 3 ? ' lvl3' : ''}${activeId === h.id ? ' active' : ''}`}
            onClick={e => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' }) }}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </aside>
  )
}
