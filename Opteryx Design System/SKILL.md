---
name: opteryx-design
description: Use this skill to generate well-branded interfaces and assets for Opteryx, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Tokens:** `colors_and_type.css` — CSS vars for palette, type scale, spacing, radii, shadows.
- **Fonts:** `fonts/` — self-hosted Space Grotesk (display/UI), IBM Plex Sans (body), JetBrains Mono (code).
- **Brand marks:** `assets/opteryx-icon.svg` (teal rounded-square app mark), `opteryx-logo.svg` (currentColor path-only), `opteryx-logo-outline.svg`.
- **Icons:** `assets/icons/` — the full in-product SVG set (~60 icons). Monoline 16×16, currentColor, stroke-based. Fallback: Bootstrap Icons (same geometry).
- **UI kits:** `ui_kits/studio/` (SQL IDE) and `ui_kits/marketing/` (landing page) — both are runnable React prototypes you can lift components from.
- **Voice:** sentence case, no emoji, no exclamation marks, second-person. Words to use: predictable, transparent, dependable, trust, governance, ownership, zero-ops. Words to avoid: AI-powered, magical, revolutionary.

## Core palette

| Token              | Hex       | Use                                                    |
|--------------------|-----------|--------------------------------------------------------|
| `--opteryx-teal`   | `#07797C` | Primary brand. Mark background, focus ring, IDE primary|
| `--opteryx-orange` | `#FE7701` | Accent. Active tab, links, IDE Run button              |
| `--opteryx-navy`   | `#1F2E61` | Trust. Marketing CTA, body text                        |
| `--pale-accent`    | `#F3FBFA` | Only branded surface (table header, badge bg)          |
| `--text`           | `#3D4A4E` | Body text                                              |
| `--muted`          | `#5F6B78` | Secondary text                                         |

Shadows are soft (`0 8px 24px rgba(15,23,42,0.035)`). Radii are small (5–12px mostly; 999 for pills). No emoji, no gradients except the one marketing hero tint and the navy→teal CTA strip.
