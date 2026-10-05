---
title: Connecting Claude Desktop to Opteryx
description: Register the Opteryx MCP server with Claude Desktop so you can find, query and check your Opteryx data from a Claude chat.
---

# Connecting Claude Desktop

This page assumes you've created a personal access token and run `uvx opteryx-mcp login`. If you haven't, start with [Using Opteryx from Your AI Assistant](/docs/guides/ai-assistants).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- add Opteryx to Claude Desktop's configuration without the edit being lost
- find the Opteryx tools in a chat and turn them on or off
- tell from the logs why the server didn't start

## Add the Server

Print the configuration entry for your user:

```bash
uvx opteryx-mcp config --user <user>
```

```json
{
  "mcpServers": {
    "opteryx": {
      "command": "/Users/you/.local/bin/uvx",
      "args": ["opteryx-mcp", "--user", "<user>"]
    }
  }
}
```

The command is a full path because Claude Desktop starts servers with a minimal `PATH`, where a bare `uvx` may not be found.

Now **quit Claude Desktop completely** (Cmd-Q on macOS). Claude Desktop rewrites its configuration file when it quits, so an edit made while it's running is silently dropped.

With Claude Desktop closed, open its configuration file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Merge in the `opteryx` entry. If the file already has an `mcpServers` object, add `opteryx` inside it. Leave everything else in the file as it is, because it also holds the app's own preferences.

On Windows and Linux, where there's no Keychain, add the token to the entry:

```json
"env": { "OPTERYX_TOKEN": "opt_..._01" }
```

Then reopen Claude Desktop.

## Using It

In a chat, open the **+** / tools menu in the message box. **opteryx** is listed with its seven tools, and you can turn it on or off for each chat. Then ask about your data:

> Which of my datasets have customer emails in them?

> How many orders were placed each month this year?

> Check this SQL before I run it: `SELECT ...`

The server also appears under **Settings → Developer**, with a status showing whether it's running.

## When It Doesn't Appear

- **Not listed at all.** Check that the `opteryx` entry is still in the configuration file. If you edited it while Claude Desktop was running, it was overwritten. Quit the app, add it again, and reopen.
- **Listed but failed.** Claude Desktop writes the server's log to `~/Library/Logs/Claude/mcp-server-opteryx.log` on macOS, or `%APPDATA%\Claude\logs\mcp-server-opteryx.log` on Windows. The log records each access token minted and every request that fails.
- **`token request failed (401)` in the log.** Either the user and token don't match, or the token has expired. Create a new token and run `uvx opteryx-mcp login --user <user>` again.
