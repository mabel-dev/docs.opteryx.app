---
title: DROP STATISTICS Statement — Opteryx Reference
description: SQL DROP STATISTICS statement syntax and examples for discarding collected table statistics in Opteryx
---

# DROP STATISTICS

The `DROP STATISTICS` statement discards statistics previously collected by
[ANALYZE TABLE](analyze-table.md). The table's data is untouched; only the optimizer's
metadata about it is removed.

## Basic Syntax

~~~sql
DROP STATISTICS ON [workspace].[collection].[table_name] [FOR COLUMNS column [, column ...]];
~~~

Note the `ON` — unlike `ANALYZE TABLE`, this statement names its target after `ON`, and
any other form is rejected.

## Examples

### Discard All Statistics for a Table
~~~sql
DROP STATISTICS ON workspace.collection.large_dataset;
~~~

### Discard Statistics for Specific Columns
~~~sql
DROP STATISTICS ON workspace.collection.large_dataset FOR COLUMNS region, created_at;
~~~

Columns not named keep their statistics.

## Why Drop Statistics

Statistics describe the data as it was when `ANALYZE TABLE` last ran. If a table has
changed shape substantially and has not been re-analyzed, stale statistics can be worse
than none — the optimizer will plan confidently from a distribution that no longer holds.
Dropping them returns the optimizer to planning without that input until the table is
analyzed again.

## Notes

- **Requires the `owner` role** on the table — the same tier as
  [ANALYZE TABLE](analyze-table.md), since it destroys what that statement builds.
- **Local filesystem datasets only.** Catalog-backed (workspace) datasets are rejected:
  their manifest entries carry statistics from the moment each file is written, so there
  is no "statistics absent" state to drop back to — removing them would mean deleting the
  dataset's record of the file itself. Other backends are rejected with
  `ANALYZE / DROP STATISTICS is not supported for this dataset's storage backend.`
- Idempotent — dropping statistics that were never collected is not an error.
- Dropping statistics never changes query results, only the plans chosen to produce them.
- Re-run [ANALYZE TABLE](analyze-table.md) to collect them again.
