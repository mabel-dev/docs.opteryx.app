# Plan: site and docs improvements prompted by Pivot (pivotlake.io)

Date: 2026-10-05

Pivot is a self-hosted Rust engine (Postgres protocol, managed Delta Lake, Iceberg reads).
Opteryx.app is a hosted, metered workspace with an Apache-2.0 engine underneath. The overlap
is "query open formats in place, no warehouse copy". What's worth borrowing is how they
*argue* — measured proof, a scannable spine, a single quickstart — not their claims.

Guardrail throughout: only claim the connectivity we actually have (Iceberg + native catalog).
No "works with Snowflake/Spark/Trino" style lists.

Every item marked **[M]** needs real measurements before it can ship. See *Measurements
needed* at the bottom.

---

## Phase 0 — Decision: do we publish numbers?

`reference/internals/benchmarking.md` currently says it "deliberately publishes no timings".
Phases 1 and 2 depend on reversing that, at least partly.

Proposal: keep that page as-is (methodology only), and publish numbers in **one** place — a
dated, versioned results page (`/docs/introduction/performance` or a blog post) that states
hardware, build, date and a rerun command. The marketing site and "why fast" page link to it
rather than embedding raw numbers that go stale.

- [ ] Decide: publish dated numbers yes/no, and where they live
- [ ] Decide: compare against other engines (DuckDB, DataFusion, Polars) or only against ourselves / against bytes stored

## Phase 1 — Docs: "Why Opteryx is fast and cheap" (highest value)

New narrative page in **Introduction**, ~2,000–3,000 words, diagram-led, written for
evaluators. It links down into `reference/internals/*` for depth rather than duplicating it.

Outline (draft, adjust to what we can measure):
1. **Read less** — Parquet row-group/page pruning, predicate and projection pushdown, late
   materialization. **[M]** bytes stored vs bytes scanned on representative queries.
2. **Do less per row** — bytecode engine, Draken vector encoding, German strings.
   **[M]** a before/after or per-operator figure.
3. **Start fast** — no cluster, cold start to first result. **[M]** cold and warm latency.
4. **Cost follows work** — metering on bytes scanned, so pruning shows up on the bill.
   **[M]** worked examples in pence.
5. **How we check it** — link to benchmarking methodology and the results page.

- [ ] Draft outline against existing internals pages (bytecode-engine, draken, rugo, engine-overview)
- [ ] 3–4 inline SVG diagrams (pruning, pipeline, cost per query)
- [ ] Fill in measurements **[M]**
- [ ] Add to `nav.json` under Introduction, link from `what-is-opteryx.md`

## Phase 2 — opteryx.app landing page (lives in the opteryx.app repo, not here)

1. **Proof section straight after the hero.** 2–3 measured tiles that back *our* promises,
   not raw speed: "Scanned X MB of Y GB stored", "First result in N ms, no cluster",
   "This query cost £0.000N". Each tile links to the results page. **[M]**
2. **Numbered spine** for the existing pillars, Pivot-style:
   01 Nothing to provision · 02 Governance built in · 03 No surprise bills · 04 Open engine.
3. **Promote "same SQL, hosted or local"** out of the bottom Engine section into the spine
   (pillar 04), with copyable `pip install opteryx-core`.
4. **GitHub star + repo link** in the header nav (Apache-2.0 core as a trust signal).
5. Keep the pricing and free-quota sections where they are — Pivot has nothing equivalent.

- [ ] Draft copy for spine + proof tiles (can be done here as markdown, handed over)
- [ ] Implement in opteryx.app repo
- [ ] Fill proof tiles **[M]**

## Phase 3 — Docs: one quickstart

Today there are four entry pages: `registration` → `quick-start` (Studio tour) →
`reading-data`, with `installation` off to the side. Replace with one
"First query in two minutes" page with tabs:

- **Hosted** — sign in, run a query on `public.astronomy.moons`, show expected output.
- **Anonymous (OData)** — `curl` a public dataset with no account. Pivot can't offer this; lead with it.
- **Python** — `pip install opteryx-core`, query a local Parquet file, show expected output.

Each tab ends with the same "Next steps". The existing pages stay as deeper follow-ons;
the Studio tour becomes "Studio tour" rather than "Quick Start".

- [x] Tabs added to the renderer (`<!-- tabs -->` / `<!-- tab: X -->` / `<!-- /tabs -->`, `DocTabs.tsx`)
- [x] `getting-started/first-query.md` written; OData and Python commands run for real (opteryx-core 0.9.155); Hosted tab taken from the Studio screenshot, not re-run
- [x] `nav.json`, docs landing, home hero and `index.md` point at it
- [x] Fixed `reading-data.md`: only `geopolitics` and `security` allow anonymous reads (`astronomy`, `sales` return 401)

## Phase 4 — Docs: architecture overview

Single diagram-led page tying together `architecture/planner.md`,
`core-concepts/execution-model.md` and `internals/engine-overview.md`:
SQL → AST → bound plan → optimized plan → physical operators, plus a hosted deployment view
(Studio / API / OData / Flight SQL → engine → storage). No new measurements needed.

- [ ] Draft with 2 diagrams
- [ ] Decide whether `engine-overview.md` merges into it or stays as the deep version

## Phase 5 — Docs navigation and site polish

1. **Group Functions by category** in `nav.json` (82 entries, currently flat A–Z): Numeric,
   String, Date & time, Encoding, Vector/distance, Conditional, System, etc. Keep one page per
   function (good for search); add a short landing page per category.
2. **Last-updated date** on each docs page (from git commit time at build).
3. **Dark mode** — no `prefers-color-scheme` handling in `app/globals.css` today. Add tokens + toggle.
4. **Keyboard shortcut for search** (⌘K / Ctrl+K) on the existing `SearchBox`, if not already wired.
5. **Surface guarantees** — link `roadmap-guarantees/known-limits.md` and `compatibility.md`
   from the intro page as "What we guarantee".

- [x] Functions grouped by category (generated by `scripts/update_docs_from_definitions.py`)
- [x] Last-updated dates (`scripts/build-last-updated.mjs`, `make deploy-cloudrun`, `.gcloudignore`)
- [x] Dark mode (tokens under `[data-theme="dark"]`, toggle in header, dual-theme Shiki)
- [x] ⌘K / Ctrl+K search, with hint in the box
- [x] Guarantees linked from the docs landing page and `what-is-opteryx.md`
- [ ] Follow-up: upstream function categories are off in places (`UTC_TIMESTAMP` under Misc, `GREATEST`/`LEAST` under Array); fix in the opteryx-core registrars
- [ ] Follow-up: site header overflows at phone width (pre-existing)

## Suggested order

Phase 0 decision → Phase 3 (no numbers needed, biggest first-impression win) and Phase 5 in
parallel → Phase 4 → once measurements arrive, Phase 1 → Phase 2.

---

## Measurements needed

To back Phases 1 and 2 with real figures, please supply (or point me at where they come from).
For each: the query, the dataset, hardware/environment, `opteryx-core` version, and date.

**Pruning / bytes scanned (hosted service)**
1. 3–5 representative queries with *bytes stored in the table* vs *bytes scanned* (from the
   Details panel or job stats). Ideally one selective filter, one projection-heavy, one aggregate.
2. Row groups / pages skipped vs total for the same queries, if the stats expose them.

**Latency (hosted service)**
3. Cold-start time to first result (first query after idle) and warm latency, p50 and p95,
   for a small query on a `public` dataset.

**Cost**
4. The billed cost of those same queries under current pricing (or I can compute it from
   bytes scanned × £0.004/GB + £0.10/1,000 queries if you confirm the formula is exact).

**Engine (opteryx-core, local)**
5. Any existing TPC-H / ClickBench / H2O results from the benchmarking harness — total and
   per-query, with hardware. Note whether they're cleared for external publication.
6. If we compare with other engines: the same suite run against DuckDB / DataFusion / Polars on
   the same machine.
7. One internals figure per technique you're happy to cite, e.g. speedup from the bytecode
   engine or Draken string encoding vs the previous implementation.

If some of these can't be produced, tell me which. I'll write those sections qualitatively
and leave the proof tiles out rather than use placeholder numbers.
