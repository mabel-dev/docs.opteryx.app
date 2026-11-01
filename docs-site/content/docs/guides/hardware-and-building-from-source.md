---
title: Hardware and Building from Source - CPU Requirements, Raspberry Pi 5 and RISC-V
description: Which CPUs Opteryx Core runs on, and what it takes to build it from source on a Raspberry Pi 5 or a RISC-V board.
---

# Hardware and Building from Source

Opteryx Core is compiled against a fixed instruction-set floor for each architecture. A CPU below the floor fails with an illegal-instruction error rather than running slowly, so check the floor before you install on unusual hardware.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- check whether a machine can run Opteryx Core
- build Opteryx Core from source on a Raspberry Pi 5
- know what works, and what doesn't yet, on RISC-V

## CPU Requirements

| Architecture | Floor | What it needs |
|---|---|---|
| x86-64 | Haswell (2013) or later | AVX2, BMI1/2, FMA, PCLMUL |
| ARM (AArch64) | `armv8-a+crc+aes` | ARMv8-A with the CRC32 and AES/PMULL extensions |
| RISC-V (riscv64) | `rv64gcv` | RV64GC with the vector extension (RVV) |

Plain ARMv8-A is not enough: the AES/PMULL extension is required, and every AArch64 core that has it also has CRC32.

| ARM hardware | Supported |
|---|---|
| Apple Silicon (M1 and later) | Yes |
| AWS Graviton 2 / 3 / 4 | Yes |
| Google Axion, GCP Tau T2A (Ampere Altra) | Yes |
| Ampere Altra / AmpereOne (Azure, Oracle A1, Hetzner) | Yes |
| Microsoft Cobalt 100 | Yes |
| NVIDIA Grace | Yes |
| Raspberry Pi 5 (Cortex-A76) | Yes |
| Raspberry Pi 4 / 400 / CM4 (Cortex-A72, no crypto extension) | **No** |
| Raspberry Pi 3 / Zero 2 W (Cortex-A53, no crypto extension) | **No** |
| 32-bit ARM (ARMv7) | **No** |

On Linux, check an ARM machine with:

```bash
grep -m1 Features /proc/cpuinfo
```

The list must include both `aes` and `crc32`. On a RISC-V machine, the `isa` line in `/proc/cpuinfo` must include `v`.

See [Compatibility](/docs/roadmap-guarantees/compatibility) for which Python versions and platforms have wheels.

## Building from Source

Where a wheel exists, use it — building from source is for platforms without one, or for working on the engine itself. Every build goes through `make`:

```bash
git clone https://github.com/mabel-dev/opteryx-core.git
cd opteryx-core
make compile
```

Every platform needs Python 3.14, a Rust toolchain ([rustup](https://rustup.rs)), a C/C++ compiler, `pkg-config`, OpenSSL 1.1 or later development headers and `libnghttp2` development headers. The native tests that `make q` runs call `clang++` directly, so install `clang` as well if you plan to run them.

### Raspberry Pi 5

Any Raspberry Pi 5 runs the published wheels. Building from source needs more:

- **8 GB of RAM or more.** The largest source file needs 5.3 GB of memory to compile on its own, so 2 GB and 4 GB boards cannot build.
- **Two build jobs, not four.** `make compile` defaults to one job per core; on an 8 GB board, four jobs run out of memory and the board stops responding. Use `make compile JOBS=2`.
- **GCC 14: Debian 13 (trixie) or Raspberry Pi OS trixie.** GCC 12, shipped with bookworm, refuses to compile the carry-less multiply (`vmull_p64`) under the `+aes` target — its `arm_neon.h` only enables it under `+crypto`.
- **NVMe storage recommended.** The source tree alone is about 4 GB.

On Debian 13:

```bash
sudo apt install build-essential pkg-config libssl-dev libnghttp2-dev clang
```

A full `make compile JOBS=2` takes about an hour on a Raspberry Pi 5 with 8 GB and NVMe storage.

### RISC-V

Opteryx Core builds and runs on riscv64 boards with the vector extension, and has been brought up on an Orange Pi RV2 with GCC 14 on Debian 13. RISC-V support is not finished, and these limits apply today:

- **Errors can abort the process.** With GCC 14.2, a C++ exception that passes through auto-vectorised code calls `std::terminate` instead of reaching Python. Queries that succeed are unaffected, but some error paths — for example, an invalid value in a JSON Lines file read with a declared schema — end the process instead of raising an error.
- **No vector extension, no build.** The build targets `rv64gcv`; there is no build for RV64GC cores without RVV.
- **Parts of the test suite cannot run.** Some tests use PyArrow and other libraries that publish no riscv64 wheels.

Treat a RISC-V build as working for queries that succeed, not as a supported platform.

## Next Steps

- [Installing Opteryx Core](/docs/getting-started/installation) for the wheel install
- [Querying local data](/docs/guides/querying-local-data) once it's installed
