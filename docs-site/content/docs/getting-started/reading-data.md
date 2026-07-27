# Load and Query Data

This page covers getting data into [opteryx.app](https://opteryx.app), the hosted service, and reading it back out with SQL. If you're embedding the `opteryx-core` engine directly in a Python process instead, see [Querying Local Data](/docs/guides/querying-local-data).

## Loading Data

Files are ingested through the [Upload API](/docs/reference/api/upload-api): open a session, upload one or more files as parts (Parquet, CSV, or NDJSON), then commit the session into a table. Opteryx Studio also has a guided upload flow in the UI that wraps the same API, if you'd rather drag and drop a file than script it.

For a full walkthrough of the session/part/commit flow, including the Python SDK, see [Upload client (Python SDK)](/docs/reference/python/upload).

## Reading Data

Once data is loaded, there are three ways to query it:

| Method | Auth | Best for |
| --- | --- | --- |
| [Jobs API](/docs/reference/api/jobs-api) | Required | Submitting arbitrary SQL over plain HTTP/JSON from any language. |
| [OData API](/docs/guides/querying-via-odata) | Anonymous read on public datasets; a token for anything else | Quick, filterable reads without writing any client code - see below. |
| [Arrow Flight SQL](/docs/guides/connecting-via-flight-sql) | Required | Larger result sets in Python - data streams as Arrow, no JSON round trip. |

See [Running a Query via the API](/docs/guides/running-a-query-via-the-api) for the Jobs API request/response walkthrough, and [Access and Permissions](/docs/core-concepts/access-and-permissions) for how tokens and policies control what each method can see.

### Try It: Public Sample Datasets

A handful of datasets under the `public` schema are readable with no account or token at all - useful for trying a query before you've loaded anything of your own:

| Dataset | Description |
| --- | --- |
| `public.astronomy.planets` | Small example table of planets (good for quick queries and demos). |
| `public.geopolitics.countries` | Reference table of countries. |
| `public.geopolitics.gdelt_events` | GDELT event records, ordered by `date_added`. |
| `public.github.events` | GitHub event stream samples (event-level rows), ordered by `created_at`. |
| `public.sales.orders` | Example sales orders table. |
| `public.sales.sales` | Example sales transactions table. |
| `public.security.cisa_kev` | CISA Known Exploited Vulnerabilities catalog. |
| `public.security.epss` | Exploit Prediction Scoring System (EPSS) data. |
| `public.security.exploit_db` | Exploit-DB entries. |
| `public.security.ghsa_advisories` | GitHub Security Advisories, ordered by `published_at`. |
| `public.security.ghsa_advisories_affected` | Packages/ecosystems affected by GHSA advisories, ordered by `ecosystem`. |
| `public.security.nvd_vulnerabilities` | National Vulnerability Database (NVD) records. |
| `public.security.exploited_vulnerabilities` | A view joining known-exploited and vulnerability data. |
| `public.security.vulnerabilities_per_week` | A view summarizing vulnerability counts per week. |

