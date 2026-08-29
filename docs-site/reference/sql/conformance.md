---
title: SQL Conformance — Opteryx Reference
description: A self-assessed statement of Opteryx's conformance to ANSI SQL-92 and later standards — which feature families are implemented, which are partial, and which are deliberately out of scope.
---

# SQL Conformance

> Be Aware: This is a self-assessment by the maintainers, not a certification. Opteryx has not been submitted to a formal conformance test suite, and no third party has audited the claims below. It is published so that adopters can plan against a current, specific statement of support rather than guessing.

Conformance to [ANSI SQL-92](https://www.iso.org/standard/16663.html)
(ISO/IEC 9075:1992) is the usual reference point for "does this system support
SQL". Opteryx targets the slice of that standard that analytical `SELECT`
workloads need, over files rather than over managed tables. Transaction control,
privilege statements, and most integrity constraints are outside its charter —
not unimplemented, but deliberately absent, and this page marks them as such.

For the places where Opteryx implements a feature but produces a *different
answer* from another engine, see [SQL Compatibility
Notes](advanced/adv-sql-compatibility). This page is about what exists; that page is
about what it does.

---

## How support is judged

| Status | Meaning |
|:--|:--|
| **yes** | Implemented and exercised by the automated suites. |
| **partial** | The core of the feature works; named sub-features are missing. |
| **no** | Not implemented. The parser or planner raises an explicit error. |
| **out of scope** | Not a goal for a read-oriented engine over files. |

Feature identifiers (`E051`, `F041`, `T611`) are given for orientation. They are
the standard's own labels for these feature families and are cited here to make
the table legible to anyone comparing engines — they are not a claim of
certified conformance at that feature level.

---

## SQL-92 feature families

| Feature family | Reference | Support | Notes |
|:--|:--|:--|:--|
| Projection and filtering | E051, E061, E131 | **yes** | `SELECT`, `DISTINCT`, `DISTINCT ON`, aliasing, `WHERE`, `BETWEEN`, `IN`, `LIKE` / `ILIKE`, boolean logic, `IS [NOT] NULL`. Also `SELECT * EXCEPT (...)` as an extension. |
| Identifiers | E031 | **yes** | Double-quote and backtick quoting. Opteryx reserves [far fewer words](reserved-words) than most engines, and reserves nothing in an alias position. |
| Numeric and string types | E011, E021 | **yes** | Full `DECIMAL(p,s)` for p in 1–38. See [Data Types](data-types) and the [Limits](limits) page for the boundaries. |
| Basic predicates | E061 | **yes** | Comparison, `BETWEEN`, `IN`, `LIKE`, `EXISTS`, quantified subquery predicates, `IS NULL`. |
| Set functions | E091 | **yes** | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `COUNT(DISTINCT ...)`, plus a wider [aggregate set](aggregates) including `ARRAY_AGG` and sketch-based approximations. |
| Grouping | E051 | **yes** | `GROUP BY` and `HAVING`. `ROLLUP` is supported; `GROUPING SETS` and `CUBE` are **not** implemented. |
| Set operations | E071, F302, F304 | **yes** | `UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT`, and the `ALL` (multiset) forms. See [UNION / INTERSECT / EXCEPT](statements/union). |
| Joined tables | E031, F041 | **yes** | `INNER`, `LEFT`, `RIGHT`, `FULL OUTER`, `CROSS`, `NATURAL`, `USING`, non-equi joins, and `LEFT SEMI` / `LEFT ANTI` as extensions. `RIGHT SEMI` and `RIGHT ANTI` are not supported — swap the relations. See [JOIN](statements/joins). |
| Subqueries | E051, E061 | **yes** | Subqueries in `FROM`, in the select list, and in predicates. **Correlated** subqueries, `EXISTS` / `NOT EXISTS`, and `IN (SELECT ...)` are supported — the optimizer decorrelates them into semi/anti joins. |
| Common table expressions | T121 | **yes** | Non-recursive `WITH`. `WITH RECURSIVE` is **not** implemented. See [WITH (CTE)](statements/with). |
| Null semantics | E131 | **yes** | Three-valued logic, `COALESCE`, `NULLIF`, `CASE`. Documented in detail under [NULL semantics](advanced/adv-null-semantics). |
| Scalar expressions | E011, E021, F261 | **yes** | Arithmetic with numeric promotion, `CASE`, `CAST` / `TRY_CAST`, concatenation, `SUBSTRING`, `TRIM`, `POSITION`, `CHARACTER_LENGTH`, `OCTET_LENGTH`. The canonical SQL-92 forms are accepted alongside comma-argument variants — each [function page](functions) states both. |
| Dates and times | F051 | **partial** | `DATE`, `TIME`, `TIMESTAMP`, and `INTERVAL` types; `CURRENT_DATE` / `CURRENT_TIME` / `CURRENT_TIMESTAMP`; `EXTRACT`; date arithmetic. There is no `WITH TIME ZONE` type — timestamps carry no zone. See [Working with timestamps](advanced/adv-working-with-timestamps). |
| Views | F031, F081 | **yes** | `CREATE VIEW`, `ALTER VIEW`, `DROP VIEW`, and materialized views with trigger-driven refresh. See [CREATE VIEW](statements/create-view). |
| Schema definition | F031 | **partial** | `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, `TRUNCATE TABLE`, and `COMMENT ON` exist. Constraint definition — `PRIMARY KEY`, `FOREIGN KEY`, `CHECK`, `UNIQUE` — is **not** implemented; the engine does not enforce integrity constraints. |
| Schema manipulation | F381 | **partial** | `ALTER TABLE` adds, drops, renames and widens columns — see [ALTER TABLE](statements/alter-table). `ALTER COLUMN ... TYPE` permits only widening within a type family; narrowing, integer-to-float and cross-family changes are rejected. `SET DEFAULT`, `DROP DEFAULT` and `SET NOT NULL` are rejected: a column `DEFAULT` here is a backfill value written once, not stored state a later `INSERT` consults, and nullability is not enforced. |
| Data manipulation | E101 | **partial** | `INSERT`, [UPDATE](statements/update), [DELETE](statements/delete) and [MERGE](statements/merge) are all **experimental**. `INSERT` is limited to some storage backends; the row-level statements need a catalog-backed table, because they address the rows they change by file and position. They are searched, not positioned: `WHERE CURRENT OF` does not exist. |
| Privileges | E081 | **out of scope** | No `GRANT` / `REVOKE` in SQL. Access is governed by policies attached to the connection; [SHOW GRANTS](statements/show-grants) inspects what the current session holds, and the hosted service manages them through the [Control API](/docs/reference/api/control-api). |
| Transactions | E151, E152 | **out of scope** | No `COMMIT`, `ROLLBACK`, `SET TRANSACTION`, or isolation levels. A query reads the snapshot it resolves at plan time. |
| Cursors | E121 | **out of scope** | No `DECLARE CURSOR`, `FETCH`, or positioned update. Results stream to the client as morsels. |
| SQLSTATE | E171 | **no** | Errors are typed exceptions with human-readable messages, not five-character SQLSTATE codes. Match on the exception class. |
| Embedded / module language | E182 | **out of scope** | Opteryx is a library and a service, not a host-language preprocessor. |

## Beyond SQL-92

| Feature | Reference | Support | Notes |
|:--|:--|:--|:--|
| Boolean type | T031 | **yes** | `BOOLEAN` is a first-class type. |
| Window functions | T611 | **partial** | Ranking (`ROW_NUMBER`, `RANK`, `DENSE_RANK`, `NTILE`, `PERCENT_RANK`, `CUME_DIST`), navigation (`LAG`, `LEAD`) and value (`FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE`) functions **require** `ORDER BY` inside `OVER`. Aggregate windows, frame specifications (`ROWS BETWEEN`, `RANGE BETWEEN`) and named `WINDOW` clauses are supported, so running totals and moving averages are available. See [Window Functions](statements/window-functions). |
| `information_schema` | — | **partial** | Three views — `tables`, `columns`, `triggers` — read live from the catalog. Addressed as `<workspace>.information_schema.<view>`. See [Information schema](advanced/adv-information-schema). |
| Temporal query | — | **extension** | `TIMESTAMP AS OF` reads a table as at a point in time; `VERSION AS OF` reads it as at a specific snapshot id, a tag name, `LATEST`, or `PREVIOUS` for the previous version of the data. Not a standard feature; see [TIMESTAMP AS OF](statements/timestamp-as-of) and [VERSION AS OF](statements/version-as-of). |
| Semi-structured types | — | **extension** | `ARRAY`, `VARIANT`, `VECTOR`, and `IPV4`, with JSON path operators (`->`, `->>`, `@?`). Outside the standard entirely. |

## What Opteryx is validated against

Nothing on this page comes from running a conformance suite, because we do not
run one. What backs it up instead:

- **[sqllogictest](https://sqlite.org/sqllogictest/doc/trunk/about.wiki)** — the
  portable correctness harness, in three tiers: shape-checking, result-checking,
  and execute-only.
- **Differential testing against DuckDB** — where the standard leaves behaviour
  implementation-defined, DuckDB is the reference we compare against.
- **Industry query suites** — TPC-H, ClickBench, the Join Order Benchmark, and
  H2O exercise query *shapes* that internal tests miss. Their first value to us
  was finding missing features, not producing timings.

[Benchmarking](/docs/reference/internals/benchmarking) covers all of these and
how they are run.

## Other standards Opteryx implements

SQL is not the only specification in play. These are documented in their own
right:

| Standard | Where | Position |
|:--|:--|:--|
| [OData v4.01](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html) (OASIS) | `odata.opteryx.app` | Query options, `$apply` aggregation, and `$metadata` are implemented. `$search` and `$expand` are recognised and return `501`. See [Querying via OData](/docs/guides/querying-via-odata). |
| [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) | `flight.opteryx.app:443` | Read-only: no `DoPut` ingestion, no prepared statements, no transactions. See [Connecting via Arrow Flight SQL](/docs/guides/connecting-via-flight-sql). |
| [Apache Parquet](https://parquet.apache.org/) | [Rugo](/docs/reference/internals/rugo) | The engine's own reader and writer — no PyArrow in the engine. |
| [PEP 249](https://peps.python.org/pep-0249/) (Python DB-API 2.0) | Clients | Opteryx Core no longer ships a DB-API shim; its public surface is [`opteryx.session()`](/docs/guides/querying-local-data). DB-API 2.0 access to the hosted service comes from [ADBC's Flight SQL driver](/docs/guides/connecting-via-flight-sql) and the [SQLAlchemy dialect](/docs/reference/python/sqlalchemy). |

## Keeping this page honest

This is a living statement, updated as features land. If it says a feature is
missing and your query proves otherwise — or the reverse, which matters more —
that is a documentation bug worth
[raising](https://github.com/mabel-dev/opteryx/issues).

## Related

- [Supported SQL](supported-sql) — the practical summary with examples
- [SQL Compatibility Notes](advanced/adv-sql-compatibility) — where results differ
  from other engines
- [Limits](limits) — the ceilings the engine enforces
- [Reserved Words](reserved-words) — what cannot be a bare identifier
