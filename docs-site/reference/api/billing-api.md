# Billing API

Base URL: https://billing.opteryx.app

## Overview

Billing account and membership management, payment methods and charges, and workspace lifecycle (creation, deletion, locking).

## Endpoints

<table class="endpoint-index">
  <thead>
    <tr><th>Service</th><th>Docs</th></tr>
  </thead>
  <tbody>
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
      <td><span class="ep-name">List Account Workspaces</span><span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/workspaces</code></td>
      <td class="ep-doc"><a href="#list-account-workspaces">View</a></td>
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
      <td><span class="ep-name">Create Workspace</span><span class="ep-verb ep-verb--put">put</span><code>/v1/workspaces/{name}</code></td>
      <td class="ep-doc"><a href="#create-workspace">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Delete Workspace</span><span class="ep-verb ep-verb--delete">delete</span><code>/v1/workspaces/{name}</code></td>
      <td class="ep-doc"><a href="#delete-workspace">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Lock Workspace</span><span class="ep-verb ep-verb--put">put</span><code>/v1/workspaces/{name}/lock</code></td>
      <td class="ep-doc"><a href="#lock-workspace">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Unlock Workspace</span><span class="ep-verb ep-verb--delete">delete</span><code>/v1/workspaces/{name}/lock</code></td>
      <td class="ep-doc"><a href="#unlock-workspace">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Restore Workspace</span><span class="ep-verb ep-verb--post">post</span><code>/v1/workspaces/{name}/restore</code></td>
      <td class="ep-doc"><a href="#restore-workspace">View</a></td>
    </tr>
  </tbody>
</table>

## List Accounts

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts</code>

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

<details class="api-tryit" data-method="GET" data-base="https://billing.opteryx.app" data-path="/v1/accounts" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts</span>
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

<details class="api-tryit" data-method="POST" data-base="https://billing.opteryx.app" data-path="/v1/accounts" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts</span>
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

<details class="api-tryit" data-method="GET" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}</span>
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

<details class="api-tryit" data-method="PATCH" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--patch">patch</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}</span>
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

<details class="api-tryit" data-method="DELETE" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}</span>
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

## List Members

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/members</code>

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

<details class="api-tryit" data-method="GET" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}/members" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}/members</span>
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
  - **identity_or_email** `string` [required]
  - **role** `string` [required]

### Responses

- **201** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}/members" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}/members</span>
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
  "identity_or_email": "",
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

<details class="api-tryit" data-method="PATCH" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}/members/{identity}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--patch">patch</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}/members/{identity}</span>
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

<details class="api-tryit" data-method="DELETE" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}/members/{identity}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}/members/{identity}</span>
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

<details class="api-tryit" data-method="POST" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}/members/{identity}/accept" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}/members/{identity}/accept</span>
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

<details class="api-tryit" data-method="GET" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}/payment-methods" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}/payment-methods</span>
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

<details class="api-tryit" data-method="POST" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}/payment-methods" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}/payment-methods</span>
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

<details class="api-tryit" data-method="DELETE" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}/payment-methods" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}/payment-methods</span>
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

<details class="api-tryit" data-method="POST" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}/payments" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}/payments</span>
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

## List Account Workspaces

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/accounts/{account_id}/workspaces</code>

Manage-workspaces listing. Caller must be an active member of the
account (any role).

A genuine two-database read per workspace (api-v2.md): this service's
own `workspaces/{name}` doc for `billing_account`/`members`, plus the
`catalogs` database's `$properties` doc (via an `OpteryxCatalog` handle)
for lock/delete state. Active (non-deleted) workspaces are visible to
any account member; a soft-deleted-but-still-in-grace-period workspace
is included only for callers who are an `owner` in that specific
workspace's own `members` list.

### Path Parameters

- **account_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `array<object>`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://billing.opteryx.app" data-path="/v1/accounts/{account_id}/workspaces" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/accounts/{account_id}/workspaces</span>
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

## List Invoices

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v1/invoices</code>

Placeholder: return an empty invoices list.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `array<object>`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://billing.opteryx.app" data-path="/v1/invoices" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/invoices</span>
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

Placeholder: return a minimal invoice representation.

### Path Parameters

- **invoice_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://billing.opteryx.app" data-path="/v1/invoices/{invoice_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/invoices/{invoice_id}</span>
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

## Create Workspace

**Request:** <span class="ep-verb ep-verb--put">put</span><code>/v1/workspaces/{name}</code>

Idempotent create. Caller must be an active `billing_admin` on
`body.billing_account`.

Writes `workspaces/{name}` (billing_account + members), then calls
policy.opteryx's genesis-grant endpoint (POL-2) for the explicit member
list, forwarding the caller's JWT.

Idempotency: if `workspaces/{name}` already exists with the *same*
`billing_account`/`members` as requested, this is treated as a retry -
the genesis call is re-attempted (policy.opteryx's own 409 in that case
just means the earlier attempt's genesis call already succeeded, so
that's treated as success too), and the existing doc is returned rather
than erroring. If the doc exists with *different* `billing_account`/
`members`, that's a real name conflict: 409, no genesis call made.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `WorkspaceCreateRequest`
  - **billing_account** `string` [required]
  - **members** `array<WorkspaceMemberGrant>` [required]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PUT" data-base="https://billing.opteryx.app" data-path="/v1/workspaces/{name}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--put">put</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/workspaces/{name}</span>
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
  "members": []
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

## Delete Workspace

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/v1/workspaces/{name}</code>

Starts the 24h soft-delete. Caller must be an active `billing_admin`
on the workspace's billing account. 423 if the workspace is currently
locked.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://billing.opteryx.app" data-path="/v1/workspaces/{name}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/workspaces/{name}</span>
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

## Lock Workspace

**Request:** <span class="ep-verb ep-verb--put">put</span><code>/v1/workspaces/{name}/lock</code>

Workspace **owner** sets the lock - workspace-level (checked against
this workspace's own `members` list), not billing-account-level.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PUT" data-base="https://billing.opteryx.app" data-path="/v1/workspaces/{name}/lock" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--put">put</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/workspaces/{name}/lock</span>
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

## Unlock Workspace

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/v1/workspaces/{name}/lock</code>

A **different** owner clears the lock. Not a hard access-control
boundary (per api-v2.md) - the point is a second identity on record,
so a straightforward identity-inequality check against the current
`locked-by` is sufficient.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://billing.opteryx.app" data-path="/v1/workspaces/{name}/lock" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/workspaces/{name}/lock</span>
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

## Restore Workspace

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v1/workspaces/{name}/restore</code>

Within the 24h grace window, un-deletes. Owner only.

Constructs the catalog handle with `include_deleted=True` - restoring a
deleted workspace requires reaching it in the first place.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://billing.opteryx.app" data-path="/v1/workspaces/{name}/restore" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://billing.opteryx.app</span>/v1/workspaces/{name}/restore</span>
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
