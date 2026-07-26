# Policy API

Base URL: https://policy.opteryx.app

## Overview

Workspace policy listing, inspection, creation, updates, and deletion for access-control management.

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

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://policy.opteryx.app" data-path="/health" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"></span>
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

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

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://policy.opteryx.app" data-path="/v1/access/workspace/{workspace}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"></span>
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
        <div class="t-pname">workspace<span>string · required</span></div>
        <input type="text" class="t-path" data-name="workspace" placeholder="string">
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

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

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://policy.opteryx.app" data-path="/v1/access/workspace/{workspace}/policies" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"></span>
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
        <div class="t-pname">workspace<span>string · required</span></div>
        <input type="text" class="t-path" data-name="workspace" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · CreatePolicyRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "principal": null,
  "role": "",
  "pattern": ""
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

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

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://policy.opteryx.app" data-path="/v1/access/workspace/{workspace}/policies/{policy_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"></span>
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
        <div class="t-pname">workspace<span>string · required</span></div>
        <input type="text" class="t-path" data-name="workspace" placeholder="string">
        <div class="t-pname">policy_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="policy_id" placeholder="string">
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

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

### Try it live

<details class="api-tryit" data-method="PUT" data-base="https://policy.opteryx.app" data-path="/v1/access/workspace/{workspace}/policies/{policy_id}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--put">put</span>
    <span class="t-url"></span>
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
        <div class="t-pname">workspace<span>string · required</span></div>
        <input type="text" class="t-path" data-name="workspace" placeholder="string">
        <div class="t-pname">policy_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="policy_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · UpdatePolicyRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "role": "",
  "pattern": ""
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

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

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://policy.opteryx.app" data-path="/v1/access/workspace/{workspace}/policies/{policy_id}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"></span>
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
        <div class="t-pname">workspace<span>string · required</span></div>
        <input type="text" class="t-path" data-name="workspace" placeholder="string">
        <div class="t-pname">policy_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="policy_id" placeholder="string">
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

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

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://policy.opteryx.app" data-path="/v1/cost/{workspace}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"></span>
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
        <div class="t-pname">workspace<span>string · required</span></div>
        <input type="text" class="t-path" data-name="workspace" placeholder="string">
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

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

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://policy.opteryx.app" data-path="/v1/cost/{workspace}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"></span>
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
        <div class="t-pname">workspace<span>string · required</span></div>
        <input type="text" class="t-path" data-name="workspace" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · CostPolicyRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "collection": "",
  "budget_limit": null,
  "window": "",
  "violation_action": "",
  "warn_at": null
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

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

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://policy.opteryx.app" data-path="/v1/cost/{workspace}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"></span>
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
        <div class="t-pname">workspace<span>string · required</span></div>
        <input type="text" class="t-path" data-name="workspace" placeholder="string">
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>
