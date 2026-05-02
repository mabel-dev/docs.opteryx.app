# Opteryx SQL IDE — Design System integration patch

This bundle integrates the **Opteryx Design System** into the
`opteryx-sql-ide` repo as the single source of truth for brand colors,
typography, spacing, radii, and shadows.

It is intentionally **foundation-only**: it does not touch any
`.svelte` component. After merging, components can adopt design-system
classes and tokens incrementally with no breaking changes — every
existing `var(--accent)`, `var(--text)`, `bg-teal`, etc. continues to
resolve, now to a token defined in one canonical place.

## Files in this bundle

| File | Destination in `opteryx-sql-ide` | Action |
| --- | --- | --- |
| `tokens.css` | `src/styles/tokens.css` | **new** — canonical brand tokens (mirror of design-system `colors_and_type.css`) |
| `tailwind.css` | `src/styles/tailwind.css` | **replace** — imports `tokens.css`, drops the duplicated `:root` block, keeps every component class unchanged |
| `tailwind.config.cjs` | `tailwind.config.cjs` | **replace** — Tailwind colors now reference CSS variables, so `bg-teal` and `var(--opteryx-teal)` always agree |
| `DESIGN.md` | `DESIGN.md` (repo root) | **new** — governance: where tokens live, how to add one, code-review rule |

## How to apply

From the `opteryx-sql-ide` repo root:

```bash
cp /path/to/handoff/opteryx-sql-ide/tokens.css           src/styles/tokens.css
cp /path/to/handoff/opteryx-sql-ide/tailwind.css         src/styles/tailwind.css
cp /path/to/handoff/opteryx-sql-ide/tailwind.config.cjs  tailwind.config.cjs
cp /path/to/handoff/opteryx-sql-ide/DESIGN.md            DESIGN.md
```

Then:

```bash
npm run dev   # smoke test
npm run build # confirm Tailwind picks up var()-backed colors
```

Visual diff should be **zero** — tokens were chosen so every legacy
alias (`--accent`, `--text`, `--panel`, `--header`, `--border`, `--error`,
the `accent-soft*` family, etc.) resolves to the exact same value it had
before.

## What changed conceptually

Before: brand colors lived in two places (`tailwind.css`'s `:root` block
and `tailwind.config.cjs`'s `colors:` map), drifted independently, and
neither matched the design-system spec.

After: one file (`src/styles/tokens.css`) owns everything. Tailwind reads
it via CSS variables. Component CSS reads it via the same variables.
There is no second source.

## What's next (separate PRs)

1. **Adopt design-system component classes** in the docs/marketing
   pages currently living in `web.opteryx` (tracked separately — out of
   scope for this repo).
2. **Audit raw hex usage**: the lint check in `DESIGN.md` will catch
   anything new; existing literals inside `.svelte` files can be migrated
   opportunistically to tokens as components are touched.
3. **Sync mechanism**: when `colors_and_type.css` changes upstream,
   regenerate `src/styles/tokens.css` from it — see `DESIGN.md`.
