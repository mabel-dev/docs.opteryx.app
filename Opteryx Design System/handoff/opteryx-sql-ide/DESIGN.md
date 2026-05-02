# Design

This repo uses the **Opteryx Design System** as the source of truth for
brand colors, typography, spacing, radii, shadows, and motion.

## Where tokens live

```
src/styles/
  tokens.css     ← canonical token values. THIS IS THE ONLY FILE THAT
                   DEFINES BRAND HEX/RGBA. Mirror of
                   opteryx-design-system/colors_and_type.css.
  tailwind.css   ← @imports tokens.css, declares @font-faces, contains
                   utility/component classes that USE those tokens.
```

Tailwind config (`tailwind.config.cjs`) maps utility names like
`bg-teal`, `text-navy`, `border-red` to CSS variables defined in
`tokens.css`. So a Tailwind class and a `var(--opteryx-teal)` reference
always resolve to the same value.

## Rules

1. **Never put a brand hex literal anywhere except `tokens.css`.**
   - Component CSS uses `var(--…)`.
   - Inline `style={…}` attributes use `var(--…)`.
   - Tailwind classes (`bg-teal`, `text-navy`, etc.) are fine — they go
     through tokens automatically.

2. **Adding a new brand color**: open a PR upstream against the design
   system (`colors_and_type.css`) first. Once merged, regenerate this
   repo's `tokens.css` and add a Tailwind alias if the color needs a
   utility class.

3. **Changing a value**: never patch only `tokens.css` here — the design
   system is upstream. If a color or size needs to change, raise it
   there, then sync.

## Code review check

This grep should return zero hits for any new code:

```bash
git diff --name-only origin/main... \
  | xargs grep -nE '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b' \
  | grep -vE '^(src/styles/tokens\.css|.*\.svg):'
```

If a PR introduces a hex outside `tokens.css` (or an SVG asset), reject
and ask for a token reference instead.

## Syncing tokens from the design system

When `colors_and_type.css` updates upstream:

1. Copy the `:root` block plus the `@font-face` declarations from
   `colors_and_type.css`.
2. Paste over `src/styles/tokens.css`'s `:root` block. Preserve the
   "Aliases" section (legacy variable names used across this codebase).
3. If new brand color tokens were added, expose any that need utility
   classes via `tailwind.config.cjs` `colors:` map (always as
   `var(--opteryx-…)`, never a hex).
4. Run `npm run build` and visually QA against the design-system
   reference pages.

## Fonts

The IDE self-hosts Space Grotesk, IBM Plex Sans, and JetBrains Mono
under `public/fonts/`. The `@font-face` declarations live in
`tailwind.css`. Same files are used by every Opteryx surface — do not
swap to a Google Fonts CDN, do not add new families without updating
the design system first.

## Reference

- Opteryx Design System project: contains the canonical `colors_and_type.css`,
  full UI kits (docs, marketing, blog, studio), and component examples.
- Studio UI kit (`ui_kits/studio/` in the design system) is the visual
  spec this IDE implements.
