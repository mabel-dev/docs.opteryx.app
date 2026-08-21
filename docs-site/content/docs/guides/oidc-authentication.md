---
title: Credential-less Authentication with OIDC
description: Authenticate a GitHub Actions workflow or a GCP service account to Opteryx.app with no stored client secret — register the workload once, then exchange the OIDC token its platform already mints for an Opteryx access token.
---

# Credential-less Authentication (OIDC)

A workload doesn't need a stored secret to prove who it is. Its platform already mints a short-lived, signed OIDC token describing it — GitHub Actions describes the workflow run, GCP describes the service account — and Opteryx will take that token in exchange for one of its own.

The access token you get back is exactly the one the `client_credentials` grant issues for the same client: same subject, same policies, same five-minute lifetime. Only the proof of identity changes, so nothing downstream needs to know which route the caller took. What goes away is the `client_secret` sitting in a repository secret or a config map, and everything that comes with it — the rotation, the leak, the person who left with a copy.

Two providers are supported:

| Provider | Workload | Matched on | May pin |
|---|---|---|---|
| `github` | A GitHub Actions workflow run | `repository_id` | `job_workflow_ref`, `ref`, `environment` |
| `google` | A GCP service account — Cloud Run, GCE, Cloud Functions, GKE with Workload Identity | `sub` (the service account's unique id) | `email` |

This is not a new kind of principal. A binding is a second kind of credential on an existing machine client, stored beside that client's [access tokens](/docs/reference/api/authentication-api), listed and revoked through the same endpoints.

## How the exchange works

1. The workload asks its own platform for an OIDC token, naming Opteryx as the audience.
2. It posts that token to `https://authenticate.opteryx.app/token` as an [RFC 8693](https://www.rfc-editor.org/rfc/rfc8693) token exchange.
3. Opteryx verifies the signature against the provider's JWKS, checks the issuer, audience and expiry, and looks for a registered binding matching the token's immutable subject claim.
4. If one matches, it mints the access token for the client that binding names.

Nothing in that loop involves a secret either side had to store.

## 1. Pick the client to bind to

A binding attaches a workload to an existing client. If you don't already have a machine principal for it, create a service account — you own it, it's billed to your billing account, and it's the principal your policies are written against:

```bash
curl -X POST https://authenticate.opteryx.app/service-accounts \
  -H 'Authorization: Bearer <your token>' \
  -H 'Content-Type: application/json' \
  -d '{"client_id": "scanbot", "description": "SAST/SCA scan uploads"}'
```

```json
{
  "client_id": "scanbot",
  "owner": "you@example.com",
  "description": "SAST/SCA scan uploads",
  "status": "active",
  "created_at": "2026-08-21T09:14:02.118443+00:00"
}
```

Service account names share one namespace with every other account, so they're first-come: 4–32 characters, starting with a letter, then letters, digits, underscores or hyphens. Grant it access the same way you would any other principal — see [Access and permissions](/docs/core-concepts/access-and-permissions).

As the owner, you can manage its credentials with your own token; you don't need to authenticate as the service account itself.

## 2. Register the workload

### GitHub Actions

Matching is on the numeric repository id, not `owner/name`. Find it with:

```bash
gh api repos/OWNER/NAME --jq .id
```

Then register it:

```bash
curl -X POST https://authenticate.opteryx.app/clients/scanbot/federated-credentials \
  -H 'Authorization: Bearer <your token>' \
  -H 'Content-Type: application/json' \
  -d '{
        "provider": "github",
        "subject": "123456789",
        "label": "mabel-dev/opteryx-core",
        "constraints": {
          "job_workflow_ref": "mabel-dev/opteryx-core/.github/workflows/scan.yaml@refs/heads/main"
        }
      }'
```

```json
{
  "client_id": "scanbot",
  "credential_id": "3f2b0c94-9c1e-4a55-9f4a-0f6f2e5f2a7d",
  "provider": "github",
  "subject": "123456789",
  "label": "mabel-dev/opteryx-core",
  "constraints": {
    "job_workflow_ref": "mabel-dev/opteryx-core/.github/workflows/scan.yaml@refs/heads/main"
  },
  "audience": "https://authenticate.opteryx.app"
}
```

There is no secret in that response, because there is no secret.

### GCP service account

Matching is on the service account's unique id, not its email:

```bash
gcloud iam service-accounts describe scanner@my-project.iam.gserviceaccount.com \
  --format='value(uniqueId)'
```

```bash
curl -X POST https://authenticate.opteryx.app/clients/scanbot/federated-credentials \
  -H 'Authorization: Bearer <your token>' \
  -H 'Content-Type: application/json' \
  -d '{
        "provider": "google",
        "subject": "114835721098765432109",
        "label": "scanner@my-project.iam.gserviceaccount.com"
      }'
```

Anything running as that service account — Cloud Run, a GCE VM, a Cloud Function, a GKE pod with Workload Identity — can then authenticate with no stored key.

### Why the id and not the name

Repositories get renamed, transferred and deleted; service accounts get deleted and recreated. In every one of those cases the *name* becomes available to somebody else, who would inherit whatever it was granted. The ids are never reissued. `label` is stored for whoever reads the credential list later and is never matched against — it is a note to a human, not a control.

`subject` is checked at registration: both providers' ids are numeric, so pasting `owner/name` into that field is rejected then, rather than becoming a binding that silently never matches.

## 3. Exchange the token in the workload

### From GitHub Actions

The job has to grant itself the right to ask for a token:

```yaml
jobs:
  scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write    # without this there is no token to present
    steps:
      - uses: actions/checkout@v4
      - run: python upload_scan_results.py
```

`id-token: write` is what makes GitHub set `ACTIONS_ID_TOKEN_REQUEST_URL` and `ACTIONS_ID_TOKEN_REQUEST_TOKEN` in the job environment. Note that adding a `permissions:` block at all narrows the job to what it lists, so include `contents: read` if the job checks out code.

In Python, the [upload client](/docs/reference/python/upload) does both halves — fetching the OIDC token and exchanging it:

```python
from opteryx_upload import ContractClient, GitHubOIDCAuthenticator

client = ContractClient(token=GitHubOIDCAuthenticator())
```

By hand, it's two requests — ask Actions for the token, then exchange it:

```bash
SUBJECT_TOKEN=$(curl -sS \
  -H "Authorization: Bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=https%3A%2F%2Fauthenticate.opteryx.app" \
  | jq -r .value)

curl -X POST https://authenticate.opteryx.app/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'grant_type=urn:ietf:params:oauth:grant-type:token-exchange' \
  --data-urlencode 'subject_token_type=urn:ietf:params:oauth:token-type:jwt' \
  --data-urlencode "subject_token=$SUBJECT_TOKEN"
```

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYwNzA3IiwidHlwIjoiSldUIn0...",
  "token_type": "bearer",
  "expires_in": 300
}
```

`subject_token_type` also accepts `urn:ietf:params:oauth:token-type:id_token`, which is the same thing under the name some clients use for it.

### From GCP

The workload asks the metadata server, which only something running on the instance can reach:

```bash
SUBJECT_TOKEN=$(curl -sS -H 'Metadata-Flavor: Google' \
  'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=https://authenticate.opteryx.app')

curl -X POST https://authenticate.opteryx.app/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'grant_type=urn:ietf:params:oauth:grant-type:token-exchange' \
  --data-urlencode 'subject_token_type=urn:ietf:params:oauth:token-type:jwt' \
  --data-urlencode "subject_token=$SUBJECT_TOKEN"
```

Or in Python:

```python
from opteryx_upload import ContractClient, GoogleWorkloadAuthenticator

client = ContractClient(token=GoogleWorkloadAuthenticator())
```

Both authenticators cache the assertion and re-authenticate shortly before it expires, so a long-running process holds one object rather than a token.

## Narrowing a binding

`constraints` pins claims exactly, turning "any workload with this identity" into a specific one. For GitHub that's `job_workflow_ref` (one workflow file on one ref), `ref`, and `environment`; for Google, `email`.

**Pin `job_workflow_ref` for anything that grants more than read access.** Without constraints the binding admits any workflow on any ref in that repository — which means anyone who can add a workflow file to it can claim whatever the binding was granted.

Pinning a claim the provider doesn't issue is rejected at registration, rather than becoming a binding that never matches. Where two bindings match the same token, the one pinning more claims wins — so a narrowed binding's scopes and permissions are the ones that apply.

## Audience

The workload must request the audience Opteryx expects — `https://authenticate.opteryx.app`. Both providers let the caller choose the audience, and that's the point: a token minted for a different relying party can't be replayed here. Pass `audience` when registering to have a binding additionally require a specific one.

> A Google token belonging to a *person* is refused. Someone signing in with Google gets a token from the same issuer with the same shape of `sub`, so the exchange additionally requires the `email` claim to end `gserviceaccount.com` — no human's does. A token with no `email` claim is refused for the same reason.

## Lifetime, listing and revoking

Bindings never expire by default. There's no secret to leak, so the usual reason to time-box a credential doesn't apply. Pass `expires_in_days` (maximum 365) if you want one to lapse anyway.

They live alongside access tokens on the same client, so the same endpoints list and revoke them — a binding shows `provider`, `subject`, `label` and `constraints` where a token shows none of those:

```bash
curl https://authenticate.opteryx.app/clients/scanbot/credentials \
  -H 'Authorization: Bearer <your token>'

curl -X DELETE https://authenticate.opteryx.app/clients/scanbot/credentials/3f2b0c94-9c1e-4a55-9f4a-0f6f2e5f2a7d \
  -H 'Authorization: Bearer <your token>'
```

`last_used_at` is stamped on each successful exchange, which is the quickest way to tell whether a binding you're about to delete is still carrying traffic.

## When the exchange fails

Every failure answers `401` with the same body:

```json
{"detail": "authentication failed"}
```

That's deliberate — whether a given repository is registered isn't something an unauthenticated caller gets to learn by comparing error messages — but it does mean the response won't tell you which part went wrong. Work through these in order:

- **`ACTIONS_ID_TOKEN_REQUEST_URL` is unset.** The job is missing `permissions: id-token: write`. This fails before the exchange, when fetching the subject token.
- **Wrong audience.** The token was minted for something other than `https://authenticate.opteryx.app`.
- **Subject doesn't match.** The registered `subject` is a repository *name* rather than the numeric id, or the service account was deleted and recreated (new `sub`, same email).
- **A constraint doesn't match.** `job_workflow_ref` includes the ref — a binding pinned to `@refs/heads/main` won't match a run on a branch or a tag. `environment` is only present on a job that declares one.
- **The binding expired**, if you set `expires_in_days`.
- **The clock.** Tokens are checked against `exp`, `nbf` and `iat` with 30 seconds of leeway.

## Related

- [Authentication API](/docs/reference/api/authentication-api) — token, credential and key endpoints
- [Upload client (Python SDK)](/docs/reference/python/upload) — `GitHubOIDCAuthenticator` and `GoogleWorkloadAuthenticator`
- [Running a query via the API](/docs/guides/running-a-query-via-the-api) — what to do with the token once you have it
- [Access and permissions](/docs/core-concepts/access-and-permissions) — what the bound client is allowed to do
