#!/usr/bin/env python3
"""Fail if the window functions page has drifted from the window catalog.

    definitions/windows.json  ->  docs-site/reference/sql/statements/window-functions.md

WHY THIS EXISTS
---------------
The window functions page used to say aggregate windows took "SUM, COUNT, or AVG".
That was a hand-written list, it was wrong by ten functions, and nothing noticed —
the same failure `check_statement_coverage.py` was written for, one level down.

The list does not need to be hand-written. `windows.json` is generated from the
engine and answers both questions directly:

    functions                              ->  the named window functions
    aggregate_windows.support.over_partition_by  ->  OVER (PARTITION BY <column>)
    aggregate_windows.support.over_empty         ->  OVER ()

So the correct lists are derivable, and the page can be checked against them.

Three checks, all deliberately weak — they test whether the page NAMES the right
functions, not whether the prose around them is any good, which no script can judge:

1. FUNCTIONS — every entry in `functions` (the ranking and navigation functions
   executed by the dedicated Window operator) is named on the page. LAG and LEAD
   reached the engine, the catalog and the editor's autocomplete mechanically
   while this page had to be remembered; that asymmetry is what this closes.
2. COVERAGE — every aggregate legal in `OVER (PARTITION BY ...)` is named on the
   page. A new aggregate registered in opteryx-core lands here as a failure.
3. EXCEPTIONS — the aggregates the page singles out as refused with `OVER ()` are
   exactly those without `over_empty`. Today that is ARRAY_AGG and ANY_VALUE; if
   a third joins them, or one gains global support, this fails.

The `OVER ()` exceptions are read from the page section whose heading ends
"Need a Partition" — see `EXCEPTIONS_HEADING`.

This reads `windows.json` rather than inferring the same answer from
`aggregates.json`'s `support.grouped`/`support.global`, which is where it started:
the two agree exactly, but one of them is the catalog written for this question.

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
WINDOWS = ROOT / "definitions" / "windows.json"
PAGE = ROOT / "docs-site" / "reference" / "sql" / "statements" / "window-functions.md"

# The page section that lists the aggregates refused with `OVER ()`. Matched on the
# heading's trailing words so the heading can keep naming the functions it covers.
EXCEPTIONS_HEADING = "Need a Partition"

# The page also names the window functions Opteryx does NOT have, so a bare
# word-search is satisfied by a sentence asserting the opposite: with LAG and LEAD
# still on that list, a check for "is LAG named?" passed while the page said LAG did
# not exist. Lines declaring functions unimplemented are therefore cut from the text
# the coverage check searches, and are checked separately for contradictions.
#
# Deliberately "not implemented" and not "not supported": several lines legitimately
# say a particular FORM of a supported function is unsupported (LAG's 3-argument
# default, frame specifications), and those must not read as denying the function.
NOT_IMPLEMENTED = re.compile(r"not implemented", re.IGNORECASE)


def catalog_support() -> tuple[set[str], set[str], set[str]]:
    """(functions, grouped, global) — the named window functions, and the
    aggregates each aggregate-window form accepts."""
    catalog = json.loads(WINDOWS.read_text())
    functions = {
        name
        for name, entry in (catalog.get("functions") or {}).items()
        if entry.get("status") == "supported"
    }
    grouped, global_ = set(), set()
    support = (catalog.get("aggregate_windows") or {}).get("support") or {}
    for name, forms in support.items():
        if forms.get("over_partition_by"):
            grouped.add(name)
        if forms.get("over_empty"):
            global_.add(name)
    return functions, grouped, global_


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


def split_not_implemented(text: str) -> tuple[str, str]:
    """(text without unimplemented-function lines, just those lines)."""
    kept, denied = [], []
    for line in text.splitlines():
        (denied if NOT_IMPLEMENTED.search(line) else kept).append(line)
    return "\n".join(kept), "\n".join(denied)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--list", action="store_true", help="show the catalog's support flags")
    args = parser.parse_args()

    if not WINDOWS.is_file():
        print(
            f"error: {WINDOWS} not found — run `make sql-definitions` first.",
            file=sys.stderr,
        )
        return 2
    if not PAGE.is_file():
        print(f"error: {PAGE} not found.", file=sys.stderr)
        return 2

    functions, grouped, global_ = catalog_support()

    if args.list:
        for name in sorted(functions):
            print(f"  {name:24} window function")
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
    documented, denied = split_not_implemented(text)

    problems: list[str] = []

    for name in sorted(functions - named_in(documented, functions)):
        problems.append(f"  NOT ON PAGE      {name} is a window function but is never named")
    for name in sorted(named_in(denied, functions)):
        problems.append(
            f"  CONTRADICTED     {name} is in the catalog but the page lists it as not implemented"
        )

    unnamed = sorted(grouped - named_in(documented, grouped))
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
            f"\n{len(problems)} drift(s) between the window catalog and the window functions page.\n"
            "definitions/windows.json is the source of truth: update the page, or fix the\n"
            "catalog in opteryx-core if what it records is wrong.",
            file=sys.stderr,
        )
        return 1

    print(
        f"window functions page names all {len(functions)} window functions and "
        f"{len(grouped)} windowable aggregates, "
        f"and the {len(grouped - global_)} refused with OVER ()."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
