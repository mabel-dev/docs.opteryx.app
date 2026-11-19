// Fails the build if an emoji appears in site source or docs prose. Icons are
// Phosphor SVGs (app/lib/phosphorIcons.ts); emoji render differently on every
// platform and ignore the light/dark theme.
//
// Run by `prebuild` and `validate:docs`. In markdown, fenced and inline code is
// skipped, so SQL examples with emoji strings stay legal. Plain symbols such as
// ✓ ✗ ⌘ © → are not emoji-presentation characters and are not flagged.
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Emoji-presentation characters, plus VS16, which forces text symbols like ⚙ into emoji style.
const EMOJI = /\p{Emoji_Presentation}|.?️/u
for (const ch of ['🔒', '⚡', '⚙️', '✅']) assert.ok(EMOJI.test(ch), `should flag ${ch}`)
for (const ch of ['✓', '✗', '⌘', '⏎', '©', '£', '▸', '→']) assert.ok(!EMOJI.test(ch), `should not flag ${ch}`)

// The blog lives outside docs-site locally and is copied in by the Dockerfile.
const blogDir = ['content/blog', '../content/blog']
  .map((p) => path.join(siteDir, p))
  .find((p) => fs.existsSync(p))
if (!blogDir) {
  console.error('[check-emoji] blog content not found at content/blog or ../content/blog')
  process.exit(1)
}

const roots = ['app', 'content/docs', 'content/learn', 'reference', 'nav.json', 'learn.json']
  .map((p) => path.join(siteDir, p))
  .concat(blogDir)
const EXTENSIONS = new Set(['.md', '.mdx', '.ts', '.tsx', '.css', '.json'])

function walk(p) {
  if (!fs.statSync(p).isDirectory()) return [p]
  return fs.readdirSync(p).flatMap((name) => walk(path.join(p, name)))
}

const hits = []
for (const file of roots.flatMap(walk)) {
  if (!EXTENSIONS.has(path.extname(file))) continue
  const markdown = file.endsWith('.md')
  let inFence = false
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (markdown && /^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      return
    }
    const text = markdown ? (inFence ? '' : line.replace(/`[^`]*`/g, '')) : line
    const match = text.match(EMOJI)
    if (match) hits.push(`${path.relative(siteDir, file)}:${i + 1}  ${match[0]}`)
  })
}

if (hits.length) {
  console.error(`[check-emoji] ${hits.length} emoji found. Use a Phosphor icon (app/lib/phosphorIcons.ts) instead:`)
  for (const hit of hits) console.error(`  ${hit}`)
  process.exit(1)
}
console.log('[check-emoji] no emoji found')
