# RISC-V Support

Opteryx runs on 64-bit RISC-V (`rv64gcv`). The engine — Cython, C++, the Rust
compute crate, and the RISC-V Vector (RVV) SIMD paths — builds and executes
natively, and the full regression suite, TPC-H, and ClickBench all pass.

RISC-V is an *aspirational* target alongside the primary platforms (x86-64 for
production, ARM/AArch64 for development). It is not yet part of the published
wheel matrix, so RISC-V users build from source. This page covers what works,
how to build it, what is and isn't SIMD-accelerated, and how to read the
performance numbers.

> **Validated against:** Opteryx `0.8.12` (build 2332), 27 June 2026. RISC-V is
> not yet in continuous integration, so the results and timings below are a
> point-in-time snapshot from a manual bring-up rather than a per-release
> guarantee.

---

## Status at a glance

| Workload | Result |
|----------|--------|
| Regression suite (`make q`) | 190 / 190 pass |
| TPC-H SF1 (`make tpch`) | 22 / 22 pass |
| TPC-H SF0.1 / SF0.01 | 22 / 22 · 21 / 22[^q16] |
| ClickBench (one `hits` partition) | 43 / 43 pass |

[^q16]: The single SF0.01 miss is a scale-edge case in Q16 (an empty
intermediate at tiny scale) that also reproduces off RISC-V — it is not an
architecture issue. It passes at SF0.1 and SF1.

Correctness is identical to other platforms: results are validated against the
same DuckDB baselines used on x86 and ARM.

---

## Tested platform

The reference bring-up was on a low-power single-board computer:

- **Board:** Orange Pi RV2 (SpacemiT 8-core `rv64gcv`, RVV 1.0, `VLEN=256`)
- **OS:** Debian 13 (trixie), 3.7 GB RAM
- **Toolchain:** GCC 14.2, Rust 1.95, CPython **3.14** free-threaded (`3.14.5t`)

Nothing in the port is specific to this board; any `rv64gcv` Linux target with a
recent GCC and the RVV 1.0 intrinsics should behave the same. Hardware without
the vector extension (`rv64gc`) is expected to work via the scalar fallbacks but
is untested.

---

## Building on RISC-V

The build is the standard source build (`make compile`) with a few host
prerequisites:

1. **CPython 3.14 (free-threaded).** Opteryx targets the free-threaded build.
   Install via pyenv (`pyenv install 3.14.5t`); allow time, as it compiles from
   source on RISC-V.
2. **Rust** (via rustup) — the `compute` crate is built by `setuptools-rust`.
3. **System libcurl + pkg-config** — the HTTP client links against system
   libcurl (`apt install libcurl4-openssl-dev pkg-config`).
4. **Build dependencies** — the usual CPython/C++ build toolchain
   (`build-essential`, `libssl-dev`, etc.).

```bash
make compile        # or: python setup.py build_ext --inplace -j4
make q              # regression suite
```

Two practical notes for small boards:

- **Memory.** Heavy C++ translation units (nanobind, the vendored vector
  libraries) can use over 1 GB each. On a 4 GB board, build with `-j4` (not the
  full core count) and add swap, or the compiler/SSH session can be OOM-killed.
- **Build time.** A clean from-source build — including CPython and the Rust
  crate — is on the order of an hour on a board like the RV2. This is a one-time
  cost; incremental rebuilds are minutes.

---

## SIMD (RVV) coverage

Opteryx selects the best implementation of each kernel at runtime. On RISC-V the
vector (RVV) variant is chosen when the CPU reports vector support; otherwise a
scalar fallback runs. The RVV kernels are written against the **ratified RVV 1.0
intrinsics** and are correctness-checked against their scalar equivalents on real
hardware.

**Vectorised with RVV:**

- **Hash mixing** — the core value-hashing kernel used by joins, `DISTINCT`,
  `COUNT(DISTINCT)`, and grouped aggregation.
- **Hash-table probe** — the open-addressed (Swiss-table) control-byte group
  scan that finds candidate slots during join probes.
- **Stream compaction** — packing filtered values during decode (via RVV's
  native `vcompress`; NEON and AVX2 variants exist too).
- **Aggregates, string case-conversion, base64/base16, and the cost-model
  distogram** also have RVV paths.

**Still scalar on RISC-V (opportunities, not blockers):**

- **Decompression** — the vendored zstd and snappy codecs have no RISC-V SIMD
  (their hand-written assembly is x86-only).
- **Parquet bit-unpacking and dictionary gather** — currently scalar on RISC-V.

These scalar areas are genuine future work, but — as the performance section
explains — they are not where most of the time goes.

---

## Performance

Performance on RISC-V is dominated by the **hardware class**, not by missing
optimisation. The reference board is a low-power, low-clock SBC; against a
high-end desktop or an Apple-silicon laptop it is naturally many times slower.
That gap is expected and is not a sign of a missing fast path.

Indicative timings on the RV2 (warm, for orientation only — not a benchmark
claim):

| Workload | Wall time |
|----------|-----------|
| `make q` (190 queries) | ~20 s |
| TPC-H SF0.1 (22 queries × 3) | ~90 s |
| TPC-H SF1 (22 queries × 3) | ~11 min |
| ClickBench, one partition (43 queries) | ~2 min |

### Where the time goes

Profiling TPC-H (per-operator self-time) shows the cost is concentrated in three
places, and only one of them is a SIMD question:

- **Joins (~50%).** Hashing and the hash-table probe are *already* vectorised
  with RVV. The remaining cost is random-access memory traffic — fetching and
  comparing keys and payloads from the hash table — which is latency-bound and
  cannot be vectorised away. On a board with a modest memory subsystem this
  pointer-chasing dominates.
- **Parquet decode (~28%).** Decompression, bit-unpacking, and dictionary
  expansion. This is the main area where more RISC-V SIMD could help, but the
  realisable win is bounded (see below).
- **Query planning (~31% of traced time).** Planning is Python, by design —
  Opteryx plans in Python and executes natively. On RISC-V the Python
  interpreter is comparatively slow, so planning is a larger share of wall time
  than on faster hosts. This is interpreter speed, not a vectorisation gap.

The practical takeaway: the two largest costs (join memory latency and Python
planning) are not SIMD-addressable, so vectorising more of the decode path
yields a bounded improvement rather than closing the gap to faster hardware.

---

## Portability notes for contributors

Two classes of issue are worth knowing when touching native code that may run on
RISC-V:

- **Unaligned access.** RISC-V traps unaligned multi-byte loads/stores that x86
  and ARM tolerate. Reading or writing a multi-byte value through a raw
  reinterpreted pointer into an arbitrarily-aligned buffer (for example an I/O
  serialisation buffer) will fault. Use `memcpy` for unaligned access — it
  compiles to the same instruction on x86/ARM and is safe everywhere.
- **Transitive standard-library includes.** GCC's libstdc++ does not pull in as
  many headers transitively as Clang's libc++. Include what you use
  (`<algorithm>`, `<vector>`, `<exception>`, …) rather than relying on a header
  arriving via another include — code can build on macOS and fail on a Linux
  RISC-V toolchain otherwise.

Both follow the project rule that platform fixes must stay correct on every
target: a RISC-V fix should never regress the x86 or ARM build.
