---
title: COMMENT Statement — Opteryx Reference
description: SQL COMMENT statement syntax and examples for adding comments to objects in Opteryx
---

# COMMENT

The `COMMENT` statement adds or modifies descriptive comments on tables and views. These comments provide documentation for data objects.

## Syntax

~~~sql
COMMENT [ IF EXISTS ] ON { TABLE | VIEW } <object_name> IS '<comment_text>';
~~~

## Parameters

- **`<object_name>`** — fully qualified as `<workspace>.<collection>.<object_name>`.
- **`<comment_text>`** — the comment to store, as a string literal.
- `IF EXISTS` — skip the operation without error if the object does not exist, instead of
  refusing the statement.

## Examples

### Table Comments
~~~sql
COMMENT ON TABLE workspace.collection.users IS 'User accounts and profile information';

COMMENT ON TABLE workspace.collection.orders IS 'All customer orders including status and amounts';
~~~

### View Comments
~~~sql
COMMENT ON VIEW workspace.collection.active_users IS 'Users with active accounts in the last 30 days';

COMMENT ON VIEW workspace.collection.order_summary IS 'Aggregated order statistics by customer';
~~~

### Only If It Exists
~~~sql
COMMENT IF EXISTS ON TABLE workspace.collection.old_data IS 'Legacy data table';

COMMENT IF EXISTS ON VIEW workspace.collection.temp_view IS 'Temporary analysis view';
~~~

### Documenting a Dataset
~~~sql
COMMENT ON TABLE warehouse.sales.transactions IS 'Daily transaction records including customer ID, amount, and timestamp';

COMMENT ON VIEW warehouse.sales.daily_revenue IS 'Aggregated daily revenue by product category';
~~~

## Notes

- `TABLE` and `VIEW` are the only supported object types. `COMMENT ON COLUMN` and other
  forms are rejected when the query is planned.
- Requires write access to the object being commented on, and a connector with somewhere
  to store the comment — not every backend has one.
- The comment is attributed to the session user who set it.
- Comments are useful for documenting data lineage and business logic.
- Comments are typically retrieved through metadata queries or documentation tools.
- Comment text supports a limited subset of Markdown when rendered in the web UI. See [Markdown in Comments and Descriptions](/docs/core-concepts/markdown-in-descriptions).

## See Also

- [CREATE TABLE](create-table)
- [CREATE VIEW](create-view)
- [ALTER TABLE](alter-table)
- [ALTER VIEW](alter-view)
