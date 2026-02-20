import fs from 'fs'
import path from 'path'

/**
 * Finds the content/docs directory in local and container build layouts.
 */
export function getContentDocsDir(): string {
  const cwd = process.cwd()

  const possiblePaths = [
    path.join(cwd, 'content', 'docs'),
    path.join(cwd, '../content', 'docs'),
    path.join(cwd, '../docs-site/content/docs'),
  ]

  for (const contentDir of possiblePaths) {
    try {
      if (fs.existsSync(contentDir)) {
        return contentDir
      }
    } catch {
      // Try next candidate.
    }
  }

  return path.join(cwd, 'content', 'docs')
}
