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

Query parameters which affect the execution of the query can be tuned on a per-query basis using the `SET` statement.

!!! function "`disable_optimizer`: _boolean_ = **false**"    
    Disable the use of the query optimizer (default is **false**).

## WITH hints

Hints are used to direct the planner, optimizer or the executor to make specific decisions. If a hint is not recognized, it is ignored by the planner and executor and is reported in the messages.

Multiple Hints can be provided for the same dataset in a query statement by providing the desired Hints in a comma separated list.

!!! Note
    Hints use the keyword `WITH` which is also the keyword for CTEs, this information relates to hints and not CTEs.

~~~
FROM dataset WITH(NO_CACHE)
~~~

Instructs blob/file connectors to not use cache, regardless of other settings. This is almost always followed but only applies to the local Buffer Pool and any remote cache - Operating System, CDN or other caches which may be used are not affected by this hint.

~~~
FROM dataset WITH(NO_PARTITION)
~~~

Instructs blob/file connectors to not use partitioning, regardless of other settings. This is always followed.

~~~
FROM dataset WITH(NO_PUSH_PROJECTION)
~~~

Instructs blob/file connectors not to try to prune columns at read time. The decision if to follow this hint is made by the reader. 

~~~
FROM dataset WITH(NO_PUSH_SELECTION)
~~~

Instructs the connectors to not attempt to filter results at read time, usually pushing the filter step into the read step. This does not prevent the optimizer placing filter operator elsewhere in the query plan.
