#!/usr/bin/env python3
"""Fail if a generated docs page has been hand-edited.

`update_docs_from_definitions.py` owns a set of pages outright: it rewrites them
from `definitions/*.json` on every run. A hand edit to one of those pages works
until somebody runs `make sql-docs`, and then it silently disappears — which is
how the OData `$filter` page came to document date functions and rolling windows
that vanished on the next regeneration, while the description in the service's
own OpenAPI spec never learned about them.

The check: regenerate into a scratch copy of the tree and compare. Any generated
page whose committed content differs from what the generator produces has been
edited by hand (or is stale), and the fix is never to re-apply the edit here —
it is to change the source the page is generated from and re-export.

Writes nothing to the working tree. Suitable for CI.

Usage:
    python3 scripts/check_generated_docs.py

Called by:
    make check-generated-docs
"""

from __future__ import annotations

import filecmp
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs-site"
GENERATOR = ROOT / "scripts" / "update_docs_from_definitions.py"

# Copied into the sandbox so the generator has everything it reads and writes.
# nav.json is included because the generator rewrites it too, but it is NOT
# compared: the generator only patches the entries it owns and leaves hand
# ordering intact, so a nav difference here means the ordering changed, which
# is legitimate.
INPUTS = [
    ROOT / "definitions",
    DOCS / "reference",
    DOCS / "content",
    DOCS / "nav.json",
]

MARKER = "<!-- GENERATED FILE - DO NOT EDIT."


def _snapshot(sandbox: pathlib.Path) -> None:
    for src in INPUTS:
        dst = sandbox / src.relative_to(ROOT)
        dst.parent.mkdir(parents=True, exist_ok=True)
        if src.is_dir():
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)


def _generated_pages(tree: pathlib.Path) -> set[pathlib.Path]:
    """Every page carrying the generator's marker, as tree-relative paths."""
    found = set()
    for path in (tree / "docs-site").rglob("*.md"):
        try:
            head = path.read_text(errors="replace")[:512]
        except OSError:
            continue
        if MARKER in head:
            found.add(path.relative_to(tree))
    return found


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="opteryx-docs-check-") as tmp:
        sandbox = pathlib.Path(tmp)
        _snapshot(sandbox)

        result = subprocess.run(
            [sys.executable, str(GENERATOR)],
            cwd=sandbox,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print("error: the docs generator failed to run\n", file=sys.stderr)
            print(result.stdout, file=sys.stderr)
            print(result.stderr, file=sys.stderr)
            return 2

        # A page is generated if either tree says so: `committed` catches an
        # edit that stripped the banner, `regenerated` catches a page that is
        # newly generated and not yet committed.
        pages = _generated_pages(sandbox) | {
            p.relative_to(ROOT)
            for p in (DOCS.rglob("*.md"))
            if MARKER in p.read_text(errors="replace")[:512]
        }

        edited, missing = [], []
        for rel in sorted(pages):
            committed, regenerated = ROOT / rel, sandbox / rel
            if not committed.exists():
                missing.append(rel)
            elif not regenerated.exists():
                # The generator no longer produces it; `_prune_stale` handles the
                # catalog-driven directories, so this is a page left behind.
                edited.append((rel, "no longer generated - delete it"))
            elif not filecmp.cmp(committed, regenerated, shallow=False):
                edited.append((rel, "differs from what the generator produces"))

    if not edited and not missing:
        print(f"{len(pages)} generated page(s) match their definitions.")
        return 0

    print("Generated docs have drifted from their sources:\n", file=sys.stderr)
    for rel, why in edited:
        print(f"  - {rel}: {why}", file=sys.stderr)
    for rel in missing:
        print(f"  - {rel}: generated but not committed - run `make sql-docs`", file=sys.stderr)
    print(
        "\nDo not re-apply the edit to the page. Change the source it is generated\n"
        "from - a registrar in opteryx-core, or the service's own OpenAPI\n"
        "description - re-export, then run `make sql-docs`.",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
