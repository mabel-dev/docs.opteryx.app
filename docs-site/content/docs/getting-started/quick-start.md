# Quick Start: Site Tour

This page is a short tour of Opteryx Studio, the web app for [opteryx.app](https://opteryx.app), the hosted Opteryx service. It gets you running your first SQL query without loading any data of your own. If you haven't signed in yet, start with [Logging In](registration).

If you're looking to embed the Opteryx engine directly in a Python process instead of using the hosted service, see [Querying Local Data](/docs/guides/querying-local-data).

## The Studio workspace

Once you're signed in, Studio gives you:

- A **SQL editor**, where you write and run queries
- A **results view**, where returned rows are displayed once a query finishes
- A **catalog** of the datasets available to you — your own tables plus a handful of public sample datasets
- **Query history**, so you can find and re-run queries you've written before
- **Settings**, where API tokens for programmatic access are created and managed (see [Logging In](registration))

## Run your first query

You don't need to load any data to try Studio out. A handful of datasets under the `public` schema are readable by anyone signed in, with no upload required:

```sql
SELECT *
  FROM public.astronomy.planets
 LIMIT 10;
```

Run it from the SQL editor and the results view fills in with the returned rows. See [Load and Query Data](reading-data) for the full list of public sample datasets, and for what else `public` includes (geopolitical, security, and sales reference tables).

## Next steps

- [Load and Query Data](reading-data) — load your own files into Opteryx and query them back with SQL
- [Running a Query via the API](/docs/guides/running-a-query-via-the-api) — submit SQL over HTTP instead of using the Studio editor
- [Querying via OData](/docs/guides/querying-via-odata) — filterable reads with no client code
- [Querying Local Data](/docs/guides/querying-local-data) — embed the Opteryx engine in your own Python process instead of using the hosted service

## Need Help?

If you encounter any issues, please visit our [GitHub repository](https://github.com/mabel-dev/opteryx) or check the rest of the documentation for more detail.
