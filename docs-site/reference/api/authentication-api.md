# Authentication API

Base URL: https://authenticate.opteryx.app

## Overview

Authentication, OAuth 2.0, OpenID Connect discovery, JWKS publication, and client credential management.

## Endpoints

Endpoint | Method | Summary
--- | --- | ---
`/clients/{client_id}/credentials` | `GET` | List Credentials
`/clients/{client_id}/credentials` | `POST` | Create Credential
`/clients/{client_id}/credentials/{credential_id}` | `DELETE` | Revoke Credential
`/jwks` | `GET` | Get signing keys
`/me` | `GET` | Get current user
`/token` | `POST` | Issue an access token

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
