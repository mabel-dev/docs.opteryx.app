---
title: Jupyter - Opteryx Integrations
description: Use Opteryx from Jupyter notebooks. Query local Parquet in-process with Opteryx Core, or query the hosted Opteryx.app service into pandas with opteryx-sqlalchemy and the %sql magic.
---

# Jupyter

[Jupyter](https://jupyter.org) notebooks (JupyterLab, Notebook, VS Code and Colab) are where most interactive Python analysis happens. Opteryx works there in two ways. **Opteryx Core** runs inside the notebook kernel and queries local files, with no account and no server. **opteryx-sqlalchemy** queries [opteryx.app](https://opteryx.app), the hosted service, and returns pandas DataFrames.

<img src="/images/integrations/jupyter-launches-per-year.png" alt="A bar chart produced in a Jupyter notebook showing orbital launches per year from 1957 to 2022. Launches climb to around 100 a year from the mid-1960s through the 1970s, settle between about 35 and 75 a year from 1979 to 2015, then rise sharply to a peak of 156 in 2021." width="800">

## Prerequisites

- Python 3.11 or later
- For local files: nothing else. The example downloads a small public Parquet file.
- For opteryx.app: a client ID and client secret from the [Authentication API](/docs/reference/api/authentication-api)

## Install

```bash
pip install jupyterlab opteryx-core pyarrow pandas matplotlib
```

For the hosted service, add the SQLAlchemy dialect. `jupysql` is optional and provides the `%sql` magic:

```bash
pip install opteryx-sqlalchemy jupysql
```

## Local Files with Opteryx Core

Download the sample dataset, 4,630 orbital launch attempts, into `./data/missions/` next to your notebook:

```bash
mkdir -p data/missions
curl -L -o data/missions/space_missions.parquet \
  https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/missions/space_missions.parquet
```

### Connection configuration

There is no connection. Register a workspace that maps the `data` prefix to the `./data` folder, and define a helper that returns a DataFrame:

```python
import opteryx
import pyarrow
from opteryx.connectors import DiskConnector

opteryx.register_workspace("data", DiskConnector)


def query(sql, params=None):
    morsels = opteryx.session().execute_to_morsels(sql, params)
    return pyarrow.concat_tables(m.to_arrow() for m in morsels).to_pandas()
```

`data.missions` now reads the Parquet files in `./data/missions/`. See [Querying Local Data](/docs/guides/querying-local-data) for how names map to folders.

### Minimal working example

```python
per_year = query("""
    SELECT CAST(EXTRACT(year FROM Lauched_at) AS INTEGER) AS year,
           COUNT(*)                                       AS launches
      FROM data.missions
     WHERE Lauched_at IS NOT NULL
     GROUP BY year
     ORDER BY year
""")
per_year.plot(x="year", y="launches", kind="bar", figsize=(12, 4), legend=False)
```

This draws the chart above. (`Lauched_at` is spelled that way in the file.) 127 launches in the file have no date, so the `WHERE` clause leaves them out. Without it they show up as a `nan` bar, and pandas turns `year` into a float column to hold the missing value.

Pass values as `?` parameters rather than formatting them into the SQL:

```python
query(
    "SELECT Company, COUNT(*) AS n FROM data.missions WHERE Mission_Status = ? GROUP BY Company ORDER BY n DESC LIMIT 5",
    ["Success"],
)
```

The top row is `RVSN USSR` with 1,614 successful launches.

## opteryx.app with SQLAlchemy

### Connection configuration

Keep the credentials out of the notebook. Set them as environment variables before you start Jupyter, or read them from a secrets store such as Colab Secrets:

```python
import os
from urllib.parse import quote

from sqlalchemy import create_engine

client_id = quote(os.environ["OPTERYX_CLIENT_ID"], safe="")
client_secret = quote(os.environ["OPTERYX_CLIENT_SECRET"], safe="")
engine = create_engine(f"opteryx://{client_id}:{client_secret}@opteryx.app:443/default?ssl=true")
```

### Minimal working example

Into pandas:

```python
import pandas

df = pandas.read_sql_query("SELECT name, mass FROM opteryx.test.planets ORDER BY mass DESC", engine)
df.head(3)
```

The first row is Jupiter, with a mass of 1898.0.

With the `%sql` magic, pass the engine you created above:

```python
%load_ext sql
%sql engine --alias opteryx
```

```sql
%%sql
SELECT name, gravity
  FROM opteryx.test.planets
 WHERE gravity > 10
 ORDER BY gravity DESC
```

This returns Jupiter (23.1) and Neptune (11.0). To get a DataFrame from the magic, assign the result and call `.DataFrame()`:

```python
result = %sql SELECT COUNT(*) AS n FROM opteryx.test.planets
result.DataFrame()
```

## Known Limitations and Troubleshooting

- **Aggregate before you pull.** Opteryx can scan more data than fits in memory, but a DataFrame can't. Group and filter in SQL so only the summary reaches the notebook. [Exploratory Analysis in Notebooks](/docs/guides/exploratory-analysis) covers this pattern in more depth.
- **Bound parameters don't work against opteryx.app yet.** `text("... WHERE mass > :m")` with a params dict fails server-side. The `?` parameters in the Opteryx Core examples work. For the hosted service, see [Parameterising Queries](/docs/guides/using-sqlalchemy#parameterising-queries).
- **Read-only.** The SQLAlchemy dialect doesn't support writes.
- **`Authentication error: Missing bearer token`** means the engine URL has no credentials. Check that both environment variables are set in the environment Jupyter was started from.
- **``Dataset `data.missions` cannot be found``** means the kernel's working directory isn't the folder that contains `data/`. Check it with `import os; os.getcwd()`.

## Related

- [Exploratory Analysis in Notebooks](/docs/guides/exploratory-analysis)
- [Using SQLAlchemy from a Notebook or Script](/docs/guides/using-sqlalchemy)
- [Run the notebooks in Colab](/docs/guides/notebooks)
- [marimo](/docs/integrations/marimo)
- [Integrations](/docs/integrations)
