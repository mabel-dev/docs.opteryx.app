---
title: Rugo Runs in the Browser - A 1.4 GB Parquet File's Schema in Two Requests
description: Rugo's Parquet, ORC and Avro readers are now on npm, compiled to WebAssembly from the same C++ that ships in the Python wheel. A page can read the schema of a 1.4 GB Parquet file by fetching 0.17% of it, then decode just the columns it wants. Here's what you can do with it, how it was built, and what it doesn't do yet.
date: 2026-11-21
author: Justin Joyce
role: Opteryx Engineering
tags:
  - rugo
  - webassembly
  - javascript
  - parquet
  - storage
---

# Rugo Runs in the Browser - A 1.4 GB Parquet File's Schema in Two Requests

## TL;DR

* [Rugo](https://rugo.dev), the file engine inside [Opteryx](https://opteryx.app), is now on npm as [`@opteryx/rugo`](https://www.npmjs.com/package/@opteryx/rugo). It's the same C++ that ships in the Python wheel, compiled to WebAssembly, for the browser and Node.
* **See it working at [rugo.dev/viewer](https://rugo.dev/viewer/).** Drop a Parquet file on the page and it shows the schema and row groups, read in your browser with nothing uploaded.
* **Want to know what's in a Parquet file without downloading it?** Rugo reads the footer and nothing else. On a 1.37 GB file that's two requests and 2.35 MB, 0.17% of the file, and you have the schema and every row group's metadata in about 30 ms in Node.
* **Want some of the values?** Name the columns and a row group. Rugo fetches exactly those column chunks, one request each, and hands back plain JavaScript arrays.
* **ORC and Avro work too**, with one caveat: those two read the whole file into memory.
* It's about 360 KB gzipped, has no dependencies, and needs no special server headers. It's also **alpha**, and it's a reader only.

## What you can do with it

Install it:

~~~bash
npm install @opteryx/rugo@alpha
~~~

Then point it at a file. This reads a Parquet file over HTTP, picks two columns, and adds up what SpaceX's launches cost:

~~~js
import { httpSource, openParquet } from "@opteryx/rugo";

const pq = await openParquet(await httpSource("https://rugo.dev/data/space_missions.parquet"));
try {
  const { num_rows, columns } = await pq.readRowGroup(0, ["Company", "Price"]);
  let total = 0;
  for (let i = 0; i < num_rows; i++) {
    if (columns.Company[i] === "SpaceX" && columns.Price[i] !== null) total += columns.Price[i];
  }
  console.log(`$${total.toFixed(1)}M`);   // $11181.0M
} finally {
  pq.close();
}
~~~

The file has eight columns. That code fetched the footer and two column chunks, and never asked for the other six.

In a browser, swap `httpSource(url)` for `blobSource(file)` and give it the `File` from a file picker or a drop. The file is read from disk by byte range, in the tab. Nothing is uploaded, which matters when the file is one you're not allowed to send anywhere.

That's what the [file viewer on rugo.dev](https://rugo.dev/viewer/) does: drop a Parquet file on it and it shows the schema, row groups and per-column sizes, with Rugo doing the reading.

## Why read by byte range

A Parquet file keeps its table of contents at the end. The footer lists every column, every row group, and for each column chunk where it starts, how long it is, how it's compressed and how many nulls it holds. Everything a reader needs to plan is in those last few bytes.

So the JavaScript side makes one speculative read of the last 64 KB. For most files the whole footer is in there. If it isn't, the footer's length is, and a second read fetches the part that's missing. On the 1.37 GB ClickBench file we tested with (14 million rows, 105 columns, 216 row groups, a 2.29 MB footer) that's the whole cost:

<figure class="doc-figure"><svg viewBox="0 0 680 118" width="100%" role="img" aria-labelledby="wasm-range-title wasm-range-desc" style="font-family: var(--font-body);"><title id="wasm-range-title">How much of a 1.37 GB Parquet file is read to get its schema</title><desc id="wasm-range-desc">A bar representing a 1.37 GB Parquet file. The part read to get the schema and row-group metadata is 2.35 MB at the very end of the file, 0.17 percent, fetched in two requests.</desc><style>.wrx-file{fill:var(--border-2)}.wrx-read{fill:#008d82}:root[data-theme="dark"] .wrx-read{fill:#2aa9a6}.wrx-label{fill:var(--text-deep);font-size:12.5px;font-family:var(--font-body)}.wrx-value{fill:var(--text-deep);font-size:12.5px;font-weight:600;font-family:var(--font-body)}.wrx-note{fill:var(--muted);font-size:11.5px;font-family:var(--font-body)}.wrx-lead{stroke:var(--muted);stroke-width:1;fill:none}</style><text x="20" y="22" class="wrx-label">One 1.37 GB Parquet file</text><text x="660" y="22" text-anchor="end" class="wrx-note">14,155,776 rows, 105 columns, 216 row groups</text><rect x="20" y="34" width="640" height="26" rx="4" class="wrx-file"/><rect x="658.9" y="34" width="1.1" height="26" class="wrx-read"><title>Read: 2.35 MB, 0.17% of the file</title></rect><path d="M659.4,62 v14 h-12" class="wrx-lead"/><text x="641" y="80" text-anchor="end" class="wrx-value">Read: 2.35 MB in two requests (0.17%)</text><text x="641" y="98" text-anchor="end" class="wrx-note">The teal sliver at the end is drawn to scale.</text><text x="20" y="80" class="wrx-note">Not read: 1.37 GB</text></svg><figcaption>Getting the schema and all row-group metadata of a 1.37 GB file.</figcaption></figure>

Reading values works the same way. The footer says where each column chunk lives, so `readRowGroup(0, ["Company", "Price"])` turns into two ranged reads, issued together, for exactly those bytes.

One useful consequence: file size stops mattering. WebAssembly here is 32-bit, so the module's memory tops out at 4 GB, but that limit is on what's in memory, not on the file. The offsets are ordinary JavaScript numbers and the module only ever sees the bytes it's handed. We read the footer of a 14.8 GB file the same way: two requests, 2.44 MB.

## How it was built

There were two ways to get Rugo into a browser.

One was [Pyodide](https://pyodide.org/): run the Python package as it is, on a Python interpreter compiled to WebAssembly. It sounds like the least work, because the Python layer comes along for free. In practice it doesn't. The Python layer opens paths with `open()`, which doesn't map onto a lazily-read `File` or a URL, so the I/O would need rewriting anyway. The native extensions would have to build under Pyodide's toolchain, including the parts that don't port. And every visitor would download a Python runtime of around 10 MB to run a C++ engine that doesn't need Python.

The other was to compile the C++ directly with [Emscripten](https://emscripten.org/) and write a thin JavaScript API over it. That's what we did, and it fits how Rugo is built: the Python package was always a wrapper around a native core.

The split is simple. **JavaScript owns the I/O. WebAssembly owns the decoding.** The module is built with no filesystem at all. It's handed footer bytes and column-chunk bytes, and it never knows whether they came from `Blob.slice()`, a `Range` request, or something you wrote yourself. Anything with a `size` and a `read(offset, length)` is a valid source.

Rugo's own sources compile unchanged: the footer parser, the page decoders, the encodings, the ORC and Avro readers, and the vendored Snappy, Zstandard, LZ4 and gzip decompressors. What's new is a small C++ file that exposes them through a C interface, and about 400 lines of JavaScript that fetch bytes and turn decoded columns into arrays.

Three things needed attention on the way:

- **A header that didn't exist.** Draken, the columnar library Rugo decodes into, included `<execinfo.h>` unconditionally for a stack trace in an opt-in debugging mode. Emscripten doesn't have it, and that one include blocked every build that touched a Draken header. It's now guarded, and native builds are unchanged.
- **Threads.** The module is single-threaded on purpose. Threads in WebAssembly need `SharedArrayBuffer`, which browsers only allow on pages served with cross-origin isolation headers. Requiring those would make the package awkward to drop into an existing site. Without threads, it loads anywhere a `.wasm` file does.
- **Errors.** Rugo throws when a file is malformed, so the build uses WebAssembly's native exception handling. A bad file rejects a promise with the reader's own message, such as `not a parquet file (no PAR1 trailer)`. It doesn't abort the module.

## The numbers

These are from the spike that decided the approach, on Apple Silicon with Node 26. The browser figures are against a local server that only answers `Range` requests, so they include HTTP but not a real network.

| File | Where | Requests | Bytes read | Time to schema |
|---|---|---|---|---|
| 1.37 GB, 105 columns | Node, local file | 2 | 2.35 MB | 28 to 31 ms |
| 1.37 GB, 105 columns | Node, HTTP | 2 | 2.35 MB | 49 to 51 ms |
| 1.37 GB, 105 columns | Browser, HTTP | 2 | 2.35 MB | 112 ms |
| 14.8 GB, 100 million rows | Browser, HTTP | 2 | 2.44 MB | 101 ms |
| 0.1 MB, 5,000 rows | Node, local file | 1 | 64 KB | 2.3 ms |

Starting the module takes 1 to 3 ms in Node and about 7 ms in the browser. Parsing the 1.37 GB file's footer peaked at 36.5 MB of WebAssembly memory, most of it the metadata for 22,680 column chunks.

We checked the output against native Rugo on the same file: all 22,680 column chunks match on name, physical type, logical type and null count, as do the row and row-group counts.

The footer-only build from the spike was 73 KB gzipped. The package we shipped also decodes values for three formats and carries four decompressors, and comes to about 360 KB gzipped. That's a deliberate trade: one download, and every reader is there.

## What it doesn't do

It's alpha, and some limits are worth knowing before you build on it.

- **ORC and Avro read the whole file.** Only Parquet is read by range. The ORC reader addresses the whole file, and an Avro file has no index to seek by, so both are loaded into memory in one read when you open them. Files of 4 GB or more are refused, and around 2 GB is the practical ceiling.
- **It's a reader.** Writing files, and reading CSV and JSONL, are in the Python package and not this one.
- **No predicates.** The Python reader takes filters and skips row groups that can't match. Here you filter in JavaScript. The footer's row-group metadata is all there if you want to skip row groups yourself.
- **Remote files need a cooperative server.** It has to answer `Range` requests. From a browser, reading across origins also needs CORS set up to allow the `Range` header and expose `Content-Range`. A bucket can be configured for that; a plain static host often can't.
- **Values are close to the file.** Timestamps and 64-bit integers come back as `bigint`, the integers the file stores, and nested ORC and Avro records come back as JSON text. That keeps precision, and it means converting to a `Date` is your one line to write.

## One source, one version

The package is built from the same tree as the Python wheel and released by the same tag, in a separate workflow so that neither release can block the other. The version numbers match: `@opteryx/rugo@0.5.13` and `rugo==0.5.13` are the same source. There's no JavaScript port to drift out of step with the C++, because there's no JavaScript port. There's the engine, and two thin ways to call it.

## Try it

- **Read the guide:** [Using Rugo from JavaScript](/docs/guides/rugo-javascript) covers sources, every reader, the value types and the errors.
- **See it working:** open a Parquet file at [rugo.dev/viewer](https://rugo.dev/viewer/).
- **Install it:** `npm install @opteryx/rugo@alpha`.

If you try it on a file it can't read, that's the most useful thing you can tell us. [Open an issue](https://github.com/mabel-dev/opteryx-core/issues) with the error message.

— Justin
