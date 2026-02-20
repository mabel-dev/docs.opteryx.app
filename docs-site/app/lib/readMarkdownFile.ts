import fs from 'fs'

export function stripFrontmatter(source: string): string {
  return source.replace(/^---\n[\s\S]*?\n---\n/, '')
}

export function readMarkdownFile(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    return null
  }

  return stripFrontmatter(fs.readFileSync(filePath, 'utf8'))
}
