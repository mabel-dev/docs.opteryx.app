# Policy API

Base URL: https://policy.opteryx.app

## Overview

Workspace policy listing, inspection, creation, updates, and deletion for access-control management.

## Endpoints

<table class="endpoint-index">
  <thead>
    <tr><th>Service</th><th>Docs</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="ep-name">List workspace policies</span><span class="ep-verb ep-verb--get">get</span><code>/v1/access/workspace/{workspace}</code></td>
      <td class="ep-doc"><a href="#list-workspace-policies">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Export effective permissions</span><span class="ep-verb ep-verb--get">get</span><code>/v1/access/workspace/{workspace}/effective-permissions.csv</code></td>
      <td class="ep-doc"><a href="#export-effective-permissions">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Create policy</span><span class="ep-verb ep-verb--post">post</span><code>/v1/access/workspace/{workspace}/policies</code></td>
      <td class="ep-doc"><a href="#create-policy">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get policy details</span><span class="ep-verb ep-verb--get">get</span><code>/v1/access/workspace/{workspace}/policies/{policy_id}</code></td>
      <td class="ep-doc"><a href="#get-policy-details">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Update policy</span><span class="ep-verb ep-verb--put">put</span><code>/v1/access/workspace/{workspace}/policies/{policy_id}</code></td>
      <td class="ep-doc"><a href="#update-policy">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Delete policy</span><span class="ep-verb ep-verb--delete">delete</span><code>/v1/access/workspace/{workspace}/policies/{policy_id}</code></td>
      <td class="ep-doc"><a href="#delete-policy">View</a></td>
    </tr>
  </tbody>
</table>

## List workspace policies

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/access/workspace/{workspace}</code>

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
    <span class="t-url"><span class="t-host">https://policy.opteryx.app</span>/v1/access/workspace/{workspace}</span>
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
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Export effective permissions

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/access/workspace/{workspace}/effective-permissions.csv</code>

**Tags:** Access Control

Export a CSV of who has access to every dataset and view in the workspace, resolving each policy's pattern against the workspace's actual catalog. A policy scoped to a wildcard pattern appears on one row per dataset it covers, so the same policy_id can repeat across many rows. Owner-only: this is a full map of who can reach every resource in the workspace, not a single grant.

### Path Parameters

- **workspace** `string` [path; required]
  Workspace name

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — CSV export of effective permissions. (`application/json` `object`, `text/csv` `string`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://policy.opteryx.app" data-path="/v1/access/workspace/{workspace}/effective-permissions.csv" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://policy.opteryx.app</span>/v1/access/workspace/{workspace}/effective-permissions.csv</span>
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
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Create policy

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/access/workspace/{workspace}/policies</code>

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
    Role to grant: `owner`, `admin`, `writer`, or `reader`. See [Security & Permissions](/docs/core-concepts/access-and-permissions) for what each role can do.
  - **pattern** `string` [required]
    Resource pattern (e.g., 'analytics.*')

### Responses

- **201** — Successful Response (`application/json` `CreatePolicyResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://policy.opteryx.app" data-path="/v1/access/workspace/{workspace}/policies" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://policy.opteryx.app</span>/v1/access/workspace/{workspace}/policies</span>
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
  "principal": {},
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
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Get policy details

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/access/workspace/{workspace}/policies/{policy_id}</code>

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
    <span class="t-url"><span class="t-host">https://policy.opteryx.app</span>/v1/access/workspace/{workspace}/policies/{policy_id}</span>
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
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Update policy

**Request:** <span class="ep-verb ep-verb--put">put</span><code>/v1/access/workspace/{workspace}/policies/{policy_id}</code>

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
    <span class="t-url"><span class="t-host">https://policy.opteryx.app</span>/v1/access/workspace/{workspace}/policies/{policy_id}</span>
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
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Delete policy

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/v1/access/workspace/{workspace}/policies/{policy_id}</code>

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
    <span class="t-url"><span class="t-host">https://policy.opteryx.app</span>/v1/access/workspace/{workspace}/policies/{policy_id}</span>
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
      <button type="button" class="t-btn t-copy-resp" hidden>Copy</button>
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>
