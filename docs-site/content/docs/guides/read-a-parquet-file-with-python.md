---
title: How to Read a Parquet File with Python - Rugo, Opteryx and pandas
description: Read a Parquet file in Python with Rugo or Opteryx and load it into pandas. Select columns, filter rows while reading, inspect a file before you load it, and query Parquet with SQL.
---

# How to Read a Parquet File with Python

Parquet is a columnar file format: values are stored column by column, compressed, and grouped into **row groups** that each carry min/max statistics. That layout means you should never read a whole Parquet file and then throw most of it away. A good reader lets you name the columns and the rows you want, and skips everything else before it's decoded.

This page uses the two readers that come from Opteryx:

- **[Rugo](/docs/guides/rugo-standalone)** — the file reader inside Opteryx, published on its own. You call a function, name the columns and filters, and get columns back. No SQL.
- **[Opteryx](/docs/guides/querying-local-data)** — the SQL engine built on Rugo, running in your Python process. Use it when you want to aggregate, join or rank before the data reaches pandas.

Both hand results over as Arrow, which pandas converts directly.

> **Try it yourself:** every example on this page runs in the companion notebook. [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-a-parquet-file-with-python.ipynb) or [download the notebook](/notebooks/read-a-parquet-file-with-python.ipynb).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- load a Parquet file into a pandas DataFrame with Rugo
- read only the columns you need, and filter rows while reading rather than after
- explain when a filter lets the reader skip whole row groups
- check a file's schema, row count and statistics without reading its data
- query a Parquet file with SQL and get the answer back as a DataFrame

## Install

```bash
pip install rugo opteryx-core pandas pyarrow
```

Rugo and Opteryx have no dependencies of their own. pandas and PyArrow are only needed for the final step, turning the result into a DataFrame.

The examples use `space_missions.parquet`, a 4,630-row table of every orbital launch attempt since Sputnik, with the company, location, rocket, price, launch time (`Lauched_at` — the spelling is the dataset's) and outcome of each. [Download it](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/flat/space_missions/space_missions.parquet) from the Opteryx repository.

## Load a Parquet File into pandas

```python
import pyarrow
from rugo import parquet

with parquet.read_parquet("space_missions.parquet") as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

`read_parquet` yields one **morsel** — a batch of columns — per row group. Each morsel converts to an Arrow table; concatenate them and convert once to get a single DataFrame. Types come from the schema stored in the file, so there's nothing to infer or parse:

```text
Company                   str
Location                  str
Price                 float64
Lauched_at     datetime64[us]
Rocket                    str
Rocket_Status             str
Mission                   str
Mission_Status            str
```

## Read Only the Columns You Need

Because Parquet stores each column separately, a column you don't ask for is never read from disk or decompressed:

```python
with parquet.read_parquet(
    "space_missions.parquet",
    columns=["Company", "Mission", "Price"],
) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

On a wide file this is the single biggest speed-up available.

## Filter While Reading

`predicates` is a list of `(column, operator, value)` tuples, combined with AND:

```python
with parquet.read_parquet(
    "space_missions.parquet",
    columns=["Company", "Mission", "Price"],
    predicates=[("Company", "=", "SpaceX"), ("Price", "<", 60)],
) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
# 25 rows
```

The operators are `=`, `!=`, `<`, `<=`, `>`, `>=`, `in`, `not in`, `is null` and `is not null`:

```python
predicates=[("Company", "in", ["SpaceX", "Rocket Lab"]), ("Mission_Status", "!=", "Success")]
predicates=[("Price", "is not null", None)]
predicates=[("Lauched_at", ">=", datetime.datetime(2020, 1, 1))]
```

A few rules worth knowing:

- **A predicate column doesn't have to be in `columns`.** It's read, used for filtering and dropped — `columns=["Mission"]` with a filter on `Company` returns just the mission names.
- **Comparisons follow SQL's NULL rules.** A row with a NULL `Price` matches neither `Price < 60` nor `Price >= 60`. Use `is null` to find those rows.
- **A predicate on a column the file doesn't have raises an error** rather than quietly returning everything.

### When filtering skips whole row groups

Filtering happens in two stages. First, each row group's footer statistics are checked — min/max values, and bloom filters for equality tests. A row group whose statistics show it can't contain a match is skipped without being decompressed. Then the rows in the surviving row groups are filtered exactly.

How much the first stage saves depends on how the file was written. If the file is sorted by `Lauched_at` and split into many row groups, a filter on `Lauched_at` touches only the row groups covering that date range. A filter on a column whose values are spread across every row group can't skip anything, though it still saves you building the rows you don't want. If you control how files are written, sort them by the column you filter on most. (`space_missions.parquet` is small enough to be a single row group, so everything here happens in the second stage.)

## Look Inside a File First

Installing Rugo also installs a `rugo` command. It reads a file's footer — schema, row counts, statistics — without reading the data:

```bash
rugo info space_missions.parquet       # rows, columns, size
rugo schema space_missions.parquet     # column names, types, nullability
rugo preview -n 5 space_missions.parquet
rugo inspect space_missions.parquet    # row groups, null counts, statistics, bloom filters
```

From Python, `read_metadata` gives the same information:

```python
meta = parquet.read_metadata("space_missions.parquet")
print(meta.num_rows, meta.num_row_groups)
for column in meta.schema_columns:
    print(column.name, column.logical_type)
```

See [The Rugo Command Line](/docs/guides/rugo-cli) for everything the command can do.

## Files Larger Than Memory

Concatenating every morsel into one DataFrame needs the whole result in memory. For a large file, work through it one morsel (one row group) at a time and keep only what you need:

```python
totals = {}
with parquet.read_parquet("space_missions.parquet", columns=["Company", "Price"]) as reader:
    for morsel in reader:
        chunk = morsel.to_arrow().to_pandas()
        for company, price in chunk.groupby("Company")["Price"].sum().items():
            totals[company] = totals.get(company, 0) + price
```

If you only need plain Python values, skip pandas and Arrow altogether: `morsel.column("Price").to_pylist()`.

For a summary like this one, it's simpler to write SQL and let Opteryx do the work.

## Query with SQL: Opteryx

When the question is an aggregate — counts, averages, top-N — write it as SQL and only bring the answer into pandas. [`READ_PARQUET`](/docs/reference/sql/statements/read-parquet) reads a file by path:

```python
import opteryx
import pyarrow

morsels = opteryx.session().execute_to_morsels("""
    SELECT Company,
           COUNT(*)             AS launches,
           ROUND(AVG(Price), 1) AS avg_price_musd
      FROM READ_PARQUET('space_missions.parquet')
     WHERE Mission_Status = 'Success'
       AND Lauched_at >= CAST('2000-01-01' AS TIMESTAMP)
     GROUP BY Company
     ORDER BY launches DESC
     LIMIT 5
""")
df = pyarrow.concat_tables(m.to_arrow() for m in morsels).to_pandas()
```

```text
       Company  launches  avg_price_musd
0         CASC       259            39.4
1  Arianespace       174           142.5
2       SpaceX       172            64.6
3          ULA       150           153.7
4       VKS RF       103            34.4
```

Opteryx works out the columns and filters from the query and hands them to Rugo, so the read is as selective as the `columns` and `predicates` examples above. Prefix any query with `EXPLAIN` to see it — the plan lists `predicate pushdown into scan`. The scan and the grouping happen inside the engine; only five rows reach Python.

Compare a timestamp column with `CAST('2000-01-01' AS TIMESTAMP)`, not with a bare string.

Bind values as parameters rather than formatting them into the SQL:

```python
morsels = opteryx.session().execute_to_morsels(
    "SELECT Mission, Price FROM READ_PARQUET('space_missions.parquet') WHERE Company = :company AND Price < :max_price",
    params={"company": "SpaceX", "max_price": 60},
)
```

A glob reads many files as one table: `READ_PARQUET('launches/*.parquet')`. To query a folder by name instead of by path — `SELECT ... FROM data.launches` — register it as a workspace; see [Querying Local Data](/docs/guides/querying-local-data).

## Which One to Use

| You want to... | Use |
|---|---|
| Load a file, or part of one, into pandas | Rugo `read_parquet` with `columns` and `predicates` |
| Check schema, row count or statistics | `rugo info` / `rugo inspect`, or `parquet.read_metadata` |
| Process a file larger than memory | Rugo, one morsel at a time |
| Aggregate, join or rank before loading | Opteryx `READ_PARQUET` |
| Query a folder of files by name | Opteryx with a registered workspace |

## Try It in a Notebook

The companion notebook downloads `space_missions.parquet` and runs every example on this page.

- [Open in Google Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-a-parquet-file-with-python.ipynb)
- [Download the notebook (.ipynb)](/notebooks/read-a-parquet-file-with-python.ipynb)

## Related

- [How to read a JSON Lines file with Python](/docs/guides/read-a-json-lines-file-with-python)
- [How to read an Avro file with Python](/docs/guides/read-an-avro-file-with-python)
- [Using Rugo Standalone](/docs/guides/rugo-standalone)
- [READ_PARQUET](/docs/reference/sql/statements/read-parquet)
- [Querying Local Data](/docs/guides/querying-local-data)
