# SQLAlchemy

A SQLAlchemy dialect for [opteryx.app](https://opteryx.app), the hosted service. For a full walkthrough — authentication, querying, parameter limitations — see [Using SQLAlchemy from a Notebook or Script](/docs/guides/using-sqlalchemy).

## Install

~~~bash
pip install opteryx-sqlalchemy
~~~

## Connection URL

~~~
opteryx://<client_id>:<client_secret>@opteryx.app:443/default?ssl=true
~~~

The username and password positions carry a client ID and client secret (from the [Authentication API](/docs/reference/api/authentication-api)), not a literal username and password. The dialect exchanges these for a short-lived access token automatically — there's no separate token step to run yourself.

~~~python
import os

import pandas
from sqlalchemy import URL, create_engine

url = URL.create(
    "opteryx",
    username=os.environ["OPTERYX_CLIENT_ID"],
    password=os.environ["OPTERYX_CLIENT_SECRET"],
    host="opteryx.app",
    port=443,
    database="default",
    query={"ssl": "true"},
)
engine = create_engine(url)

sql = "SELECT id, name FROM opteryx.test.planets LIMIT 5"
df = pandas.read_sql_query(sql=sql, con=engine.connect())

print(df)
~~~

Building the URL with `URL.create()` from environment variables, rather than interpolating a client secret into a connection string, keeps the secret out of source control and avoids having to URL-encode it if it contains reserved characters.