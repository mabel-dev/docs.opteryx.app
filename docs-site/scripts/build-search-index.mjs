#!/usr/bin/env node
/**
 * Builds the client-side search index from the static export.
 *
 * This reads `out/` rather than the markdown sources on purpose. A markdown
 * indexer would have to re-derive two things the renderer already decided:
 * the URL a source file ends up at (nav.json remaps reference pages) and the
 * heading anchor (renderMarkdown slugifies the *rendered* HTML, so a heading
 * of `## \`LEVENSHTEIN\`` anchors as `codelevenshteincode`, not `levenshtein`).
 * Re-implementing either invites drift that shows up as a search result
 * scrolling to the top of the page instead of the section. The export already
 * has the answer in the file path and the `id` attribute, so take it from there.
 *
 * Output is a serialized MiniSearch index at `out/search-index.json`, plus a
 * copy in `public/` so `next dev` has something to serve between builds.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import MiniSearch from 'minisearch'
import { SEARCH_OPTIONS } from '../app/lib/searchTerms.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'out')

// Only the containers that hold authored prose. The header, sidebar and footer
// are on every page; indexing them would make every page match every nav label.
const CONTENT_CONTAINERS = [
  { className: 'docs-article', section: 'Docs' },
  { className: 'post-body', section: 'Blog' }
]

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  '#39': "'", '#x27': "'", '#x2F': '/', '#47': '/', hellip: '…',
  mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”'
}

function decodeEntities(text) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const known = ENTITIES[entity] ?? ENTITIES[entity.toLowerCase()]
    if (known !== undefined) return known
    if (entity[0] === '#') {
      const code = entity[1] === 'x' || entity[1] === 'X'
        ? parseInt(entity.slice(2), 16)
        : parseInt(entity.slice(1), 10)
      if (Number.isFinite(code)) return String.fromCodePoint(code)
    }
    return match
  })
}

function stripTags(html) {
  return decodeEntities(
    html
      // Block-level tags become spaces so `<li>a</li><li>b</li>` doesn't read
      // as "ab" — otherwise adjacent list items merge into nonsense tokens.
      .replace(/<\/(p|div|li|h[1-6]|tr|pre|blockquote|section|article)>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
  ).replace(/\s+/g, ' ').trim()
}

/** Extracts the innerHTML of the first element with the given class. */
function extractContainer(html, className) {
  const open = new RegExp(`<(article|main|div)([^>]*\\bclass="[^"]*\\b${className}\\b[^"]*"[^>]*)>`, 'i')
  const match = open.exec(html)
  if (!match) return null

  const tag = match[1]
  const start = match.index + match[0].length
  // Walk nested same-name tags to find the matching close, rather than taking
  // the first one — articles contain divs, and divs contain plenty of divs.
  const scanner = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, 'gi')
  scanner.lastIndex = start
  let depth = 1
  let token
  while ((token = scanner.exec(html)) !== null) {
    if (token[0][1] === '/') {
      depth -= 1
      if (depth === 0) return html.slice(start, token.index)
    } else {
      depth += 1
    }
  }
  return html.slice(start)
}

function pageTitle(containerHtml, fullHtml) {
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(containerHtml)
  if (h1) {
    const text = stripTags(h1[1])
    if (text) return text
  }
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(fullHtml)
  if (title) {
    // Titles are "Page · Opteryx" style; the suffix is noise in every result.
    return stripTags(title[1]).replace(/\s*[|·—-]\s*Opteryx.*$/i, '').trim()
  }
  return null
}

/**
 * Splits a page into one document per h2/h3 section.
 *
 * Whole-page documents are the wrong granularity here: the SQL functions
 * reference is a single 38 KB page holding a hundred functions, so a query for
 * one of them would return "Functions" and leave the reader to Ctrl-F. Sections
 * carry the anchor the renderer already emitted, so a hit deep-links to it.
 */
function splitIntoSections(containerHtml) {
  const headings = [...containerHtml.matchAll(/<(h[23])\s+id="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/gi)]
  const sections = []

  const preamble = stripTags(
    headings.length ? containerHtml.slice(0, headings[0].index) : containerHtml
  )
  if (preamble) sections.push({ anchor: null, heading: null, text: preamble })

  headings.forEach((heading, i) => {
    const bodyStart = heading.index + heading[0].length
    const bodyEnd = i + 1 < headings.length ? headings[i + 1].index : containerHtml.length
    sections.push({
      anchor: heading[2],
      heading: stripTags(heading[3]),
      text: stripTags(containerHtml.slice(bodyStart, bodyEnd))
    })
  })

  return sections
}

function walkHtmlFiles(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '_next') continue
      walkHtmlFiles(full, found)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      found.push(full)
    }
  }
  return found
}

// nginx serves these with `try_files $uri $uri.html`, so the URL is the path
// without the extension. index.html is the directory itself.
function urlForFile(file) {
  const rel = path.relative(outDir, file).split(path.sep).join('/')
  const withoutExt = rel.replace(/\.html$/, '')
  if (withoutExt === 'index') return '/'
  return '/' + withoutExt.replace(/\/index$/, '')
}

const SKIP = new Set(['/404', '/_not-found'])
// Long sections are almost always reference tables or code samples. Indexing
// every token of them inflates the payload without improving recall, since the
// terms that matter cluster near the top of a section.
const MAX_SECTION_CHARS = 700
const EXCERPT_CHARS = 140

function build() {
  if (!fs.existsSync(outDir)) {
    console.error('[search-index] out/ not found — run `next build` first.')
    process.exit(1)
  }

  const documents = []
  let id = 0
  let pagesIndexed = 0

  for (const file of walkHtmlFiles(outDir)) {
    const url = urlForFile(file)
    if (SKIP.has(url)) continue

    const html = fs.readFileSync(file, 'utf8')

    let container = null
    let section = null
    for (const candidate of CONTENT_CONTAINERS) {
      container = extractContainer(html, candidate.className)
      if (container) {
        section = candidate.section
        break
      }
    }
    if (!container) continue

    const title = pageTitle(container, html)
    if (!title) continue

    let sectionsOnPage = 0
    for (const part of splitIntoSections(container)) {
      // A heading with no prose under it is a signpost, not an answer.
      if (!part.heading && part.text.length < 40) continue
      if (part.heading && !part.text && sectionsOnPage > 0) continue

      const text = part.text.slice(0, MAX_SECTION_CHARS)
      documents.push({
        id: id++,
        title,
        heading: part.heading,
        text,
        section,
        url: part.anchor ? `${url}#${part.anchor}` : url,
        excerpt: part.text.slice(0, EXCERPT_CHARS)
      })
      sectionsOnPage += 1
    }
    if (sectionsOnPage) pagesIndexed += 1
  }

  const miniSearch = new MiniSearch(SEARCH_OPTIONS)
  miniSearch.addAll(documents)

  const serialized = JSON.stringify(miniSearch)
  const targets = [path.join(outDir, 'search-index.json'), path.join(root, 'public', 'search-index.json')]
  for (const target of targets) {
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, serialized)
  }

  const kb = (Buffer.byteLength(serialized) / 1024).toFixed(0)
  console.log(`[search-index] ${documents.length} sections from ${pagesIndexed} pages — ${kb} KB`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  build()
}
