---
title: Connecting Claude Code, Cursor and Other MCP Clients to Opteryx
description: Register the Opteryx MCP server with Claude Code, Cursor, or any client that launches stdio MCP servers.
---

# Connecting Claude Code, Cursor and Other Clients

This page assumes you've created a personal access token and run `uvx opteryx-mcp login`. If you haven't, start with [Using Opteryx from Your AI Assistant](/docs/guides/ai-assistants).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- register Opteryx with Claude Code in one command
- register it with any other MCP client
- point the bridge at a different Opteryx environment

## Claude Code

```bash
claude mcp add opteryx -- uvx opteryx-mcp --user <user>
```

The tools appear as `mcp__opteryx__search_datasets` and so on. The SQL dialect reference is also available as the `/mcp__opteryx__opteryx_sql_dialect` slash command. Load it before asking Claude to write Opteryx SQL in your code.

## Any Other MCP Client

`opteryx-mcp` is a standard stdio MCP server, so any client that launches one can run it with the same command. For example, Cursor's `mcp.json`:

```json
{
  "mcpServers": {
    "opteryx": {
      "command": "uvx",
      "args": ["opteryx-mcp", "--user", "<user>"]
    }
  }
}
```

If the client can't find `uvx`, give its full path. `which uvx` prints it on macOS and Linux, and `where uvx` on Windows. On platforms without a Keychain, pass the token as an environment variable:

```json
"env": { "OPTERYX_TOKEN": "opt_..._01" }
```

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `OPTERYX_USER` | — | The user, if `--user` isn't given |
| `OPTERYX_TOKEN` | the Keychain entry stored by `login` | The personal access token |
| `OPTERYX_MCP_URL` | `https://agent.opteryx.app/mcp/` | The MCP endpoint |
| `OPTERYX_AUTH_URL` | `https://authenticate.opteryx.app` | Where access tokens are minted |

## Why a Local Bridge

The MCP endpoint at `https://agent.opteryx.app/mcp/` takes a bearer token, and Opteryx access tokens last five minutes. A client configured with a fixed header would be disconnected almost straight away. `opteryx-mcp` holds your personal access token and fetches a fresh access token a minute before each one expires. If the server forgets your session, it reconnects without the client noticing.

Generic bridges such as `mcp-remote` send one fixed header for the life of the process. Once that token expires they fail, typically with `does not support dynamic client registration`, an error that doesn't point to the real cause.
