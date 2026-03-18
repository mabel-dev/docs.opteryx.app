# Authentication API

Base URL: https://authenticate.opteryx.app

## Overview

Authentication, OAuth 2.0, OpenID Connect discovery, JWKS publication, and client credential management.

## Endpoints

Endpoint | Method | Summary
--- | --- | ---
`/.well-known/oauth-authorization-server` | `GET` | OAuth discovery document
`/.well-known/openid-configuration` | `GET` | OpenID Connect discovery document
`/auth/github/authorize` | `GET` | Start GitHub sign-in
`/auth/google/authorize` | `GET` | Start Google sign-in
`/auth/microsoft/authorize` | `GET` | Start Microsoft sign-in
`/clients/{client_id}/credentials` | `GET` | List Credentials
`/clients/{client_id}/credentials` | `POST` | Create Credential
`/clients/{client_id}/credentials/{credential_id}` | `DELETE` | Revoke Credential
`/health` | `GET` | Health check
`/jwks` | `GET` | Get signing keys
`/me` | `GET` | Get current user
`/oauth/authorize` | `GET` | Start OAuth authorization
`/oauth/introspect` | `POST` | Introspect a token
`/oauth/revoke` | `POST` | Revoke a token
`/oauth/token` | `POST` | Exchange OAuth tokens
`/oauth/userinfo` | `GET` | Get user profile claims
`/token` | `POST` | Issue an access token

## OAuth discovery document

**Request:** `[GET] /.well-known/oauth-authorization-server`

Returns machine-readable metadata describing the OAuth 2.0 endpoints supported by this service.

### Responses

- **200** — Successful Response (`application/json` `object`)

## OpenID Connect discovery document

**Request:** `[GET] /.well-known/openid-configuration`

Returns machine-readable metadata describing the OpenID Connect endpoints and capabilities of this service.

### Responses

- **200** — Successful Response (`application/json` `object`)

## Start GitHub sign-in

**Request:** `[GET] /auth/github/authorize`

Redirects the user to GitHub so they can authenticate with their GitHub identity.

### Responses

- **200** — Successful Response (`application/json` `object`)

## Start Google sign-in

**Request:** `[GET] /auth/google/authorize`

Redirects the user to Google so they can sign in and authorize the Opteryx authentication flow.

### Responses

- **200** — Successful Response (`application/json` `object`)

## Start Microsoft sign-in

**Request:** `[GET] /auth/microsoft/authorize`

Redirects the user to Microsoft Entra ID so they can authenticate with their Microsoft account.

### Query Parameters

- **redirect_uri** `string | null` [query; optional]

### Responses

- **307** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

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
  - **expires_in_days** `integer` [optional]
  - **scopes** `array<string>` [optional]
  - **permissions** `array<array<string>>` [optional]

### Responses

- **200** — Successful Response (`application/json` `CreateCredentialResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

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

## Health check

**Request:** `[GET] /health`

**Tags:** service

Returns a simple service status payload so monitoring systems can confirm the API is reachable.

### Responses

- **200** — Successful Response (`application/json` `object`)

## Get signing keys

**Request:** `[GET] /jwks`

**Tags:** authentication

Returns the JSON Web Key Set used to verify access tokens issued by this service.

### Responses

- **200** — Successful Response (`application/json` `object`)

## Get current user

**Request:** `[GET] /me`

Validates the bearer token and returns the caller identity and token scope details.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Start OAuth authorization

**Request:** `[GET] /oauth/authorize`

Validates the client redirect URI and creates a short-lived authorization code for PKCE-based sign-in flows.

### Query Parameters

- **response_type** `string` [query; required]
- **client_id** `string` [query; required]
- **redirect_uri** `string` [query; required]
- **scope** `string | null` [query; optional]
- **state** `string | null` [query; optional]
- **code_challenge** `string | null` [query; optional]
- **code_challenge_method** `string | null` [query; optional]
- **nonce** `string | null` [query; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Introspect a token

**Request:** `[POST] /oauth/introspect`

Returns whether a token is active and, when valid, exposes a small set of standard claims.

### Request Body

- **Content-Type:** `application/x-www-form-urlencoded`
  Schema: `Body_introspect_oauth_introspect_post`
  - **token** `string` [required]
  - **token_type_hint** `string | null` [optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Revoke a token

**Request:** `[POST] /oauth/revoke`

Revokes a refresh token and returns a success response compatible with OAuth token revocation semantics.

### Request Body

- **Content-Type:** `application/x-www-form-urlencoded`
  Schema: `Body_revoke_oauth_revoke_post`
  - **token** `string` [required]
  - **token_type_hint** `string | null` [optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Exchange OAuth tokens

**Request:** `[POST] /oauth/token`

Exchanges an authorization code or refresh token for a new access token in the OAuth 2.0 flow.

### Request Body

- **Content-Type:** `application/x-www-form-urlencoded`
  Schema: `Body_oauth_token_oauth_token_post`
  - **grant_type** `string` [required]
  - **code** `string | null` [optional]
  - **redirect_uri** `string | null` [optional]
  - **client_id** `string | null` [optional]
  - **client_secret** `string | null` [optional]
  - **refresh_token** `string | null` [optional]
  - **code_verifier** `string | null` [optional]
  - **scope** `string | null` [optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Get user profile claims

**Request:** `[GET] /oauth/userinfo`

Validates the bearer token and returns the basic OpenID Connect user claims for the authenticated caller.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Issue an access token

**Request:** `[POST] /token`

**Tags:** authentication

Creates access tokens for client credentials or refresh-token exchanges used by customer integrations.

### Query Parameters

- **set_cookie** `boolean` [query; optional]

### Request Body

- **Content-Type:** `application/x-www-form-urlencoded`
  Schema: `Body_token_endpoint_token_post`
  - **grant_type** `string` [optional]
  - **client_id** `string` [optional]
  - **client_secret** `string` [optional]
  - **refresh_token** `string` [optional]

### Responses

- **200** — Successful Response (`application/json` `TokenResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)
