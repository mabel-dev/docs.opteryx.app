import fs from 'fs'
import path from 'path'

/**
 * Finds the reference directory which may be in different locations
 * depending on whether we're building from docs-site root or deployed in /app
 */
export function getReferenceDir(): string {
  const cwd = process.cwd()
  
  // Possible locations for reference directory
  const possiblePaths = [
    path.join(cwd, 'reference'),                          // /app/reference (production)
    path.join(cwd, '../reference'),                       // parent dir
    path.join(cwd, '../docs-site/reference'),             // if running from root
  ]
  
  // Try each possible path
  for (const referenceDir of possiblePaths) {
    try {
      if (fs.existsSync(referenceDir)) {
        return referenceDir
      }
    } catch (e) {
      // Continue to next path
    }
  }
  
  // Ultimate fallback
  return path.join(cwd, 'reference')
}
