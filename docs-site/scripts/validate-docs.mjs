import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const contentDocsDir = path.join(projectRoot, 'content', 'docs')
const referenceDir = path.join(projectRoot, 'reference')
const navPath = path.join(projectRoot, 'nav.json')

const LEAF_PREFIXES_TO_TRIM = ['adv-']

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function walkFiles(dir, predicate, acc = []) {
  if (!fs.existsSync(dir)) return acc

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walkFiles(fullPath, predicate, acc)
      continue
    }

    if (entry.isFile() && predicate(fullPath)) {
      acc.push(fullPath)
    }
  }

  return acc
}

function collectNavMarkdownPaths(value, acc = []) {
  if (typeof value === 'string') {
    acc.push(value)
    return acc
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectNavMarkdownPaths(item, acc)
    }
    return acc
  }

  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) {
      collectNavMarkdownPaths(nested, acc)
    }
  }

  return acc
}

function stripMdExtension(markdownPath) {
  return markdownPath.replace(/\.md$/i, '')
}

function normalizeLeafSegment(segment) {
  let normalized = segment

  for (const prefix of LEAF_PREFIXES_TO_TRIM) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length)
      break
    }
  }

  return normalized || segment
}

function markdownPathToDocsPath(markdownPath, normalizeLeaf) {
  const segments = stripMdExtension(markdownPath).split('/').filter(Boolean)
  if (segments.length === 0) return '/docs'

  if (normalizeLeaf) {
    segments[segments.length - 1] = normalizeLeafSegment(segments[segments.length - 1])
  }

  return `/docs/${segments.join('/')}`
}

function markdownPathToDocsPathVariants(markdownPath) {
  const canonical = markdownPathToDocsPath(markdownPath, true)
  const legacy = markdownPathToDocsPath(markdownPath, false)
  return canonical === legacy ? [canonical] : [canonical, legacy]
}

function listMarkdownRoutesFromContent() {
  const routes = new Set()

  const files = walkFiles(contentDocsDir, (filePath) => filePath.endsWith('.md'))
  for (const filePath of files) {
    const relative = path.relative(contentDocsDir, filePath).replace(/\\/g, '/')
    const noExt = stripMdExtension(relative)

    if (noExt === 'index') {
      routes.add('/docs')
    } else {
      routes.add(`/docs/${noExt}`)
    }
  }

  return routes
}

function listReferenceRouteMapFromNav(navJson) {
  const navPaths = collectNavMarkdownPaths(navJson)
  const routeMap = new Map()
  const errors = []

  for (const markdownPath of navPaths) {
    if (!markdownPath.startsWith('reference/')) continue

    const mdPath = markdownPath.endsWith('.md') ? markdownPath : `${markdownPath}.md`
    const relativeReferencePath = mdPath.slice('reference/'.length)

    for (const docsPath of markdownPathToDocsPathVariants(markdownPath)) {
      const existing = routeMap.get(docsPath)
      if (existing && existing !== relativeReferencePath) {
        errors.push(
          `Route collision: ${docsPath} maps to both ${existing} and ${relativeReferencePath}`,
        )
      } else {
        routeMap.set(docsPath, relativeReferencePath)
      }
    }
  }

  return { routeMap, errors }
}

function normalizeLinkTarget(rawTarget) {
  let target = rawTarget.trim()

  if (target.startsWith('<') && target.endsWith('>')) {
    target = target.slice(1, -1).trim()
  }

  const firstSpace = target.search(/\s/)
  if (firstSpace !== -1) {
    target = target.slice(0, firstSpace)
  }

  target = target.replace(/[?#].*$/, '')
  return target
}

function toAbsoluteDocsRoute(route) {
  const normalized = route === '/docs' ? route : route.replace(/\/$/, '')
  return normalized || '/docs'
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

function validateDocsRoute(route, contentRoutes, referenceRoutes) {
  const normalized = toAbsoluteDocsRoute(route)

  if (contentRoutes.has(normalized) || referenceRoutes.has(normalized)) {
    return true
  }

  if (normalized.startsWith('/docs/reference/')) {
    const relative = normalized.slice('/docs/reference/'.length)
    return fileExists(path.join(referenceDir, `${relative}.md`))
  }

  if (normalized.startsWith('/docs/')) {
    const relative = normalized.slice('/docs/'.length)
    return fileExists(path.join(contentDocsDir, `${relative}.md`))
  }

  return true
}

function validateRelativeMarkdownLink(sourceFile, target) {
  if (!target || target.startsWith('#')) return true
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target)) return true
  if (target.startsWith('/')) return true

  const ext = path.extname(target)
  if (ext && ext.toLowerCase() !== '.md') {
    return true
  }

  const resolved = path.resolve(path.dirname(sourceFile), ext ? target : `${target}.md`)
  return fileExists(resolved)
}

function main() {
  const errors = []

  const navJson = readJson(navPath)
  const navPaths = collectNavMarkdownPaths(navJson)

  for (const navEntry of navPaths) {
    const normalized = navEntry.endsWith('.md') ? navEntry : `${navEntry}.md`

    if (normalized.startsWith('reference/')) {
      const relative = normalized.slice('reference/'.length)
      const candidatePath = path.join(referenceDir, relative)
      if (!fileExists(candidatePath)) {
        errors.push(`Missing reference markdown from nav: ${normalized}`)
      }
      continue
    }

    const candidatePath = path.join(contentDocsDir, normalized)
    if (!fileExists(candidatePath)) {
      errors.push(`Missing content markdown from nav: ${normalized}`)
    }
  }

  const { routeMap, errors: routeErrors } = listReferenceRouteMapFromNav(navJson)
  errors.push(...routeErrors)

  const contentRoutes = listMarkdownRoutesFromContent()
  const referenceRoutes = new Set(routeMap.keys())

  const markdownFiles = [
    ...walkFiles(contentDocsDir, (filePath) => filePath.endsWith('.md')),
    ...walkFiles(referenceDir, (filePath) => filePath.endsWith('.md')),
  ]

  const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g

  for (const markdownFile of markdownFiles) {
    const source = fs.readFileSync(markdownFile, 'utf8')

    for (const match of source.matchAll(markdownLinkPattern)) {
      const rawTarget = match[1]
      const target = normalizeLinkTarget(rawTarget)

      if (!target) continue

      if (target.startsWith('/docs')) {
        if (!validateDocsRoute(target, contentRoutes, referenceRoutes)) {
          errors.push(
            `Broken /docs route link in ${path.relative(projectRoot, markdownFile)}: ${target}`,
          )
        }
        continue
      }

      if (target.startsWith('/')) {
        continue
      }

      if (!validateRelativeMarkdownLink(markdownFile, target)) {
        errors.push(
          `Broken relative markdown link in ${path.relative(projectRoot, markdownFile)}: ${target}`,
        )
      }
    }
  }

  if (errors.length > 0) {
    console.error('Docs validation failed:\n')
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log('Docs validation passed.')
}

main()
