# Engine Configuration 

## Query Variables

Variables can be used when a value within a query would benefit from being configurable by the user running the query. For example pre-built queries which perform the same core statement, but with a variable input.

Variables are defined using the `SET` statement. These variables are available to `SELECT` statements as part of the same query batch. For example:

~~~sql
-- set the planet id, change for different planets
SET @id = 3;
SELECT name
  FROM $planets
 WHERE id = @id;
~~~

The above query batch contains two statements, the `SET` and the `SELECT` separated by a semicolon (`;`). The variable is defined in the `SET` statement and must start with an at symbol (`@`). The variable is then used within a filter in the `WHERE` clause of the `SELECT` statement.

## Query Parameters

Query parameters which affect the execution of the query can be tuned on a per-query basis
using the `SET` statement — subject to who owns the variable.

Variables you define yourself (`@name`) are always yours to set. **System variables are
not**: each declares an owner tier, and a session tops out at the `USER` tier — setting
one you do not outrank is refused rather than silently ignored:

~~~
User does not have permission to set variable `disable_optimizer`
~~~

Some `USER`-tier variables additionally require the `platform_admin` entitlement to set,
independent of the tier check:

~~~
Setting `parquet_gcs_io_workers` requires the `platform_admin` entitlement.
~~~

A few variables are **server-owned** and cannot be set through SQL at all, by any
caller — they are fixed once, at server startup:

**`disable_optimizer`**: _boolean_ = **false**

Disable the use of the query optimizer (default is **false**). Server-owned; not
settable via `SET`, including by a caller holding `platform_admin`.

Use [SHOW VARIABLES](/docs/reference/sql/statements/show-variables) to see which variables
your session can see and their `owner` column.
