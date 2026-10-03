---
title: Validating Parquet Files as They Arrive in S3 with AWS Lambda
description: A missing column, a type change or a handful of bad values can break everything downstream. Reject invalid Parquet files at the door with a small Lambda function and Rugo, before they become part of the data lake.
date: 2026-07-11
author: Justin Joyce
role: Opteryx Engineering
tags:
  - rugo
  - aws-lambda
  - data-quality
  - parquet
---

# Validating Parquet Files as They Arrive in S3 with AWS Lambda

## TL;DR

Modern data platforms trust that files landing in object storage are valid — right schema, right types, right values. That assumption breaks more often than anyone would like, and by the time it's caught downstream, the bad file is already in dashboards or training data.

We'll build a validation pipeline that runs on every upload: S3 triggers a Lambda function, the function reads just the Parquet footer with [Rugo](https://rugo.dev) to check the schema, then reads only the columns the data contract cares about to check the values. Bad files never make it past the trigger.

The full, working project — handler, data contract, AWS SAM deployment template, and a test suite that runs against real Parquet fixtures with no AWS account required — is in [`examples/validating-parquet-lambda`](https://github.com/mabel-dev/docs.opteryx.app/tree/main/examples/validating-parquet-lambda). Clone it, run `pytest`, and `sam deploy` it as-is or adapt `contract.py` to your own schema. The rest of this post walks through how it works.

## The Architecture

```
S3 Upload
    │
    ▼
AWS Lambda
    │
    ▼
Read Parquet metadata with Rugo
    │
    ▼
Validate file
    │
    ├── Accepted
    └── Rejected
```

The Lambda function has one job: decide whether the file meets the expected data contract. If it does, it's accepted. If it doesn't, it gets quarantined, deleted, or flagged for investigation — whatever fits the workflow downstream.

The standalone `rugo` package is local-filesystem only, so the first step in the handler is downloading the object the S3 event points at into `/tmp`:

```python
import boto3

s3 = boto3.client("s3")

def handler(event, context):
    record = event["Records"][0]["s3"]
    bucket, key = record["bucket"]["name"], record["object"]["key"]

    s3_local_path = f"/tmp/{key.split('/')[-1]}"
    s3.download_file(bucket, key, s3_local_path)
    ...
```

Everything from here on reads that local path. The part that makes this cheap enough to run on every single file is *what* Rugo reads from it to make the accept/reject decision.

## Step 1: Validate the Schema

The first check should be the cheapest one, and it is — the schema lives entirely in the Parquet footer, so `read_metadata` never touches the row data:

```python
from rugo import parquet

meta = parquet.read_metadata(s3_local_path)

expected = {
    "customer_id": "int64",
    "event_timestamp": "int64",
    "age": "int64",
    "status": "byte_array",
}

actual = {col.name: col.physical_type for col in meta.schema_columns}

missing = expected.keys() - actual.keys()
unexpected = actual.keys() - expected.keys()
mismatched = {
    name for name in expected.keys() & actual.keys()
    if expected[name] != actual[name]
}

if missing or mismatched:
    return reject(f"missing={missing} mismatched={mismatched}")
```

`meta.schema_columns` gives you name, physical type, logical type and nullability for every column — decoded from the footer alone. For most malformed files, this is where validation ends: a dropped or renamed column, a type that silently changed upstream, all caught in a few milliseconds without decoding a single row.

## Step 2: Validate the Data

A valid schema doesn't mean valid data. Once the schema passes, read only the columns the contract actually constrains:

```python
from rugo import parquet

VALID_STATUSES = {"NEW", "ACTIVE", "SUSPENDED", "CLOSED"}

with parquet.read_parquet(
    s3_local_path,
    columns=["customer_id", "age", "status"],
) as reader:
    for morsel in reader:
        ids = morsel.column("customer_id").to_pylist()
        ages = morsel.column("age").to_pylist()
        statuses = morsel.column("status").to_pylist()

        if any(v is None for v in ids):
            return reject("customer_id contains nulls")
        if any(v is not None and not (0 <= v <= 120) for v in ages):
            return reject("age out of range")
        if any(v not in VALID_STATUSES for v in statuses):
            return reject("status contains an unrecognised value")
```

If the file has thirty columns and the contract only constrains three, only those three get decoded — `columns=` skips the rest at the parse level. That matters twice over here: it's less work per file, and it's less memory held in a Lambda execution environment that's typically capped at a few hundred megabytes.

For contract checks that reduce to a simple comparison, predicate pushdown does the filtering for you instead of a Python loop:

```python
with parquet.read_parquet(
    s3_local_path,
    columns=["customer_id"],
    predicates=[("age", ">", 120)],
) as reader:
    bad_rows = sum(len(m) for m in reader)

if bad_rows:
    return reject(f"{bad_rows} rows with age > 120")
```

Row groups that can't possibly contain a matching row are pruned from footer statistics before anything is decoded — the check gets cheaper, not more expensive, as the file grows.

## Step 3: Validate the File

Some problems aren't about any single column — they're about the file as a whole. The cheapest of these is also footer-only:

```python
meta = parquet.read_metadata(s3_local_path)

if meta.num_rows == 0:
    return reject("file has zero rows")
```

A zero-row file usually means an upstream job wrote an empty partition — schema-valid, contract-valid on every column check, and still not something you want silently joining the rest of the lake. Size-based checks (a file that's a tenth the size of yesterday's for the same partition) are worth adding here too, using whatever metadata S3 already gives you in the trigger event — no need to open the file for that one.

## What Happens When Validation Fails

That depends on the workflow, but common choices are:

- Move the file into a quarantine bucket instead of the destination prefix.
- Send a notification through SNS.
- Log the failure with enough detail (which check, which columns, which values) to act on without re-reading the file.

The one thing to avoid is silently dropping the file with no trace — a rejected file that leaves no signal just becomes a different kind of missing data.

## Why Lambda

This is the shape Lambda is built for: a file arrives, a small amount of work happens, the function exits. No server to keep warm, no database to provision for what is fundamentally a stateless check per file.

The fit with Rugo is specific, not incidental. A cold Lambda invocation pays import cost on every cold start, and Rugo's is about 5 ms against PyArrow's ~29 ms — on infrequent triggers, most invocations *are* cold starts. And because validation here only ever needs the footer or a handful of projected columns, the bulk of most files is never read at all, which keeps both execution time and memory inside Lambda's tighter limits.

## Final Thoughts

None of these checks require heavyweight infrastructure — a data contract violation is visible in the footer or in a few projected columns, and Rugo is built to read exactly that and nothing more. Reject a bad file when it lands, and it never has the chance to become a bad dashboard, a bad training run, or a 2am incident three systems downstream.

In a future post: using Rugo to discover and inventory datasets across a bucket, without reading more than the footer of each file.

— Justin
