# Jobs API

Base URL: https://jobs.opteryx.app

## Overview

Job submission, execution status tracking, result retrieval, cancellation, and recent-query listing.

## Endpoints

<table class="endpoint-index">
  <thead>
    <tr><th>Service</th><th>Docs</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="ep-name">Create and execute SQL job</span><span class="ep-verb ep-verb--post">post</span><code>/api/v1/jobs</code></td>
      <td class="ep-doc"><a href="#create-and-execute-sql-job">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Retrieve recent user queries</span><span class="ep-verb ep-verb--get">get</span><code>/api/v1/jobs/recent</code></td>
      <td class="ep-doc"><a href="#retrieve-recent-user-queries">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Cancel job execution</span><span class="ep-verb ep-verb--post">post</span><code>/api/v1/jobs/{identifier}/cancel</code></td>
      <td class="ep-doc"><a href="#cancel-job-execution">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Download job results</span><span class="ep-verb ep-verb--get">get</span><code>/api/v1/jobs/{identifier}/download</code></td>
      <td class="ep-doc"><a href="#download-job-results">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get job results</span><span class="ep-verb ep-verb--get">get</span><code>/api/v1/jobs/{identifier}/results</code></td>
      <td class="ep-doc"><a href="#get-job-results">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get job status</span><span class="ep-verb ep-verb--get">get</span><code>/api/v1/jobs/{identifier}/status</code></td>
      <td class="ep-doc"><a href="#get-job-status">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">List saved variables</span><span class="ep-verb ep-verb--get">get</span><code>/api/v1/variables</code></td>
      <td class="ep-doc"><a href="#list-saved-variables">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Create or update a saved variable</span><span class="ep-verb ep-verb--put">put</span><code>/api/v1/variables/{name}</code></td>
      <td class="ep-doc"><a href="#create-or-update-a-saved-variable">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Delete a saved variable</span><span class="ep-verb ep-verb--delete">delete</span><code>/api/v1/variables/{name}</code></td>
      <td class="ep-doc"><a href="#delete-a-saved-variable">View</a></td>
    </tr>
  </tbody>
</table>

## Create and execute SQL job

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/api/v1/jobs</code>

**Tags:** Jobs Management

Submit a SQL job for execution. `:name` placeholders in sql_text are resolved from the parameters field, falling back to the caller's saved variables for anything not passed explicitly - see parameters below and the Variables API.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `JobCreateRequest`
  - **sql_text** `string` [required]
    SQL statement to execute
  - **client_info** `object | null` [optional]
    Client information, e.g. application name/version
  - **parameters** `object | null` [optional]
    Values for any `:name` placeholders in sql_text, as key-value pairs. Values passed here always take priority. Any placeholder the query references that isn't included here is automatically resolved from the caller's saved variables (see the Variables API) - this is what lets a shared query stay generic (e.g. `WHERE department = :department`) while each caller's own saved value fills in without them passing it explicitly. A placeholder that's neither passed nor saved is left unresolved, and the job fails at execution with a parameter-not-defined error.

### Responses

- **201** — Successful Response (`application/json` `JobCreateResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/jobs</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · JobCreateRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "sql_text": "",
  "client_info": {},
  "parameters": {}
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

## Retrieve recent user queries

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v1/jobs/recent</code>

**Tags:** Jobs Management

Get recent user queries.

### Query Parameters

- **filter** `string | null` [query; optional]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `array<QueryJob>`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/recent" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/jobs/recent</span>
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
        <div class="t-pname">filter<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="filter" placeholder="string | null">
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

## Cancel job execution

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/api/v1/jobs/{identifier}/cancel</code>

**Tags:** Jobs Management

Cancel a running job.

### Path Parameters

- **identifier** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `JobCancelResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/{identifier}/cancel" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/jobs/{identifier}/cancel</span>
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
        <div class="t-pname">identifier<span>string · required</span></div>
        <input type="text" class="t-path" data-name="identifier" placeholder="string">
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

## Download job results

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v1/jobs/{identifier}/download</code>

**Tags:** Jobs Management

Download the results of a previously submitted job as CSV, newline-delimited JSON, or Parquet.

### Path Parameters

- **identifier** `string` [path; required]

### Query Parameters

- **file_format** `string` [query; optional]
  Allowed values: `csv`, `json`, `parquet`
  Default: `csv`
- **limit** `integer` [query; optional]
  Default: `10000`
- **offset** `integer` [query; optional]
  Default: `0`

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/{identifier}/download" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/jobs/{identifier}/download</span>
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
        <div class="t-pname">identifier<span>string · required</span></div>
        <input type="text" class="t-path" data-name="identifier" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Query parameters</div>
      <div class="t-params">
        <div class="t-pname">file_format<span>string · optional</span></div>
        <input type="text" class="t-query" data-name="file_format" value="csv" placeholder="string">
        <div class="t-pname">limit<span>integer · optional</span></div>
        <input type="text" class="t-query" data-name="limit" value="10000" placeholder="integer">
        <div class="t-pname">offset<span>integer · optional</span></div>
        <input type="text" class="t-query" data-name="offset" value="0" placeholder="integer">
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

## Get job results

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v1/jobs/{identifier}/results</code>

**Tags:** Jobs Management

Retrieve the results of a previously submitted job.

### Path Parameters

- **identifier** `string` [path; required]

### Query Parameters

- **num_rows** `integer` [query; optional]
  Default: `5000`
- **offset** `integer` [query; optional]
  Default: `0`
- **verbose** `boolean` [query; optional]
  Default: `false`

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `JobResultsResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/{identifier}/results" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/jobs/{identifier}/results</span>
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
        <div class="t-pname">identifier<span>string · required</span></div>
        <input type="text" class="t-path" data-name="identifier" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Query parameters</div>
      <div class="t-params">
        <div class="t-pname">num_rows<span>integer · optional</span></div>
        <input type="text" class="t-query" data-name="num_rows" value="5000" placeholder="integer">
        <div class="t-pname">offset<span>integer · optional</span></div>
        <input type="text" class="t-query" data-name="offset" value="0" placeholder="integer">
        <div class="t-pname">verbose<span>boolean · optional</span></div>
        <input type="text" class="t-query" data-name="verbose" value="false" placeholder="boolean">
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

## Get job status

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v1/jobs/{identifier}/status</code>

**Tags:** Jobs Management

Retrieve the execution status of a previously submitted job.

### Path Parameters

- **identifier** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `JobStatusResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/{identifier}/status" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/jobs/{identifier}/status</span>
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
        <div class="t-pname">identifier<span>string · required</span></div>
        <input type="text" class="t-path" data-name="identifier" placeholder="string">
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

## List saved variables

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v1/variables</code>

**Tags:** Variables

List the caller's saved query-parameter variables.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `VariableListResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://jobs.opteryx.app" data-path="/api/v1/variables" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/variables</span>
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

## Create or update a saved variable

**Request:** <span class="ep-verb ep-verb--put">put</span><code>/api/v1/variables/{name}</code>

**Tags:** Variables

Create (or replace) a named query-parameter variable for the caller.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `VariableUpsertRequest`
  - **type** `string` [required]
    One of 'string', 'number', or 'boolean'
  - **value** `object` [required]
    The variable's value; its JSON type must match `type`

### Responses

- **200** — Successful Response (`application/json` `VariableListResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="PUT" data-base="https://jobs.opteryx.app" data-path="/api/v1/variables/{name}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--put">put</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/variables/{name}</span>
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
      <div class="t-label">Request body <span class="t-opt">application/json · VariableUpsertRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "type": "",
  "value": null
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

## Delete a saved variable

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/api/v1/variables/{name}</code>

**Tags:** Variables

Delete a named query-parameter variable for the caller.

### Path Parameters

- **name** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **204** — Successful Response
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="DELETE" data-base="https://jobs.opteryx.app" data-path="/api/v1/variables/{name}" data-auth-docs="/docs/reference/api/authentication-api" data-destructive="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--delete">delete</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/variables/{name}</span>
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
