---
title: Querying via OData - Opteryx
description: Read data from the hosted Opteryx.app service using the OData v4 API - anonymous access to public datasets, service document discovery, and $filter/$select/$top query options.
---

# Querying via OData

This is for [opteryx.app](https://opteryx.app), the hosted service, via its OData v4 endpoint at `odata.opteryx.app`. If you want a plain HTTP/JSON API instead, see [Running a Query via the API](/docs/guides/running-a-query-via-the-api); for large result sets in Python, see [Connecting via Arrow Flight SQL](/docs/guides/connecting-via-flight-sql).

OData is read-only - no `INSERT`/`UPDATE`/`DELETE` - and, unlike the Jobs API or Flight SQL, doesn't require a token for every dataset: some are readable anonymously.

## Authentication

Datasets under the `public` schema are set to `always-allow-public-read` and can be queried with no credentials at all. Everything else needs a bearer token, carried the same way as the rest of the hosted service:

```
Authorization: Bearer <token>
```

See [Authentication API](/docs/reference/api/authentication-api) for how to mint one, and [Access and Permissions](/docs/core-concepts/access-and-permissions) for how workspace policies decide what a token can see.

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

Each entry's `url` is the path to query. `policy` is the ID of the policy (see [Policy API](/docs/reference/api/policy-api)) governing access to it - `always-allow-public-read` is the only one anonymous requests can satisfy. `source` distinguishes ordinary tables from `View`s and the `Virtual` `information_schema` entities present in every schema. When `ordered` is `true`, results come back sorted by `orderBy` (in `orderDirection`) rather than in arbitrary order.

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

- **`$top`** - limit the number of rows returned.
- **`$select`** - return only the named columns.
- **`$filter`** - restrict rows by an OData filter expression.

```bash
curl "https://odata.opteryx.app/api/v4/public/security/nvd_vulnerabilities?$select=cve_id,severity&$filter=severity+eq+%27CRITICAL%27&$top=25"
```

On the larger public datasets (`public.security.nvd_vulnerabilities`, `public.geopolitics.gdelt_events`) prefer `$filter` and `$select` to cut down what's returned rather than paging through everything.

## Related

- [Load and Query Data](/docs/getting-started/reading-data)
- [Running a Query via the API](/docs/guides/running-a-query-via-the-api)
- [Connecting via Arrow Flight SQL](/docs/guides/connecting-via-flight-sql)
- [Authentication API](/docs/reference/api/authentication-api)
- [Access and Permissions](/docs/core-concepts/access-and-permissions)
