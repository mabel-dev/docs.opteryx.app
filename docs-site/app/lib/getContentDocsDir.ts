import fs from 'fs'
import path from 'path'

/**
 * Finds the content/docs directory in local and container build layouts.
 */
export function getContentDocsDir(): string {
  const cwd = process.cwd()

  const possiblePaths = [
    // Prefer the direct path first (usual case in both dev and production)
    path.join(cwd, 'content', 'docs'),
    // Fallback paths for alternate layouts
    path.join(cwd, '../content', 'docs'),
    path.join(cwd, '../docs-site/content/docs'),
  ]

  for (const contentDir of possiblePaths) {
    try {
      if (fs.existsSync(contentDir) && fs.statSync(contentDir).isDirectory()) {
        return contentDir
      }
    } catch {
      // Try next candidate.
    }
  }

  // Default fallback - will be caught if it doesn't exist when actually used
  return path.join(cwd, 'content', 'docs')
}
