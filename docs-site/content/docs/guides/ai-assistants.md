---
title: Using Opteryx from Your AI Assistant (MCP)
description: Register the Opteryx MCP server with Claude Desktop, Claude Code, Cursor or any MCP client, and ask questions about your data in your own assistant, running as you.
---

# Using Opteryx from Your AI Assistant

Opteryx Studio has its own AI Assistant, which runs on a provider key you add under **Settings → AI Providers**. If you already work in an AI tool, you don't need it. You can register the Opteryx MCP server with that tool instead and ask questions about your data there. MCP (Model Context Protocol) is how tools such as Claude Desktop, Claude Code and Cursor connect to outside systems.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- say what your assistant can and can't do with Opteryx once it's connected
- create the personal access token it connects with
- install `opteryx-mcp`, store the token, and check the connection works
- choose the setup guide for your tool

## What Your Assistant Gets

Once connected, your assistant has seven tools. Every call runs as you, against the datasets you can see. It never runs under a shared or elevated account.

| Tool | What it does |
| --- | --- |
| `search_datasets` | Find datasets by name or by column name |
| `get_dataset_schema` | Columns, types, statistics and a few sample rows |
| `query_dataset` | Run an [OData](/docs/guides/querying-via-odata) query and return the rows |
| `profile_column` | The values a column actually holds, so a filter uses the right spelling |
| `lookup_sql_syntax` | Confirm a function or statement exists in Opteryx SQL |
| `validate_sql` | Check a SQL statement against the dialect and your schemas, without running it |
| `search_docs` | Search this documentation |

A few limits shape how the tools behave:

- **Reads are capped at 200 rows.** The assistant answers aggregate questions by aggregating on the server, and it should say when an answer rests on a read that hit the cap.
- **It reads, it doesn't write.** `query_dataset` uses OData, not SQL. The assistant can *write* SQL for you and check it with `validate_sql`, but nothing it writes is run. You run it.
- **It uses your tool's model.** Questions and results go to the model your tool uses, under that tool's terms. Opteryx doesn't add a model of its own.

## Set Up

### 1. Create a personal access token

In Studio, open **Settings → Access Tokens** and generate a token. It looks like `opt_..._01`, lasts 90 days by default, and is shown once.

The bridge exchanges this token for short-lived access tokens as it needs them. Opteryx access tokens expire after five minutes, so a token pasted straight into a tool's config would stop working almost immediately.

### 2. Install and log in

`opteryx-mcp` is a small local program that sits between your tool and Opteryx. It runs with [uv](https://docs.astral.sh/uv/), which installs it on first use:

```bash
uvx opteryx-mcp login --user <user>
```

Use the user your token belongs to. On macOS, `login` stores the token in the Keychain. It prompts for the token, so it never appears in your shell history. It then connects once to check that the user and token match:

```
Connected to https://agent.opteryx.app/mcp/ as <user>.
7 tools: search_datasets, get_dataset_schema, query_dataset, profile_column, lookup_sql_syntax, search_docs, validate_sql
```

On Windows and Linux, set the token as `OPTERYX_TOKEN` in your tool's config instead (the setup guides show where).

### 3. Register it with your tool

- [Claude Desktop](/docs/guides/ai-assistants-claude-desktop)
- [Claude Code, Cursor and other MCP clients](/docs/guides/ai-assistants-other-clients)

## When Your Token Expires

Create a new token in Studio and run `uvx opteryx-mcp login --user <user>` again. It replaces the stored one. Revoking a token under **Settings → Access Tokens** disconnects every tool that uses it.

## Checking the Connection

```bash
uvx opteryx-mcp check --user <user>
```

This connects the same way your tool does and lists the tools. If it fails with `token request failed (401)`, either the user and token don't match, or the token has expired or been revoked.
