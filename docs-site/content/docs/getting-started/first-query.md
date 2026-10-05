---
title: Your First Query - Opteryx Quick Start
description: Run a SQL query with Opteryx in about two minutes - in the browser with Opteryx Studio, over OData with no account at all, or locally in Python with opteryx-core.
---

# Your First Query

Pick whichever way in suits you. Each one ends with a real result on screen in a couple of minutes, and none of them needs a cluster, a credit card or any configuration.

- **Hosted**: sign in to [opteryx.app](https://opteryx.app) and run SQL in the browser.
- **No account**: read a public dataset over HTTP with `curl`. Nothing to sign up for.
- **Python**: `pip install opteryx-core` and query from your own process. Nothing leaves your machine.

<!-- tabs -->
<!-- tab: Hosted -->

### 1. Sign in

Go to [opteryx.app](https://opteryx.app) and sign in with Google, Microsoft or GitHub. There's no card to enter, and the free quota covers everything on this page. See [Logging In](registration) if you get stuck.

### 2. Run the example query

Opteryx Studio opens with this query already in the editor. It reads `public.astronomy.moons`, a sample table every signed-in user can read:

```sql
SELECT
    planet,
    COUNT(*) AS moons
FROM
    public.astronomy.moons
GROUP BY ALL
ORDER BY
    moons DESC
```

Press **Run** (⌘↵ / Ctrl+Enter). The results grid shows the first rows:

```text
planet   moons
Saturn      16
Jupiter      9
Neptune      8
Uranus       5
...
```

### 3. See what it cost

The status bar under the results shows the row count, how long the query took and the **bytes scanned**. Bytes scanned is what Opteryx meters, so you can see what each query costs as you go. See [Cost Model](/docs/core-concepts/cost-model).

<!-- tab: No account (OData) -->

### 1. Query a public dataset

The datasets under `public.geopolitics` and `public.security` are open to anonymous reads over [OData](/docs/guides/querying-via-odata). This query lists the three largest European countries by area:

```bash
curl 'https://odata.opteryx.app/api/v4/public/geopolitics/countries?$select=country_name_common,capital,area_km2&$filter=region%20eq%20%27Europe%27&$orderby=area_km2%20desc&$top=3'
```

Keep the URL in **single quotes**. In double quotes, the shell would expand `$top` and `$filter` as variables.

```json
{
  "@odata.context": "/api/v4/$metadata#public_geopolitics_countries",
  "value": [
    { "country_name_common": "Russia", "capital": "Moscow", "area_km2": 17098242.0 },
    { "country_name_common": "Ukraine", "capital": "Kyiv", "area_km2": 603500.0 },
    { "country_name_common": "France", "capital": "Paris", "area_km2": 551695.0 }
  ],
  "@odata.nextLink": "/api/v4/public/geopolitics/countries?%24select=...&%24skip=3"
}
```

The `@odata.nextLink` points to the next page of results.

### 2. See what else is open

The service root lists every dataset you can read. Without a token, that's the anonymous ones:

```bash
curl 'https://odata.opteryx.app/api/v4/'
```

The same URLs work in Power BI and Excel. Point either one at the service root and it loads the datasets with no driver to install.

<!-- tab: Python -->

### 1. Install

```bash
pip install opteryx-core
```

You need Python 3.11 or later. See [Installing Opteryx Core](installation) for details.

### 2. Query the built-in sample data

`$planets` ships inside the engine, so this works with no files and no network:

```python
import opteryx

session = opteryx.session()
for morsel in session.execute_to_morsels(
    "SELECT name, gravity FROM $planets ORDER BY gravity DESC LIMIT 3"
):
    for row in morsel:
        print(row.name, row.gravity)
```

```text
Jupiter 23.1
Neptune 11.0
Earth 9.8
```

### 3. Query your own file

Point `READ_PARQUET` at any Parquet file on disk, by path. Nothing needs to be registered first:

```python
for morsel in session.execute_to_morsels(
    "SELECT city, SUM(amount) AS total "
    "FROM READ_PARQUET('sales.parquet') "
    "GROUP BY city ORDER BY total DESC"
):
    for row in morsel:
        print(row.city, row.total)
```

`READ_PARQUET` also accepts glob patterns and `https://` URLs. See [READ_PARQUET](/docs/reference/sql/statements/read-parquet), and [Querying Local Data](/docs/guides/querying-local-data) for registering folders as named datasets.

<!-- /tabs -->

## Next Steps

- [Load and Query Data](reading-data): get your own files into the hosted service, and the ways to read them back
- [Site Tour](quick-start): what each part of Opteryx Studio is for
- [Running a Query via the API](/docs/guides/running-a-query-via-the-api): submit SQL over HTTP from any language
- [SQL Reference](/docs/reference/sql/introduction): the full dialect

## Need Help?

If a step here didn't do what you expected, [raise a bug or ask a question](https://github.com/mabel-dev/opteryx.app/issues/new/choose). [Getting help](/docs/support/getting-help) covers what to include.
