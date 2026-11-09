"""An MCP server that lets a language model query local files with Opteryx Core.

Tools:
    list_datasets()          the datasets in ./data
    describe_dataset(name)   a dataset's columns and types
    run_sql(sql)             run a query and return the rows (at most 200)

Resources:
    opteryx://sql/guide          the Opteryx SQL guide for agents (about 5,000 tokens)
    opteryx://sql/guide-short    the condensed guide, for small models (about 1,200 tokens)

Each folder under ./data is a dataset: ./data/planets/ is queried as data.planets.
chat.py starts this server for you. To use it from another MCP client, register
this file as a stdio server: the command is this virtual environment's python,
and the argument is this file's absolute path.
"""

import hashlib
import os
import urllib.request

import opteryx
from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from opteryx.connectors import DiskConnector

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(HERE, "data")
DATA_EXTENSIONS = {".parquet", ".jsonl", ".skene"}
MAX_ROWS = 200

# The sample datasets, pinned to one commit of opteryx-core and checked against
# their checksums, so every run of this example queries exactly the same data.
DATA_COMMIT = "b520e2b3672c58a5fc59866829cab11011ae6d6d"
SAMPLE_DATA = {
    "planets": "d0a28920bed0a8f3dbe1ccd9b9ad6950b4bb49a00a569544e2e9fcd7747803fc",
    "satellites": "7834315789a0dc732864f5c53a195242c5aae68a85d006a9f17876876854d106",
}


def fetch_sample_data():
    """The only network access: download the sample datasets once. After that everything runs offline."""
    for name, digest in SAMPLE_DATA.items():
        target = os.path.join(DATA_DIR, name, f"{name}.parquet")
        if os.path.exists(target):
            continue
        url = (
            "https://raw.githubusercontent.com/mabel-dev/opteryx-core/"
            f"{DATA_COMMIT}/testdata/{name}/{name}.parquet"
        )
        with urllib.request.urlopen(url) as response:
            payload = response.read()
        if hashlib.sha256(payload).hexdigest() != digest:
            raise RuntimeError(f"{url} did not download correctly; try again")
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "wb") as file:
            file.write(payload)


fetch_sample_data()

# DiskConnector resolves data.planets to ./data/planets/, relative to the working directory.
os.chdir(HERE)
opteryx.register_workspace("data", DiskConnector)

mcp = MCPServer(
    "opteryx-local",
    instructions=(
        "Query local datasets with Opteryx SQL. Datasets are named data.<folder>; call "
        "list_datasets, then describe_dataset, then run_sql. Opteryx SQL is close to "
        "PostgreSQL but not the same: the resource opteryx://sql/guide describes the "
        "dialect, and opteryx://sql/guide-short is a condensed version."
    ),
)


def execute(sql):
    names, types, rows = [], [], []
    try:
        for morsel in opteryx.session().execute_to_morsels(sql):
            names = [n.decode() for n in morsel.column_names]
            types = [t.name for t in morsel.column_types]
            rows.extend(list(row) for row in morsel)
    except opteryx.exceptions.Error as err:
        # ToolError passes the message to the model, so it can read what was wrong and fix its SQL.
        raise ToolError(str(err)) from err
    return names, types, rows


@mcp.tool()
def list_datasets() -> list[str]:
    """List the datasets available to query with run_sql."""
    return [
        f"data.{entry.name}"
        for entry in sorted(os.scandir(DATA_DIR), key=lambda e: e.name)
        if entry.is_dir()
        and any(os.path.splitext(f.name)[1] in DATA_EXTENSIONS for f in os.scandir(entry.path))
    ]


@mcp.tool()
def describe_dataset(name: str) -> dict:
    """Return the column names and types of a dataset (use a name from list_datasets)."""
    names, types, _ = execute(f"SELECT * FROM {name} LIMIT 0")
    return {"dataset": name, "columns": dict(zip(names, types))}


@mcp.tool()
def run_sql(sql: str) -> dict:
    """Run one Opteryx SQL SELECT statement and return the rows (at most 200).
    Strings use single quotes; double quotes name columns. Use LIMIT, not TOP."""
    names, _, rows = execute(sql)
    return {"columns": names, "rows": rows[:MAX_ROWS], "truncated": len(rows) > MAX_ROWS}


def read_guide(filename):
    with open(os.path.join(HERE, filename), encoding="utf-8") as file:
        return file.read()


@mcp.resource(
    "opteryx://sql/guide",
    name="Opteryx SQL guide",
    description="How to write Opteryx SQL: names, quoting, functions, differences from PostgreSQL, time travel, common errors and examples.",
    mime_type="text/markdown",
)
def sql_guide() -> str:
    return read_guide("opteryx-sql-guide.md")


@mcp.resource(
    "opteryx://sql/guide-short",
    name="Opteryx SQL guide (short)",
    description="The Opteryx SQL guide condensed to about 1,200 tokens, for models with a small context window.",
    mime_type="text/markdown",
)
def sql_guide_short() -> str:
    return read_guide("opteryx-sql-guide-short.md")


if __name__ == "__main__":
    mcp.run()
