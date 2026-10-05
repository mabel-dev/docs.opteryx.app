<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# OData API

Base URL: https://odata.opteryx.app

## Overview

OData service discovery, metadata, and dataset query endpoints for compatible clients and BI tools.

## Endpoints

<table class="endpoint-index">
  <thead>
    <tr><th>Service</th><th>Docs</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="ep-name">OData v4 Service Document</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v4/<wbr></code></td>
      <td class="ep-doc"><a href="#odata-v4-service-document">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">OData v4 Service-wide EDMX Metadata</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v4/<wbr>$metadata</code></td>
      <td class="ep-doc"><a href="#odata-v4-service-wide-edmx-metadata">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Query dataset rows</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v4/<wbr>{workstream}/<wbr>{collection}/<wbr>{dataset}</code></td>
      <td class="ep-doc"><a href="#query-dataset-rows">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Per-dataset OData EDMX metadata</span><span class="ep-verb ep-verb--get">get</span><code>/<wbr>api/<wbr>v4/<wbr>{workstream}/<wbr>{collection}/<wbr>{dataset}/<wbr>$metadata</code></td>
      <td class="ep-doc"><a href="#per-dataset-odata-edmx-metadata">View</a></td>
    </tr>
  </tbody>
</table>

## OData v4 Service Document

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v4/</code>

**Tags:** OData v4

Returns the OData v4 service document listing all accessible EntitySets grouped by workspace and collection.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Service document with EntitySet list and access metadata (`application/json` `object`)
- **401** — Missing or invalid authentication
- **406** — Accept header does not admit application/json, the only format this route returns
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://odata.opteryx.app" data-path="/api/v4/" data-auth-docs="/docs/reference/api/authentication-api" data-token-optional="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://odata.opteryx.app</span>/api/v4/</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">optional</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Leave blank to read public datasets. Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
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

## OData v4 Service-wide EDMX Metadata

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v4/$metadata</code>

**Tags:** OData v4

Returns the complete OData v4 EDMX metadata document describing all EntityTypes and EntitySets accessible to the authenticated user.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — EDMX metadata document (XML) (`application/json` `object`)
- **401** — Missing or invalid authentication
- **406** — Accept header does not admit application/xml, the only format this route returns
- **504** — Firestore unavailable; cannot enumerate datasets
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://odata.opteryx.app" data-path="/api/v4/$metadata" data-auth-docs="/docs/reference/api/authentication-api" data-token-optional="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://odata.opteryx.app</span>/api/v4/$metadata</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">optional</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Leave blank to read public datasets. Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
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

## Query dataset rows

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v4/{workstream}/{collection}/{dataset}</code>

**Tags:** OData v4

Retrieve data from a dataset with OData v4 query parameters ($filter, $select, $orderby, $top, $skip, $apply, $compute, $count). Returns paginated results with total count and nextLink for server-driven paging. The dataset segment may carry a `@{label}` version selector: `dataset@current` (the default, also what a bare `dataset` means), `dataset@previous` (the most recent version of the data before this one — maintenance snapshots such as compaction that changed no rows are skipped), `dataset@{tag}` (a named snapshot), or `dataset@{snapshot_id}` (a specific snapshot id). `@current` and `@previous` are resolved fresh on every page, so paging through them is not snapshot-isolated against concurrent writes; `@{tag}` and `@{snapshot_id}` are immutable and page consistently.

### Path Parameters

- **workstream** `string` [path; required]
- **collection** `string` [path; required]
- **dataset** `string` [path; required]

### Query Parameters

- **$filter** `string | null` [query; optional]
  Row filter, e.g. `vendor eq 'Oracle' and price gt 100`. Comparison (`eq`, `ne`, `lt`, `le`, `gt`, `ge`), logical (`and`, `or`, `not`) and string (`contains`, `startswith`, `endswith`) operators, plus `cast()`, date functions, `now()` with durations for rolling windows, and the Opteryx extension `in_subnet(src_addr, '192.168.4.0/24')` for IPv4 columns. Case-sensitive; date literals are unquoted (`shipped_date gt 2024-01-01`). See [Querying via OData](/docs/guides/querying-via-odata#querying-a-dataset) for the full syntax.
- **$top** `integer | null` [query; optional]
  Limit result rows (0-25000, default 100). Value 0 with $count=true returns count only. Returns @odata.nextLink if result is truncated.
- **$skip** `integer | null` [query; optional]
  Skip N rows for pagination (server-driven). Requires $orderby: without a deterministic row order, paging duplicates some rows and drops others. Example: &$orderby=id asc&$skip=100 to fetch rows 101+. Combine with $top for paging.
- **$orderby** `string | null` [query; optional]
  Sort by column(s): 'col1 asc, col2 desc'. Default ascending. Example: &$orderby=created_date desc
- **$count** `string | null` [query; optional]
  Include total row count in response: 'true' or 'false' (default false). Use with $top=0 to get count only.
- **$select** `string | null` [query; optional]
  Select specific columns: 'col1,col2,col3' or '*' for all (default all). Reduces payload size.
- **$search** `string | null` [query; optional]
  Full-text search (not implemented; returns 501)
- **$compute** `string | null` [query; optional]
  Computed properties: comma-separated '&lt;expression> as &lt;name>' clauses, e.g. 'price mul quantity as TotalValue'. The expression uses the same operators and functions as $filter (add/sub/mul/div/mod, contains(), etc.), just producing a value instead of a boolean. The new name is then usable in $select, $orderby, and $filter on the same request, e.g. $compute=price mul quantity as TotalValue&$filter=TotalValue gt 100. Not supported combined with $apply in this version (400).
- **$apply** `string | null` [query; optional]
  Data aggregation: groupby((col), aggregate(amount with sum as Total, $count as Count)). Aggregates are written as '$count as Alias' or 'col with &lt;method> as Alias', where &lt;method> is one of sum, average, min, max -- that list is exhaustive, and function-call forms such as sum(amount) are not accepted. Transformations chain with '/', e.g. filter(x gt 1)/groupby((col), aggregate($count as Count)); a groupby with no aggregate deduplicates, so a distinct count is groupby((a,b))/groupby((a), aggregate($count as N)).

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Query succeeded; returns rows and pagination metadata (`application/json` `object`)
- **400** — Invalid query: malformed $filter, unsupported $top value (not 0-25000), negative $skip, $skip without $orderby, invalid $count value, invalid $apply expression, invalid $compute expression, $compute combined with $apply, OData-MaxVersion below 4.0, or a malformed @{label} version selector
- **401** — Missing or invalid authentication (no bearer token or basic auth)
- **403** — Forbidden: authenticated but no permission for dataset
- **404** — Dataset not found, or the @{label} version selector names a tag/snapshot/previous version that does not exist
- **406** — Accept header does not admit application/json, the only format this route returns
- **501** — Unsupported query feature: $search or $expand not implemented
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://odata.opteryx.app" data-path="/api/v4/{workstream}/{collection}/{dataset}" data-auth-docs="/docs/reference/api/authentication-api" data-token-optional="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://odata.opteryx.app</span>/api/v4/{workstream}/{collection}/{dataset}</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">optional</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Leave blank to read public datasets. Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Path parameters</div>
      <div class="t-params">
        <div class="t-pname">workstream<span>string · required</span></div>
        <input type="text" class="t-path" data-name="workstream" placeholder="string">
        <div class="t-pname">collection<span>string · required</span></div>
        <input type="text" class="t-path" data-name="collection" placeholder="string">
        <div class="t-pname">dataset<span>string · required</span></div>
        <input type="text" class="t-path" data-name="dataset" placeholder="string">
      </div>
    </div>
    <div class="t-field">
      <div class="t-label">Query parameters</div>
      <div class="t-params">
        <div class="t-pname">$filter<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="$filter" placeholder="string | null">
        <div class="t-pname">$top<span>integer | null · optional</span></div>
        <input type="text" class="t-query" data-name="$top" placeholder="integer | null">
        <div class="t-pname">$skip<span>integer | null · optional</span></div>
        <input type="text" class="t-query" data-name="$skip" placeholder="integer | null">
        <div class="t-pname">$orderby<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="$orderby" placeholder="string | null">
        <div class="t-pname">$count<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="$count" placeholder="string | null">
        <div class="t-pname">$select<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="$select" placeholder="string | null">
        <div class="t-pname">$search<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="$search" placeholder="string | null">
        <div class="t-pname">$compute<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="$compute" placeholder="string | null">
        <div class="t-pname">$apply<span>string | null · optional</span></div>
        <input type="text" class="t-query" data-name="$apply" placeholder="string | null">
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

## Per-dataset OData EDMX metadata

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v4/{workstream}/{collection}/{dataset}/$metadata</code>

**Tags:** OData v4

Returns OData $metadata (EDMX) for a single dataset, including column types and nullability, plus custom annotations carrying column statistics (Custom.Statistics.Min/Max, Min/MaxPrefix for text columns, DistinctValueCount, NullCount, Distribution, and CIDR for IPv4 columns), the source type name (Custom.OriginalType, Custom.SourceType), the caller's access (Custom.Role, Custom.Policy), dataset and column descriptions (Custom.Description, Custom.LLMDescribed), latest-snapshot metadata (Custom.Snapshot.Id/TotalRecords/TotalDataSize/CommitMessage/Author/ProducedBy, the last naming what made the commit as `kind:name` -- the segment after the colon is a catalog object for `task` and `view`, and a channel for `upload`), physical sort order (Custom.SortOrder.Column/Direction), snapshot tags (Custom.Tags.Count and Custom.Tags, a Collection of Records with Name, SnapshotId and CreatedBy), vector indexes (Custom.VectorIndexes, a Collection of Records with Name, Column, Method and Build), the dataset this one was FORKED from, if any (Custom.Fork, a Record with Upstream, RevisionsBehind, RevisionsAhead, BaseSnapshot, LastSyncMs and ForkedBy -- the two revision figures are UPPER BOUNDS, since a sequence number advances on every commit including maintenance, so render them as "at most N"; zero is exact, and the annotation is absent entirely for a dataset nobody cloned), the standing source list the current content was built from (Custom.Sources.Complete and Custom.Sources, a Collection of Records with Dataset and Visible), the commit receipt of the snapshot described (Custom.ReadSources.Reported, Custom.ReadSources.Truncated and Custom.ReadSources, a Collection of Records with Dataset, SnapshotId, ResolvedBy and Visible), and who READ that version (Custom.Consumers.Truncated and Custom.Consumers, a Collection of Records with Dataset, Visible, SnapshotId - the consumer's own version - Commits and ProducedBy; omitted entirely, flag included, when the lookup could not run, so an empty Collection beside the flag means nothing read it). Both name every source, including datasets the caller holds no grant on - a name is not readable data, and provenance that cannot be followed is not provenance - and Visible says which of those names the caller may actually read, so a client can decline to offer a link that would 403 rather than withholding the citation. Also materialized-view state (Custom.MaterializedView.\*). Annotations are omitted where they do not apply to the dataset kind or are unavailable. The dataset segment may carry a `@{label}` version selector -- `dataset@current`, `dataset@previous`, `dataset@{tag}`, or `dataset@{snapshot_id}` -- and the Custom.Snapshot.\* and Custom.ReadSources.\* annotations describe that version rather than the current one. Custom.Tags and Custom.Sources do NOT: a tag is a pin on the dataset and the source list is a property of its current content, so both are the same on every version's document.

### Path Parameters

- **workstream** `string` [path; required]
- **collection** `string` [path; required]
- **dataset** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — EDMX metadata document returned as XML (`application/json` `object`)
- **400** — Malformed @{label} version selector, or the dataset kind does not support snapshot versioning
- **401** — Missing or invalid authentication
- **403** — Forbidden: no permission to view dataset metadata
- **404** — Dataset not found in catalog, or the @{label} version selector names a tag/snapshot/previous version that does not exist
- **406** — Accept header does not admit application/xml, the only format this route returns
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

<details class="api-tryit" data-method="GET" data-base="https://odata.opteryx.app" data-path="/api/v4/{workstream}/{collection}/{dataset}/$metadata" data-auth-docs="/docs/reference/api/authentication-api" data-token-optional="1">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://odata.opteryx.app</span>/api/v4/{workstream}/{collection}/{dataset}/$metadata</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Bearer token <span class="t-opt">optional</span></div>
      <input type="password" class="t-token" autocomplete="off" placeholder="paste a token from the Authentication API">
      <div class="t-hint">Leave blank to read public datasets. Held in this tab only — never stored or logged. See the <a href="/docs/reference/api/authentication-api">Authentication API</a> for how to get one.</div>
    </div>
    <div class="t-field">
      <div class="t-label">Path parameters</div>
      <div class="t-params">
        <div class="t-pname">workstream<span>string · required</span></div>
        <input type="text" class="t-path" data-name="workstream" placeholder="string">
        <div class="t-pname">collection<span>string · required</span></div>
        <input type="text" class="t-path" data-name="collection" placeholder="string">
        <div class="t-pname">dataset<span>string · required</span></div>
        <input type="text" class="t-path" data-name="dataset" placeholder="string">
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
