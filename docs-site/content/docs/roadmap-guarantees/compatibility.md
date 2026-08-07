---
title: Compatibility - Supported Python Versions, Platforms, and File Formats
description: What Opteryx Core actually supports today — Python versions, operating systems, file formats, storage backends, and SQL dialect — verified against the current release.
---

# Compatibility

This page covers what Opteryx Core supports right now, as of `0.9.58`. It only lists what is verified against the current source and release pipeline — if something isn't here, treat it as unsupported rather than assume it works.

## Python Versions

`pyproject.toml` declares `requires-python = ">=3.11"`. What is built and what is tested are two different things:

- **Linux wheels** are built for **3.11, 3.12, 3.13, and 3.14** (manylinux2014, x86_64).
- **macOS wheels** are built for **3.14 only**.
- The regression suite, SQL logic tests, and fuzzer all run against **3.14**.

So 3.11–3.13 are installable from a wheel but are not covered by the test matrix; 3.14 is the version to run if you want the tested configuration. There is no free-threaded (`3.14t`) build of Opteryx Core — the macOS job is explicitly the GIL build. Python 3.10 and below are not supported.

## Operating Systems

- **Linux (x86_64)** — built as `manylinux2014` wheels and the platform all test suites run on (`ubuntu-latest` in CI).
- **macOS (Apple Silicon / arm64)** — wheels are built on `macos-14`. There's no equivalent macOS test run in CI, so this is build-verified rather than test-verified. Intel macOS is not built.
- **Windows** — not supported. No Windows runner appears anywhere in CI, and no Windows wheels are built.

## File Formats

Opteryx Core's file I/O goes through [Rugo](/docs/reference/internals/rugo), its native, dependency-free file engine — there is no PyArrow in the engine itself.

A **dataset** — the thing `SELECT ... FROM workspace.dataset` resolves to — is a folder of data files in one of three formats:

- **Parquet** (`.parquet`) — the default, and what stored datasets are normally written as.
- **JSONL** (`.jsonl`) — queryable directly, no conversion step.
- **Skene** (`.skene`) — the engine's own [native format](/docs/reference/internals/skene).

A dataset is single-format by decree: format is a property of the dataset, not of individual files, and a folder whose data files disagree is a hard error at discovery rather than a silent drop of the minority files.

**CSV** is not a dataset format, but it is still queryable — as are Parquet and JSONL — through the file-reading table functions, which take a path directly (there is no `READ_SKENE`):

```sql
SELECT * FROM READ_CSV('/path/to/file.csv');
SELECT * FROM READ_JSONL('/path/to/file.jsonl');
SELECT * FROM READ_PARQUET('/path/to/file.parquet');
```

Rugo also reads and writes Parquet, CSV, and JSONL as a standalone library — see [Using Rugo Standalone](/docs/guides/rugo-standalone).

ORC and Avro are not supported — there's no reader for either in the engine or in Rugo.

## Storage Backends

Storage is reached through one generic `FileSystemConnector`, which picks a filesystem from the path's protocol:

- **Local disk** — a bare path, or `file://`.
- **Google Cloud Storage** — `gs://` or `gcs://`, authenticating through Google's own OAuth-based service account credentials.
- **HTTP / HTTPS** — `http://` and `https://`, via range requests.

`DiskConnector` and `GcpCloudStorageConnector` still work as names, but they are backwards-compatible aliases for `FileSystemConnector` rather than separate implementations.

One exception worth knowing: the `READ_*` table functions are bare dataset functions with no per-query authorization layer, so a `gs://` path given to one of them is fetched **anonymously** — a plain unauthenticated HTTPS GET, never this process's ambient service-account credential. GCS's own object-level IAM decides whether that succeeds.

S3, Azure Blob Storage, and MinIO are not implemented. Test configuration in CI references MinIO and Azure environment variables for mocking purposes, and some comments still name S3 as a hypothetical connector, but no corresponding connector code exists in the engine — don't take either as a sign they're supported.

## SQL Dialect

Opteryx parses SQL through its own `OpteryxDialect`, built on a fork of `sqlparser` (via `sqloxide`). It started from the MySQL dialect and has since picked up syntax from others where it made sense. It is not a strict implementation of ANSI SQL, PostgreSQL, or MySQL — if a query relies on dialect-specific syntax from one of those, check it against Opteryx directly rather than assuming compatibility.

## What's Not Here

These come up often enough to call out explicitly as **not implemented**:

- No REST, GraphQL, or gRPC server — Opteryx Core is an in-process library, not a service. (It does put an `opteryx` command on your PATH for running queries locally; the hosted [opteryx.app](https://opteryx.app) exposes a [Jobs API](/docs/reference/api) separately.)
- No Docker image, Helm chart, or Kubernetes manifests shipped with the project.
- No OAuth, SAML, or OpenID Connect provider implemented by Opteryx itself. The GCS connector consumes Google's OAuth client library to authenticate outbound requests — that's using an auth protocol, not offering one.

## Dependencies

The package ships with **no required runtime dependencies** (`dependencies = []` in `pyproject.toml`). Three optional extras exist: `performance` (adds `orjson`, which has no free-threaded build), `testing`, and `embeddings` — the last of which installs nothing, and instead documents the out-of-band ONNX Runtime SDK and model weights needed to compile the optional `EMBED` capability. Everything else you'll see referenced in the repository — `pyarrow`, `pandas`, `numpy`, `pydantic`, and the rest — is test-only tooling, not something installed alongside the engine.

## Related

- [Known Limits](known-limits)
- [Using Rugo Standalone](/docs/guides/rugo-standalone)
