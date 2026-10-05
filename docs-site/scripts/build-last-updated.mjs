// Writes last-updated.json: for every markdown page under content/ and
// reference/, the time of the last commit that touched it.
//
// Run before `next build` (see the `prebuild` script). The Cloud Build context
// carries no .git, so there the history is unavailable: the script leaves any
// existing file alone and exits cleanly, and a page with no entry simply shows
// no date. `make deploy-cloudrun` regenerates the file before uploading, and
// .gcloudignore re-includes it even though it is gitignored here.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outPath = path.join(siteDir, 'last-updated.json')
const roots = ['content', 'reference']

let log
try {
  log = execFileSync(
    'git',
    ['log', '--format=@%ct', '--name-only', '--relative', '--', ...roots],
    { cwd: siteDir, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
  )
} catch {
  console.log('[last-updated] no git history available; keeping existing last-updated.json')
  process.exit(0)
}

// Newest commit first, so the first time a path appears is its last change.
const updated = {}
let commitTime = null
for (const line of log.split('\n')) {
  if (line.startsWith('@')) {
    commitTime = Number(line.slice(1))
  } else if (line.endsWith('.md') && commitTime && !(line in updated)) {
    updated[line] = new Date(commitTime * 1000).toISOString().slice(0, 10)
  }
}

// A path can outlive its file in history (deleted, later re-created), so only
// pages that exist now are kept. A page with uncommitted changes is dated
// today: the build is shipping those changes, not the last commit's text.
for (const file of Object.keys(updated)) {
  if (!fs.existsSync(path.join(siteDir, file))) delete updated[file]
}
const today = new Date().toISOString().slice(0, 10)
const dirty = execFileSync(
  'git',
  ['status', '--porcelain', '--untracked-files=all', '--', ...roots],
  { cwd: siteDir, encoding: 'utf8' }
)
for (const line of dirty.split('\n')) {
  // Porcelain paths are repo-root relative; ours are site relative.
  const file = line.slice(3).trim().replace(/^.*?docs-site\//, '').replace(/^"|"$/g, '')
  if (file.endsWith('.md') && fs.existsSync(path.join(siteDir, file))) updated[file] = today
}

const sorted = Object.fromEntries(Object.entries(updated).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(outPath, JSON.stringify(sorted, null, 0).replace(/,"/g, ',\n"') + '\n')
console.log(`[last-updated] ${Object.keys(sorted).length} pages`)
