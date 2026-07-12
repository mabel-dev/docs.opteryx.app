---
title: Embedding Opteryx Core in a Python Service
description: Run Opteryx Core inside your own Python service. Register a workspace once at startup, execute parameterised queries per request, and stream results as Arrow.
---

# Embedding Opteryx Core in a Service

Because Opteryx Core is a library that runs in-process, it slots into a Python service the same way any other embedded engine would: set it up once at startup, then execute queries per request. This guide covers the shape of that, independent of which web framework you use.

## Set Up Once, at Startup

Registering a workspace is a one-time step — do it when the process starts, not per request:

```python
import opteryx
from opteryx.connectors import DiskConnector

def create_app():
    opteryx.register_workspace("data", DiskConnector)
    ...
```

A `session`, by contrast, is cheap and scoped to a unit of work — create one per request:

```python
def handle_request(customer_id: int):
    session = opteryx.session()
    table = session.execute_to_arrow(
        "SELECT order_id, amount FROM data.orders WHERE customer_id = :customer_id",
        params={"customer_id": customer_id},
    )
    return table.to_pandas().to_dict(orient="records")
```

## Parameterising Safely

Never build SQL by concatenating request input — that is how you get SQL injection. Bind parameters instead: named placeholders (`:name`) with a dict, or positional placeholders (`?`) with a list. The value is treated as data, never as SQL:

```python
session.execute(
    "SELECT name FROM data.planets WHERE mass > :min_mass",
    params={"min_mass": request_mass},
)
```

> Warning: Treat every value from a request as untrusted. Bind it as a parameter — do not interpolate it into the query string, and do not let callers supply raw SQL or arbitrary dataset names.

## Choosing a Result Shape

For a request handler, decide up front whether you need the whole result at once or can stream it:

- **`execute_to_arrow`** collects the result into one Arrow table — simplest, right for small-to-moderate responses like a filtered lookup or a summary.
- **`execute_to_morsels`** streams the result as it's produced — better for a large export, where you want to start writing the response before the whole query has finished.

```python
def stream_export():
    session = opteryx.session()
    for morsel in session.execute_to_morsels("SELECT * FROM data.orders"):
        yield morsel.to_arrow().to_pandas().to_csv(index=False, header=False)
```

## Things to Know

- **Opteryx is single-node.** One process handles one query at a time efficiently; it is not a concurrent multi-tenant database. For a low-traffic internal service this is fine — for higher concurrency, run several worker processes and expect each to serve requests serially.
- **Cold reads dominate latency.** The first query against a dataset pays the read cost. Keep hot datasets close (local disk beats remote storage) and keep queries selective so pushdown keeps each read small.
- **Return summaries, not raw dumps.** Aggregate in SQL rather than pulling every row back and reducing it in Python — that's the whole point of pushing the work into the engine.

See [When to Use Opteryx](/docs/introduction/when-to-use) for where this pattern fits, and [opteryx.app](https://opteryx.app) if you want a hosted, multi-tenant service instead of embedding the engine yourself.

## Related

- [Querying Local Data](/docs/guides/querying-local-data)
- [Troubleshooting Queries](/docs/guides/troubleshooting)
