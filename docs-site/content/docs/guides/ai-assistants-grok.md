---
title: Connecting Grok to Opteryx
description: Add Opteryx to Grok as a remote MCP server, using your user and a personal access token in a header, so you can find and query your Opteryx data from a Grok chat.
---

# Connecting Grok

Grok connects to remote MCP servers directly, so you don't need to install `opteryx-mcp`. You give Grok the Opteryx MCP endpoint and a header carrying your user and a personal access token.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- add Opteryx to Grok as a remote MCP server
- write the authorization header Grok sends
- check the connection from a chat

## Before You Start

You need a personal access token. In Studio, open **Settings → Access Tokens** and generate one. It looks like `opt_..._01`, lasts 90 days by default, and is shown once. See [Using Opteryx from Your AI Assistant](/docs/guides/ai-assistants) for what your assistant can and can't do once it's connected.

## Add the Server

In Grok, open **Settings → Connect Apps** and choose **Add MCP Server**. Fill in the form:

| Field | Value |
| --- | --- |
| Name | `opteryx` |
| Server URL | `https://agent.opteryx.app/mcp/` |
| Header key | `Authorization` |
| Header value | `Bearer <user>:<token>` |

The header value is the word `Bearer`, a space, then your user and your token joined by a colon. For the user `alice` with the token `opt_abcd_01`, the value is:

```
Bearer alice:opt_abcd_01
```

Choose **Add MCP**.

If you'd rather not use the `Authorization` header, either of these works the same way:

| Header key | Header value |
| --- | --- |
| `X-API-Key` | `<user>:<token>` |
| `Authorization` | `Basic ` followed by `<user>:<token>` encoded as base64 |

## Check It Works

Start a new chat and ask:

```
ask opteryx for the public datasets
```

Grok calls `search_datasets` and lists the datasets in the `public` workspace, such as `public.astronomy.planets` and `public.geopolitics.countries`.

## How the Token Is Used

Opteryx access tokens last five minutes, so a fixed header can't carry one. Instead, the header carries your personal access token. On each request, the Opteryx MCP server exchanges it for a short-lived access token and runs the call as you. The exchange is cached, so it doesn't happen on every call.

Your user can't contain a colon. Your token can, because the value is split at the first colon.

## When Your Token Expires

Create a new token in Studio, then edit the Opteryx server in **Settings → Connect Apps** and replace the token in the header value. Revoking a token under **Settings → Access Tokens** disconnects Grok straight away.

## Troubleshooting

If Grok can reach the server but every Opteryx call fails as unauthorized, check that:

- the header value starts with `Bearer ` (with a space) when the key is `Authorization`
- the user is the one the token belongs to
- the token hasn't expired or been revoked

To test the user and token outside Grok, store them with `uvx opteryx-mcp login --user <user>`, then run `uvx opteryx-mcp check --user <user>`. If that also fails with `token request failed (401)`, the user and token don't match.
