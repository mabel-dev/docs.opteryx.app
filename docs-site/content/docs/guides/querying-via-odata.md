---
title: Querying via OData - Opteryx
description: Read data from the hosted Opteryx.app service using the OData v4 API - anonymous access to public datasets, service document discovery, $filter/$select/$top/$skip/$apply query options, paging with @odata.nextLink, and error handling.
---

# Querying via OData

This is for [opteryx.app](https://opteryx.app), the hosted service, via its OData v4 endpoint at `odata.opteryx.app`. If you want a plain HTTP/JSON API instead, see [Running a Query via the API](/docs/guides/running-a-query-via-the-api); for large result sets in Python, see [Connecting via Arrow Flight SQL](/docs/guides/connecting-via-flight-sql).

OData is read-only - no `INSERT`/`UPDATE`/`DELETE` - and, unlike the Jobs API or Flight SQL, doesn't require a token for every dataset: some are readable anonymously.

## Authentication

Select datasets under the `public` workspace can be queried with no credentials at all. Everything else needs a bearer token, carried the same way as the rest of the hosted service:

```
Authorization: Bearer <token>
```

That token must be a JWT access token, not a raw Personal Access Token (PAT). If you already hold a PAT (a `client_id`/`client_secret` pair) for another service - for example the one `opteryx_upload`'s `PATAuthenticator` uses - exchange it for a short-lived access token first:

```bash
curl -X POST https://authenticate.opteryx.app/token \
  -d grant_type=client_credentials \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET
```

Use the `access_token` from the response as the bearer token above, and refresh it before it expires. See [Authentication API](/docs/reference/api/authentication-api) for the full token endpoint reference, and [Access and Permissions](/docs/core-concepts/access-and-permissions) for how workspace policies decide what a token can see.

## Discovering Datasets

`GET` the service document to list every EntitySet your credentials (or lack of them) can see:

```bash
curl https://odata.opteryx.app/api/v4/
```

```json
{
  "@odata.context": "/api/v4/$metadata",
  "value": [
    {
      "name": "public.astronomy.planets",
      "kind": "EntitySet",
      "url": "public/astronomy/planets",
      "source": "Table",
      "role": "reader",
      "policy": "always-allow-public-read",
      "ordered": false,
      "orderBy": null,
      "orderDirection": null
    },
    {
      "name": "public.geopolitics.gdelt_events",
      "kind": "EntitySet",
      "url": "public/geopolitics/gdelt_events",
      "source": "Table",
      "role": "reader",
      "policy": "always-allow-public-read",
      "ordered": true,
      "orderBy": "date_added",
      "orderDirection": "asc"
    }
  ]
}
```

Each entry's `url` is the path to query, shaped `{workspace}/{collection}/{dataset}` - the same three-part addressing used elsewhere on the platform (for example the Upload API's `Target(workspace=..., collection=..., dataset=...)`). `public/astronomy/planets` means workspace `public`, collection `astronomy`, dataset `planets`. `public` and `personal` are special workspace values: `public` is anonymous-readable, and `personal` maps `collection` to the caller's own identity rather than a shared collection name.

`policy` is the ID of the policy (see [Policy API](/docs/reference/api/policy-api)) governing access to it - `always-allow-public-read` is the only one anonymous requests can satisfy. `source` distinguishes ordinary tables from `View`s and the `Virtual` `information_schema` entities present in every workspace. When `ordered` is `true`, results come back sorted by `orderBy` (in `orderDirection`) rather than in arbitrary order.

`@odata.context` points at `/api/v4/$metadata`, the CSDL metadata document describing each EntitySet's schema.

## Querying a Dataset

Combine the base URL with an entry's `url` from the service document:

```bash
curl "https://odata.opteryx.app/api/v4/public/astronomy/planets?$top=10"
```

For a dataset that needs a token, add the `Authorization` header:

```bash
curl "https://odata.opteryx.app/api/v4/opteryx/test/planets?$top=10" \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

Query options confirmed to work:

- **`$top`** - limit the number of rows returned. Defaults to 100, capped at 25,000; requesting more than the cap returns `400 Bad Request`.
- **`$skip`** - skip this many rows before returning results, for paging.
- **`$select`** - return only the named columns.
- **`$filter`** - restrict rows by an OData filter expression.
- **`$apply`** - group and aggregate rows server-side (see below).

```bash
curl "https://odata.opteryx.app/api/v4/public/security/nvd_vulnerabilities?$select=cve_id,severity&$filter=severity+eq+%27CRITICAL%27&$top=25"
```

On the larger public datasets (`public.security.nvd_vulnerabilities`, `public.geopolitics.gdelt_events`) prefer `$filter` and `$select` to cut down what's returned rather than paging through everything.

### Paging Through a Full Result Set

When a query matches more rows than `$top`, the response is exactly `$top` rows plus an `@odata.nextLink` pointing at the next page - it's never truncated silently, and it's not an error:

```json
{
  "@odata.context": "/api/v4/$metadata#astronomy.planets",
  "value": [ /* ... $top rows ... */ ],
  "@odata.nextLink": "https://odata.opteryx.app/api/v4/public/astronomy/planets?$top=100&$skip=100"
}
```

To read a full result set, keep following `@odata.nextLink` until a response has no `@odata.nextLink` key. `$top` only errors (`400`) if the *requested* value exceeds the 25,000 cap - a large true result set is paged, not rejected.

### Date and Timestamp Literals in `$filter`

Date and datetime literals must be unquoted ISO 8601, per the OData v4 spec - a quoted value is parsed as a string and raises a type-mismatch error against a timestamp column:

```bash
# correct - unquoted, compared as a timestamp
curl "https://odata.opteryx.app/api/v4/ichnos/landing/observations?$filter=observed_at ge 2026-07-20T00:00:00Z" \
  -H 'Authorization: Bearer YOUR_TOKEN'

# wrong - quoted, compared as a string, raises a type-mismatch error
# $filter=observed_at ge '2026-07-20T00:00:00Z'
```

### Aggregating with `$apply`

`$apply` groups and aggregates rows server-side, so you don't have to pull every row and dedupe or aggregate client-side. Supported aggregates are `$count`, `sum`, `average`, `min`, `max`, and `countdistinct`:

```bash
curl "https://odata.opteryx.app/api/v4/ichnos/landing/observations?$apply=groupby((source_ip),aggregate($count as observation_count))"
```

## Errors

Errors are JSON, shaped `{"error": {"code": ..., "message": ...}}`, with the HTTP status code reflecting the failure:

| Status | Meaning |
| --- | --- |
| `400` | Malformed `$filter`/`$apply` syntax, `$top` outside `0..25000`, or an unknown dataset referenced in the query itself |
| `401` | Missing or invalid bearer token |
| `403` | Authenticated, but the token's policy doesn't grant access to that dataset |
| `404` | Unknown dataset, when looked up via `$metadata` |
| `500` | Unexpected server-side error |

A query that fails never comes back as a `200` with an empty `value` array - failure and "no rows matched" are always distinguishable by status code.

## Related

- [Load and Query Data](/docs/getting-started/reading-data)
- [Running a Query via the API](/docs/guides/running-a-query-via-the-api)
- [Connecting via Arrow Flight SQL](/docs/guides/connecting-via-flight-sql)
- [Authentication API](/docs/reference/api/authentication-api)
- [Access and Permissions](/docs/core-concepts/access-and-permissions)
