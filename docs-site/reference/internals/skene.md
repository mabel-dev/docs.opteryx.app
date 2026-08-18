# Skene — the file format

Skene is Opteryx's own columnar file format. One `.skene` file holds **one row group of [Draken](draken) vectors, stored losslessly** — including the things Parquet cannot express. It is C++17 with no dependencies, it imports Draken's headers directly, and there is no Python anywhere on its read path.

Parquet remains the default. It is the interchange format, and it is what stored datasets are written as; [Rugo](rugo) reads and writes it. Skene is for the narrower set of cases where a Draken-native round trip is what matters: query results, sort spill, and datasets we want optimised rather than interoperable. Nothing outside the engine reads `.skene`, and no foreign reader is promised.

---

## What a Parquet round trip loses

An IPv4 column in Draken is a `UINT32` *refined* by an `IPV4` logical-type descriptor. Parquet stores the 32 bits and loses the refinement, so a consumer has to recover the real type from a sidecar — or not at all. The same is true of the layout facts Draken already knows: whether a column is dictionary-encoded, whether its rows are sorted, whether its dictionary keys are sorted.

Skene carries all of it. The `DrakenType`, the logical-type descriptor, the vector flags, and the dictionary **selection** all round-trip exactly — the dictionary is *restored*, not re-derived by scanning the values again. A morsel written and read back is the morsel that was written.

---

## One file, one row group

The file is framed by a fixed head at byte 0 and a fixed tail at EOF, with a footer holding a column directory and a section directory. That footer is the index: after one footer read, any single column can be fetched with one range request, and metadata can be read without touching column data at all.

Scale is by file count, not by row groups inside a file — the same way job results are already written as `part_NNNN`. Access is column-granular, never row-granular; there is no random row lookup.

---

## Value ordering

A column may optionally be stored **value-ordered**: its distinct values sorted and deduplicated, with the selection carrying the row order. Three things follow at once — the first and last values *are* the minimum and maximum, the stored value count *is* the exact distinct count rather than an estimate, and a predicate resolves to a contiguous range of codes by binary search.

The property is flagged per column and only set when it genuinely holds. Deduplication keys on the bit pattern rather than engine equality, because under Draken's float order `-0.0` and `0.0` compare equal — deduplicating on equality would collapse them and a column containing `-0.0` would read back as `0.0`. Types with no defined total order — `VARIANT`, `ARRAY`, FP16 — are always written as-written.

---

## Skipping work before reading

Alongside the required column data, a file may carry per-column statistics (min/max ordinals in the same dialect the catalog uses, null count, and an exact 128-bit sum), zone maps, and bloom filters. Together they let a reader rule a file — or a region of a column — out before decoding anything.

The discipline throughout is that **a file never claims more than was computed**. A column ineligible for ordering is written as-written; a statistic that cannot be defined is absent rather than zero. Absent means "don't know", and a reader treats it that way.

---

## Encodings and compression

Three encodings are implemented: bit packing for selection codes, delta-plus-bitpack for ascending integer data, and per-section zstd.

Per-section compression matters more than expected. Raw, skene is 1.9–3.8× *larger* than the equivalent ZSTD Parquet; with per-section zstd it lands at 0.92–1.09× per table, and 0.99× across the whole TPC-H SF1 schema — parity on size, measured against Parquet compressed with the same class of codec. Reads over that schema are 1.83× faster than Parquet, and that number is conservative: skene's reader is single-threaded, while Rugo's Parquet reader is a threaded pipeline.

The ratio tracks table size. On a 25-row table, skene is 1.80× larger, because fixed per-column footer, statistics and zone-map overhead has nothing to amortise against; by 10,000 rows it is 1.04×, and on the large tables it turns favourable.

---

## The spill profile

Sort spill uses the same format with everything optional switched off: no value ordering, no statistics, no optional sections. Spill data is written once, read once, in process, and is wall-clock bound — no read acceleration is worth paying for. This is a *profile*, not a variant: a spill file is an ordinary `.skene` file and any reader reads it.

---

## Verification and versioning

Every byte is covered by an XXH3-64 checksum — per section and over the footer — and a conforming reader validates the framing, the version, and the checksums *before* interpreting any content. A file that is truncated, byte-swapped, or written by an unsupported version fails loud rather than producing plausible wrong data.

A build reads two versions — the one it writes and its predecessor — and writes exactly one. Older files are migrated forward one hop at a time. The first six bytes of the header are frozen for all time, so any build can *identify* any file even when it cannot read it.

---

## Status

Format v1 is a **draft and is not frozen**: the byte layouts are implemented and tested, but fields may still change without a version bump until v1 is released. Writer and reader cover the full required layout — every type family, all three selection kinds, logical-type round trip, checksums, column selection and metadata-only reads — plus value ordering, statistics, the three encodings, zone maps, and bloom filters. Permutations and migration are not implemented; nothing produces a stored sort order yet, and migration needs a v2 to migrate from.

---

## In short

Skene is the format for the cases where Opteryx is talking to itself: one row group of Draken vectors, written and read back exactly — types, flags, dictionaries and all — indexed for column-granular reads, and honest about what it doesn't know. Parquet still owns interchange; skene owns the round trip.
