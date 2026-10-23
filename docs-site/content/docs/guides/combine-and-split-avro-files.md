---
title: Combine and Split Avro Files - the rugo Command
description: Merge many Avro files into one, or split a big one into parts, with the rugo command. Avro can't be joined with cat, and nested records are flattened to JSON text on the way through, so here is what to expect.
---

# Combine and Split Avro Files

Avro files arrive in large numbers — a file per Kafka Connect flush, one per hour from a change-capture tool. You can't join them with `cat`: each Avro file is a container with its own header, a schema and a sync marker, and two of them back to back are not one valid file. [Rugo](/docs/guides/rugo-standalone) has `merge` and `split` that do it properly.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- split an Avro file into parts of a fixed number of rows
- merge Avro files into one file, or straight into Parquet
- know what happens to nested records on the way through
- decide between merging Avro and converting to Parquet

## Split One File into Parts

```bash
pip install rugo
rugo split space_missions.avro --rows 2000
```

```text
space_missions.part0000.avro  (2000 rows)
space_missions.part0001.avro  (2000 rows)
space_missions.part0002.avro  (630 rows)
```

The example file is `space_missions.avro`, 4,630 orbital launch attempts. [Download it](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/avro/space_missions.avro) from the Opteryx repository.

Parts land beside the input, with a zero-padded number so a shell wildcard lists them in order. Each is a complete Avro file with its own header; an Avro library such as fastavro opens it.

## Merge Files into One

The last name on the line is the output; everything before it is an input:

```bash
rugo merge space_missions.part000*.avro space_missions_all.avro
```

```text
merged 3 files (4630 rows) -> space_missions_all.avro
```

```bash
rugo count space_missions_all.avro
```

```text
4630
```

Rows keep the order of the files you gave. The output is written with the `deflate` codec.

Every file must have the same column names, in the same order, with the same types; otherwise nothing is written and the error says which differs.

## What Happens to Nested Records

This is the one surprise. Rugo turns each Avro record into columns of simple values, and a nested record — a record inside a record — becomes JSON text. When `merge` or `split` writes Avro again, that column is written as a plain `string`.

The original file's `Rocket` field is a record with a `Name` and an enum `Status`. After a split or a merge it is a string holding `{"Name":"Sputnik 8K71PS","Status":"Retired"}`:

```bash
rugo preview -n 1 -c Rocket space_missions_all.avro
```

The data is all still there, but the schema in the header has changed, and a consumer that expects a record there will not get one. Top-level fields — strings, numbers, timestamps, nullable columns — come through with their types.

So, if your Avro has nested records and a downstream consumer depends on the exact schema, don't round-trip it through `rugo`. Flat Avro files are unaffected.

## Merge Straight into Parquet

You don't have to produce Avro. The output format follows the name you give it:

```bash
rugo merge space_missions.part000*.avro space_missions_all.parquet
```

```text
merged 3 files (4630 rows) -> space_missions_all.parquet
```

That is usually the better end state. Avro is a good format to write and a poor one to query, and combining a pile of small Avro files into one Parquet file does two jobs in a single step. See [Convert Avro to Parquet](/docs/guides/convert-avro-to-parquet) for how types come across.

`rugo split` has a matching option, `--format`: `rugo split big.avro --rows 100000 --format parquet` writes Parquet parts.

## Large Files

`merge` and `split` build the whole result in memory before writing it, and the Avro reader holds an input file in memory while it decodes it, so these suit files that fit in RAM. For many small Avro files, which is the common case, that is no constraint.

## Related

- [Convert Avro to Parquet](/docs/guides/convert-avro-to-parquet)
- [How to Read an Avro File with Python](/docs/guides/read-an-avro-file-with-python)
- [Combine and split Parquet files](/docs/guides/combine-and-split-parquet-files)
- [The Rugo Command Line](/docs/guides/rugo-cli)
