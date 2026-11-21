<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Authentication API

Base URL: https://authenticate.opteryx.app

## Overview

Authentication, OAuth 2.0, OpenID Connect discovery, JWKS publication, and client credential management.

## Getting a token

Every other Opteryx API expects a bearer token. Getting one is a two-part conversation: create a credential once, then exchange it for access tokens as often as you need.

<div class="api-flow">
  <div class="api-flow__head">
    <span class="api-flow__actor api-flow__actor--a">Client</span>
    <span class="api-flow__actor api-flow__actor--b">Authentication API</span>
  </div>
  <ol class="api-flow__steps">
    <li class="api-flow__step api-flow__step--req">
      <span class="api-flow__num">1</span>
      <span class="api-flow__label"><code>POST /clients/{client_id}/credentials</code></span>
    </li>
    <li class="api-flow__step api-flow__step--res">
      <span class="api-flow__num">2</span>
      <span class="api-flow__label">200 &middot; <code>credential_id</code>, <code>secret</code> (shown once)</span>
    </li>
    <li class="api-flow__step api-flow__step--req">
      <span class="api-flow__num">3</span>
      <span class="api-flow__label"><code>POST /token</code> &mdash; grant_type=client_credentials</span>
    </li>
    <li class="api-flow__step api-flow__step--res">
      <span class="api-flow__num">4</span>
      <span class="api-flow__label">200 &middot; <code>access_token</code>, <code>expires_in</code>, <code>refresh_token</code></span>
    </li>
    <li class="api-flow__group" data-label="To refresh, once access_token expires">
      <ol class="api-flow__steps">
        <li class="api-flow__step api-flow__step--req">
          <span class="api-flow__label"><code>POST /token</code> &mdash; grant_type=refresh_token</span>
        </li>
        <li class="api-flow__step api-flow__step--res">
          <span class="api-flow__label">200 &middot; new <code>access_token</code>, <code>expires_in</code></span>
        </li>
      </ol>
    </li>
    <li class="api-flow__group" data-label="Or, if no refresh_token was issued">
      <ol class="api-flow__steps">
        <li class="api-flow__step api-flow__step--req">
          <span class="api-flow__label"><code>POST /token</code> &mdash; grant_type=client_credentials, again</span>
        </li>
        <li class="api-flow__step api-flow__step--res">
          <span class="api-flow__label">200 &middot; new <code>access_token</code>, <code>expires_in</code></span>
        </li>
      </ol>
    </li>
    <li class="api-flow__note">Every other Opteryx API call sends this <code>access_token</code> as <code>Authorization: Bearer &lt;token&gt;</code></li>
  </ol>
</div>

- **The secret is shown once.** `CreateCredentialResponse.secret` is only ever returned at creation time — store it immediately. If it's lost, revoke the credential and create a new one; there's no way to retrieve it again.
- **Prefer refresh over the client secret when you have it.** If `/token` returned a `refresh_token`, use `grant_type=refresh_token` to rotate access tokens without touching the stored `client_secret` again.
- **Tokens are bearer, not sessions.** There's no separate "login" call — holding a valid `access_token` is what authenticates every request to Upload, Jobs, and Policy.

## Endpoints

<table class="endpoint-index">
  <thead>
    <tr><th>Service</th><th>Docs</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="ep-name">List Credentials</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>clients/<wbr>{client_id}/<wbr>credentials</code></td>
      <td class="ep-doc"><a href="#list-credentials">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Create Credential</span><span class="ep-verb ep-verb--post">post</span><code>/<wbr>clients/<wbr>{client_id}/<wbr>credentials</code></td>
      <td class="ep-doc"><a href="#create-credential">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Revoke Credential</span><span class="ep-verb ep-verb--delete">delete</span><code>/<wbr>clients/<wbr>{client_id}/<wbr>credentials/<wbr>{credential_id}</code></td>
      <td class="ep-doc"><a href="#revoke-credential">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Register Federated Credential</span><span class="ep-verb ep-verb--post">post</span><code>/<wbr>clients/<wbr>{client_id}/<wbr>federated-credentials</code></td>
      <td class="ep-doc"><a href="#register-federated-credential">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get signing keys</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>jwks</code></td>
      <td class="ep-doc"><a href="#get-signing-keys">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get current user</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>me</code></td>
      <td class="ep-doc"><a href="#get-current-user">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">List service accounts</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>service-accounts</code></td>
      <td class="ep-doc"><a href="#list-service-accounts">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Create a service account</span><span class="ep-verb ep-verb--post">post</span><code>/<wbr>service-accounts</code></td>
      <td class="ep-doc"><a href="#create-a-service-account">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Export service accounts</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>service-accounts.csv</code></td>
      <td class="ep-doc"><a href="#export-service-accounts">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get Service Account</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>service-accounts/<wbr>{client_id}</code></td>
      <td class="ep-doc"><a href="#get-service-account">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Update a service account</span><span class="ep-verb ep-verb--patch">patch</span><code>/<wbr>service-accounts/<wbr>{client_id}</code></td>
      <td class="ep-doc"><a href="#update-a-service-account">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Delete Service Account</span><span class="ep-verb ep-verb--delete">delete</span><code>/<wbr>service-accounts/<wbr>{client_id}</code></td>
      <td class="ep-doc"><a href="#delete-service-account">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Issue an access token</span><span class="ep-verb ep-verb--post">post</span><code>/<wbr>token</code></td>
      <td class="ep-doc"><a href="#issue-an-access-token">View</a></td>
    </tr>
  </tbody>
</table>

## List Credentials

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>clients/<wbr>{client_id}/<wbr>credentials</code>

**Tags:** credentials

List all active credentials for a client (without secrets).

Args:
    client_id: Client identifier

Returns:
    List of credential metadata (excluding secrets)

### Path Parameters

- **client_id** `string` [path; required]
  Client identifier

### Header Parameters

- **authorization** `string | null` [header; optional]
- **x-admin-token** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `array<CredentialMetadata>`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://authenticate.opteryx.app" data-path="/clients/{client_id}/credentials" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/clients/{client_id}/credentials</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Path parameters</div>
      <div class="t-params">
        <div class="t-pname">client_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="client_id" placeholder="string">
      </div>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Create Credential

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/<wbr>clients/<wbr>{client_id}/<wbr>credentials</code>

**Tags:** credentials

Create a new client credential (PAT).

This creates a Personal Access Token (PAT) for machine-to-machine authentication.
The secret is shown only once and must be stored securely by the caller.

Callers may create credentials for their own client_id (authenticated via bearer
token) or, with an admin token, for any client_id.

Args:
    client_id: Client identifier
    request: Credential creation parameters

Returns:
    Credential metadata with plaintext secret (shown only once)

### Path Parameters

- **client_id** `string` [path; required]
  Client identifier

### Header Parameters

- **authorization** `string | null` [header; optional]
- **x-admin-token** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `CreateCredentialRequest`
  - **type** `string` [optional]
    Credential type: 'interactive', or a named identifier for a machine credential.
    Default: `interactive`
  - **expires_in_days** `integer | null` [optional]
    Lifetime of the credential in days. Pass null for a credential that never expires.
    Default: `90`
  - **scopes** `array<string>` [optional]
    Scopes to grant the credential. Empty grants the caller's default scopes.
  - **permissions** `array<array<string>>` [optional]
    Resource grants as [pattern, role] pairs, e.g. [['analytics.\*', 'reader']]. Roles are 'owner', 'admin', 'writer' or 'reader'.

### Responses

- **200** — Successful Response (`application/json` `CreateCredentialResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://authenticate.opteryx.app" data-path="/clients/{client_id}/credentials" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/clients/{client_id}/credentials</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Path parameters</div>
      <div class="t-params">
        <div class="t-pname">client_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="client_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · CreateCredentialRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "type": "interactive",
  "expires_in_days": 90,
  "scopes": [],
  "permissions": []
}</textarea>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Revoke Credential

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/<wbr>clients/<wbr>{client_id}/<wbr>credentials/<wbr>{credential_id}</code>

**Tags:** credentials

Revoke a credential by deleting it.

Covers both PATs and federated bindings - they are the same kind of record
on the same client, so one revocation path serves both.

Args:
    client_id: Client identifier
    credential_id: Credential ID to revoke

Returns:
    Success message

### Path Parameters

- **client_id** `string` [path; required]
  Client identifier
- **credential_id** `string` [path; required]
  Credential ID to revoke

### Header Parameters

- **authorization** `string | null` [header; optional]
- **x-admin-token** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://authenticate.opteryx.app" data-path="/clients/{client_id}/credentials/{credential_id}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/clients/{client_id}/credentials/{credential_id}</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Path parameters</div>
      <div class="t-params">
        <div class="t-pname">client_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="client_id" placeholder="string">
        <div class="t-pname">credential_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="credential_id" placeholder="string">
      </div>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Register Federated Credential

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/<wbr>clients/<wbr>{client_id}/<wbr>federated-credentials</code>

**Tags:** credentials

Register a workload as a credential-less credential.

A GitHub Actions workflow, or a GCP service account, can then exchange the
OIDC token its platform mints for it for an Opteryx access token at
`/token`, with no stored client secret anywhere in the loop. The token it
receives is the one the `client_credentials` grant issues for this same
`client_id` - same policies, same lifetime - so nothing downstream needs
to change.

The workload must request the audience this service expects. A GitHub
workflow additionally needs `permissions: id-token: write`.

Callers may register bindings for their own client_id (authenticated via
bearer token) or, with an admin token, for any client_id.

Args:
    client_id: Client the workload authenticates as
    request: Binding parameters

Returns:
    The registered binding (there is no secret to return)

### Path Parameters

- **client_id** `string` [path; required]
  Client identifier

### Header Parameters

- **authorization** `string | null` [header; optional]
- **x-admin-token** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `RegisterFederatedCredentialRequest`
  - **provider** `string` [optional]
    The OIDC provider the workload authenticates with: 'github' or 'google'.
    Default: `github`
  - **subject** `string` [required]
    The provider's immutable identifier for the workload. For 'github', the numeric repository id (the `repository_id` claim) - not `owner/name`. For 'google', the service account's numeric unique id (its `sub` claim) - not its email. Names are recycled after a rename, transfer, or a delete and recreate; these ids are not.
  - **label** `string | null` [optional]
    The readable name this id belongs to - `owner/name`, or the service account email. Recorded so a human reading the credential list can tell what it is; never used for matching.
  - **constraints** `object` [optional]
    Claims to pin exactly, narrowing the binding further. For 'github': `job_workflow_ref` (one workflow file on one ref), `ref`, `environment`. For 'google': `email`. Pinning a claim the provider does not issue is rejected rather than silently never matching.
  - **audience** `string | null` [optional]
    Optional audience this binding additionally requires, for a deployment that accepts more than one.
  - **expires_in_days** `integer | null` [optional]
    Lifetime of the binding in days (max 365). Defaults to null - no secret is stored, so there is nothing to rotate.
  - **scopes** `array<string>` [optional]
    Scopes to grant the binding. Empty grants the caller's default scopes.
  - **permissions** `array<array<string>>` [optional]
    Resource grants as [pattern, role] pairs, e.g. [['analytics.\*', 'reader']]. Roles are 'owner', 'admin', 'writer' or 'reader'.

### Responses

- **200** — Successful Response (`application/json` `RegisterFederatedCredentialResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://authenticate.opteryx.app" data-path="/clients/{client_id}/federated-credentials" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/clients/{client_id}/federated-credentials</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Path parameters</div>
      <div class="t-params">
        <div class="t-pname">client_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="client_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · RegisterFederatedCredentialRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "provider": "github",
  "subject": "",
  "label": "",
  "constraints": {},
  "audience": "",
  "expires_in_days": 0,
  "scopes": [],
  "permissions": []
}</textarea>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Get signing keys

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>jwks</code>

**Tags:** authentication

Returns the JSON Web Key Set used to verify access tokens issued by this service.

### Responses

- **200** — Successful Response (`application/json` `object`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://authenticate.opteryx.app" data-path="/jwks" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/jwks</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Get current user

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>me</code>

**Tags:** User

Validates the bearer token and returns the caller identity, billing account and token scope details.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://authenticate.opteryx.app" data-path="/me" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/me</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## List service accounts

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>service-accounts</code>

**Tags:** service accounts

Lists every service account on the caller's billing account - not just the ones the caller created. A service account belongs to the account that pays for it, so it stays visible and manageable when the person who made it moves on.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `array<ServiceAccountResponse>`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://authenticate.opteryx.app" data-path="/service-accounts" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/service-accounts</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Create a service account

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/<wbr>service-accounts</code>

**Tags:** service accounts

Creates a machine principal on the caller's billing account. Requires an active billing account; the service account is billed to it, belongs to it, and stays visible to its members after the creator leaves. The caller becomes the initial contact.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `CreateServiceAccountRequest`
  - **client_id** `string` [required]
    The name, which becomes the principal string policies are written against. Shares one namespace with every other account, so it is first-come and case-insensitive: 4-64 characters, starting with a letter, then letters, digits or underscores. Stored lowercase.
  - **description** `string | null` [optional]
    Free text, for your own benefit. Not used for anything.

### Responses

- **200** — Successful Response (`application/json` `ServiceAccountResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://authenticate.opteryx.app" data-path="/service-accounts" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/service-accounts</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · CreateServiceAccountRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "client_id": "",
  "description": ""
}</textarea>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Export service accounts

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>service-accounts.csv</code>

**Tags:** service accounts

CSV of every service account on the billing account and every credential attached to it - one row per credential, so an account with three tokens appears on three rows and one with none appears on a single row with the credential columns empty. For managing machine identities off-platform: rotation reviews, access reviews, and finding the bots nobody owns. billing_admin only.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — CSV export of service accounts and their credentials. (`application/json` `object`, `text/csv` `string`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://authenticate.opteryx.app" data-path="/service-accounts.csv" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/service-accounts.csv</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Get Service Account

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>service-accounts/<wbr>{client_id}</code>

**Tags:** service accounts

Fetch one service account the caller owns.

### Path Parameters

- **client_id** `string` [path; required]
  Service account identifier

### Header Parameters

- **authorization** `string | null` [header; optional]
- **x-admin-token** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `ServiceAccountResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://authenticate.opteryx.app" data-path="/service-accounts/{client_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/service-accounts/{client_id}</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Path parameters</div>
      <div class="t-params">
        <div class="t-pname">client_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="client_id" placeholder="string">
      </div>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Update a service account

**Request:** <span class="ep-verb ep-verb--patch">patch</span><code>/<wbr>service-accounts/<wbr>{client_id}</code>

**Tags:** service accounts

Update the description and/or contact. Open to any member of the billing account: neither field grants anything or changes what can authenticate, and requiring an admin to keep a contact current is how contacts go stale. A contact must be an active member of the same billing account.

### Path Parameters

- **client_id** `string` [path; required]
  Service account identifier

### Header Parameters

- **authorization** `string | null` [header; optional]
- **x-admin-token** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `UpdateServiceAccountRequest`
  - **description** `string | null` [optional]
    Free text. Send null to clear it.
  - **contact** `string | null` [optional]
    The identity to hold as contact. Must be an active member of the same billing account. Omit to leave unchanged.

### Responses

- **200** — Successful Response (`application/json` `ServiceAccountResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PATCH" data-base="https://authenticate.opteryx.app" data-path="/service-accounts/{client_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--patch">patch</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/service-accounts/{client_id}</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Path parameters</div>
      <div class="t-params">
        <div class="t-pname">client_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="client_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · UpdateServiceAccountRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "description": "",
  "contact": ""
}</textarea>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Delete Service Account

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/<wbr>service-accounts/<wbr>{client_id}</code>

**Tags:** service accounts

Delete a service account and every credential attached to it.

Its grants in the policy store are not touched - they are policy.opteryx's
records, written against a principal string, and this service does not get
to delete another service's data. Deleting the account does stop anything
authenticating as it, so the leftover grants apply to nobody; releasing the
name lets someone else take it, and a new account with the same name would
inherit them. Revoke the grants first if that matters.

### Path Parameters

- **client_id** `string` [path; required]
  Service account identifier

### Header Parameters

- **authorization** `string | null` [header; optional]
- **x-admin-token** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://authenticate.opteryx.app" data-path="/service-accounts/{client_id}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/service-accounts/{client_id}</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Path parameters</div>
      <div class="t-params">
        <div class="t-pname">client_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="client_id" placeholder="string">
      </div>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Issue an access token

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/<wbr>token</code>

**Tags:** authentication

Creates access tokens for client credentials or refresh-token exchanges used by customer integrations.

### Query Parameters

- **set_cookie** `boolean` [query; optional]
  Default: `false`

### Request Body

- **Content-Type:** `application/x-www-form-urlencoded`
  Schema: `Body_token_endpoint_token_post`
  - **grant_type** `string` [optional]
    Default: `client_credentials`
  - **client_id** `string` [optional]
  - **client_secret** `string` [optional]
  - **refresh_token** `string` [optional]
  - **subject_token** `string` [optional]
  - **subject_token_type** `string` [optional]
    Default: `urn:ietf:params:oauth:token-type:jwt`

### Responses

- **200** — Successful Response (`application/json` `TokenResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://authenticate.opteryx.app" data-path="/token" data-auth-docs="/docs/reference/api/authentication-api" data-body-type="form">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://authenticate.opteryx.app</span>/token</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Query parameters</div>
      <div class="t-params">
        <div class="t-pname">set_cookie<span>boolean · optional</span></div>
        <input type="text" class="t-query" data-name="set_cookie" value="false" placeholder="boolean">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Form body <span class="t-opt">application/x-www-form-urlencoded · Body_token_endpoint_token_post</span></div>
      <div class="t-params">
        <div class="t-pname">grant_type<span>string · optional</span></div>
        <input type="text" class="t-form" data-name="grant_type" value="client_credentials" autocomplete="off" placeholder="string">
        <div class="t-pname">client_id<span>string · optional</span></div>
        <input type="text" class="t-form" data-name="client_id" autocomplete="off" placeholder="string">
        <div class="t-pname">client_secret<span>string · optional</span></div>
        <input type="password" class="t-form" data-name="client_secret" data-secret="1" autocomplete="off" placeholder="string">
        <div class="t-pname">refresh_token<span>string · optional</span></div>
        <input type="password" class="t-form" data-name="refresh_token" data-secret="1" autocomplete="off" placeholder="string">
        <div class="t-pname">subject_token<span>string · optional</span></div>
        <input type="password" class="t-form" data-name="subject_token" data-secret="1" autocomplete="off" placeholder="string">
        <div class="t-pname">subject_token_type<span>string · optional</span></div>
        <input type="password" class="t-form" data-name="subject_token_type" data-secret="1" value="urn:ietf:params:oauth:token-type:jwt" autocomplete="off" placeholder="string">
      </div>
      <div class="t-hint">Secret fields are sent only to the API — copied cURL and Python snippets carry a placeholder, never the value.</div>
    </div>
    <div class="t-actions">
      <button type="button" class="t-btn t-send">Send request</button>
      <button type="button" class="t-btn t-curl">Copy as cURL</button>
      <button type="button" class="t-btn t-python">Copy as Python</button>
    </div>
  </div>
  <div class="t-resp">
    <div class="t-resp__bar">
      <span class="t-pill"></span>
      <span class="t-meta"></span>
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>
