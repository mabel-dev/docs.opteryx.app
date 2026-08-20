/**
 * Term processing shared by the search indexer and the browser.
 *
 * MiniSearch cannot serialize `processTerm` into the index, so both sides pass
 * it in separately — and they must agree exactly. If they diverge, a term is
 * stored under one form and looked up under another, and the search silently
 * returns nothing for it. That is the entire reason this lives in its own
 * `.mjs` module: `scripts/build-search-index.mjs` runs under plain node and the
 * header component runs in the browser, and neither can import the other's file.
 */

// Ordinary English words carry no signal in a technical corpus, but each one
// still carries a posting list per document — which is most of the payload the
// reader has to download before the first query returns.
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'for', 'from',
  'has', 'have', 'if', 'in', 'into', 'is', 'it', 'its', 'not', 'of', 'on', 'or',
  'that', 'the', 'then', 'there', 'these', 'this', 'to', 'was', 'were', 'when',
  'which', 'will', 'with', 'you', 'your'
])

export function processTerm(term) {
  const normalized = term.toLowerCase()
  if (STOP_WORDS.has(normalized)) return null
  // Base64 blobs, hashes and minified fragments leak in from code samples.
  if (normalized.length > 24) return null
  return normalized
}

/** The options below must be identical on both sides for `loadJSON` to work. */
export const SEARCH_OPTIONS = {
  fields: ['title', 'heading', 'text'],
  storeFields: ['title', 'heading', 'url', 'section', 'excerpt'],
  processTerm
}
