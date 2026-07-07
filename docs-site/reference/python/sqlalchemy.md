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
from sqlalchemy import create_engine
import pandas

engine = create_engine("opteryx://YOUR_CLIENT_ID:YOUR_CLIENT_SECRET@opteryx.app:443/default?ssl=true")

sql = "SELECT id, name FROM opteryx.test.planets LIMIT 5"
df = pandas.read_sql_query(sql=sql, con=engine.connect())

print(df)
~~~