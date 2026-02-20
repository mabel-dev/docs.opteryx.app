import fs from 'fs'
import path from 'path'

function walkMarkdownFiles(dir: string, current = ''): string[] {
  let files: string[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(path.join(dir, current), { withFileTypes: true })

  for (const entry of entries) {
    const relativePath = path.join(current, entry.name)
    const absolutePath = path.join(dir, relativePath)

    if (entry.isDirectory()) {
      files = files.concat(walkMarkdownFiles(dir, relativePath))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(absolutePath)
    }
  }

  return files
}

export function listMarkdownSlugs(baseDir: string): string[][] {
  return walkMarkdownFiles(baseDir)
    .map((absolutePath) => {
      const relativePath = path.relative(baseDir, absolutePath)
      return relativePath.replace(/\\/g, '/').replace(/\.md$/i, '')
    })
    .filter(Boolean)
    .map((relativePath) => relativePath.split('/').filter(Boolean))
}
