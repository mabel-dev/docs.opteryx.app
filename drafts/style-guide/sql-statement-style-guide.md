# SQL Statement Page Style Guide (proposal)

Modeled on Snowflake's SQL reference (e.g. `ALTER MATERIALIZED VIEW`), adapted to keep
Opteryx's existing voice — the prose explanations under headers like "Why This Needs
Workspace Owner" are good and should stay. This fixes the *structural* inconsistency, not
the writing style.

## The core problem

Square brackets currently mean two different things across pages, sometimes in the same
syntax block:

```
ALTER TABLE [IF EXISTS] [workspace].[collection].[table_name]
```

`[IF EXISTS]` is optional. `[table_name]` is not optional — it's a placeholder you must
fill in. A reader can't tell which is which without already knowing the statement.

## Syntax notation

| Convention | Meaning | Example |
|---|---|---|
| `UPPERCASE` | Literal keyword, type verbatim | `ALTER TABLE` |
| `<lowercase_underscore>` | Placeholder — you supply this | `<table_name>` |
| `[ ... ]` | Optional | `[ IF EXISTS ]` |
| `{ a \| b }` | Required choice | `{ ON \| OFF }` |
| `[, ...]` | Preceding item repeats, comma-separated | `<view_name> [, ...]` |
| `::` | Fully-qualified name join (unchanged from current examples) | `<workspace>.<collection>.<table_name>` |

No more overloaded brackets. `<table_name>` reads as "put a name here"; `[ CLUSTER BY ... ]`
reads as "this whole clause is optional." This is the one mechanical change that touches
every page.

## Page structure

### Simple statements (one form — DROP VIEW, TRUNCATE TABLE, SHOW USER, ...)

```
# STATEMENT NAME

One or two sentence description.

## Syntax

~~~sql
<fenced block using the notation above>
~~~

## Parameters

- **`<placeholder>`** — what it means, any constraints
- `LITERAL_KEYWORD` — what choosing it does
(definition-list style, one entry per token that isn't self-explanatory; skip this section
entirely if the statement has no parameters worth explaining beyond the Syntax block itself
— e.g. REFRESH MATERIALIZED VIEW takes none)

## Examples

### Short imperative title
~~~sql
...
~~~

(repeat per notable variant — this part of the current pages is already good, keep it)

## Notes

- Bullet list: permissions required, edge cases, refusals. (Already the strongest,
  most consistent part of the existing pages — keep as-is.)

## See Also

- [RELATED STATEMENT](related.md)
```

### Multi-form statements (ALTER TABLE, ALTER MATERIALIZED VIEW, ALTER WORKSPACE, ...)

Keep the pattern `alter-table.md` and `alter-materialized-view.md` already use — it's
good and shouldn't be flattened to match the simple template:

```
# STATEMENT NAME

Description + a table summarizing the forms (already in alter-table.md — extend this
pattern to alter-materialized-view.md and alter-workspace.md too).

## Syntax

~~~sql
<all forms together, using the unified notation>
~~~

## <FORM ONE> (e.g. "CLUSTER BY", "OWNER TO")

~~~sql
<that form's syntax alone>
~~~

### Parameters
(only if it has any worth calling out beyond Syntax)

### Examples
(inline, as now — "### Cluster by a Single Column" etc.)

### Notes
(form-specific caveats, as now)

## <FORM TWO>
... repeat ...

## Notes
(caveats that apply across every form — as now)

## See Also
```

## Other normalizations while touching each page

- Heading is always `## Syntax`, never `## Basic Syntax` (some pages currently have both
  wording *and* skip straight to two unlabeled fenced blocks — e.g. `create-table.md`).
- `select.md`'s "Core Features" section duplicates what "Examples" already shows below it —
  fold into one `## Examples` list rather than two example sections.
- Every page ends with `## See Also` linking sibling statements, even short ones like
  `drop-view.md` that currently stop at Notes.
- Multi-line syntax blocks that align keywords in a river (`SELECT` / `FROM` / `WHERE` ...,
  as `select.md` already does) are kept for SELECT-shaped statements only; simple
  single-line statements stay single-line.

## Scope

44 files under `docs-site/reference/sql/statements/`. Two worked examples follow
(`drop-view.md` as the simple case, `alter-table.md` as the multi-form case) — sanity-check
those before the rest get the same treatment.
