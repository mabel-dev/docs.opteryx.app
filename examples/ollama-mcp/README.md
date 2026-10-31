# Asking Questions of Local Data with Ollama

A local language model, run by Ollama, answers questions about local files by
writing SQL that Opteryx Core runs through an MCP server. The model, the query
engine and the data all stay on your machine: no account, no API key, and after
the first run it works offline.

Written to accompany [Asking Questions of Local Data with Ollama](https://docs.opteryx.app/docs/guides/local-ai-with-ollama).

## Run it

Install Ollama by following the instructions on [ollama.com](https://ollama.com),
and pull a model that supports tool calling:

```bash
ollama pull qwen3.5:9b
```

Then:

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python chat.py "which is the largest planet?"
```

On first run the server downloads `planets.parquet` (about 4 KB) into
`./data/planets/`. Run `python chat.py` with no question to ask several in a
row, and use `--model` to try another model.

## Point it at your own data

Put your Parquet or JSON Lines files in a folder under `./data/`.
`./data/orders/` is queried as `data.orders`.
