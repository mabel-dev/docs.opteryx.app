# Upload API

Base URL: https://upload.opteryx.app

## Overview

Agree the column types before any data is sent, then upload files against that agreement and commit them as one snapshot.

## Upload flow

An upload is an agreement, not a transfer. You send a sample of each file and the service answers with what the data will become; you read that, accept it, and only then does any data move. Everything that can refuse an upload — a type that will not cast, two files that disagree, a column the dataset does not declare, a permission you do not have — is decided while the cost is a few megabytes rather than the whole export.

<div class="api-flow">
  <div class="api-flow__head">
    <span class="api-flow__actor api-flow__actor--a">Client</span>
    <span class="api-flow__actor api-flow__actor--b">Upload API</span>
  </div>
  <ol class="api-flow__steps">
    <li class="api-flow__step api-flow__step--req">
      <span class="api-flow__num">1</span>
      <span class="api-flow__label"><code>POST /v2/contracts</code></span>
    </li>
    <li class="api-flow__step api-flow__step--res">
      <span class="api-flow__num">2</span>
      <span class="api-flow__label">201 &middot; <code>contract_id</code>, <code>state</code>, resolved <code>mode</code>, <code>plan[]</code>, <code>issues[]</code>, <code>values</code></span>
    </li>
    <li class="api-flow__group" data-label="While the schema is only proposed">
      <ol class="api-flow__steps">
        <li class="api-flow__step api-flow__step--req">
          <span class="api-flow__label"><code>PATCH /v2/contracts/{contract_id}</code></span>
        </li>
        <li class="api-flow__step api-flow__step--res">
          <span class="api-flow__label">200 &middot; the whole contract, re-planned</span>
        </li>
        <li class="api-flow__step api-flow__step--req">
          <span class="api-flow__label"><code>PUT /v2/contracts/{contract_id}/accept</code></span>
        </li>
        <li class="api-flow__step api-flow__step--res">
          <span class="api-flow__label">200 &middot; <code>state: accepted</code></span>
        </li>
      </ol>
      <div class="api-flow__note">Only inference proposes. A declared schema, or an existing dataset's, arrives accepted</div>
    </li>
    <li class="api-flow__group" data-label="Loop &mdash; for each file">
      <ol class="api-flow__steps">
        <li class="api-flow__step api-flow__step--req">
          <span class="api-flow__label"><code>POST /v2/contracts/{contract_id}/data</code></span>
        </li>
        <li class="api-flow__step api-flow__step--res">
          <span class="api-flow__label">200 &middot; <code>written[]</code> &mdash; what the file turned out to be</span>
        </li>
        <li class="api-flow__step api-flow__step--res">
          <span class="api-flow__label">409 &middot; a value that cannot be stored as the column it was promised to, with its row</span>
        </li>
      </ol>
    </li>
    <li class="api-flow__step api-flow__step--req">
      <span class="api-flow__num">3</span>
      <span class="api-flow__label"><code>POST /v2/contracts/{contract_id}/commit</code></span>
    </li>
    <li class="api-flow__step api-flow__step--res">
      <span class="api-flow__num">4</span>
      <span class="api-flow__label">200 &middot; <code>snapshot</code>, <code>rows_written</code></span>
    </li>
  </ol>
</div>

- **Negotiating uploads nothing.** `POST /v2/contracts` carries a sample per file and no data — a prefix for text, the footer for parquet, which is where its schema lives. So agreeing costs a few megabytes whatever the files weigh, and a caller who is going to be refused finds out now rather than after four gigabytes. Every file is sampled, not just the first: one contract covers all of them, so two files that disagree are caught here.
- **There is no default schema source.** `schema.mode` is `declared` (you name every column), `infer` (read them from the data and show me first), `dataset` (use the types the dataset already declares) or `auto`. `auto` is not a fourth source — it resolves to one of the three from the destination before a contract exists, and the response says which. A dataset that declares its columns has nothing to infer; one that does not exist has nothing to read.
- **An inferred schema is proposed, not agreed.** It comes back `state: proposed` and refuses writes until `PUT .../accept`, so nothing is catalogued that nobody looked at. Accepting echoes the `schema_fingerprint` you were shown, so a proposal that moved between being read and being accepted is refused rather than confirmed blind. A `declared` or `dataset` schema arrives `accepted` — you already said what you meant, in the request.
- **`plan[]` says what happens to every column** before it happens: `keep`, `retag` (relabelled, no value changes), `widen` (nothing is lost), `cast` (values are rewritten), `ignored`, `undeclared` or `unsupported`. `values` carries one real sampled value per column, which is what makes a mistyped column obvious at a glance. `issues[]` carries the service's own severity — `blocking` stops the upload, `warning` does not.
- **A value that will not cast is a 409 on the write that carried it**, naming the column, the row and the value — not a failure at commit after everything has been sent. The file is not staged, and nothing else is affected.
- **Nothing is visible until commit.** Files are written under a prefix the catalog has never named, so an upload that is abandoned, expires or fails is unreachable rather than mess somebody has to clean up. `DELETE /v2/contracts/{contract_id}` gives up; `expires_at` says how long you have.
- **Commit is idempotent** on an `Idempotency-Key` header: a retry after a lost response returns the original snapshot instead of writing a second one.
- **A contract is checked against the catalog before every write.** If the target's definition moved after the contract was agreed, the contract goes `stale` and is refused — rows already written were cast to a definition that no longer exists. Nothing was published, so the cost is work rather than a dataset somebody has read. Re-negotiating against the new definition is the fix.

## Endpoints

<table class="endpoint-index">
  <thead>
    <tr><th>Service</th><th>Docs</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="ep-name">Negotiate a Contract</span><span class="ep-verb ep-verb--post">post</span><code>/v2/contracts</code></td>
      <td class="ep-doc"><a href="#negotiate-a-contract">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Read a Contract</span><span class="ep-verb ep-verb--get">get</span><code>/v2/contracts/{contract_id}</code></td>
      <td class="ep-doc"><a href="#read-a-contract">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Amend a Proposal</span><span class="ep-verb ep-verb--patch">patch</span><code>/v2/contracts/{contract_id}</code></td>
      <td class="ep-doc"><a href="#amend-a-proposal">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Abandon a Contract</span><span class="ep-verb ep-verb--delete">delete</span><code>/v2/contracts/{contract_id}</code></td>
      <td class="ep-doc"><a href="#abandon-a-contract">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Accept a Proposal</span><span class="ep-verb ep-verb--put">put</span><code>/v2/contracts/{contract_id}/accept</code></td>
      <td class="ep-doc"><a href="#accept-a-proposal">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Commit a Contract</span><span class="ep-verb ep-verb--post">post</span><code>/v2/contracts/{contract_id}/commit</code></td>
      <td class="ep-doc"><a href="#commit-a-contract">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Write a File</span><span class="ep-verb ep-verb--post">post</span><code>/v2/contracts/{contract_id}/data</code></td>
      <td class="ep-doc"><a href="#write-a-file">View</a></td>
    </tr>
  </tbody>
</table>

## Negotiate a Contract

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v2/contracts</code>

**Tags:** contracts

Negotiate. Carries schema and samples; no upload happens here.

`multipart/form-data` with a `contract` part and one `sample` part per file,
because a contract covers every file and two files that disagree have to be
caught before anything is sent.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **201** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://upload.opteryx.app" data-path="/v2/contracts" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://upload.opteryx.app</span>/v2/contracts</span>
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

## Read a Contract

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/v2/contracts/{contract_id}</code>

**Tags:** contracts

The whole contract: plan, issues, every write, running totals.

One document read. Nothing is listed, downloaded or re-parsed to answer it,
which is what `/inspect` does today for every call.

### Path Parameters

- **contract_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://upload.opteryx.app" data-path="/v2/contracts/{contract_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://upload.opteryx.app</span>/v2/contracts/{contract_id}</span>
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
        <div class="t-pname">contract_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="contract_id" placeholder="string">
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

## Amend a Proposal

**Request:** <span class="ep-verb ep-verb--patch">patch</span><code>/v2/contracts/{contract_id}</code>

**Tags:** contracts

Retype or decline columns. Returns the whole re-planned contract.

### Path Parameters

- **contract_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PATCH" data-base="https://upload.opteryx.app" data-path="/v2/contracts/{contract_id}" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--patch">patch</span>
    <span class="t-url"><span class="t-host">https://upload.opteryx.app</span>/v2/contracts/{contract_id}</span>
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
        <div class="t-pname">contract_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="contract_id" placeholder="string">
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

## Abandon a Contract

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/v2/contracts/{contract_id}</code>

**Tags:** contracts

Give up. Nothing written was ever reachable, so nothing has to be undone.

### Path Parameters

- **contract_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **204** — Successful Response
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://upload.opteryx.app" data-path="/v2/contracts/{contract_id}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://upload.opteryx.app</span>/v2/contracts/{contract_id}</span>
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
        <div class="t-pname">contract_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="contract_id" placeholder="string">
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

## Accept a Proposal

**Request:** <span class="ep-verb ep-verb--put">put</span><code>/v2/contracts/{contract_id}/accept</code>

**Tags:** contracts

Confirm a proposed schema, echoing the fingerprint you were shown.

### Path Parameters

- **contract_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PUT" data-base="https://upload.opteryx.app" data-path="/v2/contracts/{contract_id}/accept" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--put">put</span>
    <span class="t-url"><span class="t-host">https://upload.opteryx.app</span>/v2/contracts/{contract_id}/accept</span>
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
        <div class="t-pname">contract_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="contract_id" placeholder="string">
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

## Commit a Contract

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v2/contracts/{contract_id}/commit</code>

**Tags:** contracts

### Path Parameters

- **contract_id** `string` [path; required]

### Header Parameters

- **idempotency-key** `string | null` [header; optional]
- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://upload.opteryx.app" data-path="/v2/contracts/{contract_id}/commit" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://upload.opteryx.app</span>/v2/contracts/{contract_id}/commit</span>
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
        <div class="t-pname">contract_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="contract_id" placeholder="string">
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

## Write a File

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/v2/contracts/{contract_id}/data</code>

**Tags:** contracts

Stream one file in. Answered with what it turned out to be, or refused.

### Path Parameters

- **contract_id** `string` [path; required]

### Header Parameters

- **x-file-name** `string | null` [header; optional]
- **content-type** `string | null` [header; optional]
- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://upload.opteryx.app" data-path="/v2/contracts/{contract_id}/data" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://upload.opteryx.app</span>/v2/contracts/{contract_id}/data</span>
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
        <div class="t-pname">contract_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="contract_id" placeholder="string">
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
