#!/usr/bin/env python3
"""Run every SQL example in the agent SQL guides and the local AI guide.

Each ```sql block is split into statements (a statement ends with `;` at the end
of a line) and each statement must run without error. Inside a block, a pair of
comment lines documents a mistake:

    -- Wrong: SELECT TOP 3 name FROM $planets
    -- Error: UnsupportedSyntaxError

The `Wrong:` statement must fail, and with that exception class. Blocks fenced
as anything other than `sql` (for example ```text syntax summaries) are not run.

The examples run against:

    $planets             built into Opteryx Core
    data.planets         ./data/planets/planets.parquet  (the local AI guide's sample data)
    data.satellites      ./data/satellites/satellites.parquet
    READ_PARQUET(...)    the same files by path
    lake.demo.planets    a catalog-backed table with two snapshots, for time travel

The `lake` workspace needs opteryx-catalog and opteryx-core checked out next to
this repo (it uses opteryx-core's local-disk catalog test harness) plus the
catalog's dependencies. Without them, blocks that use `lake.` are reported as
skipped and the script fails unless --allow-skips is given.

Usage:
    pip install opteryx-core requests "google-cloud-firestore==2.*" "google-cloud-storage==3.*" croniter tzdata
    python scripts/verify_sql_guides.py
    python scripts/verify_sql_guides.py -v          # print each statement and its first row
"""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import shutil
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SIBLINGS = REPO.parent

FILES = [
    REPO / "docs-site/public/opteryx-sql-guide.md",
    REPO / "docs-site/public/opteryx-sql-guide-short.md",
    REPO / "docs-site/content/docs/guides/local-ai-with-ollama.md",
]

# Copies of the guides served by the local example MCP server; they must match.
COPIES = {
    REPO / "docs-site/public/opteryx-sql-guide.md": REPO / "examples/ollama-mcp/opteryx-sql-guide.md",
    REPO / "docs-site/public/opteryx-sql-guide-short.md": REPO
    / "examples/ollama-mcp/opteryx-sql-guide-short.md",
}

# The same pinned files, and checksums, that examples/ollama-mcp/server.py downloads.
DATA_COMMIT = "b520e2b3672c58a5fc59866829cab11011ae6d6d"
DATA = {
    "planets": "d0a28920bed0a8f3dbe1ccd9b9ad6950b4bb49a00a569544e2e9fcd7747803fc",
    "satellites": "7834315789a0dc732864f5c53a195242c5aae68a85d006a9f17876876854d106",
}

FENCE = re.compile(r"^```sql[ \t]*\n(.*?)^```[ \t]*$", re.MULTILINE | re.DOTALL)


def fetch_sample_data(root: Path) -> None:
    for name, digest in DATA.items():
        target = root / "data" / name / f"{name}.parquet"
        target.parent.mkdir(parents=True, exist_ok=True)
        url = (
            "https://raw.githubusercontent.com/mabel-dev/opteryx-core/"
            f"{DATA_COMMIT}/testdata/{name}/{name}.parquet"
        )
        with urllib.request.urlopen(url) as response:
            payload = response.read()
        if hashlib.sha256(payload).hexdigest() != digest:
            raise SystemExit(f"{url} does not match its pinned checksum")
        target.write_bytes(payload)


def register_lake(root: Path) -> bool:
    """A catalog-backed `lake` workspace, using opteryx-core's local-disk catalog."""
    catalog_repo = SIBLINGS / "opteryx-catalog"
    harness = SIBLINGS / "opteryx-core" / "tests" / "tools"
    if not catalog_repo.is_dir() or not (harness / "local_catalog.py").is_file():
        return False
    sys.path.insert(1, str(catalog_repo))
    sys.path.insert(1, str(harness))
    try:
        import opteryx
        from local_catalog import local_catalog_class
        from opteryx.connectors import OpteryxConnector

        opteryx.register_workspace(
            "lake", OpteryxConnector, catalog=local_catalog_class(str(root / "lake"))
        )
        session = opteryx.session(user="docs")
        for statement in (
            "CREATE TABLE lake.demo.planets AS SELECT id, name FROM $planets WHERE id < 4",
            "INSERT INTO lake.demo.planets SELECT id, name FROM $planets WHERE id = 4",
        ):
            list(session.execute_to_morsels(statement))
            # Snapshots a second apart, so TIMESTAMP AS OF NOW() - 1 SECOND has one to find.
            time.sleep(1.1)
    except ImportError as err:
        print(f"lake workspace unavailable: {err}", file=sys.stderr)
        return False
    return True


def statements(block: str):
    """Yield (sql, wrong, error) for each statement in a block."""
    wrong = error = None
    current: list[str] = []
    for line in block.splitlines():
        stripped = line.strip()
        if stripped.startswith("-- Wrong:"):
            wrong = stripped[len("-- Wrong:") :].strip()
            continue
        if stripped.startswith("-- Error:"):
            error = stripped[len("-- Error:") :].strip()
            continue
        if stripped.startswith("--") or not stripped:
            continue
        current.append(line)
        if stripped.endswith(";"):
            yield "\n".join(current).rstrip().rstrip(";"), wrong, error
            current, wrong, error = [], None, None
    if current:
        yield "\n".join(current), wrong, error


def run(session, sql: str):
    rows = []
    for morsel in session.execute_to_morsels(sql):
        rows.extend(list(row) for row in morsel)
    return rows


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("-v", "--verbose", action="store_true")
    parser.add_argument("--allow-skips", action="store_true")
    args = parser.parse_args()

    import opteryx
    from opteryx.connectors import DiskConnector

    print(f"opteryx-core {opteryx.__version__}")

    failures, skipped, passed = [], 0, 0
    for original, copy in COPIES.items():
        if not copy.is_file() or copy.read_bytes() != original.read_bytes():
            failures.append(f"{copy.relative_to(REPO)} is not a copy of {original.relative_to(REPO)}")

    root = Path(tempfile.mkdtemp(prefix="sql-guides-"))
    cwd = os.getcwd()
    try:
        fetch_sample_data(root)
        os.chdir(root)  # DiskConnector and READ_PARQUET paths resolve from here
        opteryx.register_workspace("data", DiskConnector)
        have_lake = register_lake(root)
        session = opteryx.session(user="docs")

        for path in FILES:
            text = path.read_text()
            for match in FENCE.finditer(text):
                line_no = text[: match.start()].count("\n") + 1
                where = f"{path.relative_to(REPO)}:{line_no}"
                for sql, wrong, error in statements(match.group(1)):
                    if "lake." in sql and not have_lake:
                        skipped += 1
                        print(f"SKIP {where}  {sql.splitlines()[0]}")
                        continue
                    if wrong:
                        try:
                            run(session, wrong)
                            failures.append(f"{where}: expected an error from: {wrong}")
                        except Exception as err:  # noqa: BLE001 - checking the class name
                            if error and type(err).__name__ != error:
                                failures.append(
                                    f"{where}: {wrong!r} raised {type(err).__name__}, "
                                    f"the guide says {error}"
                                )
                            elif args.verbose:
                                print(f"  wrong  {wrong}\n         -> {type(err).__name__}")
                    try:
                        rows = run(session, sql)
                        passed += 1
                        if args.verbose:
                            flat = " ".join(sql.split())
                            print(f"  ok     {flat}\n         -> {rows[:3]}")
                    except Exception as err:  # noqa: BLE001 - every failure is reported
                        failures.append(f"{where}: {type(err).__name__}: {err}\n    {sql}")
    finally:
        os.chdir(cwd)
        shutil.rmtree(root, ignore_errors=True)

    print(f"{passed} statements passed, {skipped} skipped, {len(failures)} failed")
    for failure in failures:
        print(f"FAIL {failure}")
    if failures or (skipped and not args.allow_skips):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
