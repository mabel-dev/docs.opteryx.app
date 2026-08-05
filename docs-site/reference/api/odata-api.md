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

Returns the OData v4 service document listing all accessible EntitySets grouped by workspace and collection.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Service document with EntitySet list and access metadata (`application/json` `object`)
- **401** — Missing or invalid authentication
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## OData v4 Service-wide EDMX Metadata

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v4/$metadata</code>

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
  OData $filter expression for row filtering. Operators: eq (equal), ne (not equal), lt/le/gt/ge (comparison), and/or/not (logical), contains/startswith/endswith (string). Case-sensitive. Example: vendor eq 'Oracle' and price gt 100. Date/datetime literals must be unquoted per the OData v4 spec, e.g. shipped_date gt 2024-01-01 — a quoted date is compared as a string and raises a type-mismatch error.
- **$top** `integer | null` [query; optional]
  Limit result rows (0-25000, default 100). Value 0 with $count=true returns count only. Returns @odata.nextLink if result is truncated.
- **$skip** `integer | null` [query; optional]
  Skip N rows for pagination (server-driven). Example: &$skip=100 to fetch rows 101+. Combine with $top for paging.
- **$orderby** `string | null` [query; optional]
  Sort by column(s): 'col1 asc, col2 desc'. Default ascending. Example: &$orderby=created_date desc
- **$count** `string | null` [query; optional]
  Include total row count in response: 'true' or 'false' (default false). Use with $top=0 to get count only.
- **$select** `string | null` [query; optional]
  Select specific columns: 'col1,col2,col3' or '*' for all (default all). Reduces payload size.
- **$search** `string | null` [query; optional]
  Full-text search (not implemented; returns 501)
- **$apply** `string | null` [query; optional]
  Data aggregation: groupby((col), aggregate(sum(amount) as Total, $count as Count)). Supports min, max, average, sum, countdistinct.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Query succeeded; returns rows and pagination metadata (`application/json` `object`)
- **400** — Invalid query: malformed $filter, unsupported $top value (not 0-25000), invalid $count value, or invalid $apply expression
- **401** — Missing or invalid authentication (no bearer token or basic auth)
- **403** — Forbidden: authenticated but no permission for dataset
- **501** — Unsupported query feature: $search or $expand not implemented
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Per-dataset OData EDMX metadata

**Request:** <span class="ep-verb ep-verb--get">get</span><code>/api/v4/{workstream}/{collection}/{dataset}/$metadata</code>

**Tags:** OData v4

Returns OData $metadata (EDMX) for a single dataset, including column types, nullability, cardinality, and min/max values as custom annotations.

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
