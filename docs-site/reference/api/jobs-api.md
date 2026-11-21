<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Jobs API

Base URL: https://jobs.opteryx.app

## Overview

Job submission, execution status tracking, result retrieval, recent-query listing, and edit-time statement checking.

## Job flow

Jobs run asynchronously: submitting a query returns immediately with an `execution_id`, and the query keeps running in the background until you poll it to completion.

<div class="api-flow">
  <div class="api-flow__head">
    <span class="api-flow__actor api-flow__actor--a">Client</span>
    <span class="api-flow__actor api-flow__actor--b">Jobs API</span>
  </div>
  <ol class="api-flow__steps">
    <li class="api-flow__step api-flow__step--req">
      <span class="api-flow__num">1</span>
      <span class="api-flow__label"><code>POST /api/v1/jobs</code></span>
    </li>
    <li class="api-flow__step api-flow__step--res">
      <span class="api-flow__num">2</span>
      <span class="api-flow__label">201 &middot; <code>execution_id</code>, <code>status</code>, <code>status_url</code></span>
    </li>
    <li class="api-flow__group" data-label="Loop &mdash; poll until finished">
      <ol class="api-flow__steps">
        <li class="api-flow__step api-flow__step--req">
          <span class="api-flow__label"><code>GET /api/v1/jobs/{execution_id}/status</code></span>
        </li>
        <li class="api-flow__step api-flow__step--res">
          <span class="api-flow__label">200 &middot; <code>status</code>, <code>results_url</code></span>
        </li>
      </ol>
      <div class="api-flow__note">Repeat on an interval until <code>status</code> is no longer in progress</div>
    </li>
    <li class="api-flow__step api-flow__step--req">
      <span class="api-flow__num">3</span>
      <span class="api-flow__label"><code>GET /api/v1/jobs/{execution_id}/results</code></span>
    </li>
    <li class="api-flow__step api-flow__step--res">
      <span class="api-flow__num">4</span>
      <span class="api-flow__label">200 &middot; <code>data[]</code>, <code>total_rows</code>, <code>next_page</code></span>
    </li>
    <li class="api-flow__group" data-label="Or, to export instead">
      <ol class="api-flow__steps">
        <li class="api-flow__step api-flow__step--req">
          <span class="api-flow__label"><code>GET /api/v1/jobs/{execution_id}/download?file_format=csv|json|parquet</code></span>
        </li>
        <li class="api-flow__step api-flow__step--res">
          <span class="api-flow__label">200 &middot; file</span>
        </li>
      </ol>
    </li>
  </ol>
</div>

- **Poll `status`, not `results`.** `GET .../status` is cheap and returns `results_url` once the job is done; `GET .../results` is what actually pages through the data, `num_rows`/`offset` at a time, following `next_page` for more.
- **`results` and `download` are independent, not exclusive.** Pull a page inline with `results` to inspect it in your app, or stream the whole set with `download` as CSV, newline-delimited JSON, or Parquet — call either, neither, or both once the job has finished.

## Endpoints

<table class="endpoint-index">
  <thead>
    <tr><th>Service</th><th>Docs</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="ep-name">Check a SQL statement without running it</span><span class="ep-verb ep-verb--post">post</span><code>/<wbr>api/<wbr>v1/<wbr>check</code></td>
      <td class="ep-doc"><a href="#check-a-sql-statement-without-running-it">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Estimate how much data a SQL statement would process</span><span class="ep-verb ep-verb--post">post</span><code>/<wbr>api/<wbr>v1/<wbr>estimate</code></td>
      <td class="ep-doc"><a href="#estimate-how-much-data-a-sql-statement-would-process">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Create and execute SQL job</span><span class="ep-verb ep-verb--post">post</span><code>/<wbr>api/<wbr>v1/<wbr>jobs</code></td>
      <td class="ep-doc"><a href="#create-and-execute-sql-job">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">List trigger-fired runs for one step</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>fired</code></td>
      <td class="ep-doc"><a href="#list-trigger-fired-runs-for-one-step">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Retrieve recent user queries</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>recent</code></td>
      <td class="ep-doc"><a href="#retrieve-recent-user-queries">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Download job results</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>{identifier}/<wbr>download</code></td>
      <td class="ep-doc"><a href="#download-job-results">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get job results</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>{identifier}/<wbr>results</code></td>
      <td class="ep-doc"><a href="#get-job-results">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Save job results to a dataset</span><span class="ep-verb ep-verb--post">post</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>{identifier}/<wbr>save</code></td>
      <td class="ep-doc"><a href="#save-job-results-to-a-dataset">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Get job status</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>{identifier}/<wbr>status</code></td>
      <td class="ep-doc"><a href="#get-job-status">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Today&#x27;s usage against the daily allowance</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>usage</code></td>
      <td class="ep-doc"><a href="#todays-usage-against-the-daily-allowance">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">List saved variables</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>variables</code></td>
      <td class="ep-doc"><a href="#list-saved-variables">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Create or update a saved variable</span><span class="ep-verb ep-verb--put">put</span><code>/<wbr>api/<wbr>v1/<wbr>variables/<wbr>{name}</code></td>
      <td class="ep-doc"><a href="#create-or-update-a-saved-variable">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Delete a saved variable</span><span class="ep-verb ep-verb--delete">delete</span><code>/<wbr>api/<wbr>v1/<wbr>variables/<wbr>{name}</code></td>
      <td class="ep-doc"><a href="#delete-a-saved-variable">View</a></td>
    </tr>
  </tbody>
</table>

## Check a SQL statement without running it

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/<wbr>api/<wbr>v1/<wbr>check</code>

**Tags:** Query Check

Resolve and type-check one statement against the catalog, as the caller, and report what was found: a positioned error to underline, the result shape, and the relations and columns in scope for completion. Reads no data and changes nothing, so it is safe to call as a statement is typed. A statement that is wrong is a 200 with `ok: false` - the error is the answer, not a failure of the request.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `QueryCheckRequest`
  - **sql_text** `string` [required]
    One SQL statement to check. Not a batch.
  - **parameters** `object | null` [optional]
    Values for the statement's `:name` placeholders. Anything not passed is resolved from the caller's saved variables, exactly as job submission resolves them - see the Variables API. Each value is typed: `{"type": "<canonical type>", "value": ...}`, e.g. `{"type": "DATE", "value": "2026-01-01"}` or `{"type": "INT64", "value": 42}`. The engine binds it as `CAST(value AS type)`, so `type` is a canonical type name (VARCHAR, INT64, FLOAT64, DECIMAL(p,s), BOOL, DATE, TIMESTAMP, ...) and `value` is a string, number, boolean or null. A bare value is refused.

### Responses

- **200** — Successful Response (`application/json` `QueryCheckResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://jobs.opteryx.app" data-path="/api/v1/check" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/check</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · QueryCheckRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "sql_text": "",
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

## Estimate how much data a SQL statement would process

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/<wbr>api/<wbr>v1/<wbr>estimate</code>

**Tags:** Query Check

Plan one statement as the caller, without running it, and report the bytes processed it would be billed for - the same plan-time figure the run bills - with a rough duration and, for a payer with a daily allowance, how much of today's allowance it would use. Heavier than `/check`: planning reads manifests and statistics, so call it once a statement checks out and typing has paused, not on every keystroke. A statement that is wrong is a 200 with `ok: false`.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `QueryCheckRequest`
  - **sql_text** `string` [required]
    One SQL statement to check. Not a batch.
  - **parameters** `object | null` [optional]
    Values for the statement's `:name` placeholders. Anything not passed is resolved from the caller's saved variables, exactly as job submission resolves them - see the Variables API. Each value is typed: `{"type": "<canonical type>", "value": ...}`, e.g. `{"type": "DATE", "value": "2026-01-01"}` or `{"type": "INT64", "value": 42}`. The engine binds it as `CAST(value AS type)`, so `type` is a canonical type name (VARCHAR, INT64, FLOAT64, DECIMAL(p,s), BOOL, DATE, TIMESTAMP, ...) and `value` is a string, number, boolean or null. A bare value is refused.

### Responses

- **200** — Successful Response (`application/json` `QueryEstimateResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://jobs.opteryx.app" data-path="/api/v1/estimate" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/estimate</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">required</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Request body <span class="t-opt">application/json · QueryCheckRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "sql_text": "",
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

## Create and execute SQL job

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/<wbr>api/<wbr>v1/<wbr>jobs</code>

**Tags:** Jobs Management

Submit a SQL job for execution. `:name` placeholders in sql_text are resolved from the parameters field, falling back to the caller's saved variables for anything not passed explicitly - see parameters below and the Variables API.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `JobCreateRequest`
  - **sql_text** `string` [optional]
    SQL statement to execute. Required unless `throttled` is set - a throttled fire never built one to run.
    Default: ``
  - **client_info** `object | null` [optional]
    Client information, e.g. application name/version
  - **throttled** `boolean` [optional]
    Records that a trigger reached this fire but was deliberately suppressed by its own minimum-interval floor, rather than submitting SQL for execution. No statement is parsed or run, no worker is dispatched, and nobody is billed: a job document is written directly with a terminal `THROTTLED` status, so the fire still has a row in the same run history a real firing would. `client_info.trigger` carries the provenance (workspace, target, trigger name) in place of the statement jobs would otherwise have derived it from. Only the platform's own trigger-firing identity may set this, on the same terms as unattended trigger provenance generally.
    Default: `false`
  - **parameters** `object | null` [optional]
    Values for any `:name` placeholders in sql_text, as key-value pairs. Values passed here always take priority. Any placeholder the query references that isn't included here is automatically resolved from the caller's saved variables (see the Variables API) - this is what lets a shared query stay generic (e.g. `WHERE department = :department`) while each caller's own saved value fills in without them passing it explicitly. A placeholder that's neither passed nor saved is left unresolved, and the job fails at execution with a parameter-not-defined error. Each value is typed: `{"type": "<canonical type>", "value": ...}`, e.g. `{"type": "DATE", "value": "2026-01-01"}` or `{"type": "INT64", "value": 42}`. The engine binds it as `CAST(value AS type)`, so `type` is a canonical type name (VARCHAR, INT64, FLOAT64, DECIMAL(p,s), BOOL, DATE, TIMESTAMP, ...) and `value` is a string, number, boolean or null. A bare value is refused.

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
  "throttled": false,
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

## List trigger-fired runs for one step

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>fired</code>

**Tags:** Jobs Management

Run history for standing work. Lists the jobs a trigger has fired for one target object, or for one source dataset, most recent first. Ask by either `target` (the view or task the run works on) or `dataset` (the dataset carrying the trigger, optionally narrowed to one `trigger` name) - exactly one of the two. Visible to anyone who may READ the object, which is the same grant that shows the trigger in `information_schema.triggers`; a fired run's own `submitted_by` is the trigger's runs-as identity, so ownership is not the question here. `status` is the JOB's status - whether THIS RUN succeeded - which is a different thing from the trigger's `last_fired_status` (whether the fire happened) and from the target view's `LastRefreshStatus` (whether the latest work succeeded). A fire that was refused - suspended, egress-blocked, owner-missing - or deduplicated into another job never became a job and so never appears here: an empty list is not evidence that nothing happened. History reaches back at most `retention_days`, after which the documents are purged. `limit` is optional: omitted, the listing runs to the 1000-row ceiling, which within the retention window is usually the whole history.

### Query Parameters

- **target** `string | null` [query; optional]
- **dataset** `string | null` [query; optional]
- **trigger** `string | null` [query; optional]
- **limit** `integer | null` [query; optional]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/fired" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/jobs/fired</span>
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
        <div class="t-pname">target<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="target" placeholder="string | null">
        <div class="t-pname">dataset<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="dataset" placeholder="string | null">
        <div class="t-pname">trigger<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="trigger" placeholder="string | null">
        <div class="t-pname">limit<span>integer | null · optional</span></div>
        <input type="text" class="t-query" data-name="limit" placeholder="integer | null">
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

## Retrieve recent user queries

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>recent</code>

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

## Download job results

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>{identifier}/<wbr>download</code>

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

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>{identifier}/<wbr>results</code>

**Tags:** Jobs Management

Retrieve the results of a previously submitted job. While the job is still running the response is 202 with its status. Pass `wait` (seconds, up to 20) to have the request held until the job's status changes, so a client can poll this one endpoint instead of /status followed by /results. Pass `seen` (the status the client last saw) so a change that happened before the request arrived is answered at once rather than missed.

### Path Parameters

- **identifier** `string` [path; required]

### Query Parameters

- **num_rows** `integer` [query; optional]
  Default: `5000`
- **offset** `integer` [query; optional]
  Default: `0`
- **verbose** `boolean` [query; optional]
  Default: `false`
- **wait** `number` [query; optional]
  Default: `0`
- **seen** `string | null` [query; optional]

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
        <div class="t-pname">wait<span>number · optional</span></div>
        <input type="text" class="t-query" data-name="wait" value="0" placeholder="number">
        <div class="t-pname">seen<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="seen" placeholder="string | null">
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

## Save job results to a dataset

**Request:** <span class="ep-verb ep-verb--post">post</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>{identifier}/<wbr>save</code>

**Tags:** Jobs Management

Copy the results of a completed job into a new dataset, so they outlive the job's retention window. The dataset must not already exist.

### Path Parameters

- **identifier** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `SaveJobRequest`
  - **dataset** `string` [required]
    Name of the dataset to create
  - **workspace** `string | null` [optional]
    Workspace to create the dataset in. Defaults to `personal`, which is where a caller always has rights to their own collection.
  - **collection** `string | null` [optional]
    Collection within the workspace. Defaults to the caller's own username, giving `personal.{username}.{dataset}` - the one target that needs no granted policy.

### Responses

- **202** — Successful Response (`application/json` `SaveJobResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="POST" data-base="https://jobs.opteryx.app" data-path="/api/v1/jobs/{identifier}/save" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--post">post</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/jobs/{identifier}/save</span>
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
      <div class="t-label">Request body <span class="t-opt">application/json · SaveJobRequest</span></div>
      <textarea class="t-body" spellcheck="false">{
  "dataset": "",
  "workspace": "",
  "collection": ""
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

## Get job status

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>jobs/<wbr>{identifier}/<wbr>status</code>

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

## Today's usage against the daily allowance

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>usage</code>

**Tags:** Usage

The caller's billing account (or, without one, the caller), its effective plan, and - when that plan has a daily allowance - today's and this month's bytes processed, as counted for enforcement.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `UsageResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://jobs.opteryx.app" data-path="/api/v1/usage" data-auth-docs="/docs/reference/api/authentication-api">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://jobs.opteryx.app</span>/api/v1/usage</span>
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

## List saved variables

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v1/<wbr>variables</code>

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

**Request:** <span class="ep-verb ep-verb--put">put</span><code>/<wbr>api/<wbr>v1/<wbr>variables/<wbr>{name}</code>

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
    A canonical type name, e.g. VARCHAR, INT64, FLOAT64, BOOL, DATE
  - **value** `object` [required]
    The variable's value; it must CAST to `type` exactly as a typed parameter would

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

**Request:** <span class="ep-verb ep-verb--delete">delete</span><code>/<wbr>api/<wbr>v1/<wbr>variables/<wbr>{name}</code>

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
