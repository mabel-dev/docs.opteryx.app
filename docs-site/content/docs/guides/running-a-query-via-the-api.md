---
title: Running a Query via the Opteryx.app Jobs API
description: Authenticate and submit a SQL job to the hosted Opteryx.app Jobs API, poll for completion, and retrieve results. A full request/response walkthrough.
---

# Running a Query via the API

This guide is for [opteryx.app](https://opteryx.app), the hosted service — not the `opteryx-core` library. If you're embedding the engine in your own Python process instead, see [Querying Local Data](/docs/guides/querying-local-data).

Running a query against the hosted service is three calls: get an access token, submit the job, then poll for its result.

## 1. Get an Access Token

Exchange a client ID and secret for a bearer token, using the `client_credentials` grant:

```bash
curl -X POST https://authenticate.opteryx.app/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials' \
  -d 'client_id=YOUR_CLIENT_ID' \
  -d 'client_secret=YOUR_CLIENT_SECRET'
```

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYwNzA3IiwidHlwIjoiSldUIn0...",
  "token_type": "bearer",
  "expires_in": 300,
  "refresh_token": null
}
```

`access_token` is a short-lived JWT — `expires_in` is in seconds and varies by account, so re-authenticate rather than assuming a fixed lifetime. Use it as a bearer token on every subsequent call. See [Authentication API](/docs/reference/api/authentication-api) for how to create and revoke client credentials.

## 2. Submit the Job

Send the SQL as `sql_text` in the body of a `POST` to the Jobs API:

```bash
curl -X POST https://jobs.opteryx.app/api/v1/jobs \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYwNzA3IiwidHlwIjoiSldUIn0...' \
  -H 'Content-Type: application/json' \
  -d '{
        "sql_text": "SELECT id, name, mass FROM opteryx.test.planets LIMIT 5"
      }'
```

```json
{
  "execution_id": "20260707191803-cwt7cvre22nqymzd",
  "status": "SUBMITTED",
  "created_at": null,
  "status_url": "https://jobs.opteryx.app/api/v1/jobs/20260707191803-cwt7cvre22nqymzd/status"
}
```

`created_at` is not populated at submission time — read it back from the status or results response once the job has run. `status` values are upper case (`SUBMITTED`, `COMPLETED`, `FAILED`).

The request body accepts a `parameters` field, but at present it is not wired up to `:name` (or `@name`) placeholders in `sql_text` — a query with an unresolved placeholder fails with `ParameterError: Unresolved parameter in query`, regardless of what's in `parameters`. Until that's fixed, the working pattern is a `SET` statement ahead of the query, in the same `sql_text` batch:

```json
{
  "sql_text": "SET @min_mass = 100; SELECT name FROM opteryx.test.planets WHERE mass > @min_mass;"
}
```

> Warning: This embeds the value directly into `sql_text`, so it is only safe for values your own code has coerced to a known scalar type (cast to `int`/`float`/a validated date) *before* building the string — never for raw, unescaped user input. A string value assigned this way can still break out of the statement (e.g. via an embedded quote or semicolon), so treat it with the same care as any hand-built SQL string. This is a stopgap for a feature that isn't fully wired up yet, not a substitute for real bound parameters.

## 3. Poll for Completion

Jobs run asynchronously. Poll `status_url` (or construct it from `execution_id`) until `status` is no longer `SUBMITTED`:

```bash
curl https://jobs.opteryx.app/api/v1/jobs/20260707191803-cwt7cvre22nqymzd/status \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYwNzA3IiwidHlwIjoiSldUIn0...'
```

```json
{
  "execution_id": "20260707191803-cwt7cvre22nqymzd",
  "status": "COMPLETED",
  "finished_at": "2026-07-07T19:18:06.141000Z",
  "results_url": "https://jobs.opteryx.app/api/v1/jobs/20260707191803-cwt7cvre22nqymzd/results",
  "error_message": null
}
```

If `status` is `FAILED`, `error_message` describes what went wrong.

## 4. Get the Results

`num_rows` is required to be between 100 and 10000 inclusive — there's no way to ask for a smaller page:

```bash
curl 'https://jobs.opteryx.app/api/v1/jobs/20260707191803-cwt7cvre22nqymzd/results?num_rows=100' \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYwNzA3IiwidHlwIjoiSldUIn0...'
```

The response carries execution metadata — how many rows and bytes were processed, planning and execution time — plus the data itself. `data` is **columnar**, not a list of row objects: it's one entry per column, each with a `name`, a `type`, and a `values` array holding every row's value for that column:

```json
{
  "execution_id": "20260707191803-cwt7cvre22nqymzd",
  "sql_text": "SELECT id, name, mass FROM opteryx.test.planets LIMIT 5",
  "submitted_by": "bastian",
  "total_rows": 5,
  "bytes_processed": 0,
  "time_taken_s": 0.0,
  "data": [
    {
      "name": "id",
      "type": "INT64",
      "values": [1, 2, 3, 4, 5]
    },
    {
      "name": "name",
      "type": "VARCHAR",
      "values": ["Mercury", "Venus", "Earth", "Mars", "Jupiter"]
    },
    {
      "name": "mass",
      "type": "FLOAT64",
      "values": [0.33, 4.87, 5.97, 0.642, 1898.0]
    }
  ],
  "next_page": null
}
```

To turn this into rows, zip the `values` arrays together by position — `data[i].values[n]` for every column `i` is the n-th row. Most client code reaches for a small helper to do this once rather than repeating it inline:

```python
def to_rows(data):
    columns = [c["name"] for c in data]
    return [dict(zip(columns, values)) for values in zip(*(c["values"] for c in data))]
```

Page through a larger result with `num_rows` and `offset` (watch the 100–10000 bound on `num_rows`), or use the download endpoint to get the full result as a single CSV or JSON-lines file — see [Jobs API](/docs/reference/api/jobs-api) for both.

## Estimating Cost Before Running

For a query you suspect is expensive, `POST /api/v1/jobs/estimate` returns a coarse byte estimate without executing it — useful before running something against a large dataset:

```bash
curl -X POST https://jobs.opteryx.app/api/v1/jobs/estimate \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYwNzA3IiwidHlwIjoiSldUIn0...' \
  -H 'Content-Type: application/json' \
  -d '{ "sql_text": "SELECT * FROM opteryx.test.planets" }'
```

```json
{ "bytes": 0 }
```

## Related

- [Authentication API](/docs/reference/api/authentication-api)
- [Jobs API](/docs/reference/api/jobs-api)
- [Load and Query Data](/docs/getting-started/reading-data)
