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
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

Use `access_token` as a bearer token on every subsequent call. See [Authentication API](/docs/reference/api/authentication-api) for how to create and revoke client credentials.

## 2. Submit the Job

Send the SQL as `sql_text` in the body of a `POST` to the Jobs API:

```bash
curl -X POST https://jobs.opteryx.app/api/v1/jobs \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
        "sql_text": "SELECT name, mass FROM public.examples.planets ORDER BY mass DESC"
      }'
```

```json
{
  "execution_id": "8f14e45f-ceea-4b0f-8e1a-4c6d0f6d3d21",
  "status": "queued",
  "created_at": "2026-07-07T10:15:00Z",
  "status_url": "https://jobs.opteryx.app/api/v1/jobs/8f14e45f-ceea-4b0f-8e1a-4c6d0f6d3d21/status"
}
```

To bind parameters instead of interpolating values into `sql_text`, pass them under `parameters`:

```json
{
  "sql_text": "SELECT name FROM public.examples.planets WHERE mass > :min_mass",
  "parameters": { "min_mass": 1.0 }
}
```

> Warning: Never build `sql_text` by concatenating user input. Bind it through `parameters` — the same rule that applies to any parameterised SQL API.

## 3. Poll for Completion

Jobs run asynchronously. Poll `status_url` (or construct it from `execution_id`) until `status` is no longer `queued` or `running`:

```bash
curl https://jobs.opteryx.app/api/v1/jobs/8f14e45f-ceea-4b0f-8e1a-4c6d0f6d3d21/status \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
```

```json
{
  "execution_id": "8f14e45f-ceea-4b0f-8e1a-4c6d0f6d3d21",
  "status": "completed",
  "finished_at": "2026-07-07T10:15:02Z",
  "results_url": "https://jobs.opteryx.app/api/v1/jobs/8f14e45f-ceea-4b0f-8e1a-4c6d0f6d3d21/results"
}
```

If `status` is `failed`, `error_message` on this response describes what went wrong.

## 4. Get the Results

```bash
curl 'https://jobs.opteryx.app/api/v1/jobs/8f14e45f-ceea-4b0f-8e1a-4c6d0f6d3d21/results?num_rows=100' \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
```

The response carries the rows plus execution metadata — how much data was scanned, how long planning and execution took, and a `next_page` token if the result is larger than one page:

```json
{
  "execution_id": "8f14e45f-ceea-4b0f-8e1a-4c6d0f6d3d21",
  "sql_text": "SELECT name, mass FROM public.examples.planets ORDER BY mass DESC",
  "total_rows": 9,
  "bytes_processed": 4096,
  "time_taken_s": 0.031,
  "data": [
    { "name": "Jupiter", "mass": 1898.19 },
    { "name": "Saturn",  "mass": 568.34 }
  ],
  "next_page": null
}
```

Page through a larger result with `num_rows` and `offset`, or use the download endpoint to get the full result as a single CSV or JSON-lines file — see [Jobs API](/docs/reference/api/jobs-api) for both.

## Estimating Cost Before Running

For a query you suspect is expensive, `POST /api/v1/jobs/estimate` returns a coarse byte estimate without executing it — useful before running something against a large dataset:

```bash
curl -X POST https://jobs.opteryx.app/api/v1/jobs/estimate \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{ "sql_text": "SELECT * FROM public.nyc_taxi.2023_yellow_taxi_trips" }'
```

## Related

- [Authentication API](/docs/reference/api/authentication-api)
- [Jobs API](/docs/reference/api/jobs-api)
- [Load and Query Data](/docs/getting-started/reading-data)
