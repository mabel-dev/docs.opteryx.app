
# Authorization API

**Status:** Published

Base URL: https://authorize.opteryx.app

## Overview

Provides authorization decisions and lists resources accessible to a principal. Designed to answer "can this principal perform this action on these resources?" and "what resources can this principal act on?".

**Endpoints**

End Point | GET | POST | PATCH | DELETE
--- | --- | --- | --- | ---
`/v1/evaluate` | - | Evaluate Authorization | - | -
`/v1/resources` | - | Get Accessible Resources | - | -
`/v1/health` | Health Check | - | - | -
`/auth/ping` | Ping | - | - | -

## Evaluate Authorization

**Request:** `[POST] /v1/evaluate`

Request JSON: `{ "principal": {"identity":"justin"} | "me", "action": "read", "resources": ["workspace.collection.table"] }`

Response: `{ "decision": "allow"|"deny", "results": [{"resource":"...","predicate":"...","policy":null|"id"}] }`

## Get Accessible Resources

**Request:** `[POST] /v1/resources`

Request JSON: `{ "principal": {...}|"me", "action": "read" }`

Response: `{ "resources": [{"resource":"...","type":"table|view|collection|workspace","role":"owner|admin|writer|reader","visibility":"full|limited","policy":"id|null"}] }`

## Notes
- Protected endpoints require a Bearer JWT. Admin entitlement `urn:opteryx:entitlement:user_admin` permits querying on behalf of other principals.
- Response `policy` fields may contain fixed identifiers (e.g., `always-allow-all-public`) or document IDs for membership policies.
