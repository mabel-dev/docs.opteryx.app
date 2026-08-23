#!/usr/bin/env python3
"""Sync the SQL definition files from opteryx-core's generated reference catalogs.

    definitions/*.json  <-  opteryx-core/reference/*.json

WHY THIS EXISTS
---------------
`definitions/functions.json` and its siblings describe the SQL surface of the
engine — every function, operator, type, aggregate and system variable. The
engine already generates exactly that, authoritatively, into
`opteryx-core/reference/` (via `make reference`, from the registrars).

Until this script, the copies here were refreshed by hand. They drifted: at the
time this was written `functions.json` was 21 functions behind the engine and
still carried one function the engine had removed, and `variables.json` was 16
behind. Docs that describe a SQL surface the engine does not have are worse than
no docs — so the copy is now mechanical.

This is the first link in the chain. The rest already existed:

    opteryx-core registrars
      -> opteryx-core/reference/*.json        (make reference)
      -> docs.opteryx/definitions/*.json      (THIS SCRIPT)
      -> docs-site/reference/**/*.md          (update_docs_from_definitions.py)

Never hand-edit `definitions/*.json` or the generated `.md` — a hand edit is
silently clobbered on the next run and makes the docs claim things the engine
does not do. To change what the docs say about a function, change the registrar
in opteryx-core, run `make reference` there, then run this and
`update_docs_from_definitions.py` here.

The `api-opteryx-*.json` definitions are NOT touched by this script: those come
from each service repo's own `scripts/export_api_docs.py`.

Usage:
    python3 scripts/sync_sql_definitions.py            # write, report the drift
    python3 scripts/sync_sql_definitions.py --check     # exit 1 if stale, write nothing

Called by:
    make sql-definitions
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEFS = ROOT / "definitions"

# Where opteryx-core is checked out. Sibling of this repo by convention — the
# same assumption web.opteryx's generate_sql_signatures.py makes.
CORE = ROOT.parent / "opteryx-core"
CORE_REFERENCE = CORE / "reference"

# definitions/<local name>  <-  reference/<core name>. The names differ only for
# functions, which the engine calls `function_signatures`.
SOURCES = {
    "functions.json": "function_signatures.json",
    "aggregates.json": "aggregates.json",
    "operators.json": "operators.json",
    "types.json": "types.json",
    "variables.json": "variables.json",
    # The statement / join / unary-operator surface. These lagged behind the
    # five above: the engine generates all eight catalogs and web.opteryx's
    # query editor already consumed all eight, but the docs took only five. So
    # a statement gaining syntax in opteryx-core — ALTER TABLE's column
    # operations, say — reached the editor's autocomplete mechanically and
    # reached the docs only if somebody remembered to hand-write it.
    #
    # Exporting them makes `definitions/` the complete mirror of the engine's
    # SQL surface, which is what `check_statement_coverage.py` checks the
    # statement pages against.
    "clauses.json": "clauses.json",
    "joins.json": "joins.json",
    "unary_ops.json": "unary_ops.json",
    # The window-function surface: ranking functions, the aggregate-window
    # form, and the plan-time restrictions. The window-functions statement page
    # is hand-written prose, but the catalog is what tooling (and future
    # generators) read — a window function the engine gains must land here to
    # be visible to the docs pipeline at all.
    "windows.json": "windows.json",
    # Expression SYNTAX — CAST, CASE WHEN, BETWEEN, EXISTS, IN (subquery),
    # IS DISTINCT FROM, SIMILAR TO, INTERVAL literals. The catalogs above
    # partition SQL by clause, operator, function, type, join, window and
    # variable, and expression syntax falls through every one of them: before
    # the engine gained this catalog there was no entry anywhere for CAST or
    # CASE, so anything reading `definitions/` as the complete SQL surface
    # concluded the dialect has neither.
    "expressions.json": "expressions.json",
}

# The docs definitions are written with this indent; keep it stable so a sync
# that changes nothing semantically also changes nothing textually.
INDENT = 4


def describe_drift(old, new) -> str:
    """A one-line summary of what a sync would change, for the run log."""
    if old is None:
        return "new file"
    if old == new:
        return "up to date"
    if isinstance(old, dict) and isinstance(new, dict):
        added = sorted(set(new) - set(old))
        removed = sorted(set(old) - set(new))
        changed = sorted(k for k in set(old) & set(new) if old[k] != new[k])
        bits = []
        if added:
            bits.append(f"+{len(added)} ({', '.join(added[:4])}{'...' if len(added) > 4 else ''})")
        if removed:
            bits.append(f"-{len(removed)} ({', '.join(removed[:4])}{'...' if len(removed) > 4 else ''})")
        if changed:
            bits.append(f"~{len(changed)} ({', '.join(changed[:4])}{'...' if len(changed) > 4 else ''})")
        return "; ".join(bits) or "reordered"
    return "changed"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--check",
        action="store_true",
        help="report drift and exit 1 if any definition is stale; write nothing",
    )
    args = parser.parse_args()

    if not CORE_REFERENCE.is_dir():
        # Fail loud and name the fix — a silent skip would leave the docs on a
        # stale snapshot while reporting success.
        print(
            f"error: opteryx-core reference catalogs not found at {CORE_REFERENCE}\n"
            f"       expected opteryx-core checked out beside this repo "
            f"(at {CORE}), with `make reference` run there.",
            file=sys.stderr,
        )
        return 2

    stale = 0
    for dst_name, src_name in sorted(SOURCES.items()):
        src = CORE_REFERENCE / src_name
        dst = DEFS / dst_name
        if not src.is_file():
            print(f"error: missing source {src}", file=sys.stderr)
            return 2

        new = json.loads(src.read_text())
        old = json.loads(dst.read_text()) if dst.is_file() else None
        drift = describe_drift(old, new)

        if old == new:
            print(f"  {dst_name:17} up to date")
            continue

        stale += 1
        if args.check:
            print(f"  {dst_name:17} STALE: {drift}")
            continue

        dst.write_text(json.dumps(new, indent=INDENT) + "\n")
        print(f"  {dst_name:17} synced: {drift}")

    if args.check and stale:
        print(
            f"\n{stale} definition(s) stale — run `make sql-definitions`, then "
            f"`python3 scripts/update_docs_from_definitions.py`.",
            file=sys.stderr,
        )
        return 1

    if stale:
        print(f"\n{stale} definition(s) updated — now run "
              f"`python3 scripts/update_docs_from_definitions.py` to rebuild the pages.")
    else:
        print("\nall SQL definitions already match opteryx-core.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
