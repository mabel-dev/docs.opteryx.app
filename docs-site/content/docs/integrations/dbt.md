---
title: dbt - Opteryx Integrations
description: Run dbt Core against the hosted Opteryx.app service with the dbt-opteryx adapter. Install the adapter, configure the profile, build a first model, and see which dbt features work today.
---

# dbt

[dbt](https://www.getdbt.com) (dbt Core) turns SQL `SELECT` statements into tested, documented tables and views. Use it with Opteryx to build models over data in [opteryx.app](https://opteryx.app), the hosted service. The [`dbt-opteryx`](https://pypi.org/project/dbt-opteryx/) adapter runs every statement through the opteryx.app jobs API, using the DBAPI from [`opteryx-sqlalchemy`](/docs/guides/using-sqlalchemy).

> **Try it yourself:** the companion notebook builds a small dbt project over the public NVD vulnerability dataset and CISA's known-exploited list: staging views, two tables, data tests and a unit test. It reads the results back into pandas, then drops the models. It needs an opteryx.app account, and reads the credentials from Colab Secrets so they stay out of the notebook. [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/build-models-with-dbt-on-opteryx-app.ipynb) or [download the notebook](/notebooks/build-models-with-dbt-on-opteryx-app.ipynb).

## Prerequisites

- Python 3.10 or later, and dbt Core 1.10 or later. These steps were tested with dbt Core 1.12.
- An opteryx.app client ID and client secret. Create a client credential with the [Authentication API](/docs/reference/api/authentication-api).

## Install

```bash
pip install dbt-opteryx
```

This installs dbt Core and `opteryx-sqlalchemy` as dependencies.

## Connection Configuration

dbt's `database` is an Opteryx **workspace** and its `schema` is a **collection**. `workspace` and `collection` are accepted as aliases. Every account has a personal space, `personal.<your client ID>`, which needs no setup.

Add a profile to `~/.dbt/profiles.yml`:

```yaml
my_project:
  target: cloud
  outputs:
    cloud:
      type: opteryx
      host: opteryx.app
      port: 443
      ssl: true
      user: "{{ env_var('OPTERYX_CLIENT_ID') }}"
      token: "{{ env_var('OPTERYX_CLIENT_SECRET') }}"
      database: personal                            # workspace
      schema: "{{ env_var('OPTERYX_CLIENT_ID') }}"  # collection
      threads: 1
```

`user` and `token` carry the client ID and client secret. Keep them in environment variables rather than in the file.

Also add this to your project's `dbt_project.yml`:

```yaml
query-comment:
  append: true
```

dbt puts a comment at the start of every statement by default, and Opteryx doesn't yet accept one in front of `CREATE COLLECTION`, which dbt uses to create schemas. Appending the comment avoids it.

Run `dbt debug` to check the connection.

## Minimal Working Example

1. Declare the TPC-H sample data as a source in `models/sources.yml`:

   ```yaml
   version: 2
   sources:
     - name: tpch
       database: samples
       schema: tpch_sf001
       tables:
         - name: nation
   ```

2. Add a model, `models/nations.sql`:

   ```sql
   {{ config(materialized='view') }}
   SELECT n_nationkey AS nation_key,
          n_name      AS nation_name,
          n_regionkey AS region_key
     FROM {{ source('tpch', 'nation') }}
   ```

3. Run it:

   ```bash
   dbt run
   ```

   dbt creates the view `personal.<your client ID>.nations`. `dbt show --select nations` prints rows from it: the 25 TPC-H nations.

## What Works

| Feature | Status |
|---|---|
| `dbt debug`, `dbt run`, `dbt show`, `dbt run-operation` | Works |
| Seeds, including reloads and `--full-refresh` | Works |
| Sources, source tests and `dbt source freshness` | Works |
| View and table materializations | Works |
| Incremental models: `append`, `delete+insert`, `merge` | Works |
| Generic tests (`not_null`, `unique`, `accepted_values`, `relationships`) and singular tests | Works |
| Pre- and post-hooks | Works |
| `dbt docs generate` | Works |
| Snapshots | Not supported yet |
| Unit tests and `--empty` | Works with dbt-opteryx 0.1.2 or later |
| Model contracts | Refused, with an error naming the model |

## Known Limitations and Troubleshooting

- **No transactions.** Opteryx has none, so every statement commits on its own. A model that fails halfway can leave its earlier statements applied.
- **No temporary tables.** dbt's `__dbt_tmp` intermediate tables are real tables. dbt drops them when a model succeeds, but a failed model can leave one behind.
- **Views** are built with `CREATE OR REPLACE VIEW`, not dbt's rename swap.
- **Snapshots aren't supported.** dbt's snapshot SQL uses `SELECT *, ...`, and Opteryx doesn't accept `*` alongside other columns unless the star is qualified (`SELECT t.*, ...`).
- **A table model can't store two columns with the same name.** A model that joins tables sharing a column name, such as `SELECT o.id, c.id` or `SELECT *` across the join, is refused with an error asking for distinct names. Name one side with `AS`, for example `c.id AS customer_id`. A view model is refused the same way.
- **A bare boolean column isn't a filter.** Write `WHERE active IS TRUE` or `WHERE active = true`, not `WHERE active`.
- **Model contracts are refused.** The adapter doesn't enforce them yet, and ignoring one would claim a guarantee it doesn't keep.
- **Queries can't be cancelled** from dbt.
- **Your credential's policies apply.** dbt can only read and write the workspaces your client credential is granted. See [Access and Permissions](/docs/core-concepts/access-and-permissions).

## Related

- [Using SQLAlchemy from a Notebook or Script](/docs/guides/using-sqlalchemy)
- [Authentication API](/docs/reference/api/authentication-api)
- [Access and Permissions](/docs/core-concepts/access-and-permissions)
- [dbt notebook in Google Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/build-models-with-dbt-on-opteryx-app.ipynb) — build, test and read back models over the public NVD dataset
- [Integrations](/docs/integrations)
