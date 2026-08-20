---
title: Exploratory Data Analysis with Opteryx Core in Notebooks
description: Use Opteryx Core for exploratory data analysis in Jupyter notebooks. Query local Parquet datasets with SQL, stream results as morsels, and hand summaries to pandas or your plotting library.
---

# Exploratory Analysis in Notebooks

Opteryx Core fits the notebook workflow well: it installs with `pip`, runs in the same process as your notebook kernel, and streams results in a form you can hand straight to pandas or a plotting library. It is a good fit when a Parquet dataset is larger than you want to load whole, but you still want to explore it interactively.

## Setup

```bash
pip install opteryx-core
```

```python
import opteryx
from opteryx.connectors import DiskConnector

opteryx.register_workspace("data", DiskConnector)
session = opteryx.session()
```

`register_workspace` points the `data` prefix at the current working directory. See [Querying Local Data](/docs/guides/querying-local-data) for how dataset names resolve to folders.

## Querying Without Loading Everything

The usual notebook problem is a dataset that does not fit comfortably in memory. Aggregate it in SQL and only pull back the summary:

```python
for morsel in session.execute_to_morsels("""
    SELECT
        category,
        COUNT(*)     AS n,
        AVG(amount)  AS avg_amount
      FROM data.transactions
     WHERE ordered_at >= '2024-01-01'
     GROUP BY category
     ORDER BY n DESC
"""):
    print(morsel.to_arrow())
```

The scan, filter, and aggregation run inside Opteryx over the full dataset; only the grouped result — a handful of rows — ever reaches Python.

## A Fast First Look

Get the shape of an unfamiliar dataset without reading all of it:

```python
# a sample of rows
for morsel in session.execute_to_morsels("SELECT * FROM data.transactions LIMIT 20"):
    print(morsel.to_arrow())
```

```sql
-- row count
SELECT COUNT(*) FROM data.transactions;
```

```sql
-- distinct values and their frequencies
SELECT status, COUNT(*) AS n
  FROM data.transactions
 GROUP BY status
 ORDER BY n DESC;
```

## Straight to a Chart

For a result you know is small, concatenate the morsels into a single Arrow table, which converts to pandas directly:

```python
import pyarrow

morsels = session.execute_to_morsels("""
    SELECT
        DATE_FORMAT(ordered_at, '%Y-%m') AS month,
        SUM(amount)                      AS revenue
      FROM data.transactions
     GROUP BY month
     ORDER BY month
""")
monthly = pyarrow.concat_tables(morsel.to_arrow() for morsel in morsels).to_pandas()

monthly.plot(x='month', y='revenue')
```

Push the aggregation into SQL and keep the result small — let Opteryx do the heavy scan and grouping, and let your plotting library draw the answer.

## Working Row by Row

When you need Python-level logic per row rather than a DataFrame, iterate a morsel directly — each row comes back as a named tuple:

```python
for morsel in session.execute_to_morsels("SELECT name, mass, gravity FROM $planets"):
    for row in morsel:
        print(row.name, row.mass, row.gravity)
```

## Try It Against Sample Data

Opteryx Core ships with a built-in `$planets` relation, so you can confirm the engine works before pointing it at your own data:

```python
for morsel in session.execute_to_morsels(
    "SELECT name, mass, gravity FROM $planets ORDER BY mass DESC"
):
    print(morsel.to_arrow())
```

`$planets` doesn't touch a workspace or connector, so it tells you the engine itself is working, independently of whether your data access is configured correctly.

## Related

- [Querying Local Data](/docs/guides/querying-local-data)
- [Troubleshooting Queries](/docs/guides/troubleshooting)
