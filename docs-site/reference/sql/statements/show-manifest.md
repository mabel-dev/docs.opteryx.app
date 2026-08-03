---
title: SHOW MANIFEST FOR Statement — Opteryx Reference
description: SQL SHOW MANIFEST FOR statement syntax and examples for inspecting a dataset's file-level manifest in Opteryx
---

# SHOW MANIFEST FOR

The `SHOW MANIFEST FOR` statement returns the file-level manifest for a dataset — one row per underlying file, with its size, row count, and per-column statistics (min/max bounds, null counts, string lengths). It answers directly from metadata the engine already holds; it never scans the dataset's actual data files.

## Basic Syntax

~~~sql
SHOW MANIFEST FOR [workspace].[collection].[table_name];
~~~

## Examples

### View a Dataset's Manifest
~~~sql
SHOW MANIFEST FOR workspace.collection.large_dataset;
~~~

### Inspect a Catalog-Backed Dataset
~~~sql
SHOW MANIFEST FOR workspace.collection.orders;
~~~

`SHOW MANIFEST FOR` is not a subquery source — it cannot be wrapped in
`FROM (...)`, filtered, or joined. Filter the returned rows client-side if
you only need part of the manifest.

## Result Columns

| Column | Description |
|--------|-------------|
| `file_path` | Path of the underlying data file |
| `file_format` | File format, e.g. `PARQUET` |
| `record_count` | Row count in the file |
| `file_size_in_bytes` | File size on disk |
| `uncompressed_size_in_bytes` | Uncompressed size, when known |
| `column_uncompressed_sizes_in_bytes` | Per-column uncompressed sizes |
| `null_counts` | Per-column null counts |
| `min_values` / `max_values` | Per-column bounds, positional by `field_ids` |
| `field_ids` | Column identifiers the positional stats line up with |
| `min_lengths` / `max_lengths` | Per-column string length bounds |
| `min_k_hashes` / `histogram_counts` / `char_class_counts` | Internal sketches used by the query optimizer |

## Notes

- **Requires ownership.** `SHOW MANIFEST FOR` exposes file paths and storage layout, not just data — it requires the `owner` role on the dataset, which is stricter than the `reader`/`writer` roles that are enough to `SELECT` from it.
- **Always returns the whole manifest.** `SHOW` statements have no `WHERE` clause or column list, and the result is not a subquery source, so there is no way to filter or project it at the source at all — filter the rows client-side if you only need part of the manifest.
- **Free to run.** The manifest is metadata the engine already holds for query planning; no data files are read to answer this.
- Works against both local filesystem datasets and catalog-backed (workspace) datasets.
