"""An MCP server that lets a language model query local files with Opteryx Core.

Tools:
    list_datasets()          the datasets in ./data
    describe_dataset(name)   a dataset's columns and types
    run_sql(sql)             run a query and return the rows (at most 200)

Each folder under ./data is a dataset: ./data/planets/ is queried as data.planets.
chat.py starts this server for you; you don't need to run it yourself.
"""

import os
import urllib.request

import opteryx
from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from opteryx.connectors import DiskConnector

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_URL = "https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/planets/planets.parquet"
DATA_FILE = os.path.join(HERE, "data", "planets", "planets.parquet")
DATA_EXTENSIONS = {".parquet", ".jsonl", ".skene"}
MAX_ROWS = 200

# The only network call: fetch the sample dataset once. After that everything runs offline.
if not os.path.exists(DATA_FILE):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    urllib.request.urlretrieve(DATA_URL, DATA_FILE)

# DiskConnector resolves data.planets to ./data/planets/, relative to the working directory.
os.chdir(HERE)
opteryx.register_workspace("data", DiskConnector)

mcp = MCPServer("opteryx-local")


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
    data_dir = os.path.join(HERE, "data")
    return [
        f"data.{entry.name}"
        for entry in sorted(os.scandir(data_dir), key=lambda e: e.name)
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
    """Run a SQL SELECT query with Opteryx and return the rows (at most 200)."""
    names, _, rows = execute(sql)
    return {"columns": names, "rows": rows[:MAX_ROWS], "truncated": len(rows) > MAX_ROWS}


if __name__ == "__main__":
    mcp.run()
