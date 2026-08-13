#!/usr/bin/env python3
"""Fail if the window functions page has drifted from the aggregate catalog.

    definitions/aggregates.json  ->  docs-site/reference/sql/statements/window-functions.md

WHY THIS EXISTS
---------------
The window functions page used to say aggregate windows took "SUM, COUNT, or AVG".
That was a hand-written list, it was wrong by ten functions, and nothing noticed —
the same failure `check_statement_coverage.py` was written for, one level down.

The list does not need to be hand-written. Every entry in `aggregates.json` carries
a `support` object whose flags are exactly the two window forms:

    support.grouped  ->  OVER (PARTITION BY <column>)
    support.global   ->  OVER ()

So the correct list is derivable, and the page can be checked against it.

Two checks, both deliberately weak — they test whether the page NAMES the right
functions, not whether the prose around them is any good, which no script can judge:

1. COVERAGE — every aggregate with `support.grouped` is named on the page. A new
   aggregate registered in opteryx-core lands here as a failure.
2. EXCEPTIONS — the aggregates the page singles out as refused with `OVER ()` are
   exactly those with `support.global: false`. Today that is ARRAY_AGG and
   ANY_VALUE; if a third joins them, or one gains global support, this fails.

The `OVER ()` exceptions are read from the page section whose heading ends
"Need a Partition" — see `EXCEPTIONS_HEADING`.

A NOTE ON THE SOURCE
--------------------
opteryx-core has since grown `reference/windows.json`, a catalog written for window
functions specifically: its `aggregate_windows.support` map gives `over_empty` and
`over_partition_by` per aggregate, which is this check's question asked directly rather
than inferred. It agrees with `aggregates.json` exactly today. It is not yet in
`sync_sql_definitions.py`'s catalog list, so it does not reach `definitions/` — when it
does, point `AGGREGATES` at it and read those two flags instead.

Usage:
    python3 scripts/check_window_aggregates.py           # report, exit 1 on drift
    python3 scripts/check_window_aggregates.py --list    # show what the catalog says

Called by:
    make check-window-aggregates
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
AGGREGATES = ROOT / "definitions" / "aggregates.json"
PAGE = ROOT / "docs-site" / "reference" / "sql" / "statements" / "window-functions.md"

# The page section that lists the aggregates refused with `OVER ()`. Matched on the
# heading's trailing words so the heading can keep naming the functions it covers.
EXCEPTIONS_HEADING = "Need a Partition"


def catalog_support() -> tuple[set[str], set[str]]:
    """(grouped, global) — the aggregates each window form accepts."""
    catalog = json.loads(AGGREGATES.read_text())
    grouped, global_ = set(), set()
    for name, entry in catalog.items():
        if entry.get("status") != "active":
            continue
        support = entry.get("support") or {}
        if support.get("grouped"):
            grouped.add(name)
        if support.get("global"):
            global_.add(name)
    return grouped, global_


def exceptions_section(text: str) -> str:
    """The body of the `OVER ()` exceptions section, heading included."""
    lines = text.splitlines()
    start = None
    for index, line in enumerate(lines):
        if line.startswith("#") and line.rstrip().endswith(EXCEPTIONS_HEADING):
            start = index
            break
    if start is None:
        return ""
    depth = len(lines[start]) - len(lines[start].lstrip("#"))
    for index in range(start + 1, len(lines)):
        line = lines[index]
        if line.startswith("#"):
            if len(line) - len(line.lstrip("#")) <= depth:
                return "\n".join(lines[start:index])
    return "\n".join(lines[start:])


def named_in(text: str, names: set[str]) -> set[str]:
    """Which of `names` the text mentions as a whole word."""
    return {n for n in names if re.search(rf"\b{re.escape(n)}\b", text)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--list", action="store_true", help="show the catalog's support flags")
    args = parser.parse_args()

    if not AGGREGATES.is_file():
        print(
            f"error: {AGGREGATES} not found — run `make sql-definitions` first.",
            file=sys.stderr,
        )
        return 2
    if not PAGE.is_file():
        print(f"error: {PAGE} not found.", file=sys.stderr)
        return 2

    grouped, global_ = catalog_support()

    if args.list:
        for name in sorted(grouped | global_):
            forms = []
            if name in grouped:
                forms.append("OVER (PARTITION BY ...)")
            if name in global_:
                forms.append("OVER ()")
            print(f"  {name:24} {', '.join(forms)}")
        return 0

    text = PAGE.read_text()
    section = exceptions_section(text)

    problems: list[str] = []

    unnamed = sorted(grouped - named_in(text, grouped))
    for name in unnamed:
        problems.append(f"  NOT ON PAGE      {name} works with OVER (PARTITION BY ...) but is never named")

    if not section:
        problems.append(
            f"  NO SECTION       no heading ending '{EXCEPTIONS_HEADING}' — cannot check the OVER () exceptions"
        )
    else:
        expected = grouped - global_
        listed = named_in(section, grouped)
        for name in sorted(expected - listed):
            problems.append(f"  MISSING          {name} is refused with OVER () but the page does not say so")
        for name in sorted(listed - expected):
            problems.append(f"  STALE            {name} supports OVER () but the page lists it as refused")

    for problem in problems:
        print(problem)

    if problems:
        print(
            f"\n{len(problems)} drift(s) between the aggregate catalog and the window functions page.\n"
            "definitions/aggregates.json is the source of truth: update the page, or fix the\n"
            "registrar in opteryx-core if the support flags are wrong.",
            file=sys.stderr,
        )
        return 1

    print(
        f"window functions page names all {len(grouped)} windowable aggregates, "
        f"and the {len(grouped - global_)} refused with OVER ()."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
