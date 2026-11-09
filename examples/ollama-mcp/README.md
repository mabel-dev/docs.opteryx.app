# Asking Questions of Local Data with Ollama

A local language model, run by Ollama, answers questions about local files by
writing SQL that Opteryx Core runs through an MCP server. The model, the query
engine and the data all stay on your machine: no account, no API key, and after
the first run it works offline.

Written to accompany [Asking Questions of Local Data with Ollama](https://docs.opteryx.app/docs/guides/local-ai-with-ollama),
which also covers connecting the server to Claude Desktop and Claude Code,
eight tested example prompts, and troubleshooting.

## Files

| File | What it is |
| --- | --- |
| `server.py` | The MCP server: `list_datasets`, `describe_dataset` and `run_sql` tools, and the SQL guide as resources |
| `chat.py` | Connects an Ollama model to the server and puts the short SQL guide in its system prompt |
| `opteryx-sql-guide.md` | The Opteryx SQL guide for agents, served as `opteryx://sql/guide` |
| `opteryx-sql-guide-short.md` | The condensed guide, served as `opteryx://sql/guide-short` |

The two guides are copies of `docs-site/public/opteryx-sql-guide*.md`;
`scripts/verify_sql_guides.py` runs every SQL example in them and checks the
copies match.

## Run it

You need Python 3.13 or 3.14 on macOS 15 or later (Apple silicon), or 3.11 to
3.14 on Linux x86-64. Install Ollama by following the instructions on
[ollama.com](https://ollama.com), and pull a model that supports tool calling:

```bash
ollama pull qwen3.5:9b
```

Then:

```bash
python3.13 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python chat.py "which is the largest planet?"
```

On first run the server downloads `planets.parquet` (4 KB) and
`satellites.parquet` (9 KB) into `./data/`. Run `python chat.py` with no
question to ask several in a row, `--model` to try another model, and
`--guide full` or `--guide none` to change the SQL guide the model gets.

## Point it at your own data

Put your Parquet or JSON Lines files in a folder under `./data/`.
`./data/orders/` is queried as `data.orders`.
