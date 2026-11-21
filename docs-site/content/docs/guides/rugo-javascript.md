---
title: Using Rugo from JavaScript - Read Parquet, ORC and Avro in the Browser and Node
description: Rugo's Parquet, ORC and Avro readers are published to npm as a WebAssembly build of the same C++ that ships in the Python wheel. Read a Parquet footer or a few columns from a local file or a URL, fetching only the byte ranges needed.
---

# Using Rugo from JavaScript

[Rugo](https://rugo.dev) is the file engine inside Opteryx. Its Parquet, ORC and Avro readers are also published to npm as [`@opteryx/rugo`](https://www.npmjs.com/package/@opteryx/rugo): the same C++ that ships in the `rugo` Python wheel, compiled to WebAssembly, with a small JavaScript API on top. It runs in the browser and in Node.

```bash
npm install @opteryx/rugo@alpha
```

The package is **alpha**. The API, the metadata shapes and the value mapping may change between releases, so pin the version you tested with.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- read a Parquet file's schema and row-group metadata without downloading the file
- decode chosen columns of a Parquet file, one row group at a time, from disk or over HTTP
- read ORC stripes and Avro batches
- know what JavaScript value each column type becomes
- know what the JavaScript build leaves out compared with the Python package

## What's in the Package

| | |
|---|---|
| Runtimes | Browsers, and Node 24 or later |
| Module format | ES modules only |
| Dependencies | None |
| Download | About 370 KB gzipped, nearly all of it one `.wasm` file |
| Threads | Single-threaded, so no `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy` headers are needed |
| Types | TypeScript declarations included |

It is a reader. Writing files, CSV and JSONL, and predicate pushdown are in the Python package and not in this one (see [What's Different From Python](#whats-different-from-python)).

## Sources

Every reader takes a *source*: something with a `size` and a `read(offset, length)` that returns the requested bytes. Two are built in.

| Source | Use it for | Reads with |
|---|---|---|
| `blobSource(blob)` | A local `File` or `Blob` | `Blob.slice()` |
| `await httpSource(url)` | A remote file | HTTP `Range` requests |

Both record every read they make in `source.reads`, as `[offset, length]` pairs, which is handy for checking how much of a file was actually fetched.

Anything with the same shape works too. This is a source over a Node file handle:

```js
import { open } from "node:fs/promises";

const fh = await open("space_missions.parquet");
const { size } = await fh.stat();

const source = {
  size,
  async read(offset, length) {
    const buf = new Uint8Array(length);
    await fh.read(buf, 0, length, offset);
    return buf;
  },
};
```

The same pattern wraps an object-store SDK: have `read` issue a ranged `GetObject` and return a `Uint8Array`.

## Reading a Parquet Footer

`readFooter` reads the footer and nothing else. The examples on this page use [space_missions.parquet](https://rugo.dev/data/space_missions.parquet), 4,630 space launches.

```js
import { openAsBlob } from "node:fs";
import { blobSource, readFooter } from "@opteryx/rugo";

const src = blobSource(await openAsBlob("space_missions.parquet"));
const footer = await readFooter(src);

console.log(footer.num_rows, "rows in", footer.num_row_groups, "row group(s)");
for (const c of footer.schema) {
  console.log(`${c.name}: ${c.logical_type || c.physical_type}`);
}
```

```text
4630 rows in 1 row group(s)
Company: varchar
Location: varchar
Price: float64
Lauched_at: timestamp[us]
Rocket: varchar
Rocket_Status: varchar
Mission: varchar
Mission_Status: varchar
```

The first read is always the last 64 KB of the file, which holds the whole footer for nearly every real file. If the footer is larger, one more read fetches the part that's missing. On a 1.37 GB file with 105 columns and 216 row groups that comes to two reads and 2.35 MB, which is 0.17% of the file.

`footer.row_groups` carries the per-column-chunk detail: codec, encodings, compressed and uncompressed sizes, null count, and whether the chunk has min/max statistics, a bloom filter or a page index.

```js
for (const c of footer.row_groups[0].columns) {
  console.log(c.name, c.codec, c.total_compressed_size, c.null_count);
}
```

```text
Company ZSTD 3108 0
Location ZSTD 5686 0
Price ZSTD 1759 3380
...
```

## Reading Parquet Values

`openParquet` parses the footer and keeps the file open so you can decode values. `readRowGroup(rg, columns)` decodes the columns you name from one row group, with one read per column chunk. Leave the column list out to read every column.

This example reads a file over HTTP and adds up what SpaceX launches cost:

```js
import { httpSource, openParquet } from "@opteryx/rugo";

const src = await httpSource("https://rugo.dev/data/space_missions.parquet");
const pq = await openParquet(src);
try {
  let total = 0;
  let priced = 0;
  for (let rg = 0; rg < pq.footer.num_row_groups; rg++) {
    const { num_rows, columns } = await pq.readRowGroup(rg, ["Company", "Price"]);
    for (let i = 0; i < num_rows; i++) {
      if (columns.Company[i] === "SpaceX" && columns.Price[i] !== null) {
        total += columns.Price[i];
        priced++;
      }
    }
  }
  console.log(`SpaceX: ${priced} priced launches, $${total.toFixed(1)}M`);
} finally {
  pq.close();
}
```

```text
SpaceX: 176 priced launches, $11181.0M
```

Three things to know:

- **Each column is a plain array**, one entry per row, with `null` for nulls. `columns.Company[i]` and `columns.Price[i]` are the same row.
- **Call `close()`** when you're done. The parsed footer lives in the WebAssembly heap, which JavaScript's garbage collector doesn't manage. A `try` / `finally` keeps it tidy.
- **Read one row group at a time.** The WebAssembly heap is limited to 4 GB, and a row group's decoded columns have to fit in it alongside everything else. Loop over row groups, as above, and let each batch go before reading the next.

There is no predicate argument. Filter in JavaScript after decoding, and use the footer's row-group metadata to decide which row groups are worth reading at all.

### Reading From a URL

`httpSource` needs a server that honours `Range` requests; it rejects if the server answers with the whole file. In Node that's the only requirement.

In a browser, the usual cross-origin rules apply on top. Reading a file from the same origin as your page just works. Reading from a different origin needs that server to:

- send `Access-Control-Allow-Origin`
- answer the `OPTIONS` preflight and allow the `Range` request header (the first request asks for a suffix range, `bytes=-65536`, which browsers preflight)
- list `Content-Range` in `Access-Control-Expose-Headers`, because that's where the file size comes from

Object stores can be configured to do all three with a CORS rule. Plain static hosts often can't. When you can't change the server, fetch the file as a `Blob` and use `blobSource`, or let the user pick the file from disk.

### Reading a File the User Picked

In the browser a `File` from an `<input type="file">` or a drop event goes straight into `blobSource`. The file is read by byte range in the tab. Nothing is uploaded.

```html
<input type="file" id="file" accept=".parquet" />
<pre id="out"></pre>

<script type="module">
  import { blobSource, readFooter } from "https://cdn.jsdelivr.net/npm/@opteryx/rugo@0.5.13/rugo_footer.mjs";

  document.getElementById("file").addEventListener("change", async (event) => {
    const footer = await readFooter(blobSource(event.target.files[0]));
    document.getElementById("out").textContent = footer.schema
      .map((c) => `${c.name}: ${c.logical_type || c.physical_type}`)
      .join("\n");
  });
</script>
```

That page has no build step: it imports the package from a CDN that serves npm packages as ES modules. In an application with a bundler, `npm install` and import `@opteryx/rugo` as usual. The module finds its `.wasm` file with `new URL("rugo.wasm", import.meta.url)`, so the bundler has to support that pattern for assets.

## Reading ORC and Avro

ORC and Avro have the same shape as Parquet: open, read a unit, close. An ORC file is read a *stripe* at a time and an Avro file a *batch* at a time (whole blocks, up to 65,536 rows).

```js
import { openAsBlob } from "node:fs";
import { blobSource, openAvro } from "@opteryx/rugo";

const avro = await openAvro(blobSource(await openAsBlob("space_missions.avro")));
try {
  console.log(avro.meta.codec, avro.meta.num_rows, avro.meta.batches);
  const { columns } = await avro.readBatch(0, ["Company", "Rocket.Name"]);
  console.log(columns.Company[0], columns["Rocket.Name"][0]);
} finally {
  avro.close();
}
```

```text
deflate 4630 [ 4630 ]
RVSN USSR Sputnik 8K71PS
```

ORC is the same with `openOrc` and `readStripe`:

```js
import { openAsBlob } from "node:fs";
import { blobSource, openOrc } from "@opteryx/rugo";

const orc = await openOrc(blobSource(await openAsBlob("events.orc")));
try {
  console.log(orc.meta.num_rows, orc.meta.compression, orc.meta.stripes);
  const { num_rows, columns } = await orc.readStripe(0, ["id", "name"]);
} finally {
  orc.close();
}
```

- Avro column names can be dotted paths that reach into a record: `"Rocket.Name"` reads one field of the `Rocket` record. Asking for `"Rocket"` returns the whole record as JSON text.
- `avro.meta.schema` is the writer schema, parsed. `avro.meta.batches` and `orc.meta.stripes` list the row count of each batch or stripe.
- `orc.meta.columns` says whether each column is `readable`. A column that isn't carries a `refusal` saying why.

**ORC and Avro read the whole file into memory.** Unlike Parquet, these two readers load the file in one read when you open it: the ORC reader addresses the whole file, and an Avro container file has no index to seek by. Files of 4 GB or more are refused, and the practical limit is nearer 2 GB. For large remote files, Parquet is the format this package reads lazily.

## What the Values Look Like

| Column type | JavaScript value |
|---|---|
| 8, 16 and 32-bit integers, floats | `number` |
| dates, 32-bit times | `number` (the stored integer: days, or time units) |
| 64-bit integers, timestamps, 64-bit times | `bigint` (the stored integer; the column type gives the unit) |
| boolean | `boolean` |
| varchar / string, enum | `string` |
| binary | `Uint8Array` |
| decimal | `string`, with the decimal point in place |
| uuid | hyphenated hex `string` |
| interval | `{ months: bigint, us: bigint }` |
| list / array | nested arrays, to any depth |
| ORC struct and map, Avro record and map | JSON text `string` |

Timestamps and dates come back as the integers the file stores, not as `Date` objects, so no precision is lost. Converting is one line once you know the unit from the schema. For a `timestamp[us]` column:

```js
const { columns } = await pq.readRowGroup(0, ["Mission", "Lauched_at"]);
const micros = columns.Lauched_at[0];                 // -386310720000000n
console.log(new Date(Number(micros / 1000n)));        // 1957-10-04T19:28:00.000Z
```

64-bit integers are `bigint` for the same reason: a `number` can't hold every 64-bit value exactly. Remember that `bigint` and `number` don't mix in arithmetic, and that `JSON.stringify` refuses `bigint` unless you convert it.

For lists, a null list is `null`, an empty list is `[]`, and elements can be `null`. Parquet list elements are limited to integers, floats, booleans and strings.

## Errors

Every failure rejects with an `Error`. Nothing returns a partial result.

| Situation | Message |
|---|---|
| Not a Parquet file | `not a parquet file (no PAR1 trailer)` |
| Row group, stripe or batch out of range | `rugo: row group 3 out of range (file has 1)` |
| Unknown column | `rugo: no column 'Nope' in row group 0` |
| Read after `close()` | `rugo: file is closed` |
| Server ignores `Range` | `<url>: server ignored Range (HTTP 200)` |

A column the native reader can't decode rejects with the reader's own message passed through.

## What's Different From Python

| | Python (`pip install rugo`) | JavaScript (`@opteryx/rugo`) |
|---|---|---|
| Reads | Parquet, CSV, JSONL, Avro, ORC | Parquet, ORC, Avro |
| Writes | Parquet, CSV, JSONL, Avro | Nothing |
| Remote files | No, local filesystem only | Yes, over HTTP `Range` |
| Predicates | Pushed into the reader | Filter in JavaScript |
| Threads | Yes | Single-threaded |
| Result | Draken morsels | Plain arrays per column |
| Parquet codecs | Snappy, Zstandard, gzip, LZ4 raw; no Brotli | The same |

Versions match across the two: `@opteryx/rugo@0.5.13` is built from the same source as `rugo==0.5.13`.

## See It Running

The [file viewer on rugo.dev](https://rugo.dev/viewer/) reads Parquet footers with this build. Open a file from disk or a URL and it shows the schema, row groups and per-column detail without uploading anything.

## Related

- [Using Rugo Standalone](/docs/guides/rugo-standalone)
- [The Rugo Command Line](/docs/guides/rugo-cli)
- [Rugo — the file engine](/docs/reference/internals/rugo)
- [Read a Parquet file with Python](/docs/guides/read-a-parquet-file-with-python)
