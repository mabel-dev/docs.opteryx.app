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
      // Unconditionally, because this runs once per post: the previous check
      // read an activeId left over from the post navigated away from, which is
      // never empty after the first one, so every post reached by a client-side
      // route change opened with nothing highlighted.
      setActiveId(data.length ? data[0].id : '')
    }
    const timer = setTimeout(extract, 100)
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) }),
      { rootMargin: '-100px 0px -66%' }
    )
    document.querySelectorAll('article h2, article h3').forEach(el => obs.observe(el))
    // The timer is cleared as well as the observer: left pending across a route
    // change it fires against the next post and overwrites the heading it has
    // just highlighted.
    return () => { clearTimeout(timer); obs.disconnect() }
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
