# docs-site

Next.js documentation frontend for Opteryx.

## Key Directories

- `app/docs/[...slug]/page.tsx` - renders non-reference markdown from `content/docs/`.
- `app/docs/reference/[...slug]/page.tsx` - renders reference markdown from `reference/`.
- `app/lib/docsNav.ts` - shared nav parsing, breadcrumbs, and reference URL mapping.
- `content/docs/` - markdown source for non-reference docs.
- `reference/` - markdown source for API/SQL/Python reference docs.
- `scripts/validate-docs.mjs` - validates nav targets and markdown links.
- `nav.json` - sidebar/navigation tree.
- `learn.json` - the learning paths under `/learn`: ordered steps (existing docs pages) per persona.
- `content/learn/` - the hands-on exercise markdown for each learning path.
- `app/learn/` - renders the learning paths index and per-path pages.
- `public/` - static assets.

## Conventions

- Do not create per-page route wrappers under `app/docs/**` for markdown content.
- Add new non-reference docs as markdown files under `content/docs/`.
- Add new reference docs as markdown files under `reference/` and register in `nav.json`.
- Update `nav.json` whenever sidebar or breadcrumb placement should change.
- Learning paths link to existing pages only; add a step to `learn.json` rather than duplicating content under `content/learn/`.

## Development

```bash
npm ci
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Validation

```bash
npm run validate:docs
```
