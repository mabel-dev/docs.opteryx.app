# docs.opteryx

Official documentation site for Opteryx.

## Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Markdown rendered via `marked`

## Local Development

Run from repo root:

```bash
make serve
```

Or directly:

```bash
cd docs-site
npm ci
npm run dev
```

## Repository Layout

- `docs-site/content/docs/` - Markdown source for non-reference docs (`/docs/*` pages).
- `docs-site/reference/` - Markdown source for API, SQL, and Python reference docs.
- `docs-site/nav.json` - sidebar structure and reference route metadata.
- `docs-site/app/docs/[...slug]/page.tsx` - dynamic renderer for non-reference docs.
- `docs-site/app/docs/reference/[...slug]/page.tsx` - dynamic renderer for reference docs.
- `docs-site/app/lib/docsNav.ts` - shared nav + breadcrumb + reference path mapping logic.
- `docs-site/scripts/validate-docs.mjs` - nav/content integrity checks for docs paths and markdown links.
- `cloudbuild/` - Cloud Build deployment config.

## Editing Docs

1. Edit non-reference pages in `docs-site/content/docs/`.
2. Edit reference pages in `docs-site/reference/`.
3. Add/update `docs-site/nav.json` when navigation should change.

## Build

```bash
make build
```

or:

```bash
cd docs-site
npm run build
```

## Validation

```bash
make validate
```
