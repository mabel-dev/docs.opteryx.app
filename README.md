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

### Icons

Icons are [Phosphor](https://phosphoricons.com) (Regular weight, MIT), drawn as inline SVG. The path data lives in `docs-site/app/lib/phosphorIcons.ts`; to add an icon, copy its path's `d` attribute from `@phosphor-icons/core` into that file. No icon package is installed.

- Don't use emoji as icons, in components, nav or markdown. `npm run build` and `make validate` fail if they find one (`docs-site/scripts/check-emoji.mjs`). Emoji inside code blocks and inline code are allowed.
- Icons take `fill="currentColor"`, so set their colour on the parent and they follow light and dark mode. Never hard-code a colour in an icon.
- Decorative icons get `aria-hidden="true"` and `focusable="false"`. An icon-only control puts its name on the control with `aria-label`.

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
