# Upload API

Base URL: https://upload.opteryx.app

## Overview

Multipart upload sessions, part upload and deletion, session inspection, and commit flows for ingesting files into Opteryx.

## Endpoints

Endpoint | Method | Summary
--- | --- | ---
`/health` | `GET` | Health
`/v1/upload/session` | `POST` | Start Upload Session
`/v1/upload/{session_id}` | `PUT` | Upload Part
`/v1/upload/{session_id}/commit` | `POST` | Commit Session
`/v1/upload/{session_id}/inspect` | `GET` | Inspect Session
`/v1/upload/{session_id}/part/{part}` | `DELETE` | Delete Part

## Health

**Request:** `[GET] /health`

**Tags:** service

### Responses

- **200** — Successful Response (`application/json` `object`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://upload.opteryx.app" data-path="/health" data-auth-docs="/docs/reference/api/authentication-api">
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

## Start Upload Session

**Request:** `[POST] /v1/upload/session`

**Tags:** upload

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **201** — Successful Response (`application/json` `StartSessionResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://upload.opteryx.app" data-path="/v1/upload/session" data-auth-docs="/docs/reference/api/authentication-api">
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

## Upload Part

**Request:** `[PUT] /v1/upload/{session_id}`

**Tags:** upload

### Path Parameters

- **session_id** `string` [path; required]

### Query Parameters

- **part** `integer` [query; required]
- **content_type** `string | null` [query; optional]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **201** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PUT" data-base="https://upload.opteryx.app" data-path="/v1/upload/{session_id}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
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
        <div class="t-pname">session_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="session_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Query parameters</div>
      <div class="t-params">
        <div class="t-pname">part<span>integer · required</span></div>
        <input type="text" class="t-query" data-name="part" placeholder="integer">
        <div class="t-pname">content_type<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="content_type" placeholder="string | null">
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

## Commit Session

**Request:** `[POST] /v1/upload/{session_id}/commit`

**Tags:** upload

### Path Parameters

- **session_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `CommitRequest`
  - **target** `Target` [required]
  - **snapshot_message** `string | null` [optional]
  - **conflict_resolution** `ConflictResolution` [optional]
    Allowed values: `fail`, `overwrite`, `append`

### Responses

- **200** — Successful Response (`application/json` `CommitResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://upload.opteryx.app" data-path="/v1/upload/{session_id}/commit" data-auth-docs="/docs/reference/api/authentication-api">
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
        <div class="t-pname">session_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="session_id" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · CommitRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "target": null
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

## Inspect Session

**Request:** `[GET] /v1/upload/{session_id}/inspect`

**Tags:** upload

### Path Parameters

- **session_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `InspectResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://upload.opteryx.app" data-path="/v1/upload/{session_id}/inspect" data-auth-docs="/docs/reference/api/authentication-api">
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
        <div class="t-pname">session_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="session_id" placeholder="string">
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

## Delete Part

**Request:** `[DELETE] /v1/upload/{session_id}/part/{part}`

**Tags:** upload

### Path Parameters

- **session_id** `string` [path; required]
- **part** `integer` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://upload.opteryx.app" data-path="/v1/upload/{session_id}/part/{part}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
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
        <div class="t-pname">session_id<span>string · required</span></div>
        <input type="text" class="t-path" data-name="session_id" placeholder="string">
        <div class="t-pname">part<span>integer · required</span></div>
        <input type="text" class="t-path" data-name="part" placeholder="integer">
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
