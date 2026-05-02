# Opteryx Design System

**Opteryx** is a cloud data warehouse optimized for ease of use, cost, and execution transparency. It is a **read-only analytical query engine** for large datasets, with SQL as the primary interface and OData as a read-only secondary. Workloads are batch analytics — scans, filters, joins, aggregations — over object-storage-backed (Parquet) datasets, not transactional writes. It's pitched at technically mature data, platform, and security teams who want enterprise-class outcomes with full data ownership and predictable cost.

## Sources consulted

Read-only codebase mounted at `opteryx.studio/`:

- `opteryx.studio/web.opteryx/` — static marketing site (nginx) hosted at **https://opteryx.app**. HTML + Tailwind CDN + custom `css/style.css`. Contains the landing page, login, app shell (`/app/index.html`), settings, onboard, SQL reference.
- `opteryx.studio/opteryx-sql-ide/` — a Svelte+Vite rework of the SQL IDE. Thin dividers, Zed-like neutral aesthetic, Monaco/CodeMirror editor, split panes, mermaid execution-plan renderer.

Uploaded assets (in `uploads/`):

- `uploads/opteryx-brand.svg` — brand mark (silhouette + two-panel teal construction).
- `uploads/style.css` — canonical marketing stylesheet (602 lines, tokens + components).
- `uploads/ibm-plex-sans-200.woff2`, `space-grotesk-400.woff2`, `jetbrains-mono-400.woff2` — primary webfonts.

Public references:

- Homepage: https://opteryx.app
- Docs: https://docs.opteryx.app
- Status: https://status.opteryx.app / https://opteryx.statuspage.io
- Repo: https://github.com/mabel-dev/ (maintainer: Justin Joyce)

## Products represented

1. **opteryx.app** — marketing website. Public landing, login, integrations copy ("Tableau, Power BI, Looker"), "Join the waitlist" CTAs, resource cards, BI-backend positioning. 30-day free trial, sign-in via GitHub / Google / Microsoft.
2. **Opteryx Studio** — the product. A browser-based SQL IDE. Header with natural-language "Ask about this data…" input that calls `agent.opteryx.app`; left sidebar with Datasets + Recent Queries; center pane with Monaco SQL editor + tabbed Results / Details / Execution Plan; right-side SQL Reference drawer; settings (Account, Access Tokens, Billing). A Svelte rework of the IDE exists with a denser, editor-like shell (header + footer status bar, split.js panels).

---

## CONTENT FUNDAMENTALS

**Voice.** Quiet, senior, slightly understated. No exclamation marks anywhere in the marketing copy. No emoji. Product copy assumes a technical reader who has opinions about query engines. The brand doesn't hype — it tells you what it does and trusts you to get it.

**Casing.** Sentence case for all headings, buttons, labels, and tab names. Not Title Case. Examples in the codebase: "Join the waitlist", "Learn more", "Start for free", "Enterprise analytics with control, safety, and confidence", "Preparing your workspace.", "Query details", "Execution plan", "Create View" (the lone capital-V in the app is an outlier — stay sentence case).

**Person.** Second person ("your data, your control", "Make your data work harder"). First-person plural ("we") is avoided. Third-person descriptive when talking about the engine itself ("Opteryx is a read-only analytical query engine…").

**Punctuation.** Short declarative sentences. Em-dash used for emphasis in the title tag pattern (`"Opteryx — Enterprise analytics platform"`). Periods end body sentences; skipped on labels and inline UI.

**Vibe.** Trust, control, predictability. The three pillars on the marketing page are *predictable behavior*, *governance built-in*, *your data, your control*. Recurring words: **predictable, transparent, dependable, trust, governance, ownership, zero-ops, cost-aware**. Anti-words the brand avoids: "AI-powered", "magical", "revolutionary", "game-changing".

**Example copy, verbatim:**

> Enterprise analytics that deliver dependable results, clear governance, and straightforward data ownership.

> Zero-ops consumption—no infrastructure to manage.

> Cost-aware execution with transparent, predictable pricing.

> A platform your security and compliance teams can trust.

**App-side copy.** Terse, imperative where it's an action ("Run", "Import New", "Download CSV"); factual where it's a state ("Ready", "Loading…", "Up to 1,000 rows"). Empty-states teach: the Results empty-state explains what the tab will eventually show, then offers a runnable example query. Errors are a single line in a pale-red banner — no stack traces by default.

**Emoji / exclamation marks.** Do not use. None appear in the codebase.

---

## VISUAL FOUNDATIONS

**Colors.** The palette is small and used with restraint.

- **Teal `#07797C`** — the primary brand colour. It is the logo-mark background, the "Ask AI" send-icon hover, the focus ring, and the primary-action button on the IDE header/hero. It is *not* used as a page background — it stays a mark and an accent.
- **Orange `#FE7701`** — the secondary accent. It underlines the active tab (a 32px-wide, 3px-tall rounded bar), colours inline links on the marketing page, and paints the primary button in the IDE (`.btn-primary` in the Svelte rework). It's the "look here" colour.
- **Navy `#1F2E61`** — the trust colour. Marketing `btn-primary` background, body text in the IDE, big-CTA gradient endpoint.
- **Pale teal `#F3FBFA`** — the only brand-tinted surface. Table header rows, badge fills, login page body background (via `.bg-muted`).
- **Indigo line `#666699`** — a single flat rule used as the header/footer separator in the IDE (`border-bottom: 1px solid #666699;`). Unusual and distinctive.
- **Slate neutrals** — `#3D4A4E` body, `#1F2E61` deep text, `#5F6B78` muted, `#94A3B8` placeholder, `#D9E2E8` border, `#F6F8FB` panel.
- **Status** — success `#188038`, danger `#D50000`, warning `#FFA503`, gold `#C89427`. All used with ~8–16% alpha backgrounds and full-strength text.

**Type.** Three families, each with a specific job.

- **Space Grotesk** (400/600) — display and UI. Body font on the marketing site and the SQL IDE shell.
- **IBM Plex Sans** (200/400/500) — long-form body and tabular text. Used in the results table (`.custom-table-cell` at weight 200 for scanability) and set as the body fallback.
- **JetBrains Mono** (400/700) — all code, SQL, and numeric readouts (`.font-code`, `.sql-editor-box`, table row-counter).

**Weights used.** 200 (table cells — unusually light, a deliberate choice), 400 (body), 500 (UI labels, nav items), 600 (headings, primary buttons), 700 (mono emphasis).

**Backgrounds.** Predominantly white or `#F6F8FB` panel-grey. One gradient exists on the IDE app body: `bg-gradient-to-br from-slate-50 via-gray-100 to-sky-50`. The marketing hero uses a *very* subtle diagonal tint: `linear-gradient(135deg, rgba(7,121,124,0.06), rgba(31,46,97,0.03))`. The big CTA strip at the bottom of the homepage uses a saturated `linear-gradient(90deg, rgba(31,46,97,0.98), rgba(7,121,124,0.98))` — navy → teal. No photographs, no illustrations, no patterns, no grain. Backgrounds exist to recede.

**Borders.** Hairlines. `1px solid var(--muted-border)` where `--muted-border = rgba(61,74,78,0.08)`. IDE panels use a solid `#D9E2E8`. The header/footer rule in the IDE shell is the unusual `#666699` indigo-grey.

**Shadows.** Minimal and very soft. Cards use `0 8px 24px rgba(15, 23, 42, 0.035)` — barely visible, just enough to detach. Primary buttons get `0 6px 18px rgba(7,121,124,0.08)` — a teal-tinted lift. The user menu uses `0 16px 36px rgba(15, 23, 42, 0.12)`. There are no inner shadows, no multi-layer stacks.

**Corner radii.** Small and consistent. `5px` IDE buttons, `6px` inputs/icon buttons, `8px` marketing buttons, `10–12px` cards, `14px` hero section and menus, `999px` pills/badges. Nothing is fully square; nothing is a "pill" except status badges.

**Cards.** White background, 1px hairline border, 12px radius, 24px inner padding, very-soft shadow. No colored left-borders, no accent stripes, no icon wells unless the design actively earns them.

**Buttons.** Three tiers.
- *Primary* — solid fill, 600 weight. Marketing uses navy fill; IDE uses teal or orange fill depending on surface.
- *Secondary* — transparent background, 1px border, navy text.
- *Ghost/icon* — no border, no background, muted grey; `rgba(7,121,124,0.06)` background and teal text on hover. 28×28 square hit target in the IDE.

**Hover states.** Subtle. Opacity rarely changes; backgrounds pick up a 6–8% alpha teal tint; text shifts from muted to teal/navy. `filter: brightness(0.92)` on the IDE's orange button. Links flip from orange to teal on hover (an unusual inversion that reinforces teal as the "correct" brand colour).

**Press states.** Background deepens (`#EEF2F7` on ghost buttons). No transform/scale animation anywhere — presses are colour-only.

**Transparency & blur.** Used once meaningfully: the IDE header is `bg-white/50 backdrop-blur` so the subtle page gradient bleeds through. Elsewhere, transparency is purely in shadow/border alphas.

**Layout rules.** Marketing: centered, `max-width: 1100–1536px`, generous vertical rhythm (`py-16`, `py-20` for hero). IDE: full-viewport flex shell, fixed 48px header, no outer margin, split.js-resizable panels with 1px indigo-teal gutters that thicken to ~10px on hover.

**Iconography.** Thin monoline 16×16 SVGs. See [ICONOGRAPHY](#iconography) below.

**Animation.** Minimal. 120–200ms eases. The only non-trivial animations in the codebase: `pulse` on the green status-indicator dot (`2s infinite`), `fadeIn`/`slideUp` on the AI-response modal (200ms / 300ms), and `animate-spin` on the loading slash-circle. No page transitions, no parallax, no scroll-triggered reveals.

**Protection gradients / capsules.** Not used. Text sits on solid or very-softly-tinted surfaces.

**Imagery vibe.** There is no product photography. The only figurative asset is the Opteryx logo mark — a stylized bird silhouette made from angular shapes, rendered in a single teal colour (`#07797C`) or white-on-teal. Placeholder "Logo" boxes appear where customer logos would go.

---

## ICONOGRAPHY

**Approach.** A **hand-crafted, project-owned SVG icon set** lives in `web.opteryx/static/icons/` and `opteryx-sql-ide/src/lib/icons/`. Filenames follow a strict namespacing: `action-*` for toolbar actions, `object-*` for data entities (table, view, file, person), `type-*` for SQL data types (integer, varchar, date, decimal, jsonb, interval…), `tab-*` for the main Results/Details/Plan tabs, `status-*` for statuses, and `source-*` for data-source origins (python, portal). These have been copied into `assets/icons/` in this design system.

**Style.** Monoline, 16×16, `currentColor`, ~1.5–2px strokes, rounded caps/joins, no fills (mostly). The set borrows silhouettes from Bootstrap Icons (the filenames `check-circle-fill`, `chevron-down`, `graph-up`, `record-circle-fill`, `slash-circle`, `x-circle-fill` are Bootstrap-Icon conventions) but has been trimmed and renamed. A few additions (the branded `source-portal`, `source-python`, the `type-*` set) are custom to Opteryx.

**Emoji.** Not used. Zero emoji in the codebase.

**Unicode symbols.** Not used as iconography. The only unicode character doing UI work is "→" in a single "Learn how to connect →" link and "×" in the modal close button.

**Logo mark.** The bird-silhouette mark appears in three forms — solid on teal (`assets/opteryx-icon.svg`, `opteryx-favicon.svg`), full-colour on white (`opteryx-mark-d2.png` / `.svg`), and outline-only using `currentColor` (`opteryx-logo-outline.svg`). A path-only currentColor variant (`opteryx-logo.svg`) is used in the app's loading state at `w-32 h-32 text-accent`.

**Substitution policy.** If you need an icon that isn't in `assets/icons/`, reach for **[Bootstrap Icons](https://icons.getbootstrap.com/)** first — the stroke weight and geometry match. Do *not* mix in Lucide, Heroicons, or Feather: their weight is different. The marketing site does load `feather-icons` via CDN for a few footer social icons (twitter, linkedin), but the primary product icon set is the in-repo SVGs.

---

## VISUAL INDEX — this folder

```
README.md                ← you are here
SKILL.md                 ← invokable skill manifest
colors_and_type.css      ← CSS vars: palette, type, spacing, radii, shadows
fonts/                   ← Space Grotesk, IBM Plex Sans, JetBrains Mono (woff2)
assets/
  opteryx-icon.svg       ← teal rounded-square brand mark (use as favicon/mark)
  opteryx-logo.svg       ← currentColor mark (scale + tint freely)
  opteryx-logo-outline.svg
  opteryx-favicon.svg
  opteryx-traced.svg
  opteryx-mark-d1.png    ← alt brand-mark variant
  opteryx-mark-d2.svg    ← alt brand-mark variant (teal+navy+orange)
  tab-icons.svg          ← sprite used by the IDE tab bar
  icons/*.svg            ← the full Opteryx icon set (~60 icons)
preview/                 ← design-system cards (auto-shown in DS tab)
ui_kits/
  marketing/             ← opteryx.app landing + login recreation
  studio/                ← Opteryx Studio (SQL IDE) recreation
```

## CAVEATS

- **No Figma file was provided.** All visual truth comes from the `opteryx.studio/` codebase + uploaded CSS.
- **No slide deck template exists** in the sources, so `slides/` is not generated.
- **Font files are the ones you uploaded.** No substitutions were needed — all three families are present in the codebase at the weights used.
- **Imagery is sparse by design.** The real product has almost no photographic/illustrative imagery. I did not invent any.
- **No brand guidelines document** exists in the codebase; content fundamentals above are synthesized from observing actual site copy, not from an authored voice guide.
