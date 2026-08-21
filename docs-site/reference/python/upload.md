# Upload

The Python client for the [Upload API](/docs/reference/api/upload-api), the hosted service for ingesting Parquet, CSV and NDJSON files into Opteryx tables. It ships a library, a command line and a full-screen terminal app; for the last two see [The Upload Command Line](/docs/guides/upload-cli).

## Install

~~~bash
pip install opteryx-upload
~~~

## Authentication

Pass an access token — a client ID and client secret from the [Authentication API](/docs/reference/api/authentication-api) — through `PATAuthenticator`. It exchanges them for a short-lived assertion, caches it, and re-authenticates before it expires:

~~~python
from opteryx_upload import ContractClient, PATAuthenticator

client = ContractClient(
    token=PATAuthenticator(client_id="YOUR_CLIENT_ID", client_secret="YOUR_CLIENT_SECRET"),
)
~~~

`token` also takes a plain JWT, or any zero-argument callable, and is resolved per request. A bearer assertion lives about five minutes and an upload can take longer than that, so prefer the access token for anything substantial.

### In CI, with no secret at all

In a GitHub Actions job, or on GCP running as a service account, there is nothing to store: the platform mints a signed token saying which workload this is, and the authenticate service exchanges it for the same assertion a client secret would have bought. Both are drop-in replacements for `PATAuthenticator` — callable, cached, same `invalidate()`.

~~~python
from opteryx_upload import ContractClient, GitHubOIDCAuthenticator

client = ContractClient(token=GitHubOIDCAuthenticator())
~~~

The job needs `permissions: id-token: write`, which is what puts `ACTIONS_ID_TOKEN_REQUEST_URL` and `ACTIONS_ID_TOKEN_REQUEST_TOKEN` in its environment; without it the authenticator raises `AuthenticationError` saying so. `GoogleWorkloadAuthenticator()` is the GCP counterpart, fetching its token from the metadata server instead.

For a script that runs both in CI and on a laptop, ask before committing to one:

~~~python
from opteryx_upload import ContractClient, GitHubOIDCAuthenticator, PATAuthenticator

if GitHubOIDCAuthenticator.is_available():
    token = GitHubOIDCAuthenticator()
else:
    token = PATAuthenticator(client_id=..., client_secret=...)

client = ContractClient(token=token)
~~~

The repository or service account has to be registered against a client first, and which client it is — and what it may write — is decided there, not here. See [Credential-less authentication (OIDC)](/docs/guides/oidc-authentication).

## Agreeing before uploading

An upload is a short conversation: negotiate what the data will become, read the plan, accept it, then send the files and commit.

~~~python
from opteryx_upload import ContractClient, Schema, Target

client = ContractClient(token="<jwt>")

contract = client.negotiate(
    Target("acme", "security", "findings"),
    ["findings.parquet", "more_findings.parquet"],
    Schema.auto(),
)

for entry in contract.plan:
    print(entry)          # source_ip: VARCHAR -> IPV4 (cast)

if contract.blocking:
    raise SystemExit(contract.issues)

if contract.state == "proposed":
    contract.accept()

contract.write_all(["findings.parquet", "more_findings.parquet"])
result = contract.commit(message="nightly load")
print(result.table, result.commit_id, result.rows_written)
~~~

`negotiate` uploads no data. Each file is sampled locally — a prefix for text, the *footer* for Parquet, which is where its schema lives — so agreeing costs a few megabytes whatever the files weigh, and an upload that was going to be refused is refused before it starts. Every file is sampled, not just the first: one contract covers all of them, so two files that disagree are caught here rather than at commit.

## Where the schema comes from

There is no default. Omitting it raises a `TypeError` at the call site rather than quietly inferring — a schema chosen because nobody said otherwise is how a column of dotted quads is catalogued as `VARCHAR` forever, and once it is, reading the data back cannot tell you it was a mistake.

~~~python
Schema.auto()                  # work it out from the destination
Schema.inferred()              # read the types from the data, and show me first
Schema.of_dataset("append")    # use the types the dataset already declares
Schema.declared({"source_ip": "IPV4", "published": "TIMESTAMP[us]"})
~~~

`Schema.auto()` is not a fourth source of types — it asks the service to look up something it already knows. A dataset that declares its columns supplies them; one that does not exist has them inferred. The contract that comes back names the mode it resolved to, so nothing downstream has to know `auto` existed.

`Schema.of_dataset("overwrite")` replaces the rows the dataset resolves to and leaves its definition exactly as the catalog holds it — a dataset defined as `IPV4` is still `IPV4` afterwards.

## Reading the plan

A contract whose types were inferred arrives `proposed` and refuses writes until it is accepted, so a script that never looks at what was inferred fails loudly instead of cataloguing a guess.

~~~python
contract.values          # {"source_ip": "10.4.19.7"} - one real value per column
contract.plan            # PlanEntry(column, from_, to, action)
contract.issues          # Issue(code, column, detail, severity)
contract.blocking        # True when something must be resolved first

contract.retype(source_ip="IPV4", published="TIMESTAMP[us]")
contract.ignore("score")     # read it, do not write it
contract.accept()
~~~

`PlanEntry.action` is one of `keep`, `retag`, `widen`, `cast`, `unsupported`, `undeclared` or `ignored`, and `entry.changes_values` is the distinction worth reading for: relabelling a column `IPV4` and multiplying every value in it by a thousand are both one line of a table, and only one of them is worth stopping for.

Amending an inference is a declaration — you looked at it and said what you wanted — so the contract returns to `proposed` and has to be accepted again. `accept()` echoes back the fingerprint you were shown, so a proposal that moved between being read and being accepted is refused rather than confirmed blind.

Without `ignore`, a column your files carry that the target does not declare is refused rather than included on your behalf. That is the right default: quietly discarding data nobody mentioned is how a column goes missing for a quarter.

## Everything in one call

~~~python
client.load(
    ["findings.parquet"],
    Target("acme", "security", "findings"),
    Schema.declared({"cve_id": "VARCHAR", "source_ip": "IPV4"}),
    message="nightly load",
)
~~~

`schema` is required here too. A load that chose its own types because nobody said otherwise is the thing this design exists to prevent, and making the convenience wrapper the exception would defeat it.

## Errors

One exception per error code, each carrying its fields, so a caller branches on a field rather than matching English in a message.

~~~python
from opteryx_upload import ContractStale, ValueNotCastable

try:
    contract.write("findings.parquet")
except ValueNotCastable as error:
    print(error.column, error.row, error.value, error.declared)
except ContractStale as error:
    print(error.diff, error.written_rows)   # re-negotiate; retrying works
~~~

`ValueNotCastable` is raised on the write carrying the bad value, naming the row — not at commit after everything has been sent. `ContractStale` means the target's definition moved after the contract was agreed; nothing was published, so the cost is work rather than a dataset somebody has already read. `InternalError` carries a `reference`, the id the service logged its traceback against.

The rest: `SchemaSourceRequired`, `ColumnUndeclared`, `ColumnMissing`, `SourcesDisagree`, `ContractNotAccepted`, `ProposalChanged`, `ContractExpired`, `AlreadyCommitted`, `DatasetExists`, `FormatUnreadable`, `NotAuthorized`, `ContractNotFound`.

## Reattaching and retrying

~~~python
contract = client.contract("ct_20260819180247_b47d7241786f")
contract.write("big.parquet", progress=lambda sent, total: print(sent, total))
contract.commit(message="retry", idempotency_key="nightly-2026-08-19")
~~~

Commit is idempotent on `idempotency_key`: a retry after a lost response returns the original snapshot instead of writing a second one. `contract.abandon()` gives up — nothing written was ever readable, so there is nothing to undo.

## Formats

Files are typed from their extension: `.parquet`/`.pq`, `.csv`, `.ndjson`/`.jsonl`. Anything else is refused by name rather than guessed at. Parquet is sampled from its footer and text from its front, so negotiating costs the same few megabytes either way.

`UploadClient` and the `/v1/upload` session endpoints still work for existing callers, but they are no longer documented and no longer where new work should start: they infer types from the data and report what they found after the upload rather than before it.

For the full source, see [github.com/mabel-dev/opteryx-upload](https://github.com/mabel-dev/opteryx-upload).
