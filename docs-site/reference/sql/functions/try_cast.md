# TRY_CAST

**Category:** Conversion

Signature: `TRY_CAST(value AS TYPE)` — attempt to cast a value to the target type; returns `NULL` if the cast fails.

## Syntax

## Examples

```sql
SELECT TRY_CAST('not-a-number' AS INTEGER);
```

## Related Functions

CAST, SAFE_CAST

## Notes

Document behavior with invalid inputs and examples.
