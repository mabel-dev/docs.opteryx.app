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
      <td><span class="ep-name">Well Known Llms</span><span class="ep-verb ep-verb--get">get</span><code>/.well-known/llms.txt</code></td>
      <td class="ep-doc"><a href="#well-known-llms">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">OData v4 Service Document</span><span class="ep-verb ep-verb--get">get</span><code>/api/v4/</code></td>
      <td class="ep-doc"><a href="#odata-v4-service-document">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">OData v4 Service-wide EDMX Metadata</span><span class="ep-verb ep-verb--get">get</span><code>/api/v4/$metadata</code></td>
      <td class="ep-doc"><a href="#odata-v4-service-wide-edmx-metadata">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Query dataset rows</span><span class="ep-verb ep-verb--get">get</span><code>/api/v4/{workstream}/{collection}/{dataset}</code></td>
      <td class="ep-doc"><a href="#query-dataset-rows">View</a></td>
    </tr>
    <tr>
      <td><span class="ep-name">Per-dataset OData EDMX metadata</span><span class="ep-verb ep-verb--get">get</span><code>/api/v4/{workstream}/{collection}/{dataset}/$metadata</code></td>
      <td class="ep-doc"><a href="#per-dataset-odata-edmx-metadata">View</a></td>
    </tr>
  </tbody>
</table>

## Well Known Llms

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/.well-known/llms.txt</code>

**Tags:** service

Serve LLM directives file for automated agents.

### Responses

- **200** — Successful Response (`text/plain` `string`)

## OData v4 Service Document

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v4/</code>

**Tags:** OData v4

Returns the OData v4 service document listing all accessible EntitySets grouped by workspace and collection.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Service document with EntitySet list and access metadata (`application/json` `object`)
- **401** — Missing or invalid authentication
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## OData v4 Service-wide EDMX Metadata

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v4/$metadata</code>

**Tags:** OData v4

Returns the complete OData v4 EDMX metadata document describing all EntityTypes and EntitySets accessible to the authenticated user.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — EDMX metadata document (XML) (`application/json` `object`)
- **401** — Missing or invalid authentication
- **504** — Firestore unavailable; cannot enumerate datasets
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Query dataset rows

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v4/{workstream}/{collection}/{dataset}</code>

**Tags:** OData v4

Retrieve data from a dataset with OData v4 query parameters ($filter, $select, $orderby, $top, $skip, $apply, $count). Returns paginated results with total count and nextLink for server-driven paging.

### Path Parameters

- **workstream** `string` [path; required]
- **collection** `string` [path; required]
- **dataset** `string` [path; required]

### Query Parameters

- **$filter** `string | null` [query; optional]
  OData $filter expression for row filtering. Operators: eq (equal), ne (not equal), lt/le/gt/ge (comparison), and/or/not (logical), contains/startswith/endswith (string), in_subnet (IPv4 CIDR containment). Case-sensitive. in_subnet(ip_column, 'cidr') is an Opteryx extension for IPv4-typed columns, e.g. in_subnet(src_addr, '192.168.4.0/24'); the PostgreSQL <<= operator is not valid OData syntax. Example: vendor eq 'Oracle' and price gt 100. Date/datetime literals must be unquoted per the OData v4 spec, e.g. shipped_date gt 2024-01-01 — a quoted date is compared as a string and raises a type-mismatch error. Date and time functions: now() (the query's wall clock, evaluated once per query so every row sees the same instant), year(), month(), day(), hour(), minute(), second() (each returns the named component of a date or timestamp as an integer, e.g. year(shipped_date) eq 2024), and date() (narrows a timestamp to its date part, e.g. date(created_at) eq 2024-01-01). The OData functions time(), mindatetime() and maxdatetime() are not implemented and are rejected with a message naming what to write instead. Rolling windows: combine now() with an ISO 8601 duration literal using add or sub, e.g. published_at ge now() sub duration'P30D' for the last 30 days. The duration syntax is duration'PnYnMnDTnHnMnS', optionally signed, e.g. duration'P1Y', duration'P18M', duration'PT12H', duration'-P7D'. Year and month durations are calendar-aware — duration'P1Y' means one calendar year and duration'P1M' one calendar month, so their length depends on the date they are applied to — while day, hour, minute and second durations are fixed spans (duration'P30D' is always exactly 30 × 24 hours).
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
- **$apply** `string | null` [query; optional]
  Data aggregation: groupby((col), aggregate(amount with sum as Total, $count as Count)). Aggregates are written as '$count as Alias' or 'col with <method> as Alias', where <method> is one of sum, average, min, max -- that list is exhaustive, and function-call forms such as sum(amount) are not accepted. Transformations chain with '/', e.g. filter(x gt 1)/groupby((col), aggregate($count as Count)); a groupby with no aggregate deduplicates, so a distinct count is groupby((a,b))/groupby((a), aggregate($count as N)).

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Query succeeded; returns rows and pagination metadata (`application/json` `object`)
- **400** — Invalid query: malformed $filter, unsupported $top value (not 0-25000), negative $skip, $skip without $orderby, invalid $count value, or invalid $apply expression
- **401** — Missing or invalid authentication (no bearer token or basic auth)
- **403** — Forbidden: authenticated but no permission for dataset
- **501** — Unsupported query feature: $search or $expand not implemented
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Per-dataset OData EDMX metadata

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v4/{workstream}/{collection}/{dataset}/$metadata</code>

**Tags:** OData v4

Returns OData $metadata (EDMX) for a single dataset, including column types and nullability, plus custom annotations carrying column statistics (Custom.Statistics.Min/Max, DistinctValueCount, NullCount, Distribution, and CIDR for IPv4 columns), the source type name (Custom.OriginalType, Custom.SourceType), the caller's access (Custom.Role, Custom.Policy), dataset and column descriptions (Custom.Description, Custom.LLMDescribed), latest-snapshot metadata (Custom.Snapshot.Id/TotalRecords/TotalDataSize/CommitMessage/Author), physical sort order (Custom.SortOrder.Column/Direction), snapshot tags (Custom.Tags.Count and Custom.Tags, a Collection of Records with Name, SnapshotId and CreatedBy), and materialized-view state (Custom.MaterializedView.*). Annotations are omitted where they do not apply to the dataset kind or are unavailable.

### Path Parameters

- **workstream** `string` [path; required]
- **collection** `string` [path; required]
- **dataset** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — EDMX metadata document returned as XML (`application/json` `object`)
- **401** — Missing or invalid authentication
- **403** — Forbidden: no permission to view dataset metadata
- **404** — Dataset not found in catalog
- **422** — Validation Error (`application/json` `HTTPValidationError`)
