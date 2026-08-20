'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SEARCH_OPTIONS } from '@/app/lib/searchTerms.mjs'

type Result = {
  id: number
  title: string
  heading: string | null
  url: string
  section: string
  excerpt: string
}

type IndexState = 'idle' | 'loading' | 'ready' | 'error'

const MAX_RESULTS = 8
// A reference page is indexed one section at a time, so a query naming a page
// well — `levenshtein` against its Syntax, Arguments and Returns sections —
// otherwise wins every slot with one destination and hides everything else.
const MAX_PER_PAGE = 2

function limitPerPage(hits: Result[]) {
  const perPage = new Map<string, number>()
  const kept: Result[] = []
  const overflow: Result[] = []

  for (const hit of hits) {
    const page = hit.url.split('#')[0]
    const seen = perPage.get(page) ?? 0
    if (seen < MAX_PER_PAGE) {
      perPage.set(page, seen + 1)
      kept.push(hit)
    } else {
      overflow.push(hit)
    }
  }

  // Backfill rather than return a short list: if the query genuinely only
  // matches one page, showing more of that page beats showing three results.
  return kept.concat(overflow).slice(0, MAX_RESULTS)
}

export default function SearchBox() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<IndexState>('idle')

  const searchRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // The index is a few hundred KB — far too much to put in front of a reader
  // who never searches. It is fetched on first intent (focus or the `/` key)
  // instead of on page load, so the cost lands only on people who search.
  const loadIndex = useCallback(async () => {
    if (searchRef.current || state === 'loading') return
    setState('loading')
    try {
      const [{ default: MiniSearch }, response] = await Promise.all([
        import('minisearch'),
        fetch('/search-index.json')
      ])
      if (!response.ok) throw new Error(`index request failed: ${response.status}`)
      searchRef.current = MiniSearch.loadJSON(await response.text(), SEARCH_OPTIONS as any)
      setState('ready')
    } catch (error) {
      console.error('[search] index unavailable', error)
      setState('error')
    }
  }, [state])

  // Re-run when the index arrives, so a query typed while it was still in
  // flight resolves itself rather than sitting on an empty result list.
  useEffect(() => {
    if (state !== 'ready' || !searchRef.current) return
    if (!query.trim()) {
      setResults([])
      return
    }
    const hits = searchRef.current.search(query, {
      prefix: true,
      // Fuzziness is proportional to term length so short, exact tokens like
      // `sum` stay exact while a mistyped `agregate` still finds its page.
      fuzzy: (term: string) => (term.length > 5 ? 0.2 : 0),
      boost: { title: 3, heading: 2 },
      combineWith: 'AND'
    })
    setResults(limitPerPage(hits))
    setActive(0)
  }, [query, state])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  // `/` to focus is the convention every docs site the reader already uses has
  // trained them on — but not while they are typing into something else.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function goTo(result: Result) {
    setOpen(false)
    setQuery('')
    setResults([])
    router.push(result.url)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (!results.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (i - 1 + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      goTo(results[active])
    }
  }

  const trimmed = query.trim()
  const showPanel = open && trimmed.length > 0

  return (
    <div className="docs-search" ref={containerRef}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="6" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        ref={inputRef}
        aria-label="Search"
        placeholder="Search"
        value={query}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="search-results"
        aria-autocomplete="list"
        aria-activedescendant={showPanel && results.length ? `search-result-${active}` : undefined}
        autoComplete="off"
        onFocus={() => { setOpen(true); loadIndex() }}
        // Also on change, not only on focus: autofill, a paste into an already
        // focused field and browser-restored form state all put text in the box
        // without firing focus, and the panel would sit on "Loading" forever.
        onChange={(event) => { setQuery(event.target.value); setOpen(true); loadIndex() }}
        onKeyDown={onKeyDown}
      />
      {showPanel && (
        <div className="search-results">
          {state === 'error' && <p className="search-empty">Search is unavailable right now.</p>}
          {state !== 'error' && state !== 'ready' && <p className="search-empty">Loading search…</p>}
          {state === 'ready' && results.length === 0 && (
            <p className="search-empty">No results for “{trimmed}”.</p>
          )}
          {/* The listbox wraps only the options: a status message is not one,
              and screen readers skip a listbox whose children are not options. */}
          <div id="search-results" role="listbox" aria-label="Search results">
          {results.map((result, i) => (
            <a
              key={result.id}
              id={`search-result-${i}`}
              href={result.url}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'search-result is-active' : 'search-result'}
              onMouseEnter={() => setActive(i)}
              onClick={(event) => { event.preventDefault(); goTo(result) }}
            >
              <span className="search-result-title">
                {result.title}
                {result.heading && <span className="search-result-heading"> › {result.heading}</span>}
              </span>
              <span className="search-result-excerpt">{result.excerpt}</span>
              <span className="search-result-section">{result.section}</span>
            </a>
          ))}
          </div>
        </div>
      )}
    </div>
  )
}
