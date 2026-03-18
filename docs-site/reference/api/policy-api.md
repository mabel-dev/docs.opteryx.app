# Policy API

**Status:** Published

Base URL: https://policy.opteryx.app

## Overview

Workspace policy listing, inspection, creation, updates, and deletion for access-control management.

Generated from `definitions/api-opteryx-policy.json`.

## Endpoints

Endpoint | Method | Summary
--- | --- | ---
`/health` | `GET` | Health check
`/v1/access/workspace/{workspace}` | `GET` | List workspace policies
`/v1/access/workspace/{workspace}/policies` | `POST` | Create policy
`/v1/access/workspace/{workspace}/policies/{policy_id}` | `GET` | Get policy details
`/v1/access/workspace/{workspace}/policies/{policy_id}` | `PUT` | Update policy
`/v1/access/workspace/{workspace}/policies/{policy_id}` | `DELETE` | Delete policy
`/v1/cost/{workspace}` | `GET` | Get cost policy
`/v1/cost/{workspace}` | `POST` | Create/update cost policy
`/v1/cost/{workspace}` | `DELETE` | Delete cost policy

## Health check

**Request:** `[GET] /health`

**Tags:** Health

Returns service health status.

### Responses

- **200** — Successful Response (`application/json` `object`)

## List workspace policies

**Request:** `[GET] /v1/access/workspace/{workspace}`

**Tags:** Access Control

Get all access policies for a workspace. Requires owner or admin access.

### Path Parameters

- **workspace** `string` [path; required]
  Workspace name

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `WorkspacePoliciesResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Create policy

**Request:** `[POST] /v1/access/workspace/{workspace}/policies`

**Tags:** Access Control

Create a new access policy for a user in the workspace.

### Path Parameters

- **workspace** `string` [path; required]
  Workspace name

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `CreatePolicyRequest`
  - **principal** `Principal` [required]
    User to grant access to
  - **role** `string` [required]
    Role to grant (e.g., 'owner', 'reader', 'writer')
  - **pattern** `string` [required]
    Resource pattern (e.g., 'analytics.*')

### Responses

- **201** — Successful Response (`application/json` `CreatePolicyResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Get policy details

**Request:** `[GET] /v1/access/workspace/{workspace}/policies/{policy_id}`

**Tags:** Access Control

Get detailed information about a specific policy.

### Path Parameters

- **workspace** `string` [path; required]
  Workspace name
- **policy_id** `string` [path; required]
  Policy ID

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `PolicyDetail`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Update policy

**Request:** `[PUT] /v1/access/workspace/{workspace}/policies/{policy_id}`

**Tags:** Access Control

Update an existing access policy.

### Path Parameters

- **workspace** `string` [path; required]
  Workspace name
- **policy_id** `string` [path; required]
  Policy ID

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `UpdatePolicyRequest`
  - **role** `string` [required]
    Updated role
  - **pattern** `string` [required]
    Updated resource pattern

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Delete policy

**Request:** `[DELETE] /v1/access/workspace/{workspace}/policies/{policy_id}`

**Tags:** Access Control

Remove an access policy from the workspace.

### Path Parameters

- **workspace** `string` [path; required]
  Workspace name
- **policy_id** `string` [path; required]
  Policy ID

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Get cost policy

**Request:** `[GET] /v1/cost/{workspace}`

**Tags:** Cost Control

Retrieve the cost policy for a workspace.

### Path Parameters

- **workspace** `string` [path; required]
  Workspace name

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `CostPolicyRequest`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Create/update cost policy

**Request:** `[POST] /v1/cost/{workspace}`

**Tags:** Cost Control

Create or update the cost policy for a workspace.

### Path Parameters

- **workspace** `string` [path; required]
  Workspace name

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `CostPolicyRequest`
  - **collection** `string` [required]
    Collection the policy applies to
  - **budget_limit** `number` [required]
    Budget limit for the collection
  - **window** `string` [required]
    Time window for the budget (e.g., calendar_month)
  - **violation_action** `string` [required]
    Action to take on violation (e.g., block)
  - **warn_at** `array<integer>` [required]
    Warning thresholds as percentages

### Responses

- **201** — Successful Response (`application/json` `PolicyStoredResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Delete cost policy

**Request:** `[DELETE] /v1/cost/{workspace}`

**Tags:** Cost Control

Delete the cost policy for a workspace.

### Path Parameters

- **workspace** `string` [path; required]
  Workspace name

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `PolicyStoredResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)
