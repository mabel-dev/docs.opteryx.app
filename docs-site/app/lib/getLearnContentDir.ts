import fs from 'fs'
import path from 'path'

/**
 * Finds content/learn, which holds the hands-on exercise for each learning
 * path. Mirrors getContentDocsDir so the container build layout keeps working.
 * Server-only: learnPaths.ts is imported by client components, so the fs
 * dependency lives here instead.
 */
export function getLearnContentDir(): string {
  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, 'content', 'learn'),
    path.join(cwd, '../content', 'learn'),
    path.join(cwd, '../docs-site/content/learn'),
  ]

  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isDirectory()) {
        return candidate
      }
    } catch {
      // Try the next candidate
    }
  }

  return candidates[0]
}
