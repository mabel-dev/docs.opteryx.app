# Authentication API

**Status:** Published

Base URL: https://authenticate.opteryx.app

## Overview

The Authentication service issues and validates JWTs, provides JWKS, and implements OAuth2 flows (client credentials, authorization code + PKCE, refresh tokens).

**Endpoints**

End Point            | GET | POST | PATCH | DELETE
-------------------- | --- | ---- | ----- | ------
`/health`            | Read Health | - | - | -
`/jwks`              | Read JWKS | - | - | -
`/token`             | - | Create Token | - | -
`/keys/ensure`       | - | Ensure Key | - | -
`/oauth/authorize`   | Read Authorization | - | - | -
`/oauth/token`       | - | Exchange Token | - | -
`/admin/*`           | Read Admin | Create Admin | Update Admin | Delete Admin

**Authentication flows**
- Client Credentials: `POST /token` with `grant_type=client_credentials` and `client_id`/`client_secret` (confidential clients).
- Authorization Code + PKCE: `GET /oauth/authorize` then `POST /oauth/token` exchanging the code with `code_verifier` for public clients.
- Refresh tokens: returned on authorization_code flows; refreshes performed via `POST /token` with `grant_type=refresh_token`.

## Get JWKS

**Request:** `[GET] /jwks`

Response: JSON Web Key Set containing public keys used to verify tokens.

## Create Token

**Request:** `[POST] /token`

Content-Type: application/x-www-form-urlencoded

Form parameters include `grant_type`, `client_id`, `client_secret` (confidential clients), `code_verifier` (PKCE), and `scope`.

Response: JSON with `access_token`, `token_type`, `expires_in`, optional `refresh_token` and `scope`.

## Security Notes
- Keys may be stored in GCP Secret Manager or filesystem fallback. Set `SECRET_STORE_BACKEND=gcp` to enforce Secret Manager.
- Rate limiting and CORS configurable via environment (`RATE_LIMITING`, `CORS_ORIGINS`).
- Use PKCE for public/browser clients; do not use `client_credentials` from browser code.

Example PKCE flow (high level): generate `code_verifier` and `code_challenge`, redirect to `GET /oauth/authorize`, exchange code at `POST /oauth/token` using `code_verifier`.
