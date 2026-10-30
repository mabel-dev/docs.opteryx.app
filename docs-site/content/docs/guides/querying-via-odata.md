---
title: Querying via OData - Opteryx
description: Read live data from the hosted Opteryx.app service using the OData v4 API - connect from Power BI and Excel, page with @odata.nextLink, aggregate with $apply, read a tagged or prior snapshot, and handle errors.
---

# Querying via OData

[opteryx.app](https://opteryx.app), the hosted service, exposes datasets as an [OData v4](https://www.odata.org/) feed at `odata.opteryx.app`. OData is an OASIS standard for querying data over HTTP, so a large number of tools - Power BI and Excel among them - can read Opteryx data directly, with no driver to install and no export step.

If you want a plain HTTP/JSON API instead, see [Running a Query via the API](/docs/guides/running-a-query-via-the-api); for large result sets in Python, see [Connecting via Arrow Flight SQL](/docs/guides/connecting-via-flight-sql).

OData here is read-only - no `INSERT`/`UPDATE`/`DELETE`.

The query syntax used below is defined by the standard, not by Opteryx. For the full grammar see [OData v4.01 Part 2: URL Conventions](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html), and for `$apply` see the [Data Aggregation extension](https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html).

> **Try it yourself:** the companion notebook works through this page in Python with `requests` and pandas: it discovers the public datasets, reads a schema from `$metadata`, filters, sorts and counts the NVD vulnerability data, pages with `@odata.nextLink`, and aggregates CISA's known-exploited list with `$apply`. It needs no account or token. [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/query-public-data-with-odata.ipynb) or [download the notebook](/notebooks/query-public-data-with-odata.ipynb).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- explain how the OData service differs from taking an extract
- connect Power BI, Excel or another OData client to a dataset, with or without a token
- discover the datasets available to you, and query one with filters and paging via `@odata.nextLink`
- aggregate server-side with `$apply`, and read a tagged or prior snapshot
- recognise the errors the service returns and what each one means

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

A bearer token must be a JWT access token - see the [Authentication API](/docs/reference/api/authentication-api) for how to mint one. A raw Personal Access Token isn't accepted as a bearer token: if you hold a PAT (a `client_id`/`client_secret` pair, as used by `opteryx_upload`'s `PATAuthenticator`), exchange it for an access token at that endpoint first. [Access and Permissions](/docs/core-concepts/access-and-permissions) covers how workspace policies decide what a token can see.

Clients that can only store a user name and password - Power BI and Excel among them - can use HTTP Basic authentication instead, with the `client_id` as the user name and the PAT as the password. The service exchanges them for an access token on each request. [Iceberg in Power BI and Excel](/docs/guides/iceberg-in-power-bi-and-excel#step-2-create-a-credential-for-power-bi-and-excel) walks through it.

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
      "policy": "always-allow-public-anonymous",
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
      "policy": "always-allow-public-anonymous",
      "ordered": false,
      "orderBy": null,
      "orderDirection": null
    }
  ]
}
```

Each entry's `url` is the path to query, shaped `{workspace}/{collection}/{dataset}` - the same three-part addressing used elsewhere on the platform (for example the Upload API's `Target(workspace=..., collection=..., dataset=...)`). So `public/geopolitics/countries` is workspace `public`, collection `geopolitics`, dataset `countries`. One workspace name behaves specially: `personal` resolves `collection` to your own identity rather than a shared collection name.

`role` is the access level your credentials have on that entity set, and `policy` names the grant it comes from. `source` distinguishes ordinary tables from `View`s, `MaterializedView`s, `Task`s (scheduled jobs that write to another dataset, whose `$metadata` carries the task's definition), and the `Virtual` `information_schema` entities present in every workspace. When `ordered` is `true`, results come back sorted by `orderBy` (in `orderDirection`) rather than in arbitrary order.

`@odata.context` points at `/api/v4/$metadata`, the CSDL metadata document describing each EntitySet's schema. This is the document Power BI and Excel read to work out column names and types.

## Querying a Dataset

Combine the base URL with an entry's `url` from the service document:

```bash
curl 'https://odata.opteryx.app/api/v4/public/geopolitics/countries?$top=10'
```

Use **single quotes** around the URL. In `bash` and `zsh`, a double-quoted `"...?$top=10"` makes the shell expand `$top` as a variable and send `?=10` instead.

A URL can't contain a literal space, and curl rejects one before sending anything. For options with spaces in them, such as most `$filter` and `$apply` expressions, pass `-G` and one `--data-urlencode` per option, and curl encodes each for you. An option that contains OData's own single quotes needs double quotes instead, with the `$` escaped as `\$`.

For a dataset that needs a token, add the `Authorization` header:

```bash
curl 'https://odata.opteryx.app/api/v4/acme/security/findings?$top=10' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

Supported query options:

| Option | Behaviour |
| --- | --- |
| `$top` | Limit rows returned. Defaults to 100, capped at 100,000; a larger value returns `400`. |
| `$skip` | Skip this many rows before returning results - used for paging. |
| `$select` | Return only the named columns. |
| `$filter` | Restrict rows by an OData filter expression. |
| `$orderby` | Sort by one or more columns, each optionally `asc` or `desc`. |
| `$count` | With `$count=true`, adds `@odata.count` (rows matched, before `$top`). |
| `$apply` | Group and aggregate server-side. |

`$search` and `$expand` are not implemented and return `501 Not Implemented`.

```bash
curl -G 'https://odata.opteryx.app/api/v4/public/geopolitics/countries' \
  --data-urlencode "\$filter=region eq 'Europe'" \
  --data-urlencode '$orderby=country_name_common' \
  --data-urlencode '$top=5'
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

Keep following `@odata.nextLink` until a response comes back without one; that response is the last page. There's no limit on how far `$skip` can reach, so a result set of any size can be read in full this way. The 100,000 cap applies only to the value of `$top` in a single request - a large result set is paged, never rejected.

### Reading a Snapshot, Tag, or Prior Version

Every request queries current data by default - but a dataset's path segment can carry a `@{label}` version selector to read a different point in its history instead:

| Selector | Reads |
| --- | --- |
| `dataset` (no `@`) | Current data - the default |
| `dataset@current` | Current data, explicitly |
| `dataset@previous` | The version of the data before this one. Maintenance operations that change no rows - compaction, statistics refresh - are skipped, so this always names a version with different data, not just a different snapshot id. |
| `dataset@{tag}` | A named, immutable snapshot |
| `dataset@{snapshot_id}` | A specific snapshot, by id |

```bash
curl 'https://odata.opteryx.app/api/v4/public/geopolitics/countries@previous?$top=5'
curl 'https://odata.opteryx.app/api/v4/public/geopolitics/countries@1791779848300?$top=5'
curl 'https://odata.opteryx.app/api/v4/acme/security/findings@YOUR_TAG?$top=5' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

None of the public datasets carry a tag, so the last line is a placeholder: substitute a dataset of your own and a tag it holds.

A dataset's metadata shows the snapshot it currently resolves to in `Custom.Snapshot.Id`, and how many tags it holds in `Custom.Tags.Count`:

```bash
curl 'https://odata.opteryx.app/api/v4/public/geopolitics/countries/$metadata'
```

Requesting `$metadata` for a labelled dataset (`.../countries@previous/$metadata`) describes that version rather than the current one - its `Custom.Snapshot.*` annotations reflect the snapshot the label resolved to.

An unknown tag, or `@previous` on a dataset with no earlier version, returns `404`. An unknown snapshot id currently returns `503` with the message `dataset could not be read from storage`, not `404`; its `$metadata` does return `404`. A malformed selector - `dataset@` with nothing after the `@`, for instance - returns `400`.

`@{tag}` and `@{snapshot_id}` are immutable, so paging with `$skip`/`$top` through one is fully consistent from first page to last. `@current` and `@previous` are resolved fresh on every request, so a page fetched partway through a paging loop can reflect a write that landed after the loop started - the same caveat that applies to any live query, not something specific to naming a version.

### Dates and Timestamps in `$filter`

Date and datetime literals are unquoted ISO 8601, per the OData standard:

```bash
curl -G 'https://odata.opteryx.app/api/v4/public/security/cisa_kev' \
  --data-urlencode '$filter=date_added ge 2025-01-01' \
  --data-urlencode '$top=5'
```

Quoting the value makes it a string, and comparing a string to a date or timestamp column is rejected rather than silently matching nothing:

```json
{
  "error": {
    "code": "BadRequest",
    "message": "Invalid query: column *cisa_kev.date_added* (`DATE`) and literal `2025-01-01` (`VARCHAR`) cannot be compared, because their types do not match. Date and time literals are unquoted in OData v4: write `date_added ge 2024-01-01T00:00:00Z`, not `date_added ge '2024-01-01T00:00:00Z'` -- a quoted literal is a string."
  }
}
```

A date-only literal (`2025-01-01`) and a full datetime literal (`2025-01-01T00:00:00Z`) are both accepted against either a `DATE` or a `TIMESTAMP` column, and naming the same instant either way selects the same rows. Use whichever matches the precision you need.

Where the two sides differ in precision, a date is read as midnight UTC on that day - which decides what lands on the boundary. Against a `DATE` column, `date_added lt 2026-08-03T12:00:00Z` includes the rows dated `2026-08-03`, because their midnight falls before noon, while `date_added lt 2026-08-03` excludes them. The same widening applies in reverse: `published_at lt 2026-07-01` excludes everything timestamped on the 1st, because those rows are at or after midnight.

A timezone designator is optional and is honoured when present. `2026-07-01T00:00:00Z`, `2026-07-01T00:00:00+00:00`, `2026-07-01T00:00:00` and `2026-07-01T05:00:00+05:00` all name the same instant and return the same rows.

Fractional seconds are accepted up to six digits, so the output of Python's `datetime.isoformat()` can be used as it is. Seven or more aren't recognised as a datetime, so the literal is read as a string and rejected on type:

```bash
curl -G 'https://odata.opteryx.app/api/v4/public/security/ghsa_advisories' \
  --data-urlencode '$filter=published_at ge 2026-07-01T00:00:00.1234567Z'
```

```json
{
  "error": {
    "code": "BadRequest",
    "message": "Invalid query: column *ghsa_advisories.published_at* (`TIMESTAMP[us]`) and literal `2026-07-01T00:00:00.1234567Z` (`VARCHAR`) cannot be compared, because their types do not match. Date and time literals are unquoted in OData v4: write `published_at ge 2024-01-01T00:00:00Z`, not `published_at ge '2024-01-01T00:00:00Z'` -- a quoted literal is a string."
  }
}
```

Truncate to six digits, or drop the fractional part, when building a literal from a machine-generated timestamp.

### Date functions and rolling windows

`now()` is the current UTC instant. It takes no arguments and is evaluated once
per query, so every row is compared against the same moment rather than a clock
that drifts as the scan proceeds.

Combined with an ISO 8601 duration literal and `add`/`sub`, it expresses a
rolling window server-side, which keeps the query correct when it's re-run
tomorrow:

```bash
curl -G 'https://odata.opteryx.app/api/v4/public/security/ghsa_advisories' \
  --data-urlencode "\$filter=published_at ge now() sub duration'P30D'" \
  --data-urlencode '$count=true' \
  --data-urlencode '$top=5'
```

The duration is ISO 8601: `P<n>D` days, `P<n>M` months, `P<n>Y` years, and
after a `T`, `PT<n>H` hours, `PT<n>M` minutes, `PT<n>S` seconds. Parts combine -
`P1DT2H30M` is a day and a half-past-two. Years and months are calendar-aware:
`P1Y` is a calendar year, not 365.25 days. Weeks (`P2W`) are **not** accepted;
write the equivalent in days.

The date component functions return integers, and work on `DATE` and `TIMESTAMP`
columns alike:

| Function | Returns | Example |
| --- | --- | --- |
| `year(col)`, `month(col)`, `day(col)` | integer | `year(date_added) eq 2025` |
| `hour(col)`, `minute(col)`, `second(col)` | integer | `hour(published_at) eq 9` |
| `date(col)` | date | `date(published_at) eq 2026-08-03` |

`hour()`, `minute()` and `second()` are only meaningful on a `TIMESTAMP` column.
`date()` narrows a timestamp to its day, so `date(published_at) eq 2026-08-03`
matches the whole day where `published_at eq 2026-08-03` matches only midnight.

Prefer a literal range over a component function where both express the same
question. `date_added ge 2025-01-01 and date_added lt 2026-01-01` can skip whole
files using their stored min/max, while `year(date_added) eq 2025` has to read
every row to evaluate the function.

`time()`, `mindatetime()` and `maxdatetime()` parse - they're part of the OData
v4 grammar - but aren't implemented, and return a 400 naming what to write
instead. There's no cast from a timestamp to a time, and the extremes of
`Edm.DateTimeOffset` fall outside the range an Opteryx timestamp can hold.

### Converting types with `cast()`

`cast(col, Edm.Type)` converts a value before it's compared, for when a column
holds data in a different type from the one you need. `iso_numeric` in the
countries dataset is text, zero-padded to three digits, so `iso_numeric eq '4'`
matches nothing - Afghanistan is stored as `'004'`. Compared as a number, it
matches:

```bash
curl -G 'https://odata.opteryx.app/api/v4/public/geopolitics/countries' \
  --data-urlencode '$filter=cast(iso_numeric, Edm.Int32) eq 4' \
  --data-urlencode '$select=country_name_common,iso_numeric'
```

A value that doesn't convert becomes `null`, as the OData standard defines it,
rather than failing the query - Kosovo has no ISO numeric code, and its empty
string simply doesn't match. To find the values that don't convert, compare
the cast with `null`: `cast(iso_numeric, Edm.Int32) eq null`.

| Target | Converts to |
| --- | --- |
| `Edm.String` | text |
| `Edm.Boolean` | boolean |
| `Edm.Byte`, `Edm.SByte`, `Edm.Int16`, `Edm.Int32`, `Edm.Int64` | integers of that width |
| `Edm.Single`, `Edm.Double` | floating point |
| `Edm.Decimal` | fixed point, 18 digits with 6 after the point |
| `Edm.Date` | date - from a timestamp, the same as `date()` |
| `Edm.DateTimeOffset` | timestamp |

The type name is unquoted, as the standard writes it. `cast()` works in
`$compute` as well as `$filter`, so `$compute=cast(iso_numeric, Edm.Int32) as iso_code`
makes the converted value available to `$select` and `$orderby`.

`Edm.TimeOfDay`, `Edm.Duration`, `Edm.Binary` and `Edm.Guid` are valid OData
targets but aren't supported, and return a 400 naming what to write instead.
Neither is the one-argument form `cast(Edm.Type)`, which casts the entity itself
to a derived type - no entity type here has one. `isof()` isn't implemented.

Don't reach for `cast()` to compare against a quoted literal: write the literal
in the column's own type instead. `date_added ge 2025-01-01` is right;
`cast(date_added, Edm.String) ge '2025-01-01'` happens to work for ISO dates but
compares text, and can't skip files using their stored min/max.

### Aggregating with `$apply`

`$apply` groups and aggregates server-side, so you don't have to pull every row back to count or deduplicate it. `$count`, `sum`, `average`, `min`, `max` and `countdistinct` are available:

```bash
curl -G 'https://odata.opteryx.app/api/v4/public/geopolitics/countries' \
  --data-urlencode '$apply=groupby((region),aggregate($count as country_count))'
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
| `400` | Malformed `$filter`/`$apply` syntax, a type mismatch in a comparison, `$top` above 100,000, or a malformed `@{label}` version selector |
| `401` | Missing or invalid bearer token |
| `403` | Authenticated, but not permitted to read that dataset |
| `404` | No such dataset, or a `@{label}` version selector names a tag or previous version that doesn't exist |
| `501` | `$search` or `$expand` - recognised by the standard, not implemented here |
| `500` | Unexpected server-side error |
| `503` | The dataset couldn't be read from storage. An unknown `@{snapshot_id}` currently returns this too, rather than `404` |

A failed read is never returned as a `200` with an empty `value` array. An empty `value` means the query ran and matched no rows; anything else is a non-2xx status with an error body. This distinction is guaranteed, so a consumer can safely treat "empty" as a real result rather than having to guess whether the read failed.

Queries are executed by the Opteryx SQL engine, and some messages it raises are phrased for SQL. Your OData request is not translated into SQL before it runs; it's compiled directly into an execution plan. Type-mismatch errors are restated for OData - a quoted date or number is told to drop the quotes, and any other mismatch is given the OData `cast()` to write, in your own column - but other messages can still name SQL types or syntax. Read those as a description of the underlying problem - the [Data Types](/docs/reference/sql/data-types) reference explains the types being compared - and fix it in the OData expression rather than trying to pass SQL through a query option.

## Related

- [OData notebook in Google Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/query-public-data-with-odata.ipynb) - query the public NVD and CISA KEV datasets with no account
- [Load and Query Data](/docs/getting-started/reading-data)
- [Running a Query via the API](/docs/guides/running-a-query-via-the-api)
- [Connecting via Arrow Flight SQL](/docs/guides/connecting-via-flight-sql)
- [Authentication API](/docs/reference/api/authentication-api)
- [Access and Permissions](/docs/core-concepts/access-and-permissions)
