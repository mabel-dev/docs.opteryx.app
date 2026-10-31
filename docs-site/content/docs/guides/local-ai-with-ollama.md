---
title: Asking Questions of Local Data with Ollama
description: Run a local language model with Ollama that answers questions by querying your files with Opteryx Core through an MCP server. Your data never leaves your laptop, nothing needs an account, and it works offline.
---

# Asking Questions of Local Data with Ollama

[Ollama](https://ollama.com) runs language models on your own machine, and Opteryx Core runs in-process on your own files, so together they give you an assistant that answers questions about your data without sending it anywhere. You ask "which is the largest planet?", the model writes SQL, Opteryx runs it against a Parquet file on your disk, and the model answers from the rows that come back.

- **Your data never leaves your laptop.** The model, the query engine and the files are all local. There is no API key, no account and no cloud service involved.
- **Entirely self-contained.** Two Python packages and Ollama, with no database server to run.
- **Works offline.** After the first run has downloaded the sample dataset, you can disconnect from the network and everything still works.

> **Try it yourself:** the complete example is in [`examples/ollama-mcp`](https://github.com/mabel-dev/docs.opteryx.app/tree/main/examples/ollama-mcp). Install Ollama, `pip install -r requirements.txt`, then `python chat.py "which is the largest planet?"`.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- expose a folder of local files to a language model as MCP tools backed by Opteryx Core
- connect an Ollama model to those tools
- ask questions in plain English and see the SQL the model runs to answer them
- point the example at your own data

## How It Fits Together

<figure class="doc-figure">
<svg viewBox="0 0 680 332" width="100%" role="img" aria-labelledby="ollama-flow-title ollama-flow-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="ollama-flow-title">How a question is answered, all on your laptop</title>
<desc id="ollama-flow-desc">Everything sits inside one boundary labelled your laptop. You send a question to chat.py and get an answer back. chat.py sends the conversation and the tool list to Ollama, a local model, which replies with tool calls or an answer. chat.py passes tool calls over MCP on stdio to server.py, which sends SQL to Opteryx Core and gets rows back. Opteryx Core reads the files in ./data/planets/.</desc>
<defs>
<marker id="ollama-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill: var(--muted);"/></marker>
</defs>
<rect x="6" y="8" width="668" height="316" rx="12" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-dasharray: 6 4;"/>
<text x="24" y="32" style="fill: var(--opteryx-teal); font-size: 12px; font-weight: 700;">Your laptop: nothing leaves it</text>
<rect x="30" y="52" width="110" height="50" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="85" y="82" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700;">You</text>
<rect x="220" y="52" width="160" height="50" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="300" y="73" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700; font-family: var(--font-mono);">chat.py</text>
<text x="300" y="91" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">connects the two</text>
<rect x="470" y="52" width="180" height="50" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="560" y="73" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700;">Ollama</text>
<text x="560" y="91" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">local language model</text>
<rect x="220" y="172" width="160" height="50" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="300" y="193" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700; font-family: var(--font-mono);">server.py</text>
<text x="300" y="211" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">MCP server, 3 tools</text>
<rect x="470" y="172" width="180" height="50" rx="6" style="fill: var(--accent-soft); stroke: var(--accent-soft-3);"/>
<text x="560" y="193" text-anchor="middle" style="fill: var(--opteryx-teal); font-weight: 700;">Opteryx Core</text>
<text x="560" y="211" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">runs the SQL in-process</text>
<rect x="470" y="258" width="180" height="50" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="560" y="279" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700; font-family: var(--font-mono);">./data/planets/</text>
<text x="560" y="297" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-mono);">planets.parquet</text>
<line x1="140" y1="77" x2="220" y2="77" marker-start="url(#ollama-arrow)" marker-end="url(#ollama-arrow)" style="stroke: var(--muted); stroke-width: 1.5;"/>
<text x="180" y="69" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">question</text>
<text x="180" y="94" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">answer</text>
<line x1="380" y1="77" x2="470" y2="77" marker-start="url(#ollama-arrow)" marker-end="url(#ollama-arrow)" style="stroke: var(--muted); stroke-width: 1.5;"/>
<text x="425" y="69" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">chat + tools</text>
<text x="425" y="94" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">tool calls</text>
<line x1="300" y1="102" x2="300" y2="172" marker-start="url(#ollama-arrow)" marker-end="url(#ollama-arrow)" style="stroke: var(--muted); stroke-width: 1.5;"/>
<text x="310" y="134" style="fill: var(--muted); font-size: 11px;">MCP over stdio</text>
<text x="310" y="149" style="fill: var(--muted); font-size: 11px;">tool call / result</text>
<line x1="380" y1="197" x2="470" y2="197" marker-start="url(#ollama-arrow)" marker-end="url(#ollama-arrow)" style="stroke: var(--muted); stroke-width: 1.5;"/>
<text x="425" y="189" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">SQL</text>
<text x="425" y="214" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">rows</text>
<line x1="560" y1="222" x2="560" y2="258" marker-end="url(#ollama-arrow)" style="stroke: var(--muted); stroke-width: 1.5;"/>
<text x="570" y="244" style="fill: var(--muted); font-size: 11px;">reads</text>
</svg>
<figcaption>The model never touches the files: it asks for SQL to be run, and Opteryx Core runs it against your disk. Every step runs on your machine.</figcaption>
</figure>

- **`server.py`** is an [MCP](https://modelcontextprotocol.io) server. It gives the model three tools: `list_datasets`, `describe_dataset` and `run_sql`. Each runs in-process with Opteryx Core against the files in `./data/`.
- **`chat.py`** connects the two. Ollama models can call tools, but Ollama doesn't connect to MCP servers itself. `chat.py` starts `server.py`, passes its tools to the model, and runs each tool call the model makes until the model has an answer.

## Setup

Install Ollama and download a model that supports tool calling. Follow the instructions on [ollama.com](https://ollama.com) for your platform. The example defaults to `qwen3.5:9b`; any model listed under [tools](https://ollama.com/search?c=tools) should work.

```bash
ollama pull qwen3.5:9b
```

Then get the example and install its two dependencies:

```bash
cd examples/ollama-mcp
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

`requirements.txt` is `opteryx-core` and `mcp`.

## Ask a Question

Make sure Ollama is running, then:

```bash
python chat.py "which is the largest planet?"
```

On the first run `server.py` downloads `planets.parquet` (about 4 KB) into `./data/planets/`. This is the only network access the example makes. Each tool call the model makes is printed as it happens, so you can see how it reached its answer:

```
  -> list_datasets({})
  -> describe_dataset({"name": "data.planets"})
  -> run_sql({"sql": "SELECT * FROM data.planets ORDER BY diameter DESC LIMIT 1"})
Based on the dataset, **Jupiter** is the largest planet with a diameter of 142,984 km. It has a mass of 1898.0 and is the fifth planet in our solar system (id: 5).
```

The model's wording and the SQL it writes will vary from run to run. Run `python chat.py` with no question to ask several questions in a row, and pass `--model` to try a different model.

## The Server

The server is a short Python file. It registers `./data/` as a workspace, so `./data/planets/` is queried as `data.planets`, and turns three functions into MCP tools:

```python
import opteryx
from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from opteryx.connectors import DiskConnector

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
def describe_dataset(name: str) -> dict:
    """Return the column names and types of a dataset (use a name from list_datasets)."""
    names, types, _ = execute(f"SELECT * FROM {name} LIMIT 0")
    return {"dataset": name, "columns": dict(zip(names, types))}


@mcp.tool()
def run_sql(sql: str) -> dict:
    """Run a SQL SELECT query with Opteryx and return the rows (at most 200)."""
    names, _, rows = execute(sql)
    return {"columns": names, "rows": rows[:200], "truncated": len(rows) > 200}
```

The docstrings matter: they are the tool descriptions the model reads when deciding what to call. `list_datasets` is in the full file and lists the folders under `./data/`.

Re-raising Opteryx errors as `ToolError` matters too. The MCP library hides the text of any other exception from the model, so without it a bad query only returns "Error executing tool run_sql". With it, the model sees Opteryx's message, for example ``Column *nope* cannot be found. Did you mean `name`?``, and can correct its query.

`run_sql` returns at most 200 rows. A model's context is small, so ask it to aggregate in SQL rather than pull raw rows back.

## Use Your Own Data

Put your files in a folder under `./data/`. For example, `./data/orders/` is queried as `data.orders`. Parquet, JSON Lines and Skene files work as datasets; CSV doesn't (see [Querying Local Data](/docs/guides/querying-local-data)). `list_datasets` picks up the new folder the next time you run `chat.py`.

The model only sees column names and types. It doesn't know units or what a code means, and it will guess. In the planets data, for example, `mass` is in units of 10²⁴ kg, and a model may report it as Earth masses. Clear column names help, and so does saying what you mean in the question.

## Things to Know

- **Small models make mistakes.** A local model writes less reliable SQL than a large hosted one. When a query fails, the error is printed and passed back to the model so it can try again. Check the printed SQL when an answer matters.
- **`run_sql` runs whatever the model writes.** The tool description asks for `SELECT` statements, but nothing enforces that. The server can read every file under `./data/`, so only put data there that you're happy for the model to query.
- **Any MCP client can use the server.** `server.py` is a standard stdio MCP server, so you can also register it with a desktop assistant. That assistant's model may be hosted, in which case query results are sent to its provider.

## Related

- [Ollama example code](https://github.com/mabel-dev/docs.opteryx.app/tree/main/examples/ollama-mcp)
- [Querying Local Data](/docs/guides/querying-local-data)
- [Embedding Opteryx Core in a Service](/docs/guides/embedding-in-a-service)
- [Using Opteryx from Your AI Assistant](/docs/guides/ai-assistants) — the hosted Opteryx MCP server
