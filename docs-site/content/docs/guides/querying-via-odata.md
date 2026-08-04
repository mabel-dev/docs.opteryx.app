---
title: Querying via OData - Opteryx
description: Read live data from the hosted Opteryx.app service using the OData v4 API - connect from Power BI and Excel, page with @odata.nextLink, aggregate with $apply, and handle errors.
---

# Querying via OData

[opteryx.app](https://opteryx.app), the hosted service, exposes datasets as an [OData v4](https://www.odata.org/) feed at `odata.opteryx.app`. OData is an OASIS standard for querying data over HTTP, so a large number of tools - Power BI and Excel among them - can read Opteryx data directly, with no driver to install and no export step.

If you want a plain HTTP/JSON API instead, see [Running a Query via the API](/docs/guides/running-a-query-via-the-api); for large result sets in Python, see [Connecting via Arrow Flight SQL](/docs/guides/connecting-via-flight-sql).

OData here is read-only - no `INSERT`/`UPDATE`/`DELETE`.

The query syntax used below is defined by the standard, not by Opteryx. For the full grammar see [OData v4.01 Part 2: URL Conventions](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html), and for `$apply` see the [Data Aggregation extension](https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html).

## A Live View, Not an Extract

Every request queries current data. There's no extract to schedule and no copy to keep in sync - a dashboard refreshing hourly shows the data as it stood at each refresh.

Each refresh is a real query, so push the work into it with `$filter`, `$select` and `$apply` rather than pulling everything back and reducing it client-side.

## Connecting from Power BI, Excel, and Other Tools

Point any OData v4 client at the service root to browse the datasets available to you, or at a single dataset URL to go straight to one:

```
https://odata.opteryx.app/api/v4/
```

Power BI and Excel are the two clients we test against; Microsoft documents the connection steps for [Power BI](https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-connect-odata) and [Excel](https://support.microsoft.com/en-us/office/connect-to-an-odata-feed-power-query-4441a94d-9392-488a-a6a9-739b6d2ad500). Anything else implementing OData v4 should work the same way - the [OData ecosystem list](https://www.odata.org/ecosystem/) covers the wider set of clients and libraries.

Clients that implement server-driven paging follow `@odata.nextLink` for you, so a dataset larger than one page still loads in full without any extra configuration.

## Authentication

Requests carry a bearer token, the same as the rest of the hosted service:

```
Authorization: Bearer <token>
```

This must be a JWT access token - see the [Authentication API](/docs/reference/api/authentication-api) for how to mint one. A raw Personal Access Token isn't accepted here: if you hold a PAT (a `client_id`/`client_secret` pair, as used by `opteryx_upload`'s `PATAuthenticator`), exchange it for an access token at that endpoint first. [Access and Permissions](/docs/core-concepts/access-and-permissions) covers how workspace policies decide what a token can see.

## Discovering Datasets

`GET` the service document to list every EntitySet available to you:

```bash
curl https://odata.opteryx.app/api/v4/
```

```json
{
  "@odata.context": "/api/v4/$metadata",
  "value": [
    {
      "name": "public.geopolitics.countries",
      "kind": "EntitySet",
      "url": "public/geopolitics/countries",
      "source": "Table",
      "role": "reader",
      "ordered": false,
      "orderBy": null,
      "orderDirection": null
    },
    {
      "name": "public.security.cisa_kev",
      "kind": "EntitySet",
      "url": "public/security/cisa_kev",
      "source": "Table",
      "role": "reader",
      "ordered": false,
      "orderBy": null,
      "orderDirection": null
    }
  ]
}
```

Each entry's `url` is the path to query, shaped `{workspace}/{collection}/{dataset}` - the same three-part addressing used elsewhere on the platform (for example the Upload API's `Target(workspace=..., collection=..., dataset=...)`). So `public/geopolitics/countries` is workspace `public`, collection `geopolitics`, dataset `countries`. One workspace name behaves specially: `personal` resolves `collection` to your own identity rather than a shared collection name.

`role` is the access level your credentials have on that entity set. `source` distinguishes ordinary tables from `View`s and the `Virtual` `information_schema` entities present in every workspace. When `ordered` is `true`, results come back sorted by `orderBy` (in `orderDirection`) rather than in arbitrary order.

`@odata.context` points at `/api/v4/$metadata`, the CSDL metadata document describing each EntitySet's schema. This is the document Power BI and Excel read to work out column names and types.

## Querying a Dataset

Combine the base URL with an entry's `url` from the service document:

```bash
curl 'https://odata.opteryx.app/api/v4/public/geopolitics/countries?$top=10'
```

Use **single quotes** around the URL. In `bash` and `zsh`, a double-quoted `"...?$top=10"` makes the shell expand `$top` as a variable and send `?=10` instead.

For a dataset that needs a token, add the `Authorization` header:

```bash
curl 'https://odata.opteryx.app/api/v4/acme/security/findings?$top=10' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

Supported query options:

| Option | Behaviour |
| --- | --- |
| `$top` | Limit rows returned. Defaults to 100, capped at 25,000; a larger value returns `400`. |
| `$skip` | Skip this many rows before returning results - used for paging. |
| `$select` | Return only the named columns. |
| `$filter` | Restrict rows by an OData filter expression. |
| `$orderby` | Sort by one or more columns, each optionally `asc` or `desc`. |
| `$count` | With `$count=true`, adds `@odata.count` (rows matched, before `$top`). |
| `$apply` | Group and aggregate server-side. |

`$search` and `$expand` are not implemented and return `501 Not Implemented`.

```bash
curl 'https://odata.opteryx.app/api/v4/public/geopolitics/countries?$filter=region eq %27Europe%27&$orderby=country_name_common&$top=5'
```

### Paging Through a Full Result Set

When a query matches more rows than `$top`, the response carries exactly `$top` rows plus an `@odata.nextLink` for the next page. Results are never silently truncated, and exceeding `$top` is not an error:

```json
{
  "@odata.context": "/api/v4/$metadata#public_geopolitics_countries",
  "value": [ "..." ],
  "@odata.nextLink": "/api/v4/public/geopolitics/countries?%24top=2&%24skip=2"
}
```

Two details matter if you're writing the paging loop yourself. The link is **relative** - resolve it against `https://odata.opteryx.app` - and the `$` in the query string arrives **percent-encoded as `%24`**, which is equivalent and should be passed through unchanged rather than rewritten.

Keep following `@odata.nextLink` until a response comes back without one; that response is the last page. There's no limit on how far `$skip` can reach, so a result set of any size can be read in full this way. The 25,000 cap applies only to the value of `$top` in a single request - a large result set is paged, never rejected.

### Dates and Timestamps in `$filter`

Date and datetime literals are unquoted ISO 8601, per the OData standard:

```bash
curl 'https://odata.opteryx.app/api/v4/public/security/cisa_kev?$filter=date_added ge 2025-01-01&$top=5'
```

Quoting the value makes it a string, and comparing a string to a date or timestamp column is rejected rather than silently matching nothing:

```json
{
  "error": {
    "code": "BadRequest",
    "message": "Invalid query: Incompatible types for column 'cisa_kev.date_added' (DATE) and literal '2025-01-01' (VARCHAR). Using `CAST(column AS type)` may help resolve."
  }
}
```

A date-only literal (`2025-01-01`) and a full datetime literal (`2025-01-01T00:00:00Z`) are both accepted against either a `DATE` or a `TIMESTAMP` column, and naming the same instant either way selects the same rows. Use whichever matches the precision you need.

Where the two sides differ in precision, a date is read as midnight UTC on that day - which decides what lands on the boundary. Against a `DATE` column, `date_added lt 2026-08-03T12:00:00Z` includes the rows dated `2026-08-03`, because their midnight falls before noon, while `date_added lt 2026-08-03` excludes them. The same widening applies in reverse: `published_at lt 2026-07-01` excludes everything timestamped on the 1st, because those rows are at or after midnight.

A timezone designator is optional and is honoured when present. `2026-07-01T00:00:00Z`, `2026-07-01T00:00:00+00:00`, `2026-07-01T00:00:00` and `2026-07-01T05:00:00+05:00` all name the same instant and return the same rows.

Fractional seconds are accepted up to five digits. Six or more - which is what Python's `datetime.isoformat()` emits - aren't recognised as a datetime, so the literal is read as a string and rejected on type:

```bash
curl 'https://odata.opteryx.app/api/v4/public/security/ghsa_advisories?$filter=published_at ge 2026-07-01T00:00:00.123456Z'
```

```json
{
  "error": {
    "code": "BadRequest",
    "message": "Invalid query: Incompatible types for column 'ghsa_advisories.published_at' (TIMESTAMP) and literal '2026-07-01T00:00:00.123456Z' (VARCHAR). Using `CAST(column AS type)` may help resolve."
  }
}
```

Truncate to five digits, or drop the fractional part, when building a literal from a machine-generated timestamp.

To filter a rolling window, compute the boundary in the calling code and interpolate it - OData has no `now()` and no relative-date syntax.

### Aggregating with `$apply`

`$apply` groups and aggregates server-side, so you don't have to pull every row back to count or deduplicate it. `$count`, `sum`, `average`, `min`, `max` and `countdistinct` are available:

```bash
curl 'https://odata.opteryx.app/api/v4/public/geopolitics/countries?$apply=groupby((region),aggregate($count as country_count))'
```

```json
{
  "@odata.context": "/api/v4/$metadata#public_geopolitics_countries",
  "value": [
    { "region": "Africa", "country_count": 59 },
    { "region": "Americas", "country_count": 56 },
    { "region": "Asia", "country_count": 50 },
    { "region": "Europe", "country_count": 53 },
    { "region": "Oceania", "country_count": 27 },
    { "region": "Antarctic", "country_count": 5 }
  ]
}
```

For a distinct list of values, group by the column without aggregating it further - that returns one row per distinct value, rather than every underlying row for you to deduplicate.

Note that `$apply` combined with `$orderby` on an aggregate alias is not currently supported; sort the aggregated result client-side.

## Try It

This queries `public.geopolitics.countries` live - 250 rows. Edit the options and the request URL updates as you type.

<details class="api-tryit" data-method="GET" data-base="https://odata.opteryx.app" data-path="/api/v4/public/geopolitics/countries">
  <summary class="api-tryit__bar">
    <span class="t-verb t-verb--get">get</span>
    <span class="t-url"><span class="t-host">https://odata.opteryx.app</span>/api/v4/public/geopolitics/countries</span>
    <span class="t-open"></span>
  </summary>
  <div class="api-tryit__body">
    <div class="t-field">
      <div class="t-label">Query options</div>
      <div class="t-params">
        <div class="t-pname">$filter<span>expression · optional</span></div>
        <input type="text" class="t-query" data-name="$filter" value="region eq 'Europe'" placeholder="region eq 'Europe'">
        <div class="t-pname">$select<span>columns · optional</span></div>
        <input type="text" class="t-query" data-name="$select" placeholder="country_name_common,capital,population">
        <div class="t-pname">$orderby<span>column [asc|desc] · optional</span></div>
        <input type="text" class="t-query" data-name="$orderby" value="country_name_common" placeholder="area_km2 desc">
        <div class="t-pname">$top<span>integer · optional</span></div>
        <input type="text" class="t-query" data-name="$top" value="5" placeholder="100">
        <div class="t-pname">$skip<span>integer · optional</span></div>
        <input type="text" class="t-query" data-name="$skip" placeholder="0">
        <div class="t-pname">$apply<span>aggregation · optional</span></div>
        <input type="text" class="t-query" data-name="$apply" placeholder="groupby((region),aggregate($count as n))">
        <div class="t-pname">$count<span>true · optional</span></div>
        <input type="text" class="t-query" data-name="$count" placeholder="true">
      </div>
      <div class="t-hint">Columns include <code>iso_alpha2</code>, <code>country_name_common</code>, <code>capital</code>, <code>region</code>, <code>subregion</code>, <code>area_km2</code>, <code>landlocked</code>, <code>independent</code>, <code>un_member</code>, <code>lat</code>, <code>lng</code>. Leave a field blank to omit it.</div>
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

## Errors

Errors are JSON, shaped `{"error": {"code": ..., "message": ...}}`, with the HTTP status reflecting the failure:

| Status | Meaning |
| --- | --- |
| `400` | Malformed `$filter`/`$apply` syntax, a type mismatch in a comparison, or `$top` above 25,000 |
| `401` | Missing or invalid bearer token |
| `403` | Authenticated, but not permitted to read that dataset |
| `404` | No such dataset |
| `501` | `$search` or `$expand` - recognised by the standard, not implemented here |
| `500` | Unexpected server-side error |

A failed read is never returned as a `200` with an empty `value` array. An empty `value` means the query ran and matched no rows; anything else is a non-2xx status with an error body. This distinction is guaranteed, so a consumer can safely treat "empty" as a real result rather than having to guess whether the read failed.

Queries are executed by the Opteryx SQL engine, and some messages it raises are phrased for SQL - the type-mismatch error above suggesting `CAST(column AS type)` is one example. Your OData request is not translated into SQL before it runs; it's compiled directly into an execution plan. So read that kind of advice as a description of the underlying type problem - the [Data Types](/docs/reference/sql/data-types) reference explains the types being compared - and fix it in the OData expression rather than trying to pass SQL through a query option.

## Related

- [Load and Query Data](/docs/getting-started/reading-data)
- [Running a Query via the API](/docs/guides/running-a-query-via-the-api)
- [Connecting via Arrow Flight SQL](/docs/guides/connecting-via-flight-sql)
- [Authentication API](/docs/reference/api/authentication-api)
- [Access and Permissions](/docs/core-concepts/access-and-permissions)
