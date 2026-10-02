---
title: Bronze Is the File — A Medallion Pipeline for Our Own Logs
description: Our platform logs feed billing, auditing and health dashboards. We rebuilt the ingest as a medallion — raw lines in bronze, SQL tasks for silver and gold — and found two bugs that had been losing data in the old one.
date: 2026-10-02
author: Justin Joyce
role: Opteryx Engineering
tags:
      - tasks
      - triggers
      - logging
      - jsonl
      - dogfooding
---

# Bronze Is the File — A Medallion Pipeline for Our Own Logs

## TL;DR

Every Cloud Run service behind opteryx.app writes logs, and those logs are not just for debugging. Billing events, audit records and request telemetry all start life as a log line. We rebuilt the ingest as a medallion pipeline on Opteryx itself:

| | Before | After |
|---|---|---|
| Parsing | Python, per line, in four cron jobs | SQL tasks, fired by each commit |
| What the landing keeps | A fixed set of fields | Every line, verbatim |
| Structured stderr entries | ~25% landed with every content column empty | Kept |
| Nested JSON keys | Rewritten (including IDs) | As written |
| A malformed line | Skipped, with a log warning | Skipped by silver, kept in bronze, queryable |
| CPU per day of logs | 4.1 s | 0.85 s |

The speed-up is real but it is not the point. The point is that the old pipeline was quietly losing data, and the new one cannot lose it in the same way.

## The Problem

Cloud Logging sinks every service's output to a storage bucket as hourly newline-delimited JSON files: one stream for stdout, one for request logs, one for stderr, one for system logs. About 94,000 lines a day across the four.

Four hourly cron jobs read the previous hour, parsed each line with `json.loads`, converted keys to snake_case, picked out the columns each table wanted, and appended the result. Everything downstream hangs off those tables: tasks split stdout into an audit log, catalog changes, policy changes and billing events, and billing events roll up into what we invoice.

It worked. We also thought it was slow, so we sat down to replace the Python parsing with `READ_JSONL`. Comparing the old and new output row by row showed two things that had nothing to do with speed.

## What We Found

**The key conversion went too deep.** The snake_case pass was recursive, so it rewrote keys *inside* nested payloads too. Our query telemetry includes maps keyed by a random scan identifier, and those identifiers came out mangled:

~~~text
"6fxkt8eLjgJkSZrnQIPfxUUDd0K8WD9L"  →  "6fxkt8e_ljg_jk_s_zrn_qi_pfx_uu_dd0_k8_wd9_l"
~~~

The result is an identifier that exists nowhere. Container labels went the same way (`commit-sha` became `commit_sha`). Nothing downstream happened to read those keys, which is the only reason nobody noticed.

**The stderr table was dropping a quarter of its content.** About 25% of stderr entries are structured: Python logging through a JSON formatter, which Cloud Logging stores as `jsonPayload` with a `severity` and a `sourceLocation`, and no `textPayload`. The stderr table had columns for none of those. Every one of those rows landed with an insert ID, a timestamp and nothing else.

Both have the same cause: **the landing made decisions.** It decided what a key should be called, and which fields were worth keeping. A decision made at the landing can't be undone later, because the source files are deleted by the bucket's retention policy after seven days. Once the landing has dropped something, it's gone.

That is exactly the problem a medallion architecture is meant to prevent.

## The Medallion

- **Bronze** is the source, untouched. You can rebuild everything else from it.
- **Silver** is where fields are extracted, typed and conformed, into tables you can build on.
- **Gold** is what the business consumes.

For our logs that becomes:

~~~text
storage bucket, hourly JSONL files
    │   cron: copy lines, parse nothing
    ▼
BRONZE  opteryx.raw_logs.{stdout, requests, stderr, varlog}
    │   one task per stream, fired by each bronze commit
    ▼
SILVER  opteryx.ops.{stdout_log, request_log, stderr_log, varlog}
    │   tasks fired by each silver commit
    ▼
        ops.audit_log, ops.catalog_changes, ops.policy_changes
GOLD    platform.billing.events → billing relations, priced by the rate card
~~~

The silver tables are the ones the old crons wrote, with the same schemas, so nothing downstream had to change.

### Bronze is the file

A bronze row is one line of the file, plus where it came from and when it arrived:

| Column | |
|---|---|
| `ingest_ms` | When this hour landed, in epoch milliseconds |
| `source` | The file the line came from |
| `line` | The line's position in that file |
| `entry` | The line, verbatim |

The landing job still runs in Python, but only to move bytes. It splits the file on newlines and appends. The bucket is private, and `READ_JSONL` reads `gs://` paths anonymously by design. It never borrows the service's own credentials, so the one place a credential is used is the one place that copies.

Landing a whole day of all four streams takes 147 ms of CPU.

### Silver is SQL

Each stream has one task. Here is stdout's, lightly trimmed:

~~~sql
CREATE TASK opteryx.ops.stdout_log_ingest AS
    INSERT INTO opteryx.ops.stdout_log
    SELECT
        CAST(entry->>'insertId'    AS VARCHAR)   AS insert_id,
        CAST(entry->>'labels'      AS VARCHAR)   AS labels,
        CAST(entry->>'jsonPayload' AS VARCHAR)   AS json_payload,
        CAST(entry->>'textPayload' AS VARCHAR)   AS text_payload,
        CAST(entry->>'timestamp'   AS TIMESTAMP) AS event_timestamp
        -- ...
      FROM opteryx.raw_logs.stdout VERSION AS OF :current_version
     WHERE ingest_ms > :parent_version
       AND ingest_ms <= :current_version
       AND entry IS JSON OBJECT;

CREATE TRIGGER task__ops__stdout_log_ingest
    ON opteryx.raw_logs.stdout
    EXECUTE opteryx.ops.stdout_log_ingest;
~~~

`->>` does the work the Python used to do, and handles the awkward cases well. A field an entry doesn't have is `NULL`, not an error, which matters because log entries are sparse: `jsonPayload` and `textPayload` never appear on the same line. A nested object comes back as its JSON text, exactly as written. Nothing is renamed.

### The window is a column

When a commit fires a trigger, the task is given two snapshot IDs: `:parent_version`, the table before the commit, and `:current_version`, the table after it. The [tasks guide](/docs/guides/tasks-and-triggers) recovers the commit's rows with an anti-join between those two versions. That works, but it reads both versions of the table, and bronze only grows.

We used a column instead. Snapshot IDs in Opteryx are epoch milliseconds, allocated as `max(now, highest existing + 1)`. The landing stamps `ingest_ms` with that same rule just before it appends, so every row of a commit falls inside that commit's window:

~~~text
parent snapshot  <  ingest_ms  ≤  this commit's snapshot
~~~

Bronze is sorted on `ingest_ms`, so the filter prunes each run to the one file the commit wrote. Because the window is a column rather than a file, compaction can merge bronze files without breaking it. It holds up under failure too: if a run fails, the next one is handed a window reaching back to the last successful run, so no commit is skipped. The only requirement is one writer per bronze table, which one cron per stream gives us.

### One bad line

The first time we ran silver over a deliberately malformed line, the whole statement failed. In a pipeline that retries a failed window on every later fire, that's worse than one lost line: one bad line would stall the stream for good.

`entry IS JSON OBJECT` keeps silver moving. The difference from the old pipeline is what happens to the line. The Python job logged a warning and dropped it. Bronze keeps it, so a single query tells you every line silver has refused and exactly where it came from:

~~~sql
SELECT source, line, entry
  FROM opteryx.raw_logs.stdout
 WHERE NOT entry IS JSON OBJECT;
~~~

## Dogfooding Finds Bugs

Building this on our own engine turned up an engine bug. Cloud Logging writes RFC 3339 timestamps with up to nine fractional digits, and trims trailing zeros, so a single hour mixes `…03.088320942Z`, `…03.0812Z` and `…03Z`. `CAST(… AS TIMESTAMP)` rejected more than six digits. Worse, over a column it also rejected a `Z` after fewer than six, which the constant-folded path accepted. The format is unambiguous, so the fix is to truncate to microseconds, which is what Python's `fromisoformat` does. It's fixed in opteryx-core and ships in the next release. Until then the silver tasks strip the designator and cut the string to 26 characters.

## The Numbers

We'd guessed the engine would be about ten times faster than Python at this. Measured the way production runs, one hour at a time over a full day of real logs (M-series Mac, median of five runs):

| Stream | Old Python job | Bronze | Silver | Medallion | |
|---|---|---|---|---|---|
| stdout | 1,766 ms | 62 ms | 259 ms | 321 ms | 5.5× |
| requests | 1,418 ms | 51 ms | 216 ms | 268 ms | 5.3× |
| stderr | 925 ms | 31 ms | 171 ms | 202 ms | 4.6× |
| varlog | 20 ms | 3 ms | 56 ms | 59 ms | 0.3× |
| **all four** | **4,129 ms** | **147 ms** | **702 ms** | **849 ms** | **4.9×** |

Three things are worth saying about that table.

- **The guess was right for parsing.** Reading the files directly with `READ_JSONL` came out about 8× faster than Python. The medallion gives some of that back: silver extracts each field from stored text, where `READ_JSONL` reads every field in one pass. That is the price of keeping the raw line, and we'd pay it again.
- **varlog got slower.** It writes about 25 lines an hour, so the engine's fixed cost per query dominates. Engines win when there's work to do.
- **It was never much CPU.** We saved about three seconds a day. If the rewrite were only about speed, it wouldn't have been worth doing.

Every number was checked against the old pipeline on the same data. Every stream produced the same rows, the same IDs and the same column types. The only differences were the nested keys the old landing had been mangling.

## The Point

The bugs we found weren't parsing bugs. They were decisions made at the wrong layer, in code that couldn't take them back. A medallion fixes that by construction. Bronze keeps the source, so silver can be wrong, be fixed, and be rebuilt.

It also means the pipeline is SQL from the landing to the invoice. Python's only job is copying bytes out of a private bucket. Everything else is a `SELECT` that runs because a commit landed, on the same engine our users query with.

— Justin
