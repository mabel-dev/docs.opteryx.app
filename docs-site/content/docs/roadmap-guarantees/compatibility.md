---
title: Compatibility - Supported Python Versions, Platforms, and File Formats
description: What Opteryx Core actually supports today — Python versions, operating systems, file formats, storage backends, and SQL dialect — verified against the current release.
---

# Compatibility

This page covers what Opteryx Core supports right now, as of `0.9.14`. It only lists what is verified against the current source and release pipeline — if something isn't here, treat it as unsupported rather than assume it works.

## Python Versions

`pyproject.toml` declares `requires-python = ">=3.13"`. In practice, support is narrower than that floor suggests:

- Release wheels are built for **Python 3.14** and **3.14t** (the free-threaded build), for both manylinux2014 and macOS.
- The regression suite, SQL logic tests, and fuzzer all run against **3.14t** only.

If you're on 3.13, the package may install from source but isn't part of the tested or wheel-built matrix. Earlier versions (3.12 and below) are not supported.

## Operating Systems

- **Linux (x86_64)** — built as `manylinux2014` wheels and the platform all test suites run on (`ubuntu-latest` in CI).
- **macOS (Apple Silicon / arm64)** — wheels are built on `macos-14`. There's no equivalent macOS test run in CI, so this is build-verified rather than test-verified.
- **Windows** — not supported. No Windows runner appears anywhere in CI, and no Windows wheels are built.

## File Formats

Opteryx Core's file I/O goes through [Rugo](/docs/reference/internals/rugo), its native, dependency-free file engine — there is no PyArrow in the engine itself.

- **Parquet** — the only format you can query with SQL today. `SELECT ... FROM workspace.dataset` resolves to a folder of Parquet files.
- **CSV and JSONL** — Rugo can read and write both directly, but not as SQL query sources yet. Convert to Parquet first if you need to query them. See [Using Rugo Standalone](/docs/guides/rugo-standalone).

ORC and Avro are not supported — there's no reader for either in the engine or in Rugo.

## Storage Backends

- **Local disk** — via `DiskConnector`.
- **Google Cloud Storage** — via `GcpCloudStorageConnector`, authenticating through Google's own OAuth-based service account credentials.

S3, Azure Blob Storage, and MinIO are not implemented as connectors. Test configuration in CI references MinIO and Azure environment variables for mocking purposes, but no corresponding connector code exists in the engine — don't take their presence in CI config as a sign they're supported.

## SQL Dialect

Opteryx parses SQL through its own `OpteryxDialect`, built on a fork of `sqlparser` (via `sqloxide`). It started from the MySQL dialect and has since picked up syntax from others where it made sense. It is not a strict implementation of ANSI SQL, PostgreSQL, or MySQL — if a query relies on dialect-specific syntax from one of those, check it against Opteryx directly rather than assuming compatibility.

## What's Not Here

These come up often enough to call out explicitly as **not implemented**:

- No REST, GraphQL, or gRPC server — Opteryx Core is an in-process library, not a service. (The hosted [opteryx.app](https://opteryx.app) exposes a [Jobs API](/docs/reference/api) separately.)
- No Docker image, Helm chart, or Kubernetes manifests shipped with the project.
- No OAuth, SAML, or OpenID Connect provider implemented by Opteryx itself. The GCS connector consumes Google's OAuth client library to authenticate outbound requests — that's using an auth protocol, not offering one.

## Dependencies

The package ships with **no required runtime dependencies** (`dependencies = []` in `pyproject.toml`). The `performance` extra adds `orjson`. Everything else you'll see referenced in the repository — `pyarrow`, `pandas`, `numpy`, `pydantic`, and the rest — is test-only tooling, not something installed alongside the engine.

## Related

- [Known Limits](known-limits)
- [Stability Promises](stability-promises)
- [Using Rugo Standalone](/docs/guides/rugo-standalone)
