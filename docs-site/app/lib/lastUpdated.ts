import fs from 'fs'
import path from 'path'

let cache: Record<string, string> | null = null

function load(): Record<string, string> {
  // Cached for a build; re-read in dev, where the file is regenerated under a
  // long-running server.
  if (cache && process.env.NODE_ENV === 'production') return cache
  try {
    cache = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'last-updated.json'), 'utf8'))
  } catch {
    // Absent on a build with no git history (see scripts/build-last-updated.mjs):
    // pages render without a date rather than with a wrong one.
    cache = {}
  }
  return cache!
}

/** "5 October 2026" for the page's markdown file, or null if unknown. */
export function lastUpdated(markdownPath: string): string | null {
  const relative = path.relative(process.cwd(), markdownPath).split(path.sep).join('/')
  const iso = load()[relative]
  if (!iso) return null
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
