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
      <td><span class="ep-name">List Credentials</span><span class="ep-verb ep-verb--get">get</span><code>/clients/{client_id}/credentials</code></td>
      <td class="ep-doc"><a href="#list-credentials">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Create Credential</span><span class="ep-verb ep-verb--post">post</span><code>/clients/{client_id}/credentials</code></td>
      <td class="ep-doc"><a href="#create-credential">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Revoke Credential</span><span class="ep-verb ep-verb--delete">delete</span><code>/clients/{client_id}/credentials/{credential_id}</code></td>
      <td class="ep-doc"><a href="#revoke-credential">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get signing keys</span><span class="ep-verb ep-verb--get">get</span><code>/jwks</code></td>
      <td class="ep-doc"><a href="#get-signing-keys">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get current user</span><span class="ep-verb ep-verb--get">get</span><code>/me</code></td>
      <td class="ep-doc"><a href="#get-current-user">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Issue an access token</span><span class="ep-verb ep-verb--post">post</span><code>/token</code></td>
      <td class="ep-doc"><a href="#issue-an-access-token">View</a></td>
    </tr>
  </tbody>
</table>

## List Credentials

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/clients/{client_id}/credentials</code>

**Tags:** credentials

List all active credentials for a client (without secrets).

Args:
    client_id: Client identifier

Returns:
    List of credential metadata (excluding secrets)

### Path Parameters

- **client_id** `string` [path; required]
  Client identifier

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

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/clients/{client_id}/credentials</code>

**Tags:** credentials

Create a new client credential (PAT).

This creates a Personal Access Token (PAT) for machine-to-machine authentication.
The secret is shown only once and must be stored securely by the caller.

Args:
    client_id: Client identifier
    request: Credential creation parameters

Returns:
    Credential metadata with plaintext secret (shown only once)

### Path Parameters

- **client_id** `string` [path; required]
  Client identifier

### Request Body

- **Content-Type:** `application/json`
  Schema: `CreateCredentialRequest`
  - **type** `string` [optional]
    Default: `interactive`
  - **expires_in_days** `integer` [optional]
    Default: `90`
  - **scopes** `array<string>` [optional]
    Default: `[]`
  - **permissions** `array<array<string>>` [optional]
    Default: `[]`

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

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/clients/{client_id}/credentials/{credential_id}</code>

**Tags:** credentials

Revoke a credential by deleting it.

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

## Get signing keys

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/jwks</code>

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

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/me</code>

Validates the bearer token and returns the caller identity and token scope details.

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

## Issue an access token

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/token</code>

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
