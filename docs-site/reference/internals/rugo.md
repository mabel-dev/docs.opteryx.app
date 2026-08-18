# Rugo — the file engine

[Rugo](https://rugo.dev) is the part of Opteryx that turns files on disk (or in object storage) into columns the engine can compute over. It reads and writes **Parquet, CSV, and JSONL**, and it does so without PyArrow, without NumPy, and without any heavy runtime dependency — the compression codecs it needs are vendored into the source tree, so a built Rugo has nothing else to install.

Rugo is also published on its own. The same source that ships inside Opteryx is packaged as a standalone `rugo` wheel — a fast, dependency-free file engine for people who want Parquet/CSV/JSONL I/O without the SQL engine on top. Both packagings bundle [Draken](draken), the columnar vector library Rugo emits into.

---

## Where Rugo sits

Rugo is the bottom of the execution stack. When a physical plan includes a scan, it is Rugo that opens the file, reads only the parts the query needs, and hands back **Draken vectors** batched into morsels. From that point on the rest of the engine never sees a file format — it sees columns.

The crucial property is that Rugo is native end to end. The decode path is C++; the Python layer is a thin edge that orchestrates and hands ownership across. A scan reads, decodes, and serialises without holding the GIL, which is what lets many scans and many row groups proceed in parallel.

---

## Reading less, and reading it later

A naive reader decodes the whole file and lets the engine throw most of it away. Rugo is built around the opposite instinct: decide what *not* to read, as early as possible, and materialise survivors last.

**Projection.** Only the columns the query references are decoded. The others are never touched on disk.

**Row-group pruning from statistics.** Parquet stores per-row-group min/max statistics in its footer. Before decoding a row group, Rugo checks whether the query's predicates *could* match anything in it — if a row group's range proves it holds no matching row, the group is skipped without decoding a single value. This is the filter-first principle pushed all the way down to the bytes.

**Bloom-filter pruning.** For equality and `IN` predicates, range statistics are weak — a value can fall inside a min/max range and still be absent. Where a Parquet file carries bloom filters, Rugo probes them to rule out row groups that *definitely* don't contain the wanted value, catching cases min/max can't. Pruning is fail-open: if a filter is missing or unreadable, the row group is read rather than wrongly skipped.

**Dictionary-aware skipping.** A dictionary-encoded column carries a small table of its distinct values. Rugo can evaluate an equality or membership predicate against that *dictionary* — a few hundred comparisons — before decoding the per-row codes. If no dictionary entry satisfies the predicate, the column's data pages are skipped entirely.

**Materialisation last.** Across all three formats, projection and predicate evaluation happen *before* typed columns are built, so only the rows and columns that survive are ever parsed into vectors. The expensive step — turning bytes into typed values — runs on the smallest possible amount of data.

---

## From file bytes to Draken shapes

Rugo doesn't just decode to a flat array and move on; it preserves the structure already present in the file, because that structure is exactly what makes downstream work cheap.

A Parquet column that is dictionary-encoded on disk maps directly onto Draken's dictionary shape — the dictionary stays a dictionary, with no expansion to a flat array at read time. A column whose values are all identical can arrive as a constant. Everything else decodes dense. (These are the three encoding shapes described in [Draken vector encoding](draken-vector-encoding).)

Run-length encoding is resolved at this boundary and never propagates further. For a non-nullable dictionary column, Rugo resolves one dictionary lookup per *run* rather than per row, and merges runs that span page boundaries — so a long stretch of a repeated value costs work proportional to the number of runs, not the number of rows. By the time data leaves Rugo it is always one of Draken's three shapes; the operators above never deal with RLE.

---

## Reading from anywhere

Rugo's Parquet reader fetches bytes through a lock-free IO pipeline: a pool of worker threads reads, decodes, and serialises, with results handed back over a lock-free queue. The same pipeline serves three sources behind one interface — local files via `pread`, HTTP/HTTPS via range requests, and Google Cloud Storage `gs://` paths (rewritten to HTTPS range reads). Because the workers run without the GIL, IO latency on one row group overlaps with decode work on another.

The CSV and JSONL readers are built for throughput too: each uses a SIMD structural scan (NEON on ARM, AVX2 on x86, with a scalar fallback) to find record and field boundaries quickly, then applies projection and predicate pushdown before building typed columns.

---

## Writing, too

Rugo is a full round-trip engine, not just a reader. It writes all three formats natively from Draken morsels — Parquet (with optional bloom filters and the usual compression codecs), RFC 4180 CSV, and one-JSON-object-per-row JSONL — without Arrow anywhere in the path. The same vendored codecs that decompress on the way in compress on the way out.

Those three are the *interchange* formats, and what a Parquet round trip cannot preserve is Draken's own refinements — logical types, vector flags, the dictionary as written. Where the engine is writing vectors for itself rather than for anyone else, it uses [Skene](skene) instead. The two are deliberately parallel and disjoint: neither imports the other, and both sit directly on Draken.

---

## In short

Rugo is the engine's contact with storage: a native, dependency-free reader and writer that prunes aggressively, preserves on-disk structure as Draken shapes, and materialises only what survives — so that everything above it computes over the smallest, most compactly-encoded data the query allows.
