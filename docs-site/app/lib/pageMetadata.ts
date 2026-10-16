import fs from 'fs'
import type { Metadata } from 'next'

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/

function frontmatterValue(yaml: string, key: string): string | undefined {
  const match = yaml.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
  if (!match) return undefined
  let value = match[1].trim()
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }
  return value || undefined
}

// The first `# ` heading outside a code fence, with inline markdown removed so
// the browser tab shows text rather than backticks and link syntax.
function firstHeading(body: string): string | undefined {
  let inFence = false
  for (const line of body.split('\n')) {
    if (/^(```|~~~)/.test(line.trim())) {
      inFence = !inFence
      continue
    }
    if (!inFence && line.startsWith('# ')) {
      const text = line
        .slice(2)
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[`*_]/g, '')
        .trim()
      return text || undefined
    }
  }
  return undefined
}

// A markdown page's <title> and meta description. The frontmatter `title` is
// written for the tab and search results, so it wins; a page without one falls
// back to its H1. The layout's title template adds the site name, unless the
// title already carries it.
export function markdownPageMetadata(filePath: string): Metadata {
  let source: string
  try {
    source = fs.readFileSync(filePath, 'utf8')
  } catch {
    return {}
  }

  const match = source.match(FRONTMATTER)
  const yaml = match ? match[1] : ''
  const body = match ? source.slice(match[0].length) : source

  const title = frontmatterValue(yaml, 'title') || firstHeading(body)
  const description = frontmatterValue(yaml, 'description')

  const metadata: Metadata = {}
  if (title) {
    metadata.title = /opteryx/i.test(title) ? { absolute: title } : title
  }
  if (description) {
    metadata.description = description
  }
  return metadata
}
