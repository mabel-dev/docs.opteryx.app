"""Ask a local Ollama model questions about local data, answered with Opteryx Core.

Ollama models can call tools but Ollama doesn't connect to MCP servers itself,
so this script does it: it starts server.py, gives its tools to the model, and
runs each tool call the model makes until the model answers.

Run with:
    python chat.py "which is the largest planet?"
    python chat.py                                   # ask questions interactively
"""

import argparse
import asyncio
import json
import os
import sys
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
MAX_STEPS = 10


def ollama_chat(model, messages, tools):
    body = json.dumps({"model": model, "messages": messages, "tools": tools, "stream": False})
    request = urllib.request.Request(OLLAMA_URL, body.encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read())["message"]


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
            messages = [{"role": "system", "content": SYSTEM}]
            if args.question:
                print(await ask(session, args.model, tools, messages, args.question))
                return
            while question := input("> ").strip():
                print(await ask(session, args.model, tools, messages, question))


if __name__ == "__main__":
    asyncio.run(main())
