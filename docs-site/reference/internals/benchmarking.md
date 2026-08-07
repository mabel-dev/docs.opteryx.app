---
title: Benchmarking — Opteryx Internals
description: The correctness and performance suites Opteryx runs against itself — sqllogictest, TPC-H, ClickBench, JOB, H2O and others — how each run is measured, and how to read the results.
---

# Benchmarking

> Be Aware: Benchmarks deserve scepticism, including ours. Every suite below encodes an opinion about which workloads matter, and none of them is your workload. We run them to find our own blind spots, not to produce a number to quote.

Opteryx is measured continuously against two kinds of suite: **correctness**
harnesses that check the engine returns the right answer, and **performance**
harnesses that check how long it takes. Both matter, in that order — performance
work on incorrect behaviour is wasted effort.

This page describes what is run and how. It deliberately publishes **no timings**.
Numbers from a benchmark are only meaningful with the hardware, the build, and
the date attached, and a documentation page is a poor place to keep all three
current. Where results are published, this page says where to find them.

---

## Correctness suites

| Suite | Command | What it checks |
|:--|:--|:--|
| Shape battery | `make q` | The core regression suite: every query returns the expected row count, column count, and error type. |
| Full test suite | `make test` | Unit, integration, planner, connector, and type tests, with optimizer plan validation on. |
| sqllogictest | `make slt` | Portable, engine-agnostic SQL correctness — see below. |
| Fuzzing | `make fuzz` | Generated and metamorphic queries. CI runs a short pass on every push; a 100,000-iteration run goes nightly. |

### sqllogictest

[sqllogictest](https://sqlite.org/sqllogictest/doc/trunk/about.wiki) is the
correctness harness from SQLite: a portable, language-agnostic file format of
SQL statements and expected results. Opteryx runs it through an external-engine
driver against a [fork of the runner](https://github.com/mabel-dev/sqllogictest),
in three tiers:

| Tier | Command | Assertion |
|:--|:--|:--|
| Shapes | `make slt-shapes` | The result has the expected shape and types. |
| Results | `make slt-results` | The result values match exactly. |
| Run-only | `make slt-run-only` | The statement executes without error; no result assertion. |

The tiers exist because not every query has a portable expected result. Splitting
them means a query whose *values* are engine-specific can still be pinned on
*shape*, rather than being dropped from the suite entirely.

Most performance benchmarks assert nothing about output — they time a query and
move on. sqllogictest is what verifies the answers, which is why it is the first
suite listed and not an afterthought to the timing ones.

### Differential testing against DuckDB

Where the SQL standard leaves behaviour implementation-defined, "correct" needs a
reference. Opteryx uses [DuckDB](https://duckdb.org/) as that reference: the same
query, the same data, and a comparison of the results. Where the two disagree and
Opteryx is deliberately different — byte-oriented strings being the main one —
the divergence is documented in [SQL Compatibility
Notes](/docs/reference/sql/advanced/sql-compatibility) rather than silently
tolerated.

---

## Performance suites

Each suite is a `make` target in the engine repository. All of them except
`signals` compare against a stored DuckDB baseline.

| Suite | Command | Shape | What it stresses |
|:--|:--|:--|:--|
| [TPC-H](https://www.tpc.org/tpch/) | `make tpch` | 22 queries, SF1 by default | Join planning, predicate handling, subqueries, plan stability. Small data, demanding query shapes. |
| [ClickBench](https://benchmark.clickhouse.com/) | `make clickbench` | 43 queries over the `hits` web-analytics dataset | Single-table scan, filter, and aggregation at scale. Where performance cliffs show up first. |
| [JOB](https://github.com/gregrahn/join-order-benchmark) | `make job` | 113 queries over 21 IMDB tables | Join enumeration, cardinality estimation, statistics coverage. The suite that punishes a bad cost model. |
| [H2O db-benchmark](https://github.com/duckdblabs/db-benchmark) | `make h2o` | 10 group-by + 5 join queries | Aggregation and join throughput on the suite other engines publish against. |
| [JSONBench](https://github.com/ClickHouse/JSONBench) | `make jsonbench` | 5 queries over a Bluesky NDJSON dump | Nested-JSON reading and `->` / `->>` extraction through `READ_JSONL`. |
| Medicare1 | `make medicare1` | 10 queries over a public healthcare dataset | Wide tables, string-heavy grouping. |
| OData dashboard | `make dash` | 37 query shapes taken from the hosted OData service's query log | Real dashboard-shaped queries, as opposed to benchmark-shaped ones. |
| Signals | `make signals` | Synthetic security-findings dataset | Customer-shaped queries against a dataset that only exists in the repo. No DuckDB baseline. |

Why so many? Because each one catches a different class of failure. TPC-H and
ClickBench barely exercise join ordering, which is the whole point of JOB. JOB
says nothing about JSON reading. A suite that only ever ran ClickBench would
optimise for scans and let the optimizer rot. The
[benchmarks blog post](/blog/2026-05-08-benchmarks) covers the reasoning and what
each suite found when it was first run.

### RISC-V

[RISC-V Support](riscv-support) carries the one set of published pass/fail
results and indicative timings on this site — a point-in-time bring-up snapshot
on a specific single-board computer, explicitly not a benchmark claim.

---

## Method

The runners share a common approach, and the details matter when reading a
result:

- **Warm, multi-iteration.** Each query runs several times (three by default)
  and the **best** time is the one compared. The first iteration is normally the
  slowest — caches are cold and file footers have not been read.
- **Fresh session per iteration.** Each run opens its own session and drains the
  result to morsels without rendering anything, so the number reflects the engine
  rather than the table formatter.
- **Timeouts are recorded, not fatal.** A query that exceeds its per-query
  timeout is logged as a timeout and the suite continues. A suite that aborts on
  the first slow query tells you nothing about the other 42.
- **Matched allocator.** The benchmark targets preload the same allocator the
  production build uses, so a local run and a deployed run are measuring the same
  thing.
- **Every run is kept.** Per-iteration results are written to
  `results/<git-sha>-<timestamp>.csv` in the suite's own directory, so a
  regression can be bisected against the commit that caused it.

### Baselines

The DuckDB baseline is **not** regenerated on every run — it lives in a JSON file
alongside each suite and is refreshed deliberately with a separate calibration
target (`make tpch-bench-duckdb`, `make clickbench-duckdb`, `make job-duckdb`,
and so on). Two reasons: re-measuring the reference on every run would make every
comparison a comparison against a moving target, and calibrating on the machine
you are benchmarking on is what makes the ratio meaningful at all.

That last point is the important caveat. A ratio is only comparable to another
ratio measured **on the same machine, with the same baseline**. Absolute
millisecond figures from one developer's laptop say nothing about anyone else's.

### What the numbers are not

- **Not audited.** No third party has verified any of these runs.
- **Not a service level.** See [Stability
  Promises](/docs/roadmap-guarantees/stability-promises) — there is no
  performance guarantee, and an optimizer change that helps most queries can slow
  an individual one.
- **Not a claim of parity.** Several suites currently exist precisely because
  Opteryx is behind on them; that gap is the point of running them.

## Reproducing results

Opteryx's ClickBench configuration is published in the [ClickBench
repository](https://github.com/ClickHouse/ClickBench/tree/main/opteryx), so the
run can be reproduced independently rather than taken on trust. The suites
themselves live in the engine repository under `tests/performance/`, each with
its own data fetcher — `make jsonbench-data`, `make medicare1-fetch`, and the
per-suite `fetch_data.py` scripts.

## Related

- [Engine overview](engine-overview) — what the numbers are measuring
- [RISC-V support](riscv-support) — published pass/fail results on one platform
- [SQL Conformance](/docs/reference/sql/conformance) — what the engine implements
- [The Opteryx CLI](/docs/guides/opteryx-cli) — `--cycles`, for timing your own
  queries
- [Troubleshooting queries](/docs/guides/troubleshooting) — for *why* a query is
  slow, rather than how slow

---

TPC, TPC Benchmark, and TPC-H are trademarks of the Transaction Processing
Performance Council. ClickHouse is a registered trademark of ClickHouse, Inc.
