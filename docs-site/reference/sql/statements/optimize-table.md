---
title: OPTIMIZE TABLE Statement — Opteryx Reference
description: SQL OPTIMIZE TABLE statement syntax and limitations for compacting a table's data files in Opteryx
---

# OPTIMIZE TABLE

The `OPTIMIZE TABLE` statement compacts a table's data files. It changes how the rows are
stored, never which rows there are.

## Syntax

~~~sql
OPTIMIZE TABLE <table>;
~~~

## Parameters

- **`<table>`** — the table to compact, fully qualified as
  `<workspace>.<collection>.<table>`. Must be a catalog-backed table.

The `TABLE` keyword is **required**. Unlike Databricks, `OPTIMIZE <table>` on its own is
rejected rather than accepted as a shorthand.

## Examples

~~~sql
OPTIMIZE TABLE catalogue.security.vulnerabilities;
~~~

## What It Does

Two things accumulate in a table as it is written to, and compaction is what clears both.

**Small files.** Every `INSERT`, `MERGE` and `UPDATE` adds files. A table written to often
ends up with many small ones, and a query then pays per-file overhead it gets nothing for.
Compaction combines them toward a target size.

**Deleted rows.** [DELETE](delete), [UPDATE](update) and [MERGE](merge) do not rewrite the
files a row lives in — they mark the row as deleted where it sits, and readers skip it.
That keeps those statements cheap, but the bytes stay on disk and every reader keeps paying
to skip them. Compaction is what actually materialises the removal: a rewritten file
contains only its live rows, so the deleted bytes stop existing rather than being skipped.
(A file whose rows were *all* deleted is dropped from the table at that point, without
waiting for a compaction to come round.)

Neither changes what the table contains. A `SELECT` returns the same rows before and after.

## Strategy

There is no strategy to choose — it is detected from the table itself, the same way the
scheduled compaction job detects it:

- A table with a `CLUSTER BY` sort order is compacted **sort-aware**, so files keep
  non-overlapping value ranges and stay prunable.
- A table with no sort order is compacted by **bin-packing** small files together.

Set the sort order with `ALTER TABLE ... CLUSTER BY` — see [ALTER TABLE](alter-table).

## Declining Is Not Failing

`OPTIMIZE TABLE` may decide there is nothing worth doing — no group of files clears the
size thresholds, and no file carries enough deleted rows to be worth rewriting on its own.
That is a **success that did no work**: no new version of the table is written, and the
statement reports zero rows affected rather than raising.

A table that has just been compacted, or one that only ever received a single large write,
will normally decline.

## Limitations

- **`OPTIMIZE TABLE <table>` is the only form.** ClickHouse's `ON CLUSTER`, `PARTITION`,
  `FINAL` and `DEDUPLICATE`, and Databricks's `WHERE` and `ZORDER BY`, all parse but are
  **rejected** at plan time — there is no equivalent behaviour, so accepting and ignoring
  them would imply one.
- **One table per statement.**
- **Catalog-backed tables only.** A connector with no catalog has no file layout to compact
  and refuses.
- **One pass per statement.** A very fragmented table may need several runs to reach a
  settled layout.

## Notes

- Requires the `writer` role, not `owner`. Compaction rewrites files losslessly and
  declares no new structure, so it sits at the same trust tier as `INSERT` rather than the
  owner-only tier `ALTER TABLE` uses.
- Compaction is also run on a schedule; this statement is the manual form of the same
  operation, not a different one.
- Snapshot history is not rewritten. Earlier snapshots still reference the pre-compaction
  files, so [time travel](version-as-of) keeps working — which also means compaction does
  not immediately reclaim the space, since the old files are still referenced until those
  snapshots age out.
- **A materialized view accepts this statement**, unlike every other table modifier. Its
  files are compacted losslessly, so the view still holds exactly what its defining
  `SELECT` produced — see
  [REFRESH MATERIALIZED VIEW](refresh-materialized-view#a-materialized-view-is-not-a-table).

## See Also

- [ALTER TABLE](alter-table)
- [MERGE](merge)
- [DELETE](delete)
- [UPDATE](update)
- [SHOW MANIFEST](show-manifest)
