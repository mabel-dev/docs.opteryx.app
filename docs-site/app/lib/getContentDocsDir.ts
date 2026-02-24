import fs from 'fs'
import path from 'path'

/**
 * Finds the content/docs directory in local and container build layouts.
 * Used during static page generation to find source markdown files.
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
      const stat = fs.statSync(contentDir)
      if (stat && stat.isDirectory()) {
        return contentDir
      }
    } catch {
      // Try next candidate
    }
  }

  // Log a warning if we couldn't find content directory
  if (process.env.NODE_ENV === 'development') {
    console.warn('[getContentDocsDir] Could not find content/docs directory. Tried:', possiblePaths)
  }

  // Return a default that might not exist - this is caught when actually accessed
  return path.join(cwd, 'content', 'docs')
}
