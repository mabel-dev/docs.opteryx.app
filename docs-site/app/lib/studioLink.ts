import { deflateRawSync } from "node:zlib";

/*
 * "Open in Studio" links for SQL examples, built at compile time.
 *
 * The link is opteryx.app's compact form, /studio/?q=…: the SQL as UTF-8,
 * raw DEFLATE (what the browser's CompressionStream("deflate-raw") reads),
 * base64url without padding. Studio decodes it, re-checks it, and opens it in
 * the editor unrun (web.opteryx static/js/share-link.js and sql-readonly.js
 * are the source of truth for both halves).
 *
 * Only examples that would actually open get a link:
 *   - a single read-only SELECT — the same rule Studio applies to any link,
 *     ported from sql-readonly.js below, so a DDL example never becomes a
 *     link Studio would refuse;
 *   - no placeholders a reader is meant to replace (my_workspace,
 *     your-bucket, <name>, ...), since those can't run as written.
 */

const STUDIO_URL = "https://opteryx.app/studio/";

// Keep in step with web.opteryx static/js/sql-readonly.js.
const DENY = new Set([
  "ALTER", "ANALYZE", "ATTACH", "CALL", "CLONE", "COMMIT", "COPY", "CREATE",
  "DELETE", "DETACH", "DROP", "EXECUTE", "GRANT", "INSERT", "INTO", "LOAD",
  "MERGE", "OPTIMIZE", "REFRESH", "REPLACE", "RESUME", "REVOKE", "ROLLBACK",
  "SET", "SUSPEND", "TRUNCATE", "UNDROP", "UPDATE", "UPSERT", "VACUUM",
]);

function scan(sql: string): { words: string[]; semicolons: number[] } | null {
  const words: string[] = [];
  const semicolons: number[] = [];
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    if (c === "-" && sql[i + 1] === "-") {
      const nl = sql.indexOf("\n", i);
      i = nl === -1 ? n : nl + 1;
    } else if (c === "/" && sql[i + 1] === "*") {
      const close = sql.indexOf("*/", i + 2);
      if (close === -1) return null;
      i = close + 2;
    } else if (c === "'" || c === '"' || c === "`") {
      let j = i + 1;
      for (;;) {
        if (j >= n) return null;
        if (sql[j] === c) {
          if (sql[j + 1] === c) {
            j += 2;
            continue;
          }
          break;
        }
        if (c === "'" && sql[j] === "\\") j += 1;
        j += 1;
      }
      i = j + 1;
    } else if (c === ";") {
      semicolons.push(words.length);
      i += 1;
    } else if (/[A-Za-z_]/.test(c)) {
      let k = i + 1;
      while (k < n && /[A-Za-z0-9_$]/.test(sql[k])) k += 1;
      words.push(sql.slice(i, k).toUpperCase());
      i = k;
    } else {
      i += 1;
    }
  }
  return { words, semicolons };
}

export function isReadOnlySelect(sql: string): boolean {
  if (!sql.trim()) return false;
  const s = scan(sql);
  if (!s || !s.words.length) return false;
  if (s.semicolons.some((at) => at < s.words.length)) return false;
  if (s.words[0] !== "SELECT" && s.words[0] !== "WITH") return false;
  if (!s.words.includes("SELECT")) return false;
  return !s.words.some((w) => DENY.has(w));
}

// Names a reader is meant to swap for their own. An example that uses one
// can't run as written, so it gets no link.
const PLACEHOLDER = /\bmy_[a-z_]+\b|\byour[-_][a-z]|<[a-z_][a-z_ -]*>|\.\.\.|\bxxx\b/i;

// Workspaces every signed-in reader can read (personal is their own; `$me`
// resolves to it). An example over any other workspace is illustrating a
// shape, not something the reader can run, so it gets no link.
const RUNNABLE_WORKSPACES = new Set(["public", "demo", "samples", "personal"]);

function readsOnlyRunnableTables(sql: string): boolean {
  // Strip strings and comments so a name inside one isn't read as a table.
  const bare = sql
    .replace(/--[^\n]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/'(?:[^']|'')*'/g, "''");
  const ctes = new Set(
    [...bare.matchAll(/(?:\bWITH|,)\s+([A-Za-z_][\w]*)\s+AS\s*\(/gi)].map((m) => m[1].toLowerCase()),
  );
  for (const m of bare.matchAll(/\b(?:FROM|JOIN)\s+([A-Za-z_$][\w$]*(?:\.[\w$]+)*)(\s*\()?/gi)) {
    const name = m[1].toLowerCase();
    if (m[2]) return false; // FROM READ_PARQUET(...) and other table functions: paths to someone's files
    if (name.startsWith("$")) continue; // built-in sample tables, e.g. $planets
    if (ctes.has(name)) continue;
    if (!name.includes(".")) return false; // a bare name relies on a context the reader doesn't have
    if (!RUNNABLE_WORKSPACES.has(name.split(".")[0])) return false;
  }
  return true;
}

export function studioLinkFor(sql: string): string | null {
  const text = sql.trim();
  if (!isReadOnlySelect(text) || PLACEHOLDER.test(text)) return null;
  if (!readsOnlyRunnableTables(text)) return null;
  const q = deflateRawSync(Buffer.from(text, "utf8"), { level: 9 }).toString("base64url");
  return `${STUDIO_URL}?q=${q}`;
}
