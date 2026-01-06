# SQLAlchemy

**Status:** Placeholder

Document how to use Opteryx with SQLAlchemy and provide example code (placeholder).

## Install

~~~bash
pip install opteryx-sqlalchemy
~~~

## Authenticate


~~~python
from sqlalchemy import create_engine
import pandas

engine = create_engine("opteryx://username:password@opteryx.app:443/default?ssl=true")

sql = "SELECT id, name FROM $planets LIMIT 5"
df = pandas.read_sql_query(sql=sql, con=engine.connect())

print(df)
~~~