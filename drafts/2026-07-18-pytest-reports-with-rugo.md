---
title: Posting pytest Results to Pull Requests with Rugo
description: pytest's --report-log flag writes real JSON Lines, mixing several event shapes in one file. We use Rugo to project and filter it into a pass/fail summary posted straight to the PR.
date: 2026-07-18
author: Justin Joyce
role: Opteryx Engineering
tags:
  - rugo
  - github-actions
  - testing
  - jsonl
---

# Posting pytest Results to Pull Requests with Rugo

## TL;DR

Our CI runs thousands of tests per pull request, and the summary you get by default is a pass/fail count buried at the bottom of a log you have to click into. We built a GitHub Actions step that reads pytest's own JSON Lines report with [Rugo](https://rugo.dev), and posts a summary comment straight onto the PR: counts, failures, and the slowest tests, updated in place on every push.

```
pull_request
    │
    ▼
pytest --report-log=results.jsonl
    │
    ▼
report.py (Rugo projects + filters)
    │
    ▼
report.md
    │
    ▼
create-or-update PR comment
```

No container image, no separate scanner — the tool producing the report is the test runner we already use.

## pytest already writes JSON Lines

`--report-log` isn't a plugin, it's a built-in pytest flag:

```bash
pytest --report-log=results.jsonl
```

Every line is a JSON object, but they aren't all the same shape. A run mixes several event types together:

~~~jsonl
{"$report_type": "CollectReport", "nodeid": "tests/test_parquet.py", "outcome": "passed", ...}
{"$report_type": "TestReport", "nodeid": "tests/test_parquet.py::test_roundtrip", "when": "setup", "outcome": "passed", "duration": 0.0004, ...}
{"$report_type": "TestReport", "nodeid": "tests/test_parquet.py::test_roundtrip", "when": "call", "outcome": "passed", "duration": 0.118, ...}
{"$report_type": "TestReport", "nodeid": "tests/test_parquet.py::test_roundtrip", "when": "teardown", "outcome": "passed", "duration": 0.0002, ...}
{"$report_type": "TestReport", "nodeid": "tests/test_predicates.py::test_bad_dtype", "when": "call", "outcome": "failed", "duration": 0.031, "longrepr": "AssertionError: ..."}
{"$report_type": "SessionFinish", "exitstatus": 1}
~~~

Three `TestReport` rows per test (`setup`, `call`, `teardown`), plus collection and session events interleaved. What we actually want — one row per test, its outcome and duration — is a filter away, not a parse-everything-then-groupby away.

## Reading it with Rugo

```python
from rugo import jsonl

nodeids, outcomes, durations, longreprs = [], [], [], []

with jsonl.read_jsonl(
    "results.jsonl",
    columns=["nodeid", "outcome", "duration", "longrepr"],
    predicates=[
        ("$report_type", "==", "TestReport"),
        ("when", "==", "call"),
    ],
) as reader:
    for morsel in reader:
        nodeids.extend(morsel.column("nodeid").to_pylist())
        outcomes.extend(morsel.column("outcome").to_pylist())
        durations.extend(morsel.column("duration").to_pylist())
        longreprs.extend(morsel.column("longrepr").to_pylist())
```

Two things happen before anything is parsed into a Python object:

1. **Predicate pushdown** drops `setup`/`teardown` rows and every `CollectReport`/`SessionStart`/`SessionFinish` line — roughly two thirds of the file — before those rows are ever turned into values.
2. **Projection** skips every field except the four we asked for. `longrepr` is a full traceback string on failures and can be large; we still only pay for it on the rows that survive the filter.

`longrepr` is absent on passing rows and present on failing ones — Rugo returns `null` for the missing key rather than erroring, so the sparse shape of the file doesn't need to be normalised first.

## Building the report

```python
from collections import Counter

counts = Counter(outcomes)
failures = [
    (n, r) for n, o, r in zip(nodeids, outcomes, longreprs) if o == "failed"
]
slowest = sorted(zip(nodeids, durations), key=lambda x: -x[1])[:10]

lines = [
    "<!-- pytest-report -->",
    f"**{counts['passed']} passed**, **{counts['failed']} failed**, "
    f"**{counts.get('skipped', 0)} skipped**",
]

if failures:
    lines.append("\n<details><summary>Failures</summary>\n")
    for nodeid, longrepr in failures:
        lines.append(f"**{nodeid}**\n```\n{longrepr}\n```")
    lines.append("</details>")

lines.append("\n<details><summary>Slowest tests</summary>\n")
lines.append("| test | duration |\n|---|---|")
for nodeid, duration in slowest:
    lines.append(f"| {nodeid} | {duration:.3f}s |")
lines.append("</details>")

open("report.md", "w").write("\n".join(lines))
```

The `<!-- pytest-report -->` marker on the first line is what makes the comment idempotent — the workflow step below searches for it and edits the existing comment instead of adding a new one on every push.

## The workflow

```yaml
name: pytest report

on: pull_request

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - run: pip install -e .[test] rugo

      - name: Run tests
        run: pytest --report-log=results.jsonl
        continue-on-error: true

      - name: Build report
        run: python .github/scripts/report.py

      - name: Find existing comment
        uses: peter-evans/find-comment@v3
        id: fc
        with:
          issue-number: ${{ github.event.pull_request.number }}
          comment-author: "github-actions[bot]"
          body-includes: "<!-- pytest-report -->"

      - name: Post or update comment
        uses: peter-evans/create-or-update-comment@v4
        with:
          comment-id: ${{ steps.fc.outputs.comment-id }}
          issue-number: ${{ github.event.pull_request.number }}
          body-path: report.md
          edit-mode: replace
```

`continue-on-error: true` on the test step matters — a failing suite should still get a report comment, not just a red X with no detail on what broke.

## Why this over reading the file straight

The obvious alternative is `json.loads` per line in a loop, or handing the whole file to pandas. Both work at small scale. Where it starts to matter is the size of the report log itself: a suite with a few thousand tests produces three `TestReport` events per test plus collection and session noise, so the file is several times larger than the "one row per test" table you actually want, and every `longrepr` field on a passing test is a wasted parse if you're only summarising failures.

The same shape of gain we measured for log analytics applies here — Rugo gets faster the more selective the query, and this query is selective on two axes at once: two thirds of the rows are filtered out by `when == "call"`, and most of the remaining rows never need their `longrepr` parsed at all.

We'll follow up with numbers from our own CI once this has run against the real suite for a few weeks — the shape of the win is the same as the log-analytics post, but we'd rather report measured numbers than estimated ones.

## The point

Trivy and friends need something to scan — a container image, a filesystem, a lockfile. Not every repo has one of those, but almost every repo already runs a test suite that reports its own results as data. `--report-log` turns pytest into a source of structured events for free; Rugo turns the CI step that reads it back into something that costs less the more selective your report is.

— Justin
