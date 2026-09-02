## Hands-on exercise: one query, three clients

The same query, run three ways: over HTTP with curl, from Python through SQLAlchemy, and inside your own process with the embedded engine. The results should agree. It takes about 40 minutes. The first two parts need an opteryx.app account; the third needs only pip.

The query, throughout:

```sql
SELECT name, mass
  FROM public.astronomy.planets
 ORDER BY mass DESC
 LIMIT 3;
```

### 1. Over HTTP

Create a client credential in Studio under **Settings → API Tokens**, or with the [Authentication API](/docs/reference/api/authentication-api). Put the client ID and secret in environment variables rather than in a script, then exchange them for a short-lived access token:

```bash
TOKEN=$(curl -s -X POST https://authenticate.opteryx.app/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials' \
  -d "client_id=$OPTERYX_CLIENT_ID" \
  -d "client_secret=$OPTERYX_CLIENT_SECRET" \
  | python3 -c 'import json, sys; print(json.load(sys.stdin)["access_token"])')
```

Submit the query as a job:

```bash
curl -s -X POST https://jobs.opteryx.app/api/v1/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"sql_text": "SELECT name, mass FROM public.astronomy.planets ORDER BY mass DESC LIMIT 3"}'
```

Copy `execution_id` from the response and poll until `status` is no longer `SUBMITTED`:

```bash
curl -s https://jobs.opteryx.app/api/v1/jobs/EXECUTION_ID/status \
  -H "Authorization: Bearer $TOKEN"
```

Then fetch the result. `num_rows` must be at least 100 even for three rows:

```bash
curl -s 'https://jobs.opteryx.app/api/v1/jobs/EXECUTION_ID/results?num_rows=100' \
  -H "Authorization: Bearer $TOKEN"
```

`data` is columnar: one entry per column, each carrying a `values` array. Zip them together by position to get rows:

```python
def to_rows(data):
    columns = [c["name"] for c in data]
    return [dict(zip(columns, values)) for values in zip(*(c["values"] for c in data))]
```

You should end up with Jupiter, Saturn and Neptune, in that order.

### 2. From Python

```bash
pip install opteryx-sqlalchemy pandas
```

```python
import os
import pandas
from sqlalchemy import create_engine

engine = create_engine(
    "opteryx://{id}:{secret}@opteryx.app:443/default?ssl=true".format(
        id=os.environ["OPTERYX_CLIENT_ID"],
        secret=os.environ["OPTERYX_CLIENT_SECRET"],
    )
)

df = pandas.read_sql_query(
    sql="SELECT name, mass FROM public.astronomy.planets ORDER BY mass DESC LIMIT 3",
    con=engine.connect(),
)
print(df)
```

The dialect exchanges the credential for a token itself, so there is no token step. Same three planets.

If you want the result as Arrow rather than a DataFrame, [Connecting via Arrow Flight SQL](/docs/guides/connecting-via-flight-sql) shows the same query through ADBC, streamed without a JSON round trip.

### 3. In your own process

No account needed for this part:

```bash
pip install opteryx-core
```

`$planets` is a built-in sample relation with the same planets in it, so the query needs only its table name changed:

```python
import opteryx

session = opteryx.session()
for morsel in session.execute_to_morsels(
    "SELECT name, mass FROM $planets ORDER BY mass DESC LIMIT 3"
):
    for row in morsel:
        print(row.name, row.mass)
```

Now parameterise it. Never build SQL by concatenating input; bind a value instead:

```python
for morsel in session.execute_to_morsels(
    "SELECT name, mass FROM $planets WHERE mass > :floor ORDER BY mass DESC",
    params={"floor": 100},
):
    print(morsel.to_arrow())
```

To run the same thing against a folder of your own Parquet files, register a workspace as shown in [Querying local data](/docs/guides/querying-local-data) and swap `$planets` for the dataset name.

### Check your understanding

<details>
<summary>Part 1 asked for a token every time. Why did part 2 not?</summary>

The SQLAlchemy dialect takes the client ID and secret in the connection string and exchanges them for a token the first time it opens a cursor, refreshing as needed. You never handle the token. See [Using SQLAlchemy](/docs/guides/using-sqlalchemy).

</details>

<details>
<summary>The client secret in parts 1 and 2 has to be stored somewhere. How would a GitHub Actions workflow avoid that?</summary>

Register the workflow's OIDC identity as a binding, then exchange the token GitHub already mints for an Opteryx token at run time. Nothing is stored and nothing needs rotating. See [Credential-less authentication](/docs/guides/oidc-authentication).

</details>

<details>
<summary>Part 3 ran with no network at all. What does the embedded engine not give you that the hosted service does?</summary>

A catalog. Materialized views, tasks, triggers, grants and snapshots need a catalog to hold them; the embedded engine reads files where they are. See [When to use Opteryx](/docs/introduction/when-to-use) and [Known limits](/docs/roadmap-guarantees/known-limits).

</details>
