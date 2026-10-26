---
title: Run the Opteryx Notebooks in Google Colab
description: Every Opteryx companion notebook in one place. Open them in Google Colab or download them to run locally, from reading Parquet, JSONL, Avro and ORC with Python to benchmarking Opteryx against DuckDB.
---

# Run the Opteryx Notebooks

Several pages in these docs have a companion notebook that runs the page's examples for you. This page lists all of them in one place. Each opens in [Google Colab](https://colab.research.google.com/) with one click, or you can download the `.ipynb` file and run it in Jupyter on your own machine.

Each notebook installs what it needs in its first cell, so there is nothing to set up first. Only one needs an account: the SQLAlchemy notebook connects to [opteryx.app](https://opteryx.app).

## Reading Files with Python

These four load a file into pandas with [Rugo](/docs/guides/rugo-standalone), then query the same file with SQL using Opteryx. Each downloads a small public dataset of orbital launches, so you don't need any data of your own.

| Notebook | What it covers | Guide |
|---|---|---|
| **Read a Parquet file** | Load into pandas, select columns, filter rows while reading, inspect a file before reading it, query with SQL | [Read a Parquet file](/docs/guides/read-a-parquet-file-with-python) |
| **Read a JSON Lines file** | Load into pandas, fix column types, filter while reading, handle malformed lines, query with SQL | [Read a JSON Lines file](/docs/guides/read-a-json-lines-file-with-python) |
| **Read an Avro file** | Read the schema, select nested fields, read through a reader schema, convert to Parquet | [Read an Avro file](/docs/guides/read-an-avro-file-with-python) |
| **Read an ORC file** | Read the footer, select columns, take fields out of a nested struct, convert to Parquet | [Read an ORC file](/docs/guides/read-an-orc-file-with-python) |

- Parquet: [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-a-parquet-file-with-python.ipynb) · [Download](/notebooks/read-a-parquet-file-with-python.ipynb)
- JSON Lines: [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-a-json-lines-file-with-python.ipynb) · [Download](/notebooks/read-a-json-lines-file-with-python.ipynb)
- Avro: [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-an-avro-file-with-python.ipynb) · [Download](/notebooks/read-an-avro-file-with-python.ipynb)
- ORC: [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-an-orc-file-with-python.ipynb) · [Download](/notebooks/read-an-orc-file-with-python.ipynb)

## Analysing Data

**Exploratory analysis with Opteryx Core** runs the examples from [Exploratory analysis in notebooks](/docs/guides/exploratory-analysis) in order: aggregate in SQL, take a fast first look at a dataset, chart a yearly summary with pandas, and iterate rows in Python. It uses a public dataset of 4,630 orbital launches in place of the `transactions` table the guide queries.

[Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/exploratory-analysis-with-opteryx.ipynb) · [Download](/notebooks/exploratory-analysis-with-opteryx.ipynb)

## Querying Opteryx.app

Both of these read the public National Vulnerability Database (NVD) dataset on [opteryx.app](https://opteryx.app).

**Query public data with OData** uses only `requests` and pandas. It discovers the public datasets, reads a schema from `$metadata`, filters, sorts and counts, pages with `@odata.nextLink`, and aggregates CISA's known-exploited list. It needs no account. The guide is [Querying via OData](/docs/guides/querying-via-odata).

[Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/query-public-data-with-odata.ipynb) · [Download](/notebooks/query-public-data-with-odata.ipynb)

**Query Opteryx.app with SQLAlchemy** connects with the `opteryx-sqlalchemy` dialect, queries the NVD dataset into pandas, joins it to CISA's known-exploited list, then runs the same connection against your own datasets. It **needs an opteryx.app account** and a client ID and secret. The guide is [Using SQLAlchemy from a notebook](/docs/guides/using-sqlalchemy).

[Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/query-opteryx-app-with-sqlalchemy.ipynb) · [Download](/notebooks/query-opteryx-app-with-sqlalchemy.ipynb)

## Benchmarks: DuckDB vs Opteryx

These three run a standard benchmark suite against DuckDB and Opteryx side by side, on whatever machine runs the notebook. Each one generates or downloads the data, rewrites it for Opteryx with Rugo's Parquet writer, runs every query on both engines in fresh processes, cross-checks row counts, and charts the result.

| Notebook | Queries | Data |
|---|---|---|
| **TPC-H** | The 22 standard queries | Generated with DuckDB's `dbgen`, scale factor 1 by default |
| **TPC-DS** | The 99 queries, reporting coverage first: how many each engine plans and runs | Generated with DuckDB's `dsdgen`, scale factor 1 by default |
| **ClickBench** | The 43 queries | The first 10 of the 100 published `hits` Parquet partitions by default |

- TPC-H: [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/tpch-duckdb-vs-opteryx.ipynb) · [Download](/notebooks/tpch-duckdb-vs-opteryx.ipynb)
- TPC-DS: [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/tpcds-duckdb-vs-opteryx.ipynb) · [Download](/notebooks/tpcds-duckdb-vs-opteryx.ipynb)
- ClickBench: [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/clickbench-duckdb-vs-opteryx.ipynb) · [Download](/notebooks/clickbench-duckdb-vs-opteryx.ipynb)

A Colab runtime is small and shared, so compare the two engines with each other, not with figures published anywhere else. The ClickBench notebook in particular runs a subset of the data and times it differently, so it cannot be compared with the official ClickBench results. [Benchmarking](/docs/reference/internals/benchmarking) explains the method and what the numbers are and are not.

## Running a Notebook Locally

Download the `.ipynb` file and open it in Jupyter or VS Code. The notebooks install their packages with `%pip` and write their files into the notebook's working folder, so they run unchanged. The three benchmark notebooks use a `tpch_bench`, `tpcds_bench` or `clickbench` folder next to the notebook when they are not on Colab. They are also the heavy ones: for a quick check, lower `SCALE_FACTOR` to `0.1` in the TPC-H and TPC-DS notebooks, or `NUM_FILES` in the ClickBench notebook.

## Related

- [Exploratory analysis in notebooks](/docs/guides/exploratory-analysis)
- [Using Rugo standalone](/docs/guides/rugo-standalone)
- [Benchmarking](/docs/reference/internals/benchmarking)
