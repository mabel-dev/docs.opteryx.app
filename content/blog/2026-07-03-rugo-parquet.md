---
title: Rugo Ships Standalone — The Work Behind the Second Wheel
description: Rugo — Opteryx's Parquet/CSV/JSONL file engine — is now publishable as its own PyPI package, built from the same source tree as opteryx_core, with opteryx_core left completely untouched.
date: 2026-07-03
author: Justin Joyce
role: Opteryx Engineering
tags:
  - rugo
  - packaging
  - build-system
---

# Rugo Ships Standalone — The Work Behind the Second Wheel

## TL;DR

* [Rugo](https://rugo.dev) — [Opteryx](https://opteryx.app)'s Parquet/CSV/JSONL file engine — has always shipped bundled inside `opteryx_core`. It's now also its own PyPI package: `pip install rugo` gets you draken + rugo and nothing else, at 17 MB installed and a 5 ms cold import, against PyArrow's 124 MB and 29 ms.
* `opteryx_core` is untouched. Same source tree, two wheels — no fork, no second copy of anything to drift out of sync.

## Why this needed doing

Rugo already did the reading and writing for every Opteryx query — it just didn't exist independently of Opteryx. Wanting a fast, dependency-free Parquet reader without SQL meant installing the whole engine anyway. That's the gap this closes: `pip install rugo` now gets you the same reader and writer Opteryx uses internally, with none of the rest. Full numbers and API are on [rugo.dev](https://rugo.dev); this post is the packaging story.

## One tree, two wheels

The obvious way to ship a standalone package is to fork the source. We ruled that out — two trees means two places for draken and rugo to drift apart, and the project builds from one `setup.py`, on principle.

So instead: one shared `build_common.py` defines the draken/rugo extensions once, and both `opteryx_core`'s `setup.py` and a new `rugo/setup.py` import it. Neither wheel defines its own copy of the extension list — if something changes, both wheels see it, or neither does. We proved `opteryx_core`'s 64-extension set is identical before and after the refactor rather than just asserting it.

Building a second `setup.py` from inside the same repo isn't free, though — it surfaced a handful of packaging bugs specific to sharing a tree: `rugo/`'s own directory shadowing the stdlib during import, the repo-root `pyproject.toml` describing the wrong package, and shared build directories leaking opteryx binaries into the rugo wheel. All ordinary failure modes once you know to look for them, but each would have shipped a broken or bloated wheel silently otherwise.

## The deliberate cut: no remote I/O

Rugo's Parquet layer supports `gs://` and `http(s)://` reads via `libcurl` — but only because `opteryx_core` needs it. Vendoring curl into the standalone wheel just to make it compile would have undercut the entire point of a thin package.

So the call was: **standalone rugo is local-filesystem only.** It's a compile-time cut, not a runtime check — a remote path fails immediately and loudly, rather than silently returning nothing. `opteryx_core` keeps remote support exactly as it was; nothing about its behaviour changes.

## Keeping it thin

Rugo used to build as six separate `.so` files, each duplicating the nanobind runtime — the same wheel-bloat pattern we'd already fixed in draken. We fixed it in rugo too, before this wheel shipped: one dispatcher, one `rugo_native.so`. Shipping a second wheel with the old duplication would have shipped the bloat twice, right when the entire pitch is "the small one."

## What's still true

`opteryx` doesn't depend on the published `rugo` wheel — it compiles its own copy of the same source as part of the `opteryx_core` build. The two wheels share source, not a runtime dependency. `make compile` and `make q` are unaffected by any of this.

`pip install rugo` gets you a Parquet/CSV/JSONL engine with zero heavy dependencies, built from the exact code `opteryx_core` ships. Same tree, built twice, on purpose.

— Justin
