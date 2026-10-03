# Log medallion: working notes for the post

Evidence log, not the post. Every number here was measured; add to it as each
layer is rewritten.

## The shape of the pipeline

- **Bronze** — `ops.stdout_log`. Cloud Logging sinks every Cloud Run stdout line
  to `gs://mabel_logs/run.googleapis.com/stdout/YYYY/MM/DD/HH:00:00_HH:59:59_S{n}.json`
  (newline-delimited JSON). An hourly xb500 cron lands the previous hour,
  unfiltered.
- **Silver** — SQL tasks fired by every commit to the landing
  (`xb500.opteryx/app/operations/provision_log_subset_tasks.py`):
  `ops.audit_log`, `ops.catalog_changes`, and `platform.billing.events`
  (`WHERE json_payload->>'severity' = 'BILLING'`). Watermark on
  `event_timestamp`, so a failed fire is self-healing.
- **Gold** — billing relations and MVs (`scripts/platform_billing_relations.sql`,
  `scripts/billing_materialized_views.sql`), priced against a rate card.

Silver and gold were already SQL. Bronze was the only Python layer.

## Bronze rewrite: Python parsing → READ_JSONL (stdout landing)

Before: download shard text → `json.loads` per line → recursive snake_case of
every key → `build_morsel` → `dataset.append`.

After: download shard bytes → `READ_JSONL` over a temp file with an explicit
projection onto the dataset's schema → `dataset.append`. Same commit path,
same provenance receipt, same author.

### Parity (one real day, 2026-09-30, all four streams)

- Every stream: identical row counts, `insertId` sets, column names and types
  (stdout 37,378; requests 27,798; stderr 27,928; varlog 598).
- Column types identical; Parquet written from each is schema-identical
  (`varchar` ×7, `timestamp[us]` ×2).
- **Billing rows: 1,703 both ways, field-for-field identical** after the silver
  extraction (`billing_account`, `billing_event`, `event`, timestamp, `actor`,
  `workspace`).

### Speed (parse only, local disk, median of 3, M-series Mac, 2026-09-30)

Measured the way production runs: 24 separate hourly lands per stream.

| Stream | Lines/day | Python | READ_JSONL | |
|---|---|---|---|---|
| stdout | 37,378 | 1,825 ms | 196 ms | 9.3× |
| requests | 27,798 | 1,402 ms | 148 ms | 9.5× |
| stderr | 27,928 | 916 ms | 125 ms | 7.3× |
| varlog | 598 | 20 ms | 48 ms | 0.4× |
| **all four** | | **4,163 ms** | **517 ms** | **8.1×** |

- The "probably 10x" guess was about right: ~8–9× on real hourly work.
- varlog is *slower*: ~25 lines an hour, so the engine's fixed per-query cost
  (session, plan) dominates. Worth saying in the post — it is honest and it
  explains where the speed comes from.
- Do NOT quote 80×. That came from one READ_JSONL over all 24 files at once,
  which the engine parallelises across files; the job never runs that way.
- In absolute terms this is ~3.6 s of CPU a day saved. The case for the
  rewrite is fidelity and one code path, not compute cost.

Download time excluded from both; it is unchanged.

### Things the rewrite surfaced

1. **The Python path was corrupting data.** Its snake_case pass recursed into
   nested payloads. Audit telemetry maps keyed by random scan ids
   (`6fxkt8eLjgJk…`) were rewritten into ids that exist nowhere
   (`6fxkt8e_ljg_jk…`); `labels` keys like `commit-sha` became `commit_sha`.
   Nothing downstream read those keys, which is why it went unnoticed. The
   SQL landing carries nested objects as the JSON Cloud Logging wrote.
2. **Engine bug: RFC 3339 timestamps.** `CAST(… AS TIMESTAMP)` rejects more
   than six fractional digits (Cloud Logging writes nine), and the vectorised
   path also rejects `Z` after fewer than six — while the constant-folded path
   accepts it. Python's `fromisoformat` truncates to microseconds. Worked
   around with `SUBSTRING(REPLACE(ts, 'Z', ''), 1, 26)`; engine fix spawned as
   a separate task.
3. **READ_JSONL infers its schema from a sample.** Log entries are sparse
   (`jsonPayload` and `textPayload` never share a line), so a field first seen
   late fails the read. `infer_sample_size` covers the whole hour; a field
   absent from the whole hour is selected as a typed NULL. Across a week
   (168 shards) no real hour would have hit either case. Candidate engine
   improvement: let READ_JSONL take declared columns.
4. **Nested objects come back as VARIANT.** Appending them uncast would have
   been schema drift on the table the entire tree derives from. Explicit
   `CAST(… AS VARCHAR)`.
5. **The engine will not read the private bucket, by design.** `gs://` in
   READ_JSONL is an anonymous GET; it never borrows the service's credentials.
   So Python still downloads; the engine parses. Worth a sentence in the post —
   it is a security property, not a gap.
6. **Empty hours / malformed lines.** Empty file → skip before the engine
   (no columns to select). Malformed line → `ignore_errors => true`, matching
   the old skip-and-warn, because nothing ever re-reads an hour.

7. **stderr has been dropping structured entries all along.** 6,653 of the
   day's 27,928 stderr entries carry `jsonPayload` (and `severity`,
   `sourceLocation`) instead of `textPayload`. `ops.stderr_log` has no column
   for either, so those rows land with every content column null — under the
   old path and the new one alike. Fixing it is a schema change.
8. **Nested-key spelling changes against history.** Old rows have snake_cased
   nested keys (`http_request->>'request_method'`, `labels` `commit_sha`); new
   rows carry Cloud Logging's own (`requestMethod`, `commit-sha`). No code
   reads those nested keys today, but one table would hold both spellings.

### Status

- Code: `xb500.opteryx` — all four `app/operations/transform_*_logs.py` now
  declare a column map and call `read_hour`; shared landing in
  `app/operations/__init__.py` (`read_hour`, `land_jsonl`, `landing_sql`).
  Python parser helpers deleted. Uncommitted, not deployed.

## Post angle

"We built a medallion pipeline for our own billing — and the only layer that
wasn't our engine was the one doing the most work in Python." Lead with the
problem (trustworthy invoice numbers from a log firehose), not the word
medallion. Bugs found by dogfooding are part of the story.

Do not publish real tenant names, volumes or revenue. Use a synthetic or
redacted sample for any screenshots.


## Redesign (2026-10-02): bronze is the file

Justin: bronze should be raw; fields come out in silver; gold is business-facing.
The landing that typed columns was silver-in-bronze, and both landing bugs
(key mangling, stderr loss) were decisions made too early. Rebuilt:

- **Bronze** `opteryx.raw_logs.{stdout,requests,stderr,varlog}` — one row per
  line: `ingest_ms`, `source` (gs:// shard), `line`, `entry` (verbatim).
  Python splits lines; parses nothing. Sorted on `ingest_ms`.
- **Silver** — the existing `ops.*` log tables, now filled by one task per
  stream, fired by each bronze commit:
  `WHERE ingest_ms > :parent_version AND ingest_ms <= :current_version AND entry IS JSON OBJECT`.
  `ingest_ms` is stamped `max(now_ms, highest_snapshot + 1)` — the same rule
  the catalog uses to allocate snapshot ids — so a commit's rows always fall in
  its own window. One writer per bronze table makes that safe.
- **Silver → silver/gold** unchanged: `stdout_log` → audit_log, catalog_changes,
  policy_changes, `platform.billing.events` → billing relations.

### Findings from the redesign

- `->>` on a VARCHAR column handles everything: absent field → NULL, nested
  object → its JSON text. The sparse-schema problem of READ_JSONL vanishes.
- One malformed line fails the whole silver statement, and a failed window is
  retried (widened) on every later fire → the stream would stall forever.
  `entry IS JSON OBJECT` (in 0.9.148) skips it; bronze keeps it;
  `SELECT source, line, entry FROM raw_logs.<s> WHERE NOT entry IS JSON OBJECT`
  lists every rejected line with its location. Old path: skip + log warning.
- Verified the stored statement through the engine's real `EXECUTE … USING`
  path on a local store: 2 commits → 2 windows → 1,858 lines in, 1,858
  distinct rows out (time-travel clause stripped; local store lacks it).
- Engine quirk (not this pipeline): the Parquet footer cache is keyed by path,
  so a file rewritten in place within one process reads with stale metadata.
- RFC 3339 cast fix landed in local opteryx-core; not yet released, so the
  workaround stays in the task SQL until the task-running service upgrades.

### Numbers for the medallion (per hour, as production runs; median of 5)

| Stream | Old Python job | Bronze | Silver | Medallion | |
|---|---|---|---|---|---|
| stdout | 1,766 ms | 62 ms | 259 ms | 321 ms | 5.5× |
| requests | 1,418 ms | 51 ms | 216 ms | 268 ms | 5.3× |
| stderr | 925 ms | 31 ms | 171 ms | 202 ms | 4.6× |
| varlog | 20 ms | 3 ms | 56 ms | 59 ms | 0.3× |
| **all four, per day** | **4,129 ms** | **147 ms** | **702 ms** | **849 ms** | **4.9×** |

Silver is slower than READ_JSONL straight off the shard (702 vs 517 ms):
`->>` re-reads the stored text per field. That is the price of keeping the raw
line; the direct path was ~8×, the medallion ~5×.
