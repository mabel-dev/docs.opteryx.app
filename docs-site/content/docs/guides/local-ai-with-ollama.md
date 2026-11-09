---
title: Asking Questions of Local Data with Ollama
description: Run a local language model with Ollama that answers questions by querying your files with Opteryx Core through an MCP server. Install, pull a model, connect the local Opteryx MCP server to Ollama, Claude Desktop or Claude Code, and run tested example prompts. Your data never leaves your laptop.
---

# Asking Questions of Local Data with Ollama

[Ollama](https://ollama.com) runs language models on your own machine, and Opteryx Core runs in-process on your own files, so together they give you an assistant that answers questions about your data without sending it anywhere. You ask "which is the largest planet?", the model writes SQL, Opteryx runs it against a Parquet file on your disk, and the model answers from the rows that come back.

- **Your data never leaves your laptop.** The model, the query engine and the files are all local. There is no API key, no account and no cloud service involved.
- **Entirely self-contained.** Two Python packages and Ollama, with no database server to run.
- **Works offline.** After the first run has downloaded the sample data, you can disconnect from the network and everything still works.

> **Try it yourself:** the complete example is in [`examples/ollama-mcp`](https://github.com/mabel-dev/docs.opteryx.app/tree/main/examples/ollama-mcp).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- install Ollama and a tool-calling model, and run a first query against local files
- expose a folder of local files to a language model as MCP tools backed by Opteryx Core
- register the same server with Claude Desktop or Claude Code
- give a model the Opteryx SQL guide, including the short version for small models
- check a model's answers against eight tested example prompts
- fix the common problems, and point the example at your own data

## How It Fits Together

<figure class="doc-figure">
<svg viewBox="0 0 680 332" width="100%" role="img" aria-labelledby="ollama-flow-title ollama-flow-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="ollama-flow-title">How a question is answered, all on your laptop</title>
<desc id="ollama-flow-desc">Everything sits inside one boundary labelled your laptop. You send a question to chat.py and get an answer back. chat.py sends the conversation and the tool list to Ollama, a local model, which replies with tool calls or an answer. chat.py passes tool calls over MCP on stdio to server.py, which sends SQL to Opteryx Core and gets rows back. Opteryx Core reads the files in ./data/.</desc>
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
<text x="300" y="211" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">MCP server: 3 tools, SQL guide</text>
<rect x="470" y="172" width="180" height="50" rx="6" style="fill: var(--accent-soft); stroke: var(--accent-soft-3);"/>
<text x="560" y="193" text-anchor="middle" style="fill: var(--opteryx-teal); font-weight: 700;">Opteryx Core</text>
<text x="560" y="211" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">runs the SQL in-process</text>
<rect x="470" y="258" width="180" height="50" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="560" y="279" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700; font-family: var(--font-mono);">./data/</text>
<text x="560" y="297" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-mono);">planets/, satellites/</text>
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

- **`server.py`** is an [MCP](https://modelcontextprotocol.io) server. It gives the model three tools, `list_datasets`, `describe_dataset` and `run_sql`, which run in-process with Opteryx Core against the files in `./data/`. It also serves the [Opteryx SQL guide](#the-sql-guide) as an MCP resource.
- **`chat.py`** connects the two. Ollama models can call tools, but Ollama doesn't connect to MCP servers itself. `chat.py` starts `server.py`, passes its tools to the model, and runs each tool call the model makes until the model has an answer.

## What You Need

- **macOS 15 or later on Apple silicon** with Python 3.13 or 3.14, or **Linux on x86-64** with Python 3.11 to 3.14. Opteryx Core publishes ready-built packages for these. On Windows, use [WSL](https://learn.microsoft.com/windows/wsl/install).
- **Room for a model.** The default model, `qwen3.5:9b`, is a 6.6 GB download, and the model has to fit in memory while it runs. A smaller model needs less; see [Small Models](#small-models).
- **A network connection for setup.** Installing, pulling the model and the first run download things. After that, nothing does.

## Step 1: Install Ollama

Follow the instructions on [ollama.com/download](https://ollama.com/download) for your platform. On macOS you can also use Homebrew:

```bash
brew install ollama
```

Ollama runs in the background once it's installed. Check it's up:

```bash
ollama --version
```

If this prints a client version but warns it can't connect to a running instance, start the Ollama app, or run `ollama serve` in another terminal.

## Step 2: Pull a Model

The model must support tool calling. The example defaults to `qwen3.5:9b`:

```bash
ollama pull qwen3.5:9b
```

Any model listed under [tools](https://ollama.com/search?c=tools) should work. If you pull a different one, pass it to `chat.py` with `--model`.

## Step 3: Get the Example

Download the example's five files into a new folder:

```bash
mkdir ollama-mcp && cd ollama-mcp
for f in server.py chat.py requirements.txt opteryx-sql-guide.md opteryx-sql-guide-short.md; do
  curl -fsSLO "https://raw.githubusercontent.com/mabel-dev/docs.opteryx.app/main/examples/ollama-mcp/$f"
done
```

Or clone the docs repository and `cd examples/ollama-mcp`.

## Step 4: Install the Dependencies

Create a virtual environment with a supported Python version and install the two dependencies, `opteryx-core` and `mcp`:

```bash
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Use `python3.14` instead if that's what you have, or on Linux any version from `python3.11` up. If you have none of them, install one with `brew install python@3.13` on macOS or your distribution's package manager on Linux. Check the install:

```bash
python -c "import opteryx; print(opteryx.__version__)"
```

## Step 5: Ask a Question

```bash
python chat.py "which is the largest planet?"
```

On the first run `server.py` downloads the two sample datasets, `planets.parquet` (4 KB) and `satellites.parquet` (9 KB), into `./data/`. This is the only network access the example makes. Each tool call the model makes is printed as it happens, so you can see how it reached its answer:

```
  -> list_datasets({})
  -> describe_dataset({"name": "data.planets"})
  -> run_sql({"sql": "SELECT name, diameter FROM data.planets ORDER BY diameter DESC LIMIT 1"})
Jupiter is the largest planet, with a diameter of 142,984 kilometers.
```

The model's wording and the SQL it writes vary from run to run. Run `python chat.py` with no question to ask several questions in a row, and press Enter on an empty line to stop.

## The Sample Data

| Dataset | Rows | Useful columns |
| --- | --- | --- |
| `data.planets` | 9 | `id`, `name`, `mass` (10²⁴ kg), `diameter` (km), `gravity`, `mean_temperature` (°C), `distance_from_sun` (10⁶ km), `number_of_moons` |
| `data.satellites` | 177 | `id`, `planetId` (the planet's `id`), `name`, `radius` (km), `density`, `albedo` |

The files are pinned to one version of the [Opteryx Core test data](https://github.com/mabel-dev/opteryx-core/tree/main/testdata), and `server.py` checks their checksums, so the answers below are the answers you'll get.

The two datasets don't agree on moon counts: `planets.number_of_moons` says Saturn has 82 and Jupiter 79, while `satellites` lists 61 for Saturn and 67 for Jupiter. That's how the data was published, and it makes a good test of whether a model says which dataset its answer came from.

## Example Prompts

These are the questions the example was tested with, using `qwen3.5:9b` and the short SQL guide. For each one: the tool calls a model should make, a query that answers it, and the answer. A model may write different but equivalent SQL; what matters is that it reaches the same answer. Every query here has been run against the sample data.

Every question starts the same way, with `list_datasets({})` followed by `describe_dataset` for each dataset the question needs.

**1. "Which is the largest planet?"** `describe_dataset({"name": "data.planets"})`, then `run_sql`:

```sql
SELECT name, diameter FROM data.planets ORDER BY diameter DESC LIMIT 1;
```

Jupiter, 142,984 km across.

**2. "How many moons does each planet have in the satellites dataset?"** `describe_dataset` for `data.planets` and `data.satellites`, then:

```sql
SELECT p.name AS planet, COUNT(s.id) AS moons
  FROM data.planets AS p
  LEFT JOIN data.satellites AS s ON s."planetId" = p.id
 GROUP BY p.name
 ORDER BY moons DESC;
```

Jupiter 67, Saturn 61, Uranus 27, Neptune 14, Pluto 5, Mars 2, Earth 1, Mercury and Venus 0. A `JOIN` instead of a `LEFT JOIN` drops Mercury and Venus.

**3. "What are the five largest moons by radius?"** `describe_dataset({"name": "data.satellites"})`, then:

```sql
SELECT name, radius FROM data.satellites ORDER BY radius DESC LIMIT 5;
```

Ganymede (2,631 km), Titan (2,575 km), Callisto (2,410 km), Io (1,822 km) and the Moon (1,738 km).

**4. "Which planets have no moons?"** Either dataset answers it:

```sql
SELECT name FROM data.planets WHERE number_of_moons = 0;
```

```sql
SELECT p.name
  FROM data.planets AS p
  LEFT ANTI JOIN data.satellites AS s ON s."planetId" = p.id;
```

Mercury and Venus.

**5. "What is the largest moon of each planet?"** Both datasets, then:

```sql
SELECT p.name AS planet, s.name AS largest_moon, s.radius
  FROM data.planets AS p
  JOIN data.satellites AS s ON s."planetId" = p.id
QUALIFY ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY s.radius DESC) = 1
 ORDER BY s.radius DESC;
```

Jupiter: Ganymede; Saturn: Titan; Earth: the Moon; Neptune: Triton; Uranus: Titania; Pluto: Charon; Mars: Phobos.

**6. "Which planets are hotter than Earth on average?"** `data.planets`, then:

```sql
SELECT name, mean_temperature
  FROM data.planets
 WHERE mean_temperature > (SELECT mean_temperature FROM data.planets WHERE name = 'Earth')
 ORDER BY mean_temperature DESC;
```

Venus (464 °C) and Mercury (167 °C).

**7. "How many times heavier than Earth is Jupiter?"** `data.planets`, then:

```sql
SELECT ROUND((SELECT mass FROM data.planets WHERE name = 'Jupiter')
           / (SELECT mass FROM data.planets WHERE name = 'Earth'), 1) AS times_heavier;
```

About 317.9 times. In testing the model fetched both masses and divided them itself, after a few repeated queries, which reaches the same answer.

**8. "How many of Saturn's moons have a radius over 100 km?"** Both datasets, then:

```sql
SELECT COUNT(*) AS moons
  FROM data.satellites AS s
  JOIN data.planets AS p ON p.id = s."planetId"
 WHERE p.name = 'Saturn' AND s.radius > 100;
```

Nine, from Titan (2,575 km) down to Phoebe (107 km).

## The SQL Guide

A model that has learned SQL from PostgreSQL, MySQL and SQL Server writes things Opteryx doesn't accept: `SELECT TOP 5`, `DATE '2024-05-17'`, `INTERVAL '7 days'`, `"Earth"` for a string. The **Opteryx SQL guide for agents** lists what does work, with every example executed against Opteryx Core:

- **Full guide**, about 5,000 tokens: [read it](/opteryx-sql-guide.md) or <a href="/opteryx-sql-guide.md" download>download it</a>. Names, quoting, statements, functions, differences from PostgreSQL and ANSI SQL, time travel, common errors with fixes, and copy-paste examples.
- **Short guide**, about 1,200 tokens: [read it](/opteryx-sql-guide-short.md) or <a href="/opteryx-sql-guide-short.md" download>download it</a>. The same rules, condensed for small models.

There are three ways to get it to a model:

- **As an MCP resource.** `server.py` serves the full guide at `opteryx://sql/guide` and the short one at `opteryx://sql/guide-short`. `chat.py` reads the short guide and puts it in the system prompt; `--guide full` uses the full one, and `--guide none` leaves it out.
- **By download.** Paste or attach either file wherever your tool takes instructions or context.
- **Through llms.txt.** Both guides are listed in [/llms.txt](/llms.txt), for tools that look there.

### Small Models

A small local model has a small context window, and everything competes for it: the system prompt, the tool definitions, the guide, every tool result and the conversation so far. That's why there are two guides. Measured with `qwen3.5`, the prompt `chat.py` sends before any question is about 450 tokens with no guide, 1,650 with the short guide and 5,500 with the full one.

- **Start with the short guide**, which is the `chat.py` default. Move to `--guide full` only if a model keeps making a mistake the full guide covers, and has the context for it.
- **Check your context window.** Ollama picks one from your GPU memory, as small as 4k tokens on a machine with little of it. The short guide leaves room in 4k for a few tool results; the full guide doesn't fit in 4k at all. If answers lose track of earlier tool results, set a larger window with the `OLLAMA_CONTEXT_LENGTH` environment variable before starting Ollama, for example `OLLAMA_CONTEXT_LENGTH=16384 ollama serve`.
- **There's a floor on model size.** With the eight [example prompts](#example-prompts), `qwen3.5:9b` and `qwen3.5:4b` both answered all eight correctly with the short guide (the 4B model managed seven without it). `qwen3.5:0.8b` answered one of eight correctly even with the guide, and ran out of steps on most of the rest.
- **Ask for aggregates, not raw rows.** `run_sql` returns at most 200 rows, and even that much can fill a small model's context.

## Use the Server From Claude Desktop

`server.py` is a standard stdio MCP server, so you can register it with any MCP client. The client's model may be hosted, in which case the rows your queries return are sent to its provider, even though Opteryx and your files stay local.

The configuration needs two absolute paths: the virtual environment's Python and `server.py`. From the example folder, with the virtual environment active, print them:

```bash
echo "$(pwd)/.venv/bin/python"
echo "$(pwd)/server.py"
```

**Quit Claude Desktop completely** (Cmd-Q on macOS), because it rewrites its configuration file when it quits and drops edits made while it's running. Then open the configuration file:

On macOS that's `~/Library/Application Support/Claude/claude_desktop_config.json`. Add an `opteryx-local` entry inside `mcpServers`, using your two paths. Leave the rest of the file as it is:

```json
{
  "mcpServers": {
    "opteryx-local": {
      "command": "/Users/you/ollama-mcp/.venv/bin/python",
      "args": ["/Users/you/ollama-mcp/server.py"]
    }
  }
}
```

Reopen Claude Desktop. **opteryx-local** appears in the **+** / tools menu in the message box with its three tools. Ask a question such as "which planets have no moons?". If the server doesn't appear, the log is in `~/Library/Logs/Claude/mcp-server-opteryx-local.log`.

## Use the Server From Claude Code

Register it with the same two paths:

```bash
claude mcp add opteryx-local -- "$(pwd)/.venv/bin/python" "$(pwd)/server.py"
```

Check it connected:

```bash
claude mcp list
```

`opteryx-local` should be listed with `✓ Connected`. In a session, the tools appear as `mcp__opteryx-local__run_sql` and so on. To give Claude the SQL guide, type `@` and pick `opteryx://sql/guide` from the `opteryx-local` resources.

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
    """Run one Opteryx SQL SELECT statement and return the rows (at most 200).
    Strings use single quotes; double quotes name columns. Use LIMIT, not TOP."""
    names, _, rows = execute(sql)
    return {"columns": names, "rows": rows[:200], "truncated": len(rows) > 200}


@mcp.resource("opteryx://sql/guide-short", mime_type="text/markdown")
def sql_guide_short() -> str:
    with open("opteryx-sql-guide-short.md", encoding="utf-8") as file:
        return file.read()
```

The docstrings matter: they are the tool descriptions the model reads when deciding what to call. The full file also has `list_datasets`, which lists the folders under `./data/`, the full guide resource, and the sample data download.

Re-raising Opteryx errors as `ToolError` matters too. The MCP library hides the text of any other exception from the model, so without it a bad query only returns "Error executing tool run_sql". With it, the model sees Opteryx's message, for example ``Column *nope* cannot be found. Did you mean `name`?``, and can correct its query.

## Use Your Own Data

Put your files in a folder under `./data/`. For example, `./data/orders/` is queried as `data.orders`. Parquet, JSON Lines and Skene files work as datasets; CSV doesn't (see [Querying Local Data](/docs/guides/querying-local-data)). `list_datasets` picks up the new folder the next time the server starts.

The model only sees column names and types. It doesn't know units or what a code means, and it will guess. In the planets data, for example, `mass` is in units of 10²⁴ kg, and a model may report it as Earth masses. Clear column names help, and so does saying what you mean in the question.

## Troubleshooting

| What you see | What to do |
| --- | --- |
| `Could not reach Ollama at http://localhost:11434` | Ollama isn't running. Start the Ollama app, or run `ollama serve` in another terminal. |
| `Ollama returned an error: model 'qwen3.5:9b' not found` | Pull it with `ollama pull qwen3.5:9b`, or pass a model you have with `--model`. `ollama list` shows what's installed. |
| `... does not support tools` | The model can't call tools. Choose one from Ollama's [tools](https://ollama.com/search?c=tools) list. |
| `pip install` starts compiling Rust or C++, or fails building `opteryx-core` | There's no ready-built package for your Python version or platform. Recreate the virtual environment with a version listed under [What You Need](#what-you-need). |
| `ModuleNotFoundError: No module named 'opteryx'` or `'mcp'` | The virtual environment isn't active. Run `source .venv/bin/activate`. |
| `urllib.error.URLError` on the first run | The sample data download failed. Check your network and run it again; it is only needed once. |
| The model answers without calling any tools | Small models sometimes skip tools. Ask again, say "look it up", or try a larger model. |
| `!! Column *Earth* cannot be found` | The model put a string in double quotes. It usually reads the error and retries; if a model does this often, use `--guide full`. |
| `RuntimeError: the model did not answer within 10 steps` | The model went round in circles. Ask a narrower question, or try a larger model. |
| The server doesn't appear in Claude Desktop | Check the entry is still in the configuration file (edits made while the app was running are lost), that both paths are absolute, and read `~/Library/Logs/Claude/mcp-server-opteryx-local.log`. |

To check the server without any model, list its tools and resources with the MCP Inspector, which needs Node.js:

```bash
npx @modelcontextprotocol/inspector "$(pwd)/.venv/bin/python" "$(pwd)/server.py"
```

## Things to Know

- **Small models make mistakes.** A local model writes less reliable SQL than a large hosted one. When a query fails, the error is printed and passed back to the model so it can try again. Check the printed SQL when an answer matters.
- **`run_sql` runs whatever the model writes.** The tool description asks for `SELECT` statements, but nothing enforces that. The server can read every file under `./data/`, so only put data there that you're happy for the model to query.
- **The answer is only as good as the data.** The model reports what the query returns. If two datasets disagree, as they do on moon counts here, ask which one it used.

## Related

- [Ollama example code](https://github.com/mabel-dev/docs.opteryx.app/tree/main/examples/ollama-mcp)
- [Opteryx SQL guide for agents](/opteryx-sql-guide.md)
- [Querying Local Data](/docs/guides/querying-local-data)
- [Embedding Opteryx Core in a Service](/docs/guides/embedding-in-a-service)
- [Using Opteryx from Your AI Assistant](/docs/guides/ai-assistants), the hosted Opteryx MCP server
