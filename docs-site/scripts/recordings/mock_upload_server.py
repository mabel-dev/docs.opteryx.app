#!/usr/bin/env python3
"""A stand-in for the upload service, just real enough to record the TUI against.

Speaks the same `/v2/contracts` wire protocol `opteryx_upload.client.ContractClient`
sends - negotiate, accept, write, commit - so the real, installed `opteryx-upload`
command runs unmodified and produces real screens. What it does NOT do is check
anything: any bearer token is accepted, and the plan/schema returned is fixed,
scripted to match the `acme.security.findings` example already used in
upload-cli.md (an existing dataset that types `published` as a timestamp and
`source_ip` as an IPV4, with an extra `score` column the dataset doesn't
declare).

Usage:
    python3 mock_upload_server.py [port]   # default port 8756

Point the real CLI at it:
    export OPTERYX_TOKEN=demo
    export OPTERYX_UPLOAD_URL=http://127.0.0.1:8756
"""

from __future__ import annotations

import json
import sys
import time
import uuid
from http.server import BaseHTTPRequestHandler
from http.server import ThreadingHTTPServer

PLAN = [
    {"column": "cve_id", "from": "VARCHAR", "to": "VARCHAR", "action": "keep"},
    {"column": "published", "from": "VARCHAR", "to": "TIMESTAMP[us]", "action": "cast"},
    {"column": "source_ip", "from": "VARCHAR", "to": "IPV4", "action": "cast"},
    {"column": "hosts", "from": "INT64", "to": "INT64", "action": "keep"},
    {"column": "score", "from": "FLOAT64", "to": "FLOAT64", "action": "ignored"},
]
VALUES = {
    "cve_id": "CVE-2026-00001",
    "published": "2026-08-02T04:22:07Z",
    "source_ip": "10.1.7.13",
    "hosts": "1",
    "score": "0.5",
}
SCHEMA = [
    {"name": "cve_id", "type": "VARCHAR"},
    {"name": "published", "type": "TIMESTAMP[us]"},
    {"name": "source_ip", "type": "IPV4"},
    {"name": "hosts", "type": "INT64"},
]
TARGET = {"workspace": "acme", "collection": "security", "dataset": "findings"}

# Artificial delays so the TUI's spinner and progress bar are visible on
# screen for a moment, rather than resolving between two drawn frames.
NEGOTIATE_DELAY = 0.7
WRITE_DELAY = 0.5
COMMIT_DELAY = 0.6


class Contract:
    def __init__(self):
        self.contract_id = f"con_{uuid.uuid4().hex[:12]}"
        self.state = "proposed"
        self.rows_written = 0
        self.writes = []
        self.snapshot = None

    def as_json(self):
        return {
            "contract_id": self.contract_id,
            "state": self.state,
            "target": TARGET,
            "schema": SCHEMA,
            "plan": PLAN,
            "values": VALUES,
            "issues": [],
            "rows_written": self.rows_written,
            "writes": self.writes,
            "snapshot": self.snapshot,
        }


CONTRACTS: dict[str, Contract] = {}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("mock-upload-server: " + (fmt % args) + "\n")

    def _drain(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        if length:
            self.rfile.read(length)

    def _reply(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        parts = self.path.strip("/").split("/")
        # /v2/contracts
        if self.path == "/v2/contracts":
            self._drain()
            time.sleep(NEGOTIATE_DELAY)
            contract = Contract()
            CONTRACTS[contract.contract_id] = contract
            self._reply(contract.as_json())
            return
        # /v2/contracts/<id>/data | /commit
        if len(parts) == 4 and parts[0] == "v2" and parts[1] == "contracts":
            contract_id, action = parts[2], parts[3]
            contract = CONTRACTS.get(contract_id)
            if contract is None:
                self._reply({"error": {"code": "not_found"}}, status=404)
                return
            if action == "data":
                name = self.headers.get("x-file-name", "data")
                size = int(self.headers.get("Content-Length", 0) or 0)
                self._drain()
                time.sleep(WRITE_DELAY)
                contract.state = "writing"
                contract.writes.append({"file": name, "bytes": size})
                contract.rows_written += 6  # matches the sample findings.csv row count
                self._reply(contract.as_json())
                return
            if action == "commit":
                self._drain()
                time.sleep(COMMIT_DELAY)
                contract.state = "committed"
                contract.snapshot = f"snap_{uuid.uuid4().hex[:8]}"
                self._reply(contract.as_json())
                return
        self._drain()
        self._reply({"error": {"code": "not_found"}}, status=404)

    def do_PUT(self):
        parts = self.path.strip("/").split("/")
        if len(parts) == 4 and parts[3] == "accept":
            contract = CONTRACTS.get(parts[2])
            self._drain()
            if contract is None:
                self._reply({"error": {"code": "not_found"}}, status=404)
                return
            contract.state = "accepted"
            self._reply(contract.as_json())
            return
        self._drain()
        self._reply({"error": {"code": "not_found"}}, status=404)

    def do_GET(self):
        parts = self.path.strip("/").split("/")
        if len(parts) == 3 and parts[0] == "v2" and parts[1] == "contracts":
            contract = CONTRACTS.get(parts[2])
            if contract is None:
                self._reply({"error": {"code": "not_found"}}, status=404)
                return
            self._reply(contract.as_json())
            return
        self._reply({"error": {"code": "not_found"}}, status=404)

    def do_DELETE(self):
        parts = self.path.strip("/").split("/")
        if len(parts) == 3:
            contract = CONTRACTS.get(parts[2])
            if contract is not None:
                contract.state = "abandoned"
            self.send_response(204)
            self.end_headers()
            return
        self.send_response(404)
        self.end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8756
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"mock upload service on http://127.0.0.1:{port}", file=sys.stderr)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
