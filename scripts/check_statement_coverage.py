#!/usr/bin/env python3
"""Fail if a statement the engine supports has no reference page.

    definitions/clauses.json  ->  docs-site/reference/sql/statements/*.md

WHY THIS EXISTS
---------------
`sync_sql_definitions.py` keeps `definitions/*.json` matching the engine, and
`update_docs_from_definitions.py` generates the function, operator, type and
variable pages from them. Statement pages are different: they are hand-written
prose, because a statement's page is an explanation, not a table.

Nothing checked them. A statement could be added to the engine — or gain a whole
new operation, as ALTER TABLE did with ADD/DROP/RENAME/ALTER COLUMN — and the
docs would simply not mention it, silently, forever. That is the failure this
catches: not "is the prose good", which no script can judge, but "is there a
page at all, and does it name the syntax the engine actually accepts".

Two checks:

1. COVERAGE — every clause with `scope: statement` and `status: supported` has
   a page.
2. SYNTAX — every syntax form in the catalog has its leading keywords mentioned
   somewhere on that page. Deliberately weak: it looks for the operation's
   keywords, not an exact string, because the page writes syntax in the docs'
   own notation (`<table_name>`, `[ IF EXISTS ]`) rather than the catalog's.
   A page that never mentions DROP COLUMN at all is the thing worth catching.

Usage:
    python3 scripts/check_statement_coverage.py          # report, exit 1 if gaps
    python3 scripts/check_statement_coverage.py --list    # just list the mapping

Called by:
    make check-statement-coverage
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CLAUSES = ROOT / "definitions" / "clauses.json"
STATEMENTS = ROOT / "docs-site" / "reference" / "sql" / "statements"

# canonical_name -> page stem, where the obvious slug is not the filename. Kept
# explicit and tiny: an automatic fuzzy match would hide a genuinely missing
# page behind a near-miss.
PAGE_OVERRIDES = {
    "COMMENT ON": "comment",
    # Both ALTER MATERIALIZED VIEW forms are one statement page.
    "ALTER MATERIALIZED VIEW ... OWNER TO": "alter-materialized-view",
    "ALTER MATERIALIZED VIEW ... SUSPEND / RESUME": "alter-materialized-view",
}

# Statements whose reference lives somewhere other than a statement page.
# Each entry needs a reason; "it isn't written yet" is not one.
EXEMPT: dict[str, str] = {}


def page_for(canonical_name: str) -> str:
    if canonical_name in PAGE_OVERRIDES:
        return PAGE_OVERRIDES[canonical_name]
    return canonical_name.lower().replace(" ", "-")


def keywords_of(form: str) -> list[str]:
    """The UPPERCASE keyword run a syntax form opens with, past the statement
    name — i.e. the operation. `ALTER TABLE [IF EXISTS] t DROP COLUMN c` gives
    ['DROP COLUMN']."""
    tokens = re.findall(r"[A-Z][A-Z_]+(?: [A-Z][A-Z_]+)*", form)
    return [t for t in tokens if t not in ("IF EXISTS", "IF NOT EXISTS")]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--list", action="store_true", help="list the statement->page mapping")
    args = parser.parse_args()

    if not CLAUSES.is_file():
        print(
            f"error: {CLAUSES} not found — run `make sql-definitions` first "
            "(it now exports clauses.json too).",
            file=sys.stderr,
        )
        return 2

    clauses = json.loads(CLAUSES.read_text())
    missing_pages: list[str] = []
    missing_syntax: list[tuple[str, str, str]] = []
    checked = 0

    for _key, clause in sorted(clauses.items()):
        if clause.get("scope") != "statement":
            continue
        if clause.get("status") != "supported":
            continue
        name = clause["canonical_name"]
        if name in EXEMPT:
            continue

        stem = page_for(name)
        page = STATEMENTS / f"{stem}.md"
        if args.list:
            mark = "ok " if page.is_file() else "MISS"
            print(f"  {mark} {name:34} -> statements/{stem}.md")
            continue
        if not page.is_file():
            missing_pages.append(f"{name} (expected statements/{stem}.md)")
            continue

        checked += 1
        text = page.read_text().upper()
        for form in clause.get("syntax_forms", []):
            for keyword in keywords_of(form):
                if keyword and keyword not in text:
                    missing_syntax.append((name, keyword, stem))
                    break

    if args.list:
        return 0

    for name in missing_pages:
        print(f"  NO PAGE   {name}")
    for name, keyword, stem in missing_syntax:
        print(f"  UNDOCUMENTED  {name}: statements/{stem}.md never mentions '{keyword}'")

    if missing_pages or missing_syntax:
        print(
            f"\n{len(missing_pages)} statement(s) with no page, "
            f"{len(missing_syntax)} documented syntax gap(s).\n"
            "The engine's clause catalog is the source of truth: either write the "
            "page, or change the catalog in opteryx-core if the syntax is gone.",
            file=sys.stderr,
        )
        return 1

    print(f"all {checked} supported statements have a page naming their syntax.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
