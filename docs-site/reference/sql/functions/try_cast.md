```markdown
# TRY_CAST

**Status:** Placeholder

Signature: `TRY_CAST(value AS TYPE)` — attempt to cast a value to the target type; returns `NULL` if the cast fails.

Example:

```sql
SELECT TRY_CAST('not-a-number' AS INTEGER);
```

Notes: Document behavior with invalid inputs and examples.
```
