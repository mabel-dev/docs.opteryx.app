---
title: Iceberg in Power BI and Excel - Opteryx
description: Put the tables in your own Apache Iceberg data lake in front of Power BI and Excel through Opteryx's OData feed - no driver, no extract, no copy of the data - with credentials, scheduled refresh and the limits worth knowing.
---

# Iceberg in Power BI and Excel

This guide is for [opteryx.app](https://opteryx.app), the hosted service. It takes an Apache Iceberg data lake that you already run, and gets its tables into Power BI and Excel without moving them.

Three pieces make that work:

1. **Your Iceberg REST catalog** stays where it is and keeps owning the tables.
2. **An Opteryx workspace bound to that catalog** queries the tables in place.
3. **The Opteryx OData feed** exposes that workspace's tables to Power BI and Excel, which both speak OData v4 natively.

Nothing is copied at any step. Every refresh in Power BI or Excel is a live query against the snapshot your catalog reports at that moment.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- make your Iceberg tables visible over OData
- create a credential that Power BI and Excel can store and resend
- load an Iceberg table into Power BI Desktop and into Excel
- schedule a refresh in the Power BI service
- keep refreshes cheap by pushing filters and aggregation into the query
- recognise the limits of this setup before you build a report around them

## Before You Start

- **A workspace bound to your Iceberg catalog.** If you haven't done this, follow [Connecting an Iceberg Catalog](/docs/guides/connecting-an-iceberg-catalog) first. It covers the catalog requirements, credentials and grants. Run one `SELECT` in Studio against a table before going further. If that fails, Power BI will fail in the same way, with a less helpful message.
- **Power BI Desktop, or Excel with Power Query.** The steps below are for Power BI Desktop and Excel for Microsoft 365 on Windows. Other OData v4 clients work too, as described in [Querying via OData](/docs/guides/querying-via-odata).

## Step 1: Make the Tables Visible

Queries go straight to your catalog, but the **list** of tables that Power BI and Excel browse does not. That list is a stored projection of your catalog, and it's refreshed only when someone presses **Refresh dataset list** in the workspace's Catalog settings panel.

Press it once now, and again whenever tables are created, renamed or dropped in your catalog. A table that exists in your catalog but isn't in the list won't appear in the Power BI or Excel Navigator. [Refreshing the Dataset List](/docs/guides/connecting-an-iceberg-catalog#refreshing-the-dataset-list) explains why this step is manual.

Each table appears over OData at:

```
https://odata.opteryx.app/api/v4/<workspace>/<namespace>/<table>
```

So the table `analytics.sales.orders` (workspace `analytics`, Iceberg namespace `sales`, table `orders`) is at `https://odata.opteryx.app/api/v4/analytics/sales/orders`.

## Step 2: Create a Credential for Power BI and Excel

Power BI and Excel can't fetch short-lived tokens themselves. Instead, they store a user name and password and send them as HTTP Basic authentication on every request. The Opteryx OData service accepts Basic authentication in this form:

| Field | Value |
| --- | --- |
| User name | The Opteryx user (`client_id`) the token belongs to |
| Password | A personal access token for that user |

The service exchanges these for a short-lived access token on each request. Your access policies decide what the user can see, in the same way as for any other query.

To create the token, open **Settings → Access Tokens** in Studio and generate one. It's shown once, and it lasts 90 days by default. When it expires, refreshes fail until you replace it (see [Keeping Refresh Working](#keeping-refresh-working)).

**Use a service account for anything shared.** A report published to the Power BI service refreshes as whoever's credentials it holds. If those are your own, the report can read everything you can read, and it stops working when your access changes. A service account with `reader` on just the Iceberg-bound workspace is a smaller and longer-lived identity. See [Access and Permissions](/docs/core-concepts/access-and-permissions) and [GRANT](/docs/reference/sql/statements/grant).

## Step 3: Connect from Power BI Desktop

1. **Home → Get data → OData feed.**
2. Enter a URL:
   - the service root, `https://odata.opteryx.app/api/v4/`, to browse every dataset this credential can read
   - or a single table's URL, to go straight to it
3. When asked for credentials, choose **Basic**, and enter the user name and personal access token from Step 2.
4. Under **Select which level to apply these settings to**, choose `https://odata.opteryx.app/`. That way the same credential covers every table, and you won't be asked again for each one.
5. In the Navigator, tick the tables you want, then choose **Transform Data** (recommended, see [Keeping Refreshes Cheap](#keeping-refreshes-cheap)) or **Load**.

Column names and types come from the table's Iceberg schema, which Power BI reads from the service's `$metadata` document. You don't have to set types by hand.

Power BI follows the feed's `@odata.nextLink` paging automatically, so a table larger than one page loads in full.

## Step 4: Connect from Excel

1. **Data → Get Data → From Other Sources → From OData Feed.**
2. Enter the service root or a table URL, as above.
3. Choose **Basic**, enter the user name and personal access token, and apply the settings at the `https://odata.opteryx.app/` level.
4. In the Navigator, pick a table and choose **Transform Data** or **Load**.

To pick up the latest data, choose **Data → Refresh All**, or right-click the table and choose **Refresh**. Excel then runs the query again against your catalog's current snapshot.

## Keeping Refreshes Cheap

Every refresh is a real query against your Iceberg tables. It's billed like any other query (see the [Cost Model](/docs/core-concepts/cost-model)), and it reads from your object storage. A report that pulls a whole fact table on every refresh and filters it inside Power BI does the most work possible.

Do the filtering in Power Query instead. Filtering rows, removing columns, sorting and keeping the top N rows in the Power Query editor are translated into `$filter`, `$select`, `$orderby` and `$top` on the request. Opteryx then pushes those filters into the Iceberg scan, and uses the table's statistics to skip data files that can't match. Removing unused columns matters even more: Iceberg data files are columnar, so a column you don't select is never read.

**Aggregation doesn't fold.** A **Group By** step in Power Query runs after every matching row has been downloaded. If a visual only needs totals, aggregate on the server by putting `$apply` in the feed URL itself:

```
https://odata.opteryx.app/api/v4/analytics/sales/orders?$apply=groupby((region),aggregate(amount with sum as total_amount))
```

This returns one row per region, with no rows of detail. `$count`, `sum`, `average`, `min`, `max` and `countdistinct` are available. [Aggregating with `$apply`](/docs/guides/querying-via-odata#aggregating-with-apply) has the full syntax.

## Scheduled Refresh in the Power BI Service

Once a report is published, its semantic model needs its own copy of the credential:

1. In the Power BI service, open the semantic model's **Settings**.
2. Under **Data source credentials**, edit the OData source, choose **Basic**, and enter the same user name and personal access token. Use the service account's here if you followed the advice in Step 2.
3. Under **Refresh**, turn on scheduled refresh and pick a frequency.

`odata.opteryx.app` is a public HTTPS endpoint, so you don't need an on-premises data gateway.

Choose a frequency that matches how often the Iceberg tables change. A refresh against a snapshot that hasn't changed costs a query and gets back the same data.

## Keeping Refresh Working

Refreshes fail with an authentication error when the personal access token expires or is revoked. To fix that:

1. Generate a new token for the same user or service account.
2. Update the credential everywhere it's stored. In Power BI Desktop and Excel, that's **Data source settings** (choose **Edit Permissions**, then **Edit**). In the Power BI service, it's the semantic model's **Data source credentials**.

Rotating the credential your Iceberg catalog uses has nothing to do with this. That's the workspace binding, covered in [Rotating a Credential](/docs/guides/connecting-an-iceberg-catalog#rotating-a-credential), and Power BI and Excel never see it.

## Limits

- **Import mode only.** Power BI's OData connector doesn't support DirectQuery, so the data is loaded into the model and kept as current as your refresh schedule.
- **Read-only.** OData is read-only, and so is a workspace bound to your Iceberg catalog.
- **No nested columns.** Iceberg `struct`, `map` and `list` columns aren't read, so they don't appear in the Navigator.
- **New tables need a listing refresh.** See [Step 1](#step-1-make-the-tables-visible).
- **Schema changes need a model refresh.** If a column is added in Iceberg, refresh the dataset list in Opteryx, then refresh the query's preview in Power Query, so that the model picks up the new column.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| A table is missing from the Navigator | The dataset list hasn't been refreshed since the table was created, or the credential can't read it. Press **Refresh dataset list**, then check the user's grants. |
| Power BI or Excel keeps asking for credentials | The credential was rejected (`401`). Check that the user name is the user the token belongs to, and that the token hasn't expired. Basic is the only choice that works here. **Organizational account**, **Windows** and **Web API** don't. |
| A `403` error | The credential is valid, but doesn't have `reader` on that workspace. |
| A refresh fails with a storage or permission error | The workspace can't read your catalog or its data files. Run the same table in Studio, then follow [Connecting an Iceberg Catalog - Troubleshooting](/docs/guides/connecting-an-iceberg-catalog#troubleshooting). |
| Refreshes are slow | The query reads more than it needs. Remove unused columns, filter in Power Query, and use `$apply` for summary visuals. |

The full list of status codes is in [Querying via OData - Errors](/docs/guides/querying-via-odata#errors).

## Related

- [Connecting an Iceberg Catalog](/docs/guides/connecting-an-iceberg-catalog)
- [Querying via OData](/docs/guides/querying-via-odata)
- [Access and Permissions](/docs/core-concepts/access-and-permissions)
- [Cost Model](/docs/core-concepts/cost-model)
- Microsoft's own steps for [Power BI](https://learn.microsoft.com/en-us/power-bi/connect-data/desktop-connect-odata) and [Excel](https://support.microsoft.com/en-us/office/connect-to-an-odata-feed-power-query-4441a94d-9392-488a-a6a9-739b6d2ad500)
