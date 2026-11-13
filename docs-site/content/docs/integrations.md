---
title: Integrations - Opteryx
description: Use Opteryx from BI, dashboard and notebook tools - Apache Superset, dbt, Grafana, Jupyter, marimo and Streamlit - with the connection method each one uses and what it supports.
---

# Integrations

These pages show how to use Opteryx from tools you may already run. Each one covers installing the connector, the exact connection settings, a working example, and the limitations we found when testing it.

Opteryx comes in two forms, and a tool can use one or both:

- **Opteryx Core** is the embedded engine. It runs inside a Python process and queries files where they live, with no server or account. Python notebooks and apps can use it directly.
- **[opteryx.app](https://opteryx.app)** is the hosted service. Tools reach it through the [`opteryx-sqlalchemy`](/docs/guides/using-sqlalchemy) dialect, the [OData service](/docs/guides/querying-via-odata) or [Arrow Flight SQL](/docs/guides/connecting-via-flight-sql).

## Supported Tools

| Tool | What it's for | Opteryx Core | opteryx.app connection |
|---|---|---|---|
| [Apache Superset](/docs/integrations/superset) | Shared BI dashboards and SQL exploration | — | `opteryx-sqlalchemy` |
| [dbt](/docs/integrations/dbt) | Building tested, documented models in SQL | — | `dbt-opteryx` adapter |
| [Grafana](/docs/integrations/grafana) | Time-series dashboards | — | OData, through the Infinity plugin |
| [Jupyter](/docs/integrations/jupyter) | Interactive analysis in notebooks | Yes | `opteryx-sqlalchemy`, with pandas or `%sql` |
| [marimo](/docs/integrations/marimo) | Reactive notebooks and small apps | Yes | `opteryx-sqlalchemy`, with `mo.sql` |
| [Streamlit](/docs/guides/streamlit) | Data apps written in Python | Yes | `opteryx-sqlalchemy`, with `st.connection` |

Power BI and Excel connect through OData: see [Iceberg in Power BI and Excel](/docs/guides/iceberg-in-power-bi-and-excel). Claude and other AI assistants connect through MCP: see [Using Opteryx from your assistant](/docs/guides/ai-assistants).

## Not Supported Yet

- **Metabase** has no driver that reaches Opteryx. opteryx.app has no PostgreSQL-compatible endpoint, and Metabase doesn't read OData.

## Choosing a Connection

- **SQL tools** (Superset, notebooks, Streamlit) use `opteryx-sqlalchemy`. It needs a client ID and client secret from the [Authentication API](/docs/reference/api/authentication-api).
- **Tools that read JSON over HTTP** (Grafana, Power BI, Excel) use the OData service. The `demo` workspace is readable without credentials. Other workspaces accept HTTP Basic authentication with the client ID and secret.
- **Arrow-native tools** can use [Flight SQL](/docs/guides/connecting-via-flight-sql), which streams results as Arrow record batches.

- **dbt** uses the [`dbt-opteryx`](/docs/integrations/dbt) adapter, which runs statements through the opteryx.app jobs API with the same client ID and secret.

All of these except dbt are read-only, and all of them only see the datasets your credential's policies grant. See [Access and Permissions](/docs/core-concepts/access-and-permissions).
