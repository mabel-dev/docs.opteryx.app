import fs from 'fs'

export function stripFrontmatter(source: string): string {
  if (!source || typeof source !== 'string') {
    return ''
  }
  return source.replace(/^---\n[\s\S]*?\n---\n/, '')
}

export function readMarkdownFile(filePath: string): string | null {
  if (!filePath || typeof filePath !== 'string') {
    return null
  }

  try {
    if (!fs.existsSync(filePath)) {
      return null
    }

    const content = fs.readFileSync(filePath, 'utf8')
    if (!content || typeof content !== 'string') {
      return null
    }

    return stripFrontmatter(content)
  } catch {
    return null
  }
}
