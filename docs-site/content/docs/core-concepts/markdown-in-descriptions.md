# Markdown in Comments and Descriptions

Dataset descriptions and object comments - set with [`COMMENT ON TABLE`/`COMMENT ON VIEW`](/docs/reference/sql/statements/comment), or edited directly from the web UI's Manage Dataset page - support a limited subset of Markdown when rendered.

## Supported syntax

- **Bold** - `**text**`
- *Italic* - `*text*`
- `Inline code` - `` `text` ``
- Links - `[text](https://example.com)`. Only `http://` and `https://` links are rendered; anything else is shown as plain text.
- Headings - `#` through `####`
- Bulleted lists - lines starting with `-` or `*`
- Numbered lists - lines starting with `1.`, `2.`, and so on
- Tables - GFM-style pipe tables, with a `|---|---|` header separator row
- Fenced code blocks - triple backticks, with an optional language hint

## Not supported

- Nested/indented lists
- Blockquotes
- Images
- Strikethrough
- Task lists
- Raw HTML

Unsupported syntax is not stripped - it's shown as literal text.

## Example

```markdown
Raw event records ingested from the upstream tracking pipeline.

- Deduplicated by `id`
- Backfilled from **2026-01-01** onward
- See the [ingestion runbook](https://example.com/runbook) for details
```

## Notes

- Everything is escaped before formatting is applied, so comment/description text can never inject HTML or scripts into the page.
- Because comments are set through SQL string literals, a literal single quote in the text must be escaped by doubling it (`''`) - this is standard SQL string escaping, not part of the Markdown syntax. See [COMMENT](/docs/reference/sql/statements/comment).
