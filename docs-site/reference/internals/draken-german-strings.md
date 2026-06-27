# How Draken Stores Strings

Strings are the awkward case for a columnar engine. Numbers are fixed-width — every `INT64` is eight bytes, so a column is just a flat array and row `i` lives at a predictable offset. Strings are variable-length, so the obvious layouts all force a trade-off: either you chase a pointer for every value, or you pay to copy bytes you only wanted to glance at.

Draken sidesteps most of that cost with a layout commonly called the *German string* (popularised by the Umbra and DuckDB teams). The idea: make every string occupy a fixed-width slot, and pack enough information into that slot that the most common operations — equality, ordering, length — usually finish without ever touching the variable-length bytes at all.

This document explains that layout. For how strings (and every other column) are wrapped for execution, see [How Draken Stores Column Data](draken-vector-encoding.md).

---

## The fixed-width slot

Every string value is represented by a **16-byte slot**, regardless of how long the string actually is. A string column is therefore a flat array of these slots — `N` rows means `N × 16` bytes of slots — plus a separate byte **arena** holding the payloads that don't fit inline.

Sixteen bytes is the whole trick. Because every slot is the same size, row `i` is at a fixed offset just like an integer column, so the engine keeps random access, predictable striding, and SIMD-friendly layout for a type that is fundamentally variable-length.

The slot has two forms, chosen per value by its length.

### Short strings (≤ 12 bytes) live entirely in the slot

```
[ uint32 length ][ 12 inline bytes ]
```

A string of 12 bytes or fewer is stored **inline** — the bytes sit directly in the slot, no arena involved. Reading the value is just reading the slot. There is no pointer to follow, no second cache line to fetch, no allocation to track.

Trailing bytes beyond `length` are zero-filled. That matters: it makes two equal short strings produce byte-identical slots, which is what lets equality short-circuit on a raw 16-byte compare (below).

Short strings are extremely common — identifiers, country codes, status values, most categorical data — so this is the case the layout optimises hardest.

### Long strings (> 12 bytes) keep a summary in the slot

```
[ uint32 length ][ uint32 prefix ][ uint32 hash32 ][ uint32 arena_offset ]
```

When a string is too long to inline, the slot instead stores a **summary** of it, and the actual bytes live in the arena. The four fields are:

- **`length`** — the full byte length.
- **`prefix`** — the first 4 payload bytes, stored **big-endian**. Storing them big-endian means a plain unsigned-integer comparison of two prefixes gives the same answer as a lexicographic comparison of the first four bytes. This is what makes ordering fast (below).
- **`hash32`** — a 32-bit content hash (the low 32 bits of XXH3). Equal strings always have equal hashes, so an unequal hash is an instant "not equal" verdict without reading any bytes.
- **`arena_offset`** — a `uint32` byte offset into the column's arena where the full payload lives. This caps a single string column's arena at 4 GB; overflow is a hard error, never a silent wrap.

So even for a long string, the slot alone carries its length, its first four bytes, and a fingerprint of its full content — enough to answer most comparisons without dereferencing into the arena.

---

## Why this is fast

The payoff is that the hot operations on strings — the ones that show up in `WHERE`, `GROUP BY`, `ORDER BY`, and joins — mostly run against the fixed-width slots and skip the arena entirely.

### Equality short-circuits on the slot

The first 8 bytes of every slot are the 4-byte `length` plus the first 4 payload bytes. Draken calls this 8-byte word the **`lp_word`**. Two strings can only be equal if their `lp_word`s match, and that's a single 64-bit compare. Different length or different first four bytes → not equal, done.

If the `lp_word`s do match:

- **Short strings:** the remaining 8 bytes of the slot are also compared. Because short slots are fully inline and zero-padded, a 16-byte slot match *is* string equality — no arena access ever happens for short strings.
- **Long strings:** the 32-bit `hash32` is checked next. Different hash → not equal. Only when length, prefix, *and* hash all agree does Draken fall through to a full byte comparison in the arena — and by then a true match is overwhelmingly likely.

The arena is touched only in the rare case where two genuinely-long strings collide on length, first-four-bytes, and a 32-bit hash. For the vast majority of comparisons, equality is decided from the slot alone.

### Ordering compares prefixes first

To sort or range-compare strings, Draken compares the big-endian 4-byte prefix first. Any difference in the first four bytes decides the order with a single register comparison — no pointer chase, no `memcmp`. The prefix is zero-padded so a shorter string that is a prefix of a longer one orders correctly (the padding `0x00` sorts below any real byte at the point they diverge).

Only when two prefixes are identical does ordering fall through to a full byte comparison. For high-cardinality string columns — exactly the columns expensive to sort — the first four bytes usually differ, so the common case is settled in registers.

### Length is free

Every slot carries its length in the first four bytes, in both forms. `LENGTH()`-style work, and any kernel that needs to size output buffers, reads it directly — no scan, no offset arithmetic against a neighbouring entry.

---

## Re-homing without rehashing

Operations like aggregation accumulate group keys by copying string slots from one place to another — for example, from an input morsel's arena into a hash table's own arena. When a long slot is copied, its payload bytes are written into the destination arena and only the `arena_offset` field is rewritten to point at the new location. The `length`, `prefix`, and `hash32` fields are copied verbatim.

That means **no rehash and no re-derivation of the prefix** when a string moves between arenas — the expensive part (hashing the full content) was done once at construction and travels with the slot. Re-homing a string key is essentially a 16-byte copy plus an arena append.

---

## String type families

The same 16-byte slot layout backs all of Draken's string-like types — they differ in *semantics*, not storage:

- **`VARCHAR`** — the default; ASCII semantics, byte-length operations.
- **`NVARCHAR`** — opt-in UTF-8; character operations count codepoints rather than bytes.
- **`VARBINARY`** — opaque bytes; length and equality work, but character operations are rejected rather than guessing an encoding.
- **`VARIANT`** — a polymorphic JSON value whose text is held in the same German-string storage.

All four store their bytes the same way; the type tag decides how higher-level kernels interpret those bytes. There is one storage format to optimise, and the byte-vs-codepoint distinction lives in the operators, not the layout.

---

## Summary

| Property | Short (≤ 12 B) | Long (> 12 B) |
|---|---|---|
| Slot size | 16 bytes | 16 bytes |
| Payload location | inline in the slot | arena, via `arena_offset` |
| Equality | 16-byte slot compare | `lp_word` → `hash32` → arena compare |
| Ordering | prefix compare → inline bytes | prefix compare → arena compare |
| Arena access | never | only on prefix+hash collision |

The recurring theme is the same one that runs through Draken generally: **arrange the layout so the common operation finishes against fixed-width, cache-resident data, and only pay the variable-length cost when you genuinely have to read the bytes.**
