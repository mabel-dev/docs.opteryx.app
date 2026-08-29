---
title: Your First Table - Create, Query, Change and Clean Up
description: A hands-on Opteryx Studio walkthrough - build your own table from public sample data with CTAS, query it, change rows with UPDATE and DELETE, inspect its history, compact it, then drop it.
---

# Your First Table

This page is a complete round trip in [Opteryx Studio](https://opteryx.app): you create a table of your own, query it, change it, look at what those changes did to it, then remove it again. It takes about ten minutes and leaves nothing behind.

Nothing needs to be uploaded first — the table is built from `public.astronomy.planets`, one of the sample datasets everyone signed in can read. If you'd rather start from your own file, [Load and Query Data](reading-data) covers the upload flow; every step below works the same way against an uploaded table.

If you haven't signed in yet, start with [Logging In](registration), and [Site Tour](quick-start) for where the editor and catalog panel are.

## Where Your Table Will Live

Every relation is addressed as `workspace.collection.table`. You have a workspace of your own, `personal`, whose collection is your username — `personal.<you>.<table>` is yours outright, and no one else can be granted access to it (see [Access and Permissions](/docs/core-concepts/access-and-permissions)).

To find the name to type, ask for it:

```sql
SELECT USER();
```

Everything below writes `personal.<you>` — substitute the value you just got back. If your username is `ada`, `personal.<you>.planet_notes` is `personal.ada.planet_notes`.

## 1. Look at the Source Data

Start by seeing what you're copying from:

```sql
SELECT *
  FROM public.astronomy.planets
 LIMIT 10;
```

and its schema, which is what your own table's columns will be derived from:

```sql
SHOW COLUMNS FROM public.astronomy.planets;
```

`public.astronomy.planets` is read-only — you can query it, but the steps that follow need a table you own.

## 2. Create the Table

`CREATE TABLE ... AS SELECT` — CTAS — creates a table by materializing a query result. Here that's two columns per planet: its name, and a review status you're going to fill in later.

```sql
CREATE TABLE personal.<you>.planet_notes AS
SELECT name,
       'unreviewed' AS review_status
  FROM public.astronomy.planets;
```

The table's columns come from the query — there is no separate column list — and the string literal gives `review_status` its `VARCHAR` type. Every selected column has to resolve to a concrete type, so a column that is entirely `NULL` with nothing else to go on is rejected rather than guessed at.

The whole thing is one commit: either the table exists with all its rows, or the statement failed and nothing was created. It appears under `personal` in the catalog panel, alongside the `public` datasets.

If you run the statement twice, the second run fails — the table is already there. Use `CREATE OR REPLACE TABLE ... AS SELECT` to overwrite it, or `CREATE TABLE IF NOT EXISTS ... AS SELECT` to skip without an error. See [CREATE TABLE](/docs/reference/sql/statements/create-table) for both.

## 3. Query It

It's an ordinary table now, and reads like any other:

```sql
SELECT *
  FROM personal.<you>.planet_notes
 ORDER BY name;
```

```sql
SELECT review_status,
       COUNT(*) AS planets
  FROM personal.<you>.planet_notes
 GROUP BY review_status;
```

Every row should still be `unreviewed`. The **Execution plan** tab next to the results shows how Opteryx ran the query, and **Details** shows the timing and bytes scanned.

## 4. Change Some Rows

> Warning: `UPDATE` and `DELETE` are experimental, and work only against catalog-backed tables — which `personal.<you>.*` is. They aren't suitable for production use yet.

`UPDATE` changes the rows a condition names:

```sql
UPDATE personal.<you>.planet_notes
   SET review_status = 'reviewed'
 WHERE name IN ('Earth', 'Mars');
```

It reports how many rows it changed. Columns the `SET` list doesn't mention keep their existing values, and an assignment can read the value it's replacing — `SET revision = revision + 1` is fine.

Check the result:

```sql
SELECT review_status,
       COUNT(*) AS planets
  FROM personal.<you>.planet_notes
 GROUP BY review_status;
```

> Be Aware: the `WHERE` clause is what limits the damage. `UPDATE ... SET ...` with no `WHERE` changes **every row**, and there is no `LIMIT` to bound it — narrow the condition instead. Run [EXPLAIN](/docs/reference/sql/statements/explain) in front of the statement first if you want to see what it will touch without running it.

See [UPDATE](/docs/reference/sql/statements/update) for the full set of limitations — one table only, no `RETURNING`, no schema changes.

## 5. Remove Some Rows

`DELETE` takes the same shape:

```sql
DELETE FROM personal.<you>.planet_notes
 WHERE name = 'Pluto';
```

It reports how many rows it removed, and a `DELETE` that matches nothing is a success that does nothing — so re-running it is safe. As with `UPDATE`, omitting the `WHERE` clause removes every row; [TRUNCATE TABLE](/docs/reference/sql/statements/truncate-table) reaches the same end state more cheaply, by discarding the table's files outright.

## 6. See What Those Changes Did

Each of those statements committed a new version of the table, and the history is queryable:

```sql
SHOW SNAPSHOTS FOR personal.<you>.planet_notes;
```

One row per commit, newest first: when it landed, what kind of operation it was, and how many records and files it added and removed. You should see the `CREATE` at the bottom and the `UPDATE` and `DELETE` above it.

Any of those points can be read directly. `PREVIOUS` is the version of the data before the current one, so this is the table as it stood before the `DELETE` — with Pluto still in it:

```sql
SELECT *
  FROM personal.<you>.planet_notes VERSION AS OF PREVIOUS
 ORDER BY name;
```

See [VERSION AS OF](/docs/reference/sql/statements/version-as-of) for selecting a snapshot by id or by tag, and [TIMESTAMP AS OF](/docs/reference/sql/statements/timestamp-as-of) for selecting one by time.

## 7. Compact the Table

`UPDATE` and `DELETE` don't rewrite the files a row lives in — they mark the row as deleted where it sits and readers skip it. That's what makes them cheap, but the bytes stay on disk, and each write adds files. `OPTIMIZE TABLE` is what actually clears both:

```sql
OPTIMIZE TABLE personal.<you>.planet_notes;
```

There's no strategy to pick — it's detected from the table. Nothing about the table's contents changes; a `SELECT` returns the same rows before and after. On a table this small there is nothing worth compacting and it may well decline to do anything, which is a success, not a failure. See [OPTIMIZE TABLE](/docs/reference/sql/statements/optimize-table).

## 8. Clean Up

```sql
DROP TABLE personal.<you>.planet_notes;
```

> Warning: `DROP TABLE` removes the data the table holds, and its history along with it — the snapshots from step 6 go too. This cannot be undone.

Add `IF EXISTS` if you want the statement to succeed when the table has already gone, and confirm it's done:

```sql
SELECT *
  FROM personal.<you>.planet_notes;
```

That should now fail to resolve the table, and it should be gone from the catalog panel.

## What You Just Used

| Step | Statement | Reference |
| --- | --- | --- |
| Build a table from a query | `CREATE TABLE ... AS SELECT` | [CREATE TABLE](/docs/reference/sql/statements/create-table) |
| Read it back | `SELECT` | [SELECT](/docs/reference/sql/statements/select) |
| Change rows | `UPDATE` | [UPDATE](/docs/reference/sql/statements/update) |
| Remove rows | `DELETE` | [DELETE](/docs/reference/sql/statements/delete) |
| List the commit history | `SHOW SNAPSHOTS FOR` | [SHOW SNAPSHOTS FOR](/docs/reference/sql/statements/show-snapshots) |
| Read an earlier version | `VERSION AS OF` | [VERSION AS OF](/docs/reference/sql/statements/version-as-of) |
| Compact the files | `OPTIMIZE TABLE` | [OPTIMIZE TABLE](/docs/reference/sql/statements/optimize-table) |
| Remove the table | `DROP TABLE` | [DROP TABLE](/docs/reference/sql/statements/drop-table) |

## Next Steps

- [Load and Query Data](reading-data) — do the same thing with your own files instead of sample data
- [SQL Introduction](/docs/reference/sql/introduction) — a tutorial on the query language itself, if `SELECT`/`WHERE`/`JOIN` are new
- [Running a Query via the API](/docs/guides/running-a-query-via-the-api) — run these statements over HTTP rather than in the editor
- [Access and Permissions](/docs/core-concepts/access-and-permissions) — what `reader`, `writer` and `owner` each allow, and how to share a table outside `personal`
- [When a Materialized View Replaces a Pipeline](/docs/guides/when-a-materialized-view-replaces-a-pipeline) — the self-refreshing version of the CTAS in step 2

## Need Help?

If a step didn't do what you expected, [raise a bug or ask a question](https://github.com/mabel-dev/opteryx.app/issues/new/choose). [Getting help](/docs/support/getting-help) covers what to include.
