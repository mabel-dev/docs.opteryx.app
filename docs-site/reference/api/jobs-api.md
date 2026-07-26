# Jobs API

Base URL: https://jobs.opteryx.app

## Overview

Job submission, execution status tracking, result retrieval, cancellation, and recent-query listing.

## Endpoints

Endpoint | Method | Summary
--- | --- | ---
`/api/v1/jobs` | `POST` | Create and execute SQL job
`/api/v1/jobs/estimate` | `POST` | Estimate result size
`/api/v1/jobs/recent` | `GET` | Retrieve recent user queries
`/api/v1/jobs/{identifier}/download` | `GET` | Download job results
`/api/v1/jobs/{identifier}/results` | `GET` | Get job results
`/api/v1/jobs/{identifier}/status` | `GET` | Get job status

## Create and execute SQL job

**Request:** `[POST] /api/v1/jobs`

**Tags:** Jobs Management

Submit a SQL job for execution.

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
    Query parameters, key-value pairs

### Responses

- **201** — Successful Response (`application/json` `JobCreateResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"></span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. Get one from <code>POST https://authenticate.opteryx.app/token</code>.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · JobCreateRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "sql_text": ""
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

## Estimate result size

**Request:** `[POST] /api/v1/jobs/estimate`

**Tags:** Jobs Management

Return a coarse estimate of the bytes for a job result. Accepts a JSON body with the SQL job.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `EstimateRequest`
  - **sql_text** `string` [required]
    SQL statement to estimate
  - **parameters** `object | null` [optional]
    Optional query parameters

### Responses

- **200** — Successful Response (`application/json` `EstimateResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/estimate">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"></span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. Get one from <code>POST https://authenticate.opteryx.app/token</code>.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · EstimateRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "sql_text": ""
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

## Retrieve recent user queries

**Request:** `[GET] /api/v1/jobs/recent`

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

<details class="api-tryit" data-method="GET" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/recent">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"></span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. Get one from <code>POST https://authenticate.opteryx.app/token</code>.</div>
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Download job results

**Request:** `[GET] /api/v1/jobs/{identifier}/download`

**Tags:** Jobs Management

Download the results of a previously submitted job as CSV or JSON lines.

### Path Parameters

- **identifier** `string` [path; required]

### Query Parameters

- **file_format** `string` [query; optional]
  Allowed values: `csv`, `json`
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

<details class="api-tryit" data-method="GET" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/{identifier}/download">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"></span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. Get one from <code>POST https://authenticate.opteryx.app/token</code>.</div>
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Get job results

**Request:** `[GET] /api/v1/jobs/{identifier}/results`

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

<details class="api-tryit" data-method="GET" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/{identifier}/results">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"></span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. Get one from <code>POST https://authenticate.opteryx.app/token</code>.</div>
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>

## Get job status

**Request:** `[GET] /api/v1/jobs/{identifier}/status`

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

<details class="api-tryit" data-method="GET" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/{identifier}/status">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"></span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. Get one from <code>POST https://authenticate.opteryx.app/token</code>.</div>
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
    </div>
    <pre class="t-pre"></pre>
    <div class="t-note"></div>
  </div>
</details>
