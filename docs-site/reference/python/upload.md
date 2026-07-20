# Upload

A Python client SDK for the [Upload API](/docs/reference/api/upload-api), the hosted service for ingesting Parquet, CSV, and NDJSON files into Opteryx tables.

## Install

~~~bash
pip install opteryx-upload
~~~

## Authentication

Pass a JWT directly, or exchange a Personal Access Token (client ID + client secret, from the [Authentication API](/docs/reference/api/authentication-api)) using `PATAuthenticator`, which caches the resulting access token and refreshes it automatically before it expires:

~~~python
from opteryx_upload import UploadClient, PATAuthenticator

client = UploadClient(
    token=PATAuthenticator(client_id="YOUR_CLIENT_ID", client_secret="YOUR_CLIENT_SECRET"),
)
~~~

## Usage

A session is created, one or more files are staged as parts, the staged parts are inspected, and then committed into a table:

~~~python
from opteryx_upload import UploadClient, Target, ConflictResolution

client = UploadClient(token="<jwt>")

session = client.create_session()
session.upload_file("findings.parquet")
session.upload_file("more_findings.csv")  # split into multiple parts automatically if needed

result = session.inspect()
if result.has_issues:
    raise SystemExit(result.issues)

commit = session.commit(
    Target(workspace="acme", collection="security", dataset="findings"),
    snapshot_message="Initial load",
    conflict_resolution=ConflictResolution.APPEND,
)
print(commit.table, commit.commit_id, commit.rows_written)
~~~

Or, for simple jobs, in one call:

~~~python
client.upload_and_commit(
    ["findings.parquet"],
    Target("acme", "security", "findings"),
    snapshot_message="Initial load",
)
~~~

Files are typed from their extension (`.parquet`, `.csv`, `.ndjson`/`.jsonl`). CSV and NDJSON files larger than the service's part-size limit are split automatically; Parquet files should be written as multiple smaller files upstream if a single export is too large, since the binary format cannot be split by byte offset.

For the full source and API reference, see [github.com/mabel-dev/opteryx-upload](https://github.com/mabel-dev/opteryx-upload).
