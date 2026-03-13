# OData API

**Status:** Published

Base URL: https://odata.opteryx.app

## Overview

The OData service provides an OData v4-compliant API for discovering and querying Opteryx datasets. Requests are authenticated and enforce row-level security based on JWT claims.

The service supports service documents, EDMX metadata, and data queries and is compatible with BI tools such as Excel, Power BI, and Tableau.

**Endpoints**

End Point | Method | Description
--------- | ------ | -----------
`/api/v4/` | GET | Service document - lists accessible datasets
`/api/v4/$metadata` | GET | EDMX metadata document with schemas
`/api/v4/{workspace}/{collection}/{dataset}` | GET | Query data from a dataset
`/api/v4/{workspace}/{collection}/{dataset}/$metadata` | GET | Schema for a specific dataset

## Authentication

- Bearer token (recommended): `Authorization: Bearer {JWT}`
- Basic authentication (username:token) is supported for interactive tools; basic auth is exchanged for a JWT by the authentication gateway.

### Authentication examples (Python)

Bearer token example:

```python
import requests

url = "https://odata.opteryx.app/api/v4/public/examples/planets?$top=5"
headers = {"Authorization": "Bearer YOUR_JWT_HERE"}
resp = requests.get(url, headers=headers)
print(resp.status_code, resp.json())
```

Basic auth example (token as password):

```python
import requests

url = "https://odata.opteryx.app/api/v4/public/examples/planets?$top=5"
resp = requests.get(url, auth=("", "YOUR_TOKEN_HERE"))
print(resp.status_code, resp.json())
```

Tokens (personal access tokens / API keys) are created and managed from Opteryx Studio's Settings → API Tokens page. Use those tokens in `Authorization: Bearer` headers for long-lived programmatic access.

## OData v4 Query Parameters (Phase 1)

Supported parameters: `$filter`, `$select`, `$orderby`, `$top`, `$skip`, `$count`.

| Parameter | Description | Example |
|-----------|-------------|---------|
| `$filter` | Filter results using comparison and logical operators | `$filter=age gt 21 and status eq 'active'` |
| `$select` | Select specific columns | `$select=name,age` |
| `$orderby` | Sort by one or more columns | `$orderby=name asc, age desc` |
| `$top` | Limit number of results (default 100, max 10000) | `$top=100` |
| `$skip` | Skip N results for pagination | `$skip=200` |
| `$count` | Include total count of results | `$count=true` |

Notes:

- `$expand` is not supported in the current phase.
- Batching (`$batch`) is not supported.
- For large result sets the service returns paged responses and includes an `@odata.nextLink` property when more results are available — follow that link to fetch subsequent pages.

### Filter Operators

- Comparison: `eq`, `ne`, `gt`, `ge`, `lt`, `le`
- Logical: `and`, `or`, `not`
- String functions: `contains(field,'sub')`, `startswith(field,'pre')`, `endswith(field,'suf')` (case-sensitive)

### Aggregation

Aggregation functions and `$apply` support are limited in Phase 1; check the service for current support and examples.

## Examples

- Get first 10 rows:
```
GET /api/v4/public/demo/users?$top=10
```

- Filter and sort:
```
GET /api/v4/workspace/collection/dataset?$filter=age gt 21&$orderby=name&$top=100
```

- Aggregation:
```
GET /api/v4/workspace/collection/dataset?$apply=groupby((region), aggregate(sum(revenue) as TotalRevenue))&$select=region,TotalRevenue
```

## Service Document (Discover Datasets)

**Request:** `[GET] /api/v4/`

**Response:** JSON listing EntitySets accessible to the authenticated principal. Example:
```json
{
  "@odata.context": "/api/v4/$metadata",
  "value": [
    { "name": "public.demo.users", "kind": "EntitySet", "url": "public/demo/users" }
  ]
}
```

## Metadata

**Request:** `[GET] /api/v4/$metadata` returns an EDMX XML document describing EntityTypes and properties for accessible datasets.

## Permission Model

- Public datasets (`public.*`) - read access for authenticated users.
- Personal datasets (`personal.{username}.*`) - full access for owner only.
- Workspace datasets - access determined by assigned permissions.

Permissions are extracted from the JWT token and enforced at query time.

## Error Responses

Errors follow OData error format:
```json
{
  "error": {
    "code": "Forbidden",
    "message": "Access denied to dataset workspace.collection.dataset"
  }
}
```

Common codes: `Unauthorized` (401), `Forbidden` (403), `NotFound` (404), `InternalServerError` (500), `ServiceUnavailable` (503).

## BI Tool Integration

- Excel / Power BI / Tableau: Use the OData feed URL `https://odata.opteryx.app/api/v4` and Basic auth or OData-compatible token exchange.

## Notes and Limitations

- String comparisons in `$filter` are case-sensitive.
- Default `$top` is 100; maximum 10,000 rows per request.
- Phase 1 supports the most common OData query features; consult the service for up-to-date coverage.

## Development

Run locally for development:
```bash
uvicorn app.main:service --reload --host 0.0.0.0 --port 8890
```

Testing scripts and environment variables are documented in the repository README.
