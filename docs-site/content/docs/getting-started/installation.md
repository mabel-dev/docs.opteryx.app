# Installation

This guide covers installing Opteryx Core, the Python library, to embed the engine directly in your own process. If you'd rather use the hosted service instead, see [Logging In](registration) — there's nothing to install for that.

## Prerequisites

Before installing Opteryx, ensure you have:

- Python 3.11 or higher — 3.14 is the version the test suite runs against
- pip (Python package installer)

See [Compatibility](/docs/roadmap-guarantees/compatibility) for which Python versions and
platforms have wheels built for them, and which are covered by the test matrix.

## Installation Methods

### Install via pip

The easiest way to install Opteryx Core is using pip:

```bash
pip install opteryx-core
```

### Install from Source

To install the latest development version from source:

```bash
git clone https://github.com/mabel-dev/opteryx.git
cd opteryx
pip install -e .
```

## Verify Installation

After installation, verify that Opteryx is installed correctly:

```python
import opteryx
print(opteryx.__version__)
```

## Next Steps

Once you have Opteryx Core installed, proceed to [Querying Local Data](/docs/guides/querying-local-data) to learn how to use it.
