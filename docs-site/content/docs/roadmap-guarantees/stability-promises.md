---
title: Stability Promises - What Opteryx Guarantees Between Releases
description: What Opteryx Core promises to keep stable across releases - the public Python API, SQL surface, and configuration - what it explicitly does not promise, and how long each version is supported.
---

# Stability Promises

This page is about **Opteryx Core**, the embedded engine you install with
`pip install opteryx-core`. The hosted service at
[opteryx.app](https://opteryx.app) versions its APIs separately - see the
[API Reference](/docs/reference/api) for those.

Opteryx Core is pre-1.0. That is the single most important thing on this page,
and everything below follows from it: the engine is under active development,
the execution layer has been rewritten recently, and the promises here are
deliberately narrower than a 1.x project would make. Where we cannot promise
something, this page says so rather than implying a guarantee we do not keep.

---

## Version Numbering

Releases are `0.MINOR.PATCH`. In a `0.x` series, semantic versioning does not
reserve a slot for breaking changes below the major version, so the convention
we follow is:

| Component | What changes in it |
|-----------|--------------------|
| **`0.MINOR.0`** | New features, and any breaking change to the public API, SQL surface, or configuration. Breaking changes are called out in the release notes. |
| **`0.0.PATCH`** | Bug fixes, security fixes, and performance work that does not change results. No intentional behaviour changes. |

The version is available at runtime as `opteryx.__version__`, alongside
`opteryx.__build__` (a monotonic build number) and `opteryx.__lib__`.

Pinning to a minor series (`opteryx-core~=0.9.0`) is the right choice if you
need behaviour to hold still. Pinning to an exact version is the right choice
if you need query results to be byte-identical across deployments.

## What the Promise Covers

The public Python API is the set of names exported from the `opteryx` package:

```python
import opteryx

opteryx.session()                # the entry point for executing queries
opteryx.register_workspace(...)  # binding a name to a connector
opteryx.set_default_connector(...)
opteryx.analyze_query(...)
```

Within a minor series these keep their names, their argument order, and their
meaning. The same applies to the `Session` methods documented under
[Querying Local Data](/docs/guides/querying-local-data) - notably
`execute_to_morsels()` - and to the connectors exported from
`opteryx.connectors`.

`Session` itself is deliberately **not** exported from the package root, so
that importing `opteryx` does not pull in the planner. Reach it through
`opteryx.session()`, not by importing it directly.

## What the Promise Does Not Cover

Anything not in the list above is an implementation detail and may change in
any release, including a patch release:

- Modules under `opteryx.planner`, `opteryx.operators`, `opteryx.managers`,
  and the compiled extensions.
- The [Draken](/docs/reference/internals/draken) and
  [Rugo](/docs/reference/internals/rugo) APIs when called directly rather than
  through Opteryx. Rugo has [its own standalone
  surface](/docs/guides/rugo-standalone), which is the supported way to use it.
- The shape of an `EXPLAIN` plan. Plans change whenever the optimizer improves;
  read them as diagnostics, never as a contract. See
  [EXPLAIN](/docs/reference/sql/statements/explain).
- Query statistics fields, timings, and morsel boundaries. A query may be split
  into a different number of morsels between releases with no change to the
  result.
- Error message wording. Error *types* are more stable than error *text* - match
  on the exception class, not on the string.

## SQL Surface

A query that runs today and returns a defined result should keep returning that
result. Two categories sit outside that:

- **Results the SQL standard leaves unspecified.** `LIMIT` without `ORDER BY`,
  and tie-breaking among equal sort keys, may return a different subset between
  releases. This is not a regression - see
  [SQL Compatibility Notes](/docs/reference/sql/advanced/sql-compatibility).
- **Approximate aggregates.** `APPROX_COUNT_DISTINCT` and `APPROX_PERCENTILE`
  are estimates. Their sketches may be re-tuned in a minor release, so their
  output can move.

New functions, statements, and syntax are added in minor releases. Removing
something from the SQL surface is a breaking change and follows the deprecation
route below.

When a function does not exist, Opteryx fails with an explicit unknown-function
error rather than silently substituting something close. That behaviour is
itself a promise: a query either does what it says or stops.

## Configuration and Variables

System variables and their defaults are listed under
[System Variables](/docs/reference/sql/variables). Defaults may be re-tuned in
a minor release where the change improves behaviour for most workloads; a
variable that has been set explicitly is honoured.

Some variables are server-owned and cannot be changed with `SET` -
`sql_select_limit` is the notable one. See [Limits](/docs/reference/sql/limits)
for which limits are enforced and which are declared but not yet enforced.

## Deprecation and Removal

Before 1.0 we do not promise a fixed deprecation window. What we do promise:

1. **Announcement.** A deprecation is recorded in the release notes for the
   version that introduces it.
2. **A warning where one is possible.** Deprecated Python API raises a
   `DeprecationWarning` for at least one minor release before removal.
   Deprecated SQL syntax is reported at plan time.
3. **Removal in a minor release**, not a patch release.

A feature already scheduled for deprecation may be removed rather than fixed if
a bug is found in it. If you depend on something you suspect is on that list,
say so on the [issue tracker](https://github.com/mabel-dev/opteryx/issues) -
usage we know about is usage we can plan around.

## Supported Versions

Functional and security fixes land in the **current and previous minor
series**. New features go only to the current series. Patch releases are cut as
needed rather than on a schedule.

| Series | Fixes | New features |
|--------|-------|--------------|
| Current minor | Yes | Yes |
| Previous minor | Yes | No |
| Older | No | No |

A release found to contain a material bug or a security vulnerability may be
**yanked from PyPI**. A yanked release stays installable by exact pin, so
existing lockfiles do not break, but it will not be selected by a range
specifier. If you pin exactly, watch the release notes.

There is no long-term support series. Running the latest release is the
supported position.

## Security

Vulnerabilities should be reported through [GitHub Security
Advisories](https://github.com/mabel-dev/opteryx/security/advisories) rather
than the public issue tracker. Include a description, reproduction steps,
affected versions, and any known mitigations.

- We aim to **triage and respond within 7 days**.
- We follow a **90-day coordinated disclosure** timeline from first contact,
  regardless of whether the issue is resolved by then.
- Credit is given to reporters unless anonymity is requested.

The policy covers issues affecting data confidentiality, integrity, or
availability, and system functionality or integrity.

## What We Do Not Promise

**Performance.** There is no performance guarantee, no published throughput
figure, and no commitment that a given query will not get slower in a release.
The engine is measured continuously - see
[Benchmarking](/docs/reference/internals/benchmarking) for the suites and the
method - but those measurements are development instrumentation, not a service
level. Optimizer changes that make most queries faster can make an individual
query slower.

**Transactional guarantees.** Opteryx is an analytical query engine over files.
It has no transactions, no `COMMIT`/`ROLLBACK`, and no isolation levels. A
query reads a consistent snapshot of the data it resolves at plan time; two
queries in the same session are two independent reads. If you need OLTP
semantics, this is not the tool — see
[SQL Conformance](/docs/reference/sql/conformance) for what that rules out.

**Resource bounds.** Memory and concurrency behaviour depends on the data, the
plan, and the host. Opteryx does not promise a query will complete within a
given memory budget.

## How These Promises Are Backed

Every change runs through CI before it can merge:

- **Regression suite** - the shape and result battery, on Python 3.14
  free-threaded.
- **SQL logic tests** - a [sqllogictest](https://sqlite.org/sqllogictest/doc/trunk/about.wiki)
  suite in three tiers (shape-checking, result-checking, execute-only).
- **Fuzzing** - a short pass on every push, and a 100,000-iteration run nightly.
- **Static analysis and security scanning** - CodeQL, Semgrep, secrets
  scanning, type checking.

[Benchmarking](/docs/reference/internals/benchmarking) covers the correctness
and performance suites in more detail.

## Related

- [Compatibility](compatibility) - Python versions, platforms, formats, and
  storage backends
- [Limits](/docs/reference/sql/limits) - the ceilings the engine enforces
- [SQL Conformance](/docs/reference/sql/conformance) - which parts of the SQL
  standard are implemented
- [SQL Compatibility Notes](/docs/reference/sql/advanced/sql-compatibility) -
  where behaviour differs from other engines
