<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Control API

Base URL: https://control.opteryx.app

## Overview

Billing accounts and membership, payment methods and invoices, workspace lifecycle and catalogs, the access policies that govern who can reach what, and the notification feed behind the Studio bell.

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
      <td><span class="ep-name">Bootstrap a new workspace&#x27;s initial policies</span><span class="ep-verb ep-verb--post">post</span><code>/v1/access/workspace/{workspace}/genesis</code></td>
      <td class="ep-doc"><a href="#bootstrap-a-new-workspaces-initial-policies">View</a></td>
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
    <tr>
      <td><span class="ep-name">List Accounts</span><span class="ep-verb ep-verb--get">get</span><code>/v1/accounts</code></td>
      <td class="ep-doc"><a href="#list-accounts">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Create Account</span><span class="ep-verb ep-verb--post">post</span><code>/v1/accounts</code></td>
      <td class="ep-doc"><a href="#create-account">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get Account</span><span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}</code></td>
      <td class="ep-doc"><a href="#get-account">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Update Account</span><span class="ep-verb ep-verb--patch">patch</span><code>/v1/accounts/{account_id}</code></td>
      <td class="ep-doc"><a href="#update-account">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Delete Account</span><span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}</code></td>
      <td class="ep-doc"><a href="#delete-account">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">List Domains</span><span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/domains</code></td>
      <td class="ep-doc"><a href="#list-domains">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Claim Domain</span><span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/domains</code></td>
      <td class="ep-doc"><a href="#claim-domain">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Release Domain</span><span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}/domains/{domain}</code></td>
      <td class="ep-doc"><a href="#release-domain">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Verify Domain</span><span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/domains/{domain}/verify</code></td>
      <td class="ep-doc"><a href="#verify-domain">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get Idp Policy</span><span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/idp-policy</code></td>
      <td class="ep-doc"><a href="#get-idp-policy">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Put Idp Policy</span><span class="ep-verb ep-verb--put">put</span><code>/v1/accounts/{account_id}/idp-policy</code></td>
      <td class="ep-doc"><a href="#put-idp-policy">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Delete Idp Policy</span><span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}/idp-policy</code></td>
      <td class="ep-doc"><a href="#delete-idp-policy">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">List Denials</span><span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/idp-policy/denials</code></td>
      <td class="ep-doc"><a href="#list-denials">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Preview Idp Policy</span><span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/idp-policy/preview</code></td>
      <td class="ep-doc"><a href="#preview-idp-policy">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">List Members</span><span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/members</code></td>
      <td class="ep-doc"><a href="#list-members">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Invite Member</span><span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/members</code></td>
      <td class="ep-doc"><a href="#invite-member">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Update Member Role</span><span class="ep-verb ep-verb--patch">patch</span><code>/v1/accounts/{account_id}/members/{identity}</code></td>
      <td class="ep-doc"><a href="#update-member-role">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Remove Member</span><span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}/members/{identity}</code></td>
      <td class="ep-doc"><a href="#remove-member">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Accept Invite</span><span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/members/{identity}/accept</code></td>
      <td class="ep-doc"><a href="#accept-invite">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get Payment Method</span><span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/payment-methods</code></td>
      <td class="ep-doc"><a href="#get-payment-method">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Attach Payment Method</span><span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/payment-methods</code></td>
      <td class="ep-doc"><a href="#attach-payment-method">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Detach Payment Method</span><span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}/payment-methods</code></td>
      <td class="ep-doc"><a href="#detach-payment-method">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Create Payment</span><span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/payments</code></td>
      <td class="ep-doc"><a href="#create-payment">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">List Service Accounts</span><span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/service-accounts</code></td>
      <td class="ep-doc"><a href="#list-service-accounts">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Add Service Account</span><span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/service-accounts</code></td>
      <td class="ep-doc"><a href="#add-service-account">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Remove Service Account</span><span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}/service-accounts/{identity}</code></td>
      <td class="ep-doc"><a href="#remove-service-account">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">List Account Workspaces</span><span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/workspaces</code></td>
      <td class="ep-doc"><a href="#list-account-workspaces">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Test Draft Catalog Connection</span><span class="ep-verb ep-verb--post">post</span><code>/v1/catalog-connections/test</code></td>
      <td class="ep-doc"><a href="#test-draft-catalog-connection">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get Catalog Kinds</span><span class="ep-verb ep-verb--get">get</span><code>/v1/catalog-kinds</code></td>
      <td class="ep-doc"><a href="#get-catalog-kinds">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">List Invoices</span><span class="ep-verb ep-verb--get">get</span><code>/v1/invoices</code></td>
      <td class="ep-doc"><a href="#list-invoices">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get Invoice</span><span class="ep-verb ep-verb--get">get</span><code>/v1/invoices/{invoice_id}</code></td>
      <td class="ep-doc"><a href="#get-invoice">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">List notifications</span><span class="ep-verb ep-verb--get">get</span><code>/v1/notifications</code></td>
      <td class="ep-doc"><a href="#list-notifications">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Mark all notifications read</span><span class="ep-verb ep-verb--post">post</span><code>/v1/notifications/read-all</code></td>
      <td class="ep-doc"><a href="#mark-all-notifications-read">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Dismiss a notification</span><span class="ep-verb ep-verb--post">post</span><code>/v1/notifications/{notification_id}/dismiss</code></td>
      <td class="ep-doc"><a href="#dismiss-a-notification">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Mark a notification read</span><span class="ep-verb ep-verb--post">post</span><code>/v1/notifications/{notification_id}/read</code></td>
      <td class="ep-doc"><a href="#mark-a-notification-read">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Create Workspace</span><span class="ep-verb ep-verb--put">put</span><code>/v1/workspaces/{name}</code></td>
      <td class="ep-doc"><a href="#create-workspace">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get Catalog Binding</span><span class="ep-verb ep-verb--get">get</span><code>/v1/workspaces/{name}/catalog</code></td>
      <td class="ep-doc"><a href="#get-catalog-binding">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Put Catalog Binding</span><span class="ep-verb ep-verb--put">put</span><code>/v1/workspaces/{name}/catalog</code></td>
      <td class="ep-doc"><a href="#put-catalog-binding">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Delete Catalog Binding</span><span class="ep-verb ep-verb--delete">delete</span><code>/v1/workspaces/{name}/catalog</code></td>
      <td class="ep-doc"><a href="#delete-catalog-binding">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Sync Catalog Dataset List</span><span class="ep-verb ep-verb--post">post</span><code>/v1/workspaces/{name}/catalog/sync</code></td>
      <td class="ep-doc"><a href="#sync-catalog-dataset-list">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Test Saved Catalog Connection</span><span class="ep-verb ep-verb--post">post</span><code>/v1/workspaces/{name}/catalog/test</code></td>
      <td class="ep-doc"><a href="#test-saved-catalog-connection">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get Workspace Guard Properties</span><span class="ep-verb ep-verb--get">get</span><code>/v1/workspaces/{name}/properties</code></td>
      <td class="ep-doc"><a href="#get-workspace-guard-properties">View</a></td>
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

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/access/workspace/{workspace}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/access/workspace/{workspace}</span>
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

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/access/workspace/{workspace}/effective-permissions.csv" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/access/workspace/{workspace}/effective-permissions.csv</span>
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

## Bootstrap a new workspace's initial policies

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/access/workspace/{workspace}/genesis</code>

**Tags:** Access Control

Create the initial set of access policies for a brand-new workspace, one policy per {identity, role} pair, each scoped to the whole workspace (pattern `{workspace}.*`). This is a trusted bootstrap operation for whatever creates the workspace record in the first place (e.g. billing.opteryx's workspace-create endpoint) to hand it an explicit member list at creation time, rather than every caller becoming sole owner. Refuses with 409 if the workspace already has any policy at all -- this can only be used once, to bootstrap a workspace that doesn't have policies yet, not to add owners to one that already does.

### Path Parameters

- **workspace** `string` [path; required]
  Workspace name

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `GenesisGrantRequest`
  - **grants** `array<GenesisGrant>` [required]
    Identity/role pairs to grant over the whole workspace

### Responses

- **201** — Successful Response (`application/json` `GenesisGrantResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/access/workspace/{workspace}/genesis" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/access/workspace/{workspace}/genesis</span>
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
      <div class="t-label">Request body <span class="t-opt">application/json · GenesisGrantRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "grants": []
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
    Role to grant. See [Security & Permissions](/docs/core-concepts/access-and-permissions) for what each role can do.
    Allowed values: `owner`, `admin`, `writer`, `reader`
  - **pattern** `string` [required]
    Resource pattern (e.g., 'analytics.*')

### Responses

- **201** — Successful Response (`application/json` `CreatePolicyResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/access/workspace/{workspace}/policies" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/access/workspace/{workspace}/policies</span>
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

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/access/workspace/{workspace}/policies/{policy_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/access/workspace/{workspace}/policies/{policy_id}</span>
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
    Updated role. See [Security & Permissions](/docs/core-concepts/access-and-permissions) for what each role can do.
    Allowed values: `owner`, `admin`, `writer`, `reader`
  - **pattern** `string` [required]
    Updated resource pattern

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PUT" data-base="https://control.opteryx.app" data-path="/v1/access/workspace/{workspace}/policies/{policy_id}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--put">put</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/access/workspace/{workspace}/policies/{policy_id}</span>
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

<details class="api-tryit" data-method="DELETE" data-base="https://control.opteryx.app" data-path="/v1/access/workspace/{workspace}/policies/{policy_id}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/access/workspace/{workspace}/policies/{policy_id}</span>
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

## List Accounts

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts</code>

**Tags:** Accounts

List accounts the caller is an active member of.

Membership is exclusive (`find_existing_membership`), so this returns at
most one row in practice - still a list per the design doc's shape, not
collapsed to a single object.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `array<object>`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/accounts" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts</span>
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

## Create Account

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/accounts</code>

**Tags:** Accounts

Create a billing account. The caller becomes its first `billing_admin`
immediately as an active member (not a pending invite) - see
`new_genesis_member_doc`'s docstring for why.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `AccountCreateRequest`
  - **name** `string` [required]
  - **tax_id** `string | null` [optional]
  - **address** `object | null` [optional]

### Responses

- **201** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/accounts" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · AccountCreateRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "name": "",
  "tax_id": "",
  "address": {}
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

## Get Account

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}</code>

**Tags:** Accounts

Read. Only visible to active members of the account - an account's
name/tax_id/address are not public to any authenticated caller who
happens to know or guess an account id.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
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

## Update Account

**Request:** <span class="ep-verb ep-verb--patch">patch</span><code>/v1/accounts/{account_id}</code>

**Tags:** Accounts

Partial update: name, tax_id, address, member_min_age_ms. Only
billing_admins of the account may update it.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `AccountUpdateRequest`
  - **name** `string | null` [optional]
  - **tax_id** `string | null` [optional]
  - **address** `object | null` [optional]
  - **member_min_age_ms** `integer | null` [optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PATCH" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--patch">patch</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · AccountUpdateRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "name": "",
  "tax_id": "",
  "address": {},
  "member_min_age_ms": 0
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

## Delete Account

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}</code>

**Tags:** Accounts

Soft-delete: `status: deactivated`. Only billing_admins may call this.

409 if any workspace still references this account. On success, cascades
to delete every member subdocument - no "deactivated but still has
members" state should exist afterward.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
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

## List Domains

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/domains</code>

**Tags:** Domains

List claimed domains and their verification state.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/domains" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/domains</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
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

## Claim Domain

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/domains</code>

**Tags:** Domains

Claim a domain, returning the TXT record to publish.

Idempotent: re-claiming a domain this account already holds returns the
same token and leaves any existing verification intact, rather than
resetting it. Claiming a domain another account has *verified* is a 409 -
an unverified claim elsewhere is not an obstacle, since it proves nothing.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `DomainClaimRequest`
  - **domain** `string` [required]

### Responses

- **201** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/domains" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/domains</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · DomainClaimRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "domain": ""
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

## Release Domain

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}/domains/{domain}</code>

**Tags:** Domains

Release a claimed domain.

Note this can widen who may sign up - a domain that was routing new
`@customer.com` users into this account stops doing so - which is why it
is billing_admin-only and audited.

### Path Parameters

- **account_id** `string` [path; required]
- **domain** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/domains/{domain}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/domains/{domain}</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
        <div class="t-pname">domain<span>string · required</span></div>
        <input type="text" class="t-path" data-name="domain" placeholder="string">
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

## Verify Domain

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/domains/{domain}/verify</code>

**Tags:** Domains

Check DNS for the expected TXT record and mark the domain verified.

A DNS failure and a missing record are reported differently on purpose:
"we could not resolve this" is an operator's cue to wait and retry, while
"we resolved it and the record is not there" is a cue to go and publish
it. Collapsing both into one message is how domain verification gets a
reputation for being flaky.

### Path Parameters

- **account_id** `string` [path; required]
- **domain** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/domains/{domain}/verify" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/domains/{domain}/verify</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
        <div class="t-pname">domain<span>string · required</span></div>
        <input type="text" class="t-path" data-name="domain" placeholder="string">
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

## Get Idp Policy

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/idp-policy</code>

**Tags:** IDP Policy

Read the account's sign-in requirements.

Any active member may read: knowing the rules you must satisfy to sign in
is not privileged, and hiding them from members only produces support
tickets. Changing them is billing_admin-only.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/idp-policy" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/idp-policy</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
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

## Put Idp Policy

**Request:** <span class="ep-verb ep-verb--put">put</span><code>/v1/accounts/{account_id}/idp-policy</code>

**Tags:** IDP Policy

Replace the account's sign-in requirements.

Whole-document replace, not a patch: a policy that refuses sign-ins should
be read in full at the point of change, not assembled from a diff against
something the operator may not have looked at.

`version` is bumped on every write. A refresh session issued under a lower
version is refused at mint and sent back through interactive sign-in, so
tightening a policy cannot be outlived by sessions that predate it.

### Path Parameters

- **account_id** `string` [path; required]

### Query Parameters

- **force** `boolean` [query; optional]
  Proceed even if this would deny your own sign-in
  Default: `false`

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `IdpPolicyRequest`
  - **enforced** `boolean` [optional]
    Default: `false`
  - **providers** `array<string>` [optional]
  - **microsoft** `MicrosoftPolicy` [optional]
  - **google** `GooglePolicy` [optional]
  - **allow_password_auth** `boolean` [optional]
    Default: `true`
  - **machine_credentials** `MachineCredentialsPolicy` [optional]
  - **require_mfa** `boolean` [optional]
    Default: `false`
  - **max_auth_age_hours** `integer | null` [optional]
  - **max_session_hours** `integer | null` [optional]
  - **email_domains** `array<string>` [optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PUT" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/idp-policy" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--put">put</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/idp-policy</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Query parameters</div>
      <div class="t-params">
        <div class="t-pname">force<span>boolean · optional</span></div>
        <input type="text" class="t-query" data-name="force" value="false" placeholder="boolean">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · IdpPolicyRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "enforced": false,
  "providers": [],
  "microsoft": {},
  "google": {},
  "allow_password_auth": true,
  "machine_credentials": {},
  "require_mfa": false,
  "max_auth_age_hours": 0,
  "max_session_hours": 0,
  "email_domains": []
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

## Delete Idp Policy

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}/idp-policy</code>

**Tags:** IDP Policy

Remove the account's sign-in requirements entirely.

Deliberately unguarded, unlike the write path: removing a restriction can
only widen who may sign in, so it cannot lock anybody out. It still needs
a fresh interactive session, because turning the control *off* is exactly
what an attacker holding a stale machine credential would want to do.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/idp-policy" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/idp-policy</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
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

## List Denials

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/idp-policy/denials</code>

**Tags:** IDP Policy

Recent sign-ins this account's policy refused.

Without this, a customer's admin cannot answer "why can't Bob sign in" and
every denial becomes a support request that needs someone to read our
logs. It is the endpoint most likely to be dropped for time and the one
that most determines whether the feature is operable.

Denials are emitted to the audit stream by authenticate.opteryx at mint
(`app/idp_policy.py::audit_decision`); this reads them back from the
account's `idp_denials` subcollection, which the log pipeline populates.
Returns an empty list rather than 404 when nothing has been recorded - "no
denials" is the normal, healthy state and must not read as an error.

### Path Parameters

- **account_id** `string` [path; required]

### Query Parameters

- **limit** `integer` [query; optional]
  Default: `50`

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/idp-policy/denials" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/idp-policy/denials</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Query parameters</div>
      <div class="t-params">
        <div class="t-pname">limit<span>integer · optional</span></div>
        <input type="text" class="t-query" data-name="limit" value="50" placeholder="integer">
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

## Preview Idp Policy

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/idp-policy/preview</code>

**Tags:** IDP Policy

Report who a candidate policy would admit, writing nothing.

This is what makes enabling a policy something other than a blind
lockout - an admin needs to see the three contractors who sign in with
Google *before* they hear about it from a support ticket. The UI calls
this on every change and blocks the save button on its result.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `IdpPolicyRequest`
  - **enforced** `boolean` [optional]
    Default: `false`
  - **providers** `array<string>` [optional]
  - **microsoft** `MicrosoftPolicy` [optional]
  - **google** `GooglePolicy` [optional]
  - **allow_password_auth** `boolean` [optional]
    Default: `true`
  - **machine_credentials** `MachineCredentialsPolicy` [optional]
  - **require_mfa** `boolean` [optional]
    Default: `false`
  - **max_auth_age_hours** `integer | null` [optional]
  - **max_session_hours** `integer | null` [optional]
  - **email_domains** `array<string>` [optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/idp-policy/preview" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/idp-policy/preview</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · IdpPolicyRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "enforced": false,
  "providers": [],
  "microsoft": {},
  "google": {},
  "allow_password_auth": true,
  "machine_credentials": {},
  "require_mfa": false,
  "max_auth_age_hours": 0,
  "max_session_hours": 0,
  "email_domains": []
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

## List Members

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/members</code>

**Tags:** Members

List members. Any active member of the account may list.

Expired pending rows (`now > invite_expires_at`) are filtered out of the
response and lazily deleted from Firestore when encountered - no
separate sweep job, per api-v2.md.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `array<object>`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/members" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/members</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
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

## Invite Member

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/members</code>

**Tags:** Members

Invite a new member. Only existing billing_admins of this account may invite.

409 if the invitee already has an active/pending membership on another
account (checked via the collection-group `find_existing_membership`
query). Re-inviting an identity that's still `pending` *on this same
account* resets the 7-day clock instead of erroring - a fresh
`new_member_doc` is written over the existing pending doc.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `InviteMemberRequest`
  - **identity** `string` [required]
  - **email** `string` [required]
  - **role** `string` [required]

### Responses

- **201** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/members" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/members</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · InviteMemberRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "identity": "",
  "email": "",
  "role": ""
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

## Update Member Role

**Request:** <span class="ep-verb ep-verb--patch">patch</span><code>/v1/accounts/{account_id}/members/{identity}</code>

**Tags:** Members

`{role: "billing_admin"|"member"}`. Only billing_admins may change roles.

### Path Parameters

- **account_id** `string` [path; required]
- **identity** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `UpdateMemberRoleRequest`
  - **role** `string` [required]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PATCH" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/members/{identity}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--patch">patch</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/members/{identity}</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
        <div class="t-pname">identity<span>string · required</span></div>
        <input type="text" class="t-path" data-name="identity" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · UpdateMemberRoleRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "role": ""
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

## Remove Member

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}/members/{identity}</code>

**Tags:** Members

Remove a member (also how an unaccepted invite gets withdrawn).

Only billing_admins may remove *other* members. Self-removal (an
identity removing itself, i.e. leaving the account) is allowed without
the billing_admin check - api-v2.md is silent on this specifically, but
it's a low-risk, clearly-reasonable capability (a member/admin should
always be able to leave their own account).

### Path Parameters

- **account_id** `string` [path; required]
- **identity** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/members/{identity}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/members/{identity}</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
        <div class="t-pname">identity<span>string · required</span></div>
        <input type="text" class="t-path" data-name="identity" placeholder="string">
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

## Accept Invite

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/members/{identity}/accept</code>

**Tags:** Members

Invitee (authenticated as `{identity}`) flips `pending` -> `active`.

Stamps `added_at`/`min_age_ms`/`eligible_at` at acceptance time -
`min_age_ms` is read fresh from the account doc *now*, not from
whatever was on the invite, per api-v2.md's "snapshot at accept time"
behavior. 410 if the invite has expired; 404 if there's no pending
invite for this identity on this account.

### Path Parameters

- **account_id** `string` [path; required]
- **identity** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/members/{identity}/accept" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/members/{identity}/accept</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
        <div class="t-pname">identity<span>string · required</span></div>
        <input type="text" class="t-path" data-name="identity" placeholder="string">
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

## Get Payment Method

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/payment-methods</code>

**Tags:** Payment Methods

Return the single attached payment method, or `null` if none is attached.

A bare `null` (rather than e.g. a 404) is used because "no payment
method attached" is a normal, expected state for this resource - not an
error - matching how `billing_account: null` is treated as a normal
free-tier state elsewhere in this design.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object | null`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/payment-methods" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/payment-methods</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
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

## Attach Payment Method

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/payment-methods</code>

**Tags:** Payment Methods

Attach a Stripe payment method, replacing whatever's already attached.

Verifies the token against Stripe's API before trusting it, then - if a
different payment method was already attached - detaches the old one on
Stripe's side so it isn't left orphaned there.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `AttachPaymentMethodRequest`
  - **stripe_payment_method_id** `string` [required]
  - **brand** `string` [required]
  - **last4** `string` [required]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/payment-methods" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/payment-methods</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · AttachPaymentMethodRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "stripe_payment_method_id": "",
  "brand": "",
  "last4": ""
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

## Detach Payment Method

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}/payment-methods</code>

**Tags:** Payment Methods

Detach the account's payment method, if any. Idempotent - detaching
when nothing is attached is a no-op 204, not an error.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **204** — Successful Response
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/payment-methods" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/payment-methods</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
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

## Create Payment

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/payments</code>

**Tags:** Payment Methods

Ad hoc charge against the account's attached payment method.

400 if no payment method is attached. A real `PaymentIntent` is created
and confirmed synchronously against the attached Stripe payment method
id - this moves real money, so this deliberately does not fake a
successful response; a Stripe failure surfaces as 402.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `CreatePaymentRequest`
  - **amount** `integer` [required]
  - **currency** `string` [optional]
    Default: `usd`
  - **description** `string | null` [optional]

### Responses

- **201** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/payments" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/payments</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · CreatePaymentRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "amount": 0,
  "currency": "usd",
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

## List Service Accounts

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/service-accounts</code>

**Tags:** Service Accounts

List the service accounts this billing account holds, and the quota.

Any active member may list. The quota rides along so a caller does not
have to know the plan table to render "3 of 5 used", and cannot drift from
what the add route actually enforces.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/service-accounts" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/service-accounts</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
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

## Add Service Account

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/accounts/{account_id}/service-accounts</code>

**Tags:** Service Accounts

Claim a service account seat on this billing account.

Any active member may add one, not only a billing_admin. It consumes
quota, which is a billing-relevant act - but it is also the ordinary way a
developer gives a CI job an identity, and routing every one of those
through a billing admin would make the feature unusable on exactly the
team accounts that pay for it. The row records who did it.

402, not 403, when the plan has no room: the caller is permitted, the plan
is what is refusing, and the difference is the whole point of the feature
being an unlock.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `AddServiceAccountRequest`
  - **identity** `string` [required]

### Responses

- **201** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/service-accounts" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/service-accounts</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · AddServiceAccountRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "identity": ""
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

## Remove Service Account

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/v1/accounts/{account_id}/service-accounts/{identity}</code>

**Tags:** Service Accounts

Release a service account's seat.

Called by authenticate.opteryx when the service account is deleted, and by
hand to detach one. Deliberately idempotent-ish: a missing row is a 404,
but removing a row for an identity that no longer exists elsewhere is
fine - this route does not go looking.

Any active member may remove one, matching who may add. Note this is NOT
reachable by the service account itself: `_require_active_member` refuses
a service_account row, so a machine identity cannot detach itself from the
bill it runs up.

### Path Parameters

- **account_id** `string` [path; required]
- **identity** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/service-accounts/{identity}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/service-accounts/{identity}</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
        <div class="t-pname">identity<span>string · required</span></div>
        <input type="text" class="t-path" data-name="identity" placeholder="string">
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

## List Account Workspaces

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/workspaces</code>

**Tags:** Workspaces

Manage-workspaces listing. Caller must be an active member of the
account (any role).

A genuine two-database read per workspace: this service's own
`workspaces/{name}` doc for `billing_account`/`members`, plus the
`catalogs` database's `$properties` doc (via an `OpteryxCatalog` handle)
for lock state and the two protection guards.

DROP WORKSPACE removes the catalog's `$properties` doc outright - it has
no reason to touch this service's own `workspaces/{name}` registration
doc (`billing_account`/`members` are this service's own concern, not the
catalog's) - so a row whose properties read comes back empty names a
workspace that no longer exists; it is skipped rather than listed.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `array<object>`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/accounts/{account_id}/workspaces" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/accounts/{account_id}/workspaces</span>
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
        <div class="t-pname">account_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="account_id" placeholder="string">
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

## Test Draft Catalog Connection

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/catalog-connections/test</code>

**Tags:** Workspace Catalog

Test a catalog that no workspace uses yet.

The primary test, because the catalog choice is permanent: a wrong address
or an unusable credential has to surface while it can still be corrected,
not at the first query against a workspace that can only be thrown away.

`ok: false` is a 200. The request succeeded; the CATALOG failed, and
squeezing that into an HTTP status makes the caller guess whether a 401
came from us or from them.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `CatalogTestRequest`
  - **kind** `string` [required]
  - **config** `object` [optional]
    Default: `{}`
  - **auth** `CatalogAuthRequest` [optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/catalog-connections/test" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/catalog-connections/test</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · CatalogTestRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "kind": "",
  "config": {},
  "auth": {}
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

## Get Catalog Kinds

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/catalog-kinds</code>

The kind descriptor and this deployment's capabilities.

Cached privately for five minutes with an ETag over the body: it is
per-deployment static, a create form fetches it before it can render, and
a capability that flips does so on a deploy, not mid-session.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/catalog-kinds" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/catalog-kinds</span>
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

## List Invoices

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/invoices</code>

**Tags:** Invoices

Placeholder: return an empty invoices list.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `array<object>`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/invoices" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/invoices</span>
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

## Get Invoice

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/invoices/{invoice_id}</code>

**Tags:** Invoices

Placeholder: return a minimal invoice representation.

### Path Parameters

- **invoice_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/invoices/{invoice_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/invoices/{invoice_id}</span>
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
        <div class="t-pname">invoice_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="invoice_id" placeholder="string">
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

## List notifications

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/notifications</code>

**Tags:** Notifications

The caller's own notification feed, newest first, with the unread count.

### Query Parameters

- **limit** `integer` [query; optional]
  Default: `50`

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/notifications" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/notifications</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Query parameters</div>
      <div class="t-params">
        <div class="t-pname">limit<span>integer · optional</span></div>
        <input type="text" class="t-query" data-name="limit" value="50" placeholder="integer">
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

## Mark all notifications read

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/notifications/read-all</code>

**Tags:** Notifications

Marks every unread notification in the caller's feed as read.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/notifications/read-all" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/notifications/read-all</span>
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

## Dismiss a notification

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/notifications/{notification_id}/dismiss</code>

**Tags:** Notifications

Removes one of the caller's own notifications from the feed.

### Path Parameters

- **notification_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/notifications/{notification_id}/dismiss" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/notifications/{notification_id}/dismiss</span>
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
        <div class="t-pname">notification_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="notification_id" placeholder="string">
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

## Mark a notification read

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/notifications/{notification_id}/read</code>

**Tags:** Notifications

Marks one of the caller's own notifications as read.

### Path Parameters

- **notification_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/notifications/{notification_id}/read" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/notifications/{notification_id}/read</span>
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
        <div class="t-pname">notification_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="notification_id" placeholder="string">
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

## Create Workspace

**Request:** <span class="ep-verb ep-verb--put">put</span><code>/v1/workspaces/{name}</code>

**Tags:** Workspaces

Idempotent create. Caller must be an active `billing_admin` on
`body.billing_account`.

A workspace exists in THREE places, and all three are written here, in a
deliberate order:

  1. `catalogs/{name}/$properties` - the catalog namespace, stamped with
     `billing-account-id`. This is what `opteryx_catalog` means by a
     workspace; without it every `CREATE TABLE` in the workspace fails
     with `WorkspaceNotFound` no matter what the other two say.
  2. `workspaces/{name}` in this service's own database - billing_account
     and members.
  3. The genesis access grants, bootstrapped in-process via
     `_bootstrap_genesis_policies` (this was an HTTP call to
     policy.opteryx before that service merged into this one).

ORDERING. (3) is a one-way door: this service cannot revoke a grant it
caused, genesis refuses a self-revoke, and it answers 409 for the rest of
time once any policy exists on the name. (1) and (2) are local documents
this service can re-read and overwrite. So both reversible writes run
first and the irreversible one runs last, and a failure anywhere leaves a
state a retry can recognize and finish.

(1) comes first because it is also the claim record. It is the one document
that says *which billing account holds this name*, it is where
`scripts/reserve_workspace_names.py` records a hold, and it is durable
before either of the other writes - so a retry after a crash at any point
can tell "my own half-finished attempt" from "someone else's name", which
is exactly what the code could not do before (see billing-test-suite/
STATUS.md: a genesis timeout stranded a workspace name permanently, because
nothing durable recorded the claim until after genesis had already
committed).

Failure modes, all recoverable by re-issuing the same PUT:
  - (1) fails: 504, nothing else written, name still free.
  - (2) fails: the namespace is claimed by this billing account and no
    grants exist. A retry adopts it; another account's PUT is refused.
  - (3) fails: the workspace is visible in the account listing and can be
    deleted, and a retry re-attempts genesis - a 409 then means the
    earlier attempt's grants already landed, which is success. This is the
    trade named in STATUS.md: a workspace briefly without grants, rather
    than a name permanently without recourse. It carries no charge
    (billing is metered off usage events, and an empty workspace produces
    none).

Idempotency: if `workspaces/{name}` already exists with the *same*
`billing_account`/`members` as requested, this is treated as a retry and
the existing doc is returned rather than erroring. If the doc exists with
*different* `billing_account`/`members`, that's a real name conflict: 409,
no genesis bootstrap attempted.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `WorkspaceCreateRequest`
  - **billing_account** `string` [required]
  - **members** `array<WorkspaceMemberGrant>` [required]
  - **catalog** `CatalogBindingRequest | null` [optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PUT" data-base="https://control.opteryx.app" data-path="/v1/workspaces/{name}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--put">put</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/workspaces/{name}</span>
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
        <div class="t-pname">name<span>string · required</span></div>
        <input type="text" class="t-path" data-name="name" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · WorkspaceCreateRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "billing_account": "",
  "members": [],
  "catalog": {}
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

## Get Catalog Binding

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/workspaces/{name}/catalog</code>

**Tags:** Workspace Catalog

The workspace's binding, ciphertext redacted; kind "native" if unbound.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/workspaces/{name}/catalog" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/workspaces/{name}/catalog</span>
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
        <div class="t-pname">name<span>string · required</span></div>
        <input type="text" class="t-path" data-name="name" placeholder="string">
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

## Put Catalog Binding

**Request:** <span class="ep-verb ep-verb--put">put</span><code>/v1/workspaces/{name}/catalog</code>

**Tags:** Workspace Catalog

Create or replace the workspace's binding. See the module docstring
for the precondition order and the secret-handling contract.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `CatalogBindingRequest`
  - **kind** `string` [required]
  - **config** `object` [optional]
    Default: `{}`
  - **auth** `CatalogAuthRequest` [optional]
  - **preserve_sql_case** `boolean` [optional]
    Default: `false`

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PUT" data-base="https://control.opteryx.app" data-path="/v1/workspaces/{name}/catalog" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--put">put</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/workspaces/{name}/catalog</span>
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
        <div class="t-pname">name<span>string · required</span></div>
        <input type="text" class="t-path" data-name="name" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · CatalogBindingRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "kind": "",
  "config": {},
  "auth": {},
  "preserve_sql_case": false
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

## Delete Catalog Binding

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/v1/workspaces/{name}/catalog</code>

**Tags:** Workspace Catalog

Remove the binding, reverting the workspace to the native catalog.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://control.opteryx.app" data-path="/v1/workspaces/{name}/catalog" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/workspaces/{name}/catalog</span>
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
        <div class="t-pname">name<span>string · required</span></div>
        <input type="text" class="t-path" data-name="name" placeholder="string">
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

## Sync Catalog Dataset List

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/workspaces/{name}/catalog/sync</code>

**Tags:** Workspace Catalog

Re-list the workspace's external catalog into stub dataset documents.

Owner-or-admin, not owner-only: the request carries nothing, so an admin
can refresh and diagnose a listing without being able to change where the
workspace's data comes from. See the module docstring for the tiering rule
and for why nothing may call this on a user's behalf.

Order matters. Every external round trip happens before the first write,
so an unreachable catalog leaves the stored listing exactly as it was and
the 502/504 can say so without hedging.

What it costs the customer's catalog: one `list_tables` per namespace,
then one table load per TABLE for its schema, then a manifest read per
table for row counts and column bounds. That is a great deal more than
the name-only listing this started as, and it is the reason the
user-initiated-only rule is not a preference. Schema is there because
odata's `$metadata` emits nothing for a dataset with no resolvable
columns - a name-only stub was visible in the service document and
invisible to Excel and Power BI.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/workspaces/{name}/catalog/sync" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/workspaces/{name}/catalog/sync</span>
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
        <div class="t-pname">name<span>string · required</span></div>
        <input type="text" class="t-path" data-name="name" placeholder="string">
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

## Test Saved Catalog Connection

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/workspaces/{name}/catalog/test</code>

**Tags:** Workspace Catalog

Test the binding this workspace already has. Body is ignored.

Owner-or-admin: the request carries nothing, and diagnosing a workspace is
not the same authority as changing one. A stored credential is decrypted
for the probe and never leaves this process.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://control.opteryx.app" data-path="/v1/workspaces/{name}/catalog/test" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/workspaces/{name}/catalog/test</span>
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
        <div class="t-pname">name<span>string · required</span></div>
        <input type="text" class="t-path" data-name="name" placeholder="string">
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

## Get Workspace Guard Properties

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/workspaces/{name}/properties</code>

**Tags:** Workspaces

The workspace's guard flags, for ANY workspace the caller owns.

The account listing above answers the same question, but only for
workspaces registered with a billing account - it is driven by
`where("billing_account", "==", ...)`, so a workspace that predates
billing.opteryx or was created any other way is simply absent from it.
That left the UI unable to read its own setting back for those, which is
not a state a protection control can be in: a switch that cannot report
what it is set to is a switch nobody can trust.

So this is keyed by workspace and nothing else. Authorization comes from
the access policies (`_check_workspace_access`, owner/admin on the
workspace itself), NOT from billing-account membership - the same reason
the route exists at all, since an unregistered workspace has no billing
account to be a member of. The catalog handle is built by name, which
needs no billing row either.

Returns the same resolved booleans as the listing, so a caller can use
either source without knowing which one answered.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://control.opteryx.app" data-path="/v1/workspaces/{name}/properties" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://control.opteryx.app</span>/v1/workspaces/{name}/properties</span>
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
        <div class="t-pname">name<span>string · required</span></div>
        <input type="text" class="t-path" data-name="name" placeholder="string">
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
