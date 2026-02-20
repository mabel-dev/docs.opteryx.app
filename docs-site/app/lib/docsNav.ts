import navJson from '@/nav.json'

export type DocsNavItem = {
  title: string
  href?: string
  items?: DocsNavItem[]
}

export type DocsNavSection = {
  title: string
  items: DocsNavItem[]
}

type RawNavObject = Record<string, unknown>

const REFERENCE_PREFIX = 'reference/'
const LEAF_PREFIXES_TO_TRIM = ['adv-']

function stripMdExtension(markdownPath: string): string {
  return markdownPath.replace(/\.md$/i, '')
}

function normalizeLeafSegment(segment: string): string {
  let normalized = segment

  for (const prefix of LEAF_PREFIXES_TO_TRIM) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length)
      break
    }
  }

  return normalized || segment
}

function markdownPathToDocsPathInternal(markdownPath: string, normalizeLeaf: boolean): string {
  const segments = stripMdExtension(markdownPath)
    .split('/')
    .filter(Boolean)

  if (segments.length === 0) {
    return '/docs'
  }

  if (normalizeLeaf) {
    const lastIndex = segments.length - 1
    segments[lastIndex] = normalizeLeafSegment(segments[lastIndex])
  }

  return `/docs/${segments.join('/')}`
}

export function markdownPathToDocsPath(markdownPath: string): string {
  return markdownPathToDocsPathInternal(markdownPath, true)
}

function markdownPathToDocsPathVariants(markdownPath: string): string[] {
  const canonical = markdownPathToDocsPathInternal(markdownPath, true)
  const legacy = markdownPathToDocsPathInternal(markdownPath, false)

  return canonical === legacy ? [canonical] : [canonical, legacy]
}

function resolveRawNode(rawNode: RawNavObject): DocsNavItem | null {
  const entries = Object.entries(rawNode)

  if (entries.length === 0) {
    return null
  }

  const [title, value] = entries[0]

  if (typeof value === 'string') {
    return {
      title,
      href: markdownPathToDocsPath(value),
    }
  }

  if (Array.isArray(value)) {
    const items = value
      .map((child) => {
        if (typeof child === 'object' && child !== null) {
          return resolveRawNode(child as RawNavObject)
        }
        return null
      })
      .filter(Boolean) as DocsNavItem[]

    return {
      title,
      items,
    }
  }

  if (typeof value === 'object' && value !== null) {
    const node = value as Record<string, unknown>
    const item: DocsNavItem = { title }

    if (typeof node.href === 'string') {
      item.href = markdownPathToDocsPath(node.href)
    }

    if (Array.isArray(node.items)) {
      item.items = node.items
        .map((child) => {
          if (typeof child === 'object' && child !== null) {
            return resolveRawNode(child as RawNavObject)
          }
          return null
        })
        .filter(Boolean) as DocsNavItem[]
    }

    return item
  }

  return null
}

function buildSidebarNav(rawNav: RawNavObject[]): DocsNavSection[] {
  const sections: DocsNavSection[] = []

  for (const sectionNode of rawNav) {
    const entries = Object.entries(sectionNode)

    if (entries.length === 0) {
      continue
    }

    const [sectionTitle, sectionValue] = entries[0]

    if (typeof sectionValue === 'string') {
      sections.push({
        title: sectionTitle,
        items: [{ title: sectionTitle, href: markdownPathToDocsPath(sectionValue) }],
      })
      continue
    }

    if (!Array.isArray(sectionValue)) {
      continue
    }

    const sectionItems = sectionValue
      .map((child) => {
        if (typeof child === 'object' && child !== null) {
          return resolveRawNode(child as RawNavObject)
        }
        return null
      })
      .filter(Boolean) as DocsNavItem[]

    sections.push({ title: sectionTitle, items: sectionItems })
  }

  return sections
}

function collectMarkdownPaths(value: unknown, accumulator: string[]): void {
  if (typeof value === 'string') {
    accumulator.push(value)
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectMarkdownPaths(item, accumulator)
    }
    return
  }

  if (typeof value === 'object' && value !== null) {
    for (const nestedValue of Object.values(value)) {
      collectMarkdownPaths(nestedValue, accumulator)
    }
  }
}

function buildReferenceRouteMap(rawNav: RawNavObject[]): Record<string, string> {
  const markdownPaths: string[] = []

  collectMarkdownPaths(rawNav, markdownPaths)

  const map: Record<string, string> = {}

  for (const markdownPath of markdownPaths) {
    if (!markdownPath.startsWith(REFERENCE_PREFIX)) {
      continue
    }

    const referenceMarkdownPath = markdownPath.endsWith('.md') ? markdownPath : `${markdownPath}.md`
    const relativePath = referenceMarkdownPath.slice(REFERENCE_PREFIX.length)

    for (const docsPath of markdownPathToDocsPathVariants(markdownPath)) {
      if (!map[docsPath]) {
        map[docsPath] = relativePath
      }
    }
  }

  return map
}

function buildBreadcrumbMap(sections: DocsNavSection[]): Record<string, string[]> {
  const breadcrumbsByPath: Record<string, string[]> = {}

  const visit = (item: DocsNavItem, trail: string[]) => {
    const nextTrail = [...trail, item.title]

    if (item.href && !breadcrumbsByPath[item.href]) {
      breadcrumbsByPath[item.href] = nextTrail
    }

    if (item.items) {
      for (const child of item.items) {
        visit(child, nextTrail)
      }
    }
  }

  for (const section of sections) {
    for (const item of section.items) {
      visit(item, [section.title])
    }
  }

  return breadcrumbsByPath
}

function toTitleCase(value: string): string {
  const specials: Record<string, string> = {
    api: 'API',
    sql: 'SQL',
    ddl: 'DDL',
    cte: 'CTE',
  }

  return value
    .split('-')
    .filter(Boolean)
    .map((segment) => specials[segment.toLowerCase()] || `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)
    .join(' ')
}

export function inferBreadcrumbsFromPath(pathname: string): string[] {
  if (!pathname.startsWith('/docs/')) {
    return []
  }

  const segments = pathname
    .slice('/docs/'.length)
    .split('/')
    .filter(Boolean)

  return segments.map(toTitleCase)
}

export const sidebarNav = buildSidebarNav(navJson as RawNavObject[])

export const docsBreadcrumbsByPath = buildBreadcrumbMap(sidebarNav)

const referenceRouteMap = buildReferenceRouteMap(navJson as RawNavObject[])

export function getReferenceMdPathForDocsPath(docsPath: string): string | null {
  return referenceRouteMap[docsPath] || null
}

export function getReferenceDocsPaths(): string[] {
  return Object.keys(referenceRouteMap)
}
