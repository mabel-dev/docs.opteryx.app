# Authentication API

Base URL: https://authenticate.opteryx.app

## Overview

Authentication, OAuth 2.0, OpenID Connect discovery, JWKS publication, and client credential management.

## Endpoints

Endpoint | Method | Summary
--- | --- | ---
`/clients/{client_id}/credentials` | `GET` | [List Credentials](#list-credentials)
`/clients/{client_id}/credentials` | `POST` | [Create Credential](#create-credential)
`/clients/{client_id}/credentials/{credential_id}` | `DELETE` | [Revoke Credential](#revoke-credential)
`/jwks` | `GET` | [Get signing keys](#get-signing-keys)
`/me` | `GET` | [Get current user](#get-current-user)
`/token` | `POST` | [Issue an access token](#issue-an-access-token)

## List Credentials

**Request:** `[GET] /clients/{client_id}/credentials`

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

**Request:** `[POST] /clients/{client_id}/credentials`

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

**Request:** `[DELETE] /clients/{client_id}/credentials/{credential_id}`

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

**Request:** `[GET] /jwks`

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

**Request:** `[GET] /me`

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

**Request:** `[POST] /token`

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
