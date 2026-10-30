---
title: Building a Streamlit App with Opteryx
description: Build a Streamlit dashboard on Opteryx. Query local Parquet in-process with Opteryx Core, cache results with st.cache_data, bind widget values as parameters, or connect to opteryx.app with st.connection.
---

# Building a Streamlit App with Opteryx

[Streamlit](https://streamlit.io) turns a Python script into a web app, and Opteryx Core runs in the same process as that script, so a dashboard over a folder of Parquet needs no database server: Opteryx does the scan and the aggregation, and Streamlit draws the result.

> **Try it yourself:** the complete app from this page is in [`examples/streamlit-dashboard`](https://github.com/mabel-dev/docs.opteryx.app/tree/main/examples/streamlit-dashboard). It charts a public dataset of 4,630 orbital launch attempts and needs no account: `pip install -r requirements.txt`, then `streamlit run app.py`.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- register an Opteryx workspace once per Streamlit server, not on every rerun
- wrap queries in a cached helper that returns a pandas DataFrame
- feed widget values into SQL as bound parameters
- chart and tabulate the results with Streamlit's built-in elements
- point the same app at [opteryx.app](https://opteryx.app) with `st.connection` instead

## Setup

```bash
pip install opteryx-core pyarrow pandas streamlit
```

The examples query `data.missions`, which reads the Parquet files in `./data/missions/`. To follow along, download the sample file there:

```bash
mkdir -p data/missions
curl -L -o data/missions/space_missions.parquet \
  https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/missions/space_missions.parquet
```

## Two Helpers

Streamlit reruns your whole script every time a widget changes. Two of its caching decorators keep that cheap:

```python
import opteryx
import pyarrow
import streamlit as st
from opteryx.connectors import DiskConnector


@st.cache_resource
def setup():
    opteryx.register_workspace("data", DiskConnector)


@st.cache_data(ttl=600)
def query(sql, params=None):
    setup()
    morsels = opteryx.session().execute_to_morsels(sql, params)
    return pyarrow.concat_tables(morsel.to_arrow() for morsel in morsels).to_pandas()
```

- `@st.cache_resource` runs `setup()` once per server process, so the workspace is registered at startup rather than on every rerun. This is the same split as [Embedding in a Service](/docs/guides/embedding-in-a-service).
- `@st.cache_data` caches each result by its SQL and parameters. Moving a slider back to a value it already had returns the cached DataFrame without running the query again. `ttl=600` drops results after ten minutes, so the app picks up new files in the folder.
- Each call opens its own session. Streamlit serves each browser tab on its own thread, and a session per query keeps them independent.

Everything after this is ordinary Streamlit: call `query()` and pass the DataFrame to a chart or table.

```python
st.title("Space missions")

per_year = query("""
    SELECT EXTRACT(year FROM Lauched_at) AS year, COUNT(*) AS launches
      FROM data.missions
     GROUP BY year
     ORDER BY year
""")
st.bar_chart(per_year, x="year", y="launches")
```

(`Lauched_at` is spelled that way in the file.)

## Widgets as Parameters

Put widget values into the query as `?` parameters, not with an f-string. A value that comes from a widget should never be part of the SQL text:

```python
companies = st.multiselect("Companies", ["SpaceX", "CASC", "Arianespace", "VKS RF"], default=["SpaceX"])
first_year, last_year = st.slider("Years", 1957, 2022, (1990, 2022))

placeholders = ", ".join("?" for _ in companies)
by_company = query(
    f"""
    SELECT Company,
           COUNT(*)                                                   AS launches,
           SUM(CASE WHEN Mission_Status = 'Success' THEN 1 ELSE 0 END) AS successes
      FROM data.missions
     WHERE Company IN ({placeholders})
       AND EXTRACT(year FROM Lauched_at) BETWEEN ? AND ?
     GROUP BY Company
     ORDER BY launches DESC
    """,
    [*companies, first_year, last_year],
)
st.dataframe(by_company, hide_index=True)
```

The f-string only adds the right number of `?` placeholders. The company names and years go in as parameters, which are also part of the cache key, so each combination of filters is cached separately.

An `IN` list must contain at least one value, so check for an empty selection first, for example with `st.stop()`. The example app does this.

## Keep Results Small

Streamlit sends every row you display to the browser. As in a notebook, aggregate in SQL and return the summary: Opteryx can scan a dataset much larger than memory, but `st.dataframe` on millions of rows will be slow to load. If you need to show raw rows, add a `LIMIT`.

## Letting Users Write SQL

A text box that runs whatever the user types is a short addition:

```python
sql = st.text_area("Query", "SELECT Rocket, COUNT(*) AS n FROM data.missions GROUP BY Rocket ORDER BY n DESC LIMIT 10")
if st.button("Run"):
    try:
        st.dataframe(query(sql), hide_index=True)
    except Exception as err:
        st.error(err)
```

Only offer this in an app for people who could already read the files. Anyone using the box can query every dataset in the registered workspace.

## Connecting to opteryx.app Instead

To query data in the hosted service rather than local files, use Streamlit's built-in SQL connection with the [`opteryx-sqlalchemy`](/docs/guides/using-sqlalchemy) dialect:

```bash
pip install streamlit opteryx-sqlalchemy
```

Put the connection URL in `.streamlit/secrets.toml`, which keeps the client secret out of your code. Don't commit this file:

```toml
[connections.opteryx]
url = "opteryx://YOUR_CLIENT_ID:YOUR_CLIENT_SECRET@opteryx.app:443/default?ssl=true"
```

```python
import streamlit as st

conn = st.connection("opteryx", type="sql")
planets = conn.query("SELECT name, mass FROM opteryx.test.planets ORDER BY mass DESC", ttl=600)
st.dataframe(planets)
```

`conn.query` returns a pandas DataFrame and caches it for `ttl` seconds, so the helpers above aren't needed. Bound parameters don't currently work against the hosted service. See [Parameterising Queries](/docs/guides/using-sqlalchemy#parameterising-queries) for the workaround.

## Related

- [Streamlit example app](https://github.com/mabel-dev/docs.opteryx.app/tree/main/examples/streamlit-dashboard)
- [Exploratory Analysis in Notebooks](/docs/guides/exploratory-analysis)
- [Embedding Opteryx Core in a Service](/docs/guides/embedding-in-a-service)
- [Querying Local Data](/docs/guides/querying-local-data)
- [Using SQLAlchemy from a Notebook or Script](/docs/guides/using-sqlalchemy)
