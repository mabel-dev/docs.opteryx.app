"""Ask a local Ollama model questions about local data, answered with Opteryx Core.

Ollama models can call tools but Ollama doesn't connect to MCP servers itself,
so this script does it: it starts server.py, gives its tools to the model, and
runs each tool call the model makes until the model answers. It also reads the
server's condensed SQL guide resource into the system prompt, so the model
knows how Opteryx SQL differs from the SQL it learned elsewhere.

Run with:
    python chat.py "which is the largest planet?"
    python chat.py                                   # ask questions interactively
    python chat.py --guide full "..."                # use the full SQL guide instead
"""

import argparse
import asyncio
import json
import os
import sys
import urllib.error
import urllib.request

from mcp import ClientSession
from mcp import StdioServerParameters
from mcp.client.stdio import stdio_client

OLLAMA_URL = "http://localhost:11434/api/chat"
SERVER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "server.py")
SYSTEM = (
    "You answer questions using the local datasets. Always look the answer up: "
    "call list_datasets, then describe_dataset, then run_sql. Opteryx SQL is "
    "close to PostgreSQL. Base your answer only on the query results."
)
GUIDES = {"short": "opteryx://sql/guide-short", "full": "opteryx://sql/guide"}
MAX_STEPS = 10


class OllamaError(Exception):
    """Ollama is not running, or refused the request."""


def ollama_chat(model, messages, tools):
    body = json.dumps({"model": model, "messages": messages, "tools": tools, "stream": False})
    request = urllib.request.Request(OLLAMA_URL, body.encode(), {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request) as response:
            return json.loads(response.read())["message"]
    except urllib.error.HTTPError as err:
        # Ollama explains itself in the body, for example "model 'x' not found".
        detail = json.loads(err.read() or b"{}").get("error", err.reason)
        raise OllamaError(f"Ollama returned an error: {detail}") from err
    except urllib.error.URLError as err:
        raise OllamaError(
            f"Could not reach Ollama at {OLLAMA_URL} ({err.reason}). "
            "Start the Ollama app, or run `ollama serve`, and try again."
        ) from err


async def ask(session, model, tools, messages, question):
    messages.append({"role": "user", "content": question})
    for _ in range(MAX_STEPS):
        reply = ollama_chat(model, messages, tools)
        messages.append(reply)
        calls = reply.get("tool_calls") or []
        if not calls:
            return reply["content"]
        for call in calls:
            name = call["function"]["name"]
            arguments = call["function"]["arguments"]
            print(f"  -> {name}({json.dumps(arguments)})", file=sys.stderr)
            result = await session.call_tool(name, arguments)
            text = "\n".join(c.text for c in result.content if c.type == "text")
            if result.is_error:
                print(f"  !! {text}", file=sys.stderr)
            messages.append({"role": "tool", "tool_name": name, "content": text})
    raise RuntimeError(f"the model did not answer within {MAX_STEPS} steps")


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="qwen3.5:9b", help="an Ollama model that supports tool calling")
    parser.add_argument("--guide", choices=["short", "full", "none"], default="short", help="the SQL guide to give the model")
    parser.add_argument("question", nargs="?")
    args = parser.parse_args()

    server = StdioServerParameters(command=sys.executable, args=[SERVER])
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = [
                {
                    "type": "function",
                    "function": {"name": t.name, "description": t.description, "parameters": t.input_schema},
                }
                for t in (await session.list_tools()).tools
            ]
            system = SYSTEM
            if args.guide != "none":
                guide = await session.read_resource(GUIDES[args.guide])
                text = "\n".join(c.text for c in guide.contents if hasattr(c, "text"))
                system += f" Write SQL that follows this guide:\n\n{text}"
            messages = [{"role": "system", "content": system}]
            if args.question:
                print(await ask(session, args.model, tools, messages, args.question))
                return
            while question := input("> ").strip():
                print(await ask(session, args.model, tools, messages, question))


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except* OllamaError as group:
        # The MCP client runs inside nested task groups, which wrap the error; print just its message.
        error = group
        while isinstance(error, BaseExceptionGroup):
            error = error.exceptions[0]
        sys.exit(str(error))
