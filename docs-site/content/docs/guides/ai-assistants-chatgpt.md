---
title: Connecting ChatGPT to Opteryx
description: Add Opteryx to ChatGPT as a custom MCP server, signing in with your Opteryx account, so you can find and query your Opteryx data from a ChatGPT chat.
---

# Connecting ChatGPT

ChatGPT connects to the Opteryx MCP server directly, so you don't need to install `opteryx-mcp`. You add Opteryx as a custom MCP server on chatgpt.com, then sign in with your Opteryx account. You don't need a personal access token.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- add Opteryx to ChatGPT as a custom MCP server
- sign in to Opteryx from ChatGPT
- check the connection from a chat

See [Using Opteryx from Your AI Assistant](/docs/guides/ai-assistants) for what your assistant can and can't do once it's connected.

## Add the Server

On chatgpt.com, open **Plugins**, then **Add → Custom MCP server**. Fill in the form:

| Field | Value |
| --- | --- |
| Icon | Optional. A PNG, 256 × 256 px or larger, up to 10 KB |
| Name | `opteryx` |
| Connection | **Server URL**: `https://agent.opteryx.app/mcp` |
| Authentication | **OAuth** |

Expand **Advanced OAuth settings** and set:

| Field | Value |
| --- | --- |
| Registration method | **User-Defined OAuth Client** |
| OAuth client ID | `chatgpt` |
| OAuth client secret | Leave empty |
| Token endpoint auth method | `none` |
| OIDC enabled | Untick |

Leave the scopes as they are. ChatGPT fills in the **OAuth endpoints** section itself, from the Opteryx server. Leave **Registration URL** empty.

Tick **I understand and want to continue**, then choose **Create as a plugin**.

## Sign In

ChatGPT sends you to `authenticate.opteryx.app`. Sign in with your Opteryx account, and you're returned to ChatGPT. From then on ChatGPT renews access on its own, so you won't need to sign in each time.

## Check It Works

Start a new chat and ask:

```
ask opteryx for the public datasets
```

ChatGPT calls `search_datasets` and lists the datasets in the `public` workspace, such as `public.astronomy.planets` and `public.geopolitics.countries`.

## Troubleshooting

- **The form says DCR or CIMD is unavailable.** That's expected. Those are ways for ChatGPT to register itself, and you're giving it a client ID instead.
- **Sign-in fails with `invalid redirect_uri`.** The callback URL ChatGPT shows in the form isn't one Opteryx accepts. Contact support with the URL shown.
- **The connection fails after sign-in.** Check that **OIDC enabled** is unticked. Opteryx doesn't issue the OpenID token ChatGPT asks for when it's ticked.

## Disconnecting

Remove the plugin in ChatGPT under **Plugins**.
