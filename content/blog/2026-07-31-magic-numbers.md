---
title: Replacing a Magic Number
description: We set out to replace a single hardcoded LIKE selectivity constant with a real estimator. Wiring it in surfaced a statistics pipeline that was mostly unimplemented, a Python hot path at terabyte scale, and a production bug that had been silently dropping matching rows.
date: 2026-07-31
author: Justin Joyce
role: Opteryx Engineering
tags:
  - cost-estimation
  - statistics
  - query-optimizer
  - correctness
  - testing
---

# Replacing a Magic Number

## TL;DR

* We replaced the flat `0.1` selectivity constant used for `LIKE '%needle%'` with a per-column byte-class estimator with geometric decay. Mean absolute error against real data dropped from **14.5%** to **4.45%**.
* Wiring it into `ANALYZE TABLE` surfaced the actual state of the statistics pipeline: most per-file statistics were hardcoded empty on one write path, and computed in pure Python — over materialized lists, at terabyte scale — on the other. So the scope tripled: make statistics collection complete and native first, in both write paths, before the estimator could ship at all.
* Testing against real data — not code review — caught five bugs that would otherwise have shipped silently, including one already live in production: `WHERE price = 0.5` was silently skipping files that contained matching rows, because float bounds were being compared as raw bit patterns instead of values.

Somewhere in every query engine there is a number someone made up.

Ours was `0.1`. When the optimizer saw `WHERE description LIKE '%buffer%'`, it
had no idea how many rows would match, so it guessed ten percent. That guess
feeds join ordering, memory reservations, and whether a filter runs early or
late. A bad guess doesn't return wrong answers — it returns right answers
slowly, which is harder to notice and harder to blame on anything.

We set out to replace the magic number. We did. But the more interesting part
of this story is what we found on the way there, and how we found it.

## Part 1: The experiment

The first decision was to not touch the engine at all.

We built the whole thing as a standalone experiment first — separate
directory, no imports from production, free to be wrong. That constraint
turned out to matter more than any individual result, because it meant we
could cheerfully test ideas that didn't work without any sunk cost in
having wired them in.

### The model

The idea: instead of one number for every column, store a small per-column
summary of what its text actually looks like, and use that to estimate how
likely a given needle is to appear.

We classify every byte into one of 8 classes — uppercase, lowercase, digit,
whitespace, text punctuation, semantic markers, extended, control — and store
the proportion of each. That's 8 numbers per column. Then, for a needle,
estimate the per-position probability of a match and fold it over the
available positions:

```
n_positions = max(avg_length - len(needle) + 1, 0)
selectivity = 1 - exp(-n_positions * p_pos)
```

This is the standard "independent positions, i.i.d. characters" containment
approximation. It is, to be clear, wrong. English isn't i.i.d. and overlapping
positions aren't independent. The question wasn't whether the model was true;
it was whether it beat a constant.

### What we tested against

371,000 real rows from the NVD vulnerability database — CVE identifiers,
descriptions, CVSS vectors. Real text with genuinely different shapes: prose,
templated IDs, structured vectors. Plus a real ClickBench query
(`LIKE '%google%'`) as an independent check on a completely different data
distribution.

We validated "true" selectivity independently of the engine's own LIKE
implementation, so a bug in our matcher couldn't quietly grade its own
homework. Five out of five cross-checks matched exactly.

### What didn't work

Most of it. Worth recording, because the failures were more informative than
the win:

**Entropy.** Collapse the whole character distribution to one number
(`2**-entropy_bits` as the per-character probability). Elegant, and worse than
char classes across the board. One number is not enough to distinguish "mostly
lowercase prose" from "mostly hex digits."

**Undamped char classes.** The straightforward multiplicative product across
needle positions. Better than baseline, but it collapses hard on longer
needles — every additional character multiplies the estimate toward zero, and
on templated content (where characters are strongly correlated) that's wildly
pessimistic.

**Markov bigrams.** The obvious next step: store transition probabilities
between character classes, capturing some of the correlation the i.i.d. model
throws away. We tested it at full precision, then quantized to fp16 and 8-bit
fixed point to see if we could afford the storage.

It was a net loss. 7.41% mean absolute error versus 5.72% for the simpler
model. And the *reason* was the interesting part: it improved `description`
substantially while badly damaging `cvss_vector`. The bigram table has an
"OTHER" bucket, and for `cvss_vector` the measured
P(OTHER→OTHER) was genuinely 0% — a real signal about a rigidly structured
column. Our fix for the aggregation noise elsewhere (flooring that probability
at the 10% baseline) overwrote a correct zero with a wrong non-zero.

That's a general trap worth naming: **when you smooth away noise, check
whether you're also smoothing away signal.** The same correction that helped
the noisy column destroyed the clean one.

**Clamping.** Bound the output to `[lo, hi]` to cap worst-case error, like the
flat constant is implicitly capped. We tested this because it seemed obviously
prudent. It isn't symmetric: our worst errors are all *under*estimates, so a
ceiling is nearly a no-op (MAE 4.45% → 4.57%, worst case unchanged at ~99.6%).
A floor does something, but it does it by forcing every correctly-near-zero
estimate up too. We declined it.

### What won

Char classes with a geometric decay applied to each position's
*log*-contribution:

```
log(p_pos) = sum(decay**i * log(p_char(c_i)) for i, c_i in enumerate(needle))
```

Aggregate MAE **4.45%** against the flat constant's **14.5%**, at
`decay = 0.7`.

The decay caps how far a long needle can drive the estimate toward zero —
characters past roughly the first `1/(1-decay)` positions contribute a
vanishing share. Critically, every term is ≤ 0, so the estimate stays
monotonically non-increasing in needle length. An earlier hand-derived variant
of ours broke that: it compared each character against a fixed 1/256 reference
instead of discounting its own log-probability, and on a column using only ~16
distinct bytes it concluded that `'CVE-20'` was *more* likely to match than
`'CVE'`. A model that says a string is more common than its own prefix is not
a model. Monotonicity became a required property, not a nice-to-have.

### The limitation we're shipping with

This estimator cannot see character *identity*. Only class and length. So
`'google'`, `'abcdef'`, and a needle that appears nowhere in the corpus all
get the same estimate if they're the same shape.

That's not a rough edge — it's an unbounded, systematically-underestimating
tail. On a templated ID column, a needle that matches nearly every row can be
estimated at nearly zero.

We looked for a cheap signal to detect the dangerous needles in advance and
fall back to the constant. There isn't one — detecting them is
approximately the same problem as estimating them correctly. So we shipped
without a guard, deliberately, with the trade written down: typical-case
accuracy improves ~3x, worst-case risk gets worse. That's the right trade for
a cost estimate, which biases plans rather than answers. It would be the wrong
trade for anything load-bearing on correctness.

## Part 2: Shipping it, and what was actually there

Then we went to wire it into `ANALYZE TABLE`, and found the actual state of
the statistics pipeline.

`ANALYZE` computed KMV sketches for cardinality. That's all. `min_values`,
`max_values`, `histogram_counts`, `histogram_bins`, `null_counts`,
`min_lengths`, `max_lengths` were columns that existed in the manifest schema
and were hardcoded empty at write time. `record_count` was hardcoded to `0`.

The catalog-backed path *did* compute all of them — using Python `min()`,
Python `max()`, and a Python bucketing loop over a materialized list. At
terabyte scale. On a system whose engineering contract says execution is
native end to end.

So the scope tripled: make statistics collection actually complete, make it
native, in both write paths, *then* add the char-class estimator that was the
original ask.

We wrote four native kernels — a byte classifier, histogram bucketing, a
null-count popcount, and an ordinal min/max — and one thing we'd like to
highlight, because we only found it by testing:

`Vector.ordinalize()` produces a monotonic int64 sort key for any column type.
Its output vector's validity bitmap is `nullptr`, which by the unified-format
convention means "all rows valid." But null input rows are encoded as a
sentinel value (`INT64_MIN`) *in the data itself*. Both facts are correct and
documented. Together they mean that calling the generic `.min()` on an
ordinalized column — which trusts the bitmap — returns `INT64_MIN` for any
column containing a single null.

We wrote that code. It looked right. The test caught it:
`vmin = -9223372036854775808`, and a histogram whose bins summed to 10,050
instead of 10,000. Had it shipped, every nullable column in every manifest
would have silently acquired a garbage minimum, and no query would have
failed.

## Part 3: The bugs that only show up when you run it

Here's the part we'd most want another engineer to take away.

Everything above was found by writing code and testing it. The following were
found by *running the finished thing against real data* — and every one of
them was invisible to code review, including our own.

**The histogram nobody could read.** We wrote `histogram_counts` with a UINT64
leaf type. The kernel that reads it back requires INT64 and throws. Every
histogram written by the new ANALYZE was unreadable. Caught by asking for a
histogram on a dataset we'd just analyzed and getting a `TypeError`.

**The bounds in the wrong shape.** Two code paths populate file bounds — one
sets a positional list, the other a field-id-keyed dict. The histogram folder
only read the list form. So histogram statistics silently came back empty for
filesystem datasets, while both halves individually looked correct.

**An import from `scratch/`.** We had the production estimator importing its
byte-classification table at runtime from the experimental directory — which
is explicitly not packaged. It worked perfectly in the dev tree and would
have failed on any real deployment.

**A crash on array columns.** `ordinalize()` doesn't support ARRAY,
DECIMAL128, or VECTOR types — it throws, by design, rather than return a
degraded key. We called it unguarded. Any dataset with an array column would
have aborted the entire ANALYZE, not just skipped that column. Found by
running against a table that happened to have two `ARRAY<VARCHAR>` columns.

**Snapshot provenance erased on every commit.** Two functions write the same
snapshot document. Both use a full-replace `set()`. They carried *different
field sets*. Whichever ran second destroyed the other's exclusive fields —
and one always ran second, so `operation-type` and `parent-snapshot-id` were
written and immediately wiped on every commit in the system's history. Every
snapshot read back as "operation: none." Appends, compactions, and statistics
refreshes were indistinguishable after the fact, and the parent-snapshot chain
had never been persisted at all.

We only noticed because we ran an ANALYZE against production and went looking
for the snapshot it should have created.

**And the one that actually returned wrong answers.**

The catalog stores per-file min/max as ordinalized keys. For integers and
timestamps, that key *is* the value — an identity widen — so everything looked
fine. For floats, `ordinalize` is an order-preserving *bit* transform. The
pruning code compared real float literals against those bit patterns.

```
real range      : 0.1 .. 0.9
stored (ordinal): 4591870180066957722 .. 4606281698874543309

predicate: price = 0.5      (0.5 is inside the real range)
files surviving : 0         →  file dropped, rows silently lost
```

`WHERE price = 0.5` concluded that 0.5 was below the file's minimum and
skipped a file that contained matching rows. Not a slow plan — missing rows.
It had been latent for as long as the catalog had stored those bounds.

The fix needed care in the opposite direction, too: the naive version would
have *broken* date and timestamp pruning, which worked. Temporal literals are
normalized to raw integers at bind time, while the scalar ordinalize entry
point expects date objects and refuses timestamps outright. A blanket fix
would have silently stopped pruning on exactly the columns most often filtered
on log tables. Our own test caught it — and caught that the first assertion
had been passing *for the wrong reason*.

## What we'd tell you

**The experiment being separate was the highest-leverage decision.** Not
because it was cleaner, but because it made abandoning ideas free. We rejected
four approaches, and it cost nothing to reject them.

**Report negative results with their mechanism.** "Markov bigrams were worse"
is nearly useless. "Markov bigrams were worse because our noise correction
overwrote a genuine zero in a structured column" is a lesson that transfers.

**A test that passes tells you less than you think.** Two of our tests passed
for the wrong reason — the code under test was raising an exception, the
caller was skipping the work, and the assertion happened to hold anyway. Both
times, the *second* assertion in the same test is what exposed it. When you
assert that something is kept, also assert that something else is dropped.

**Run the thing.** Every bug in Part 3 survived code review — by people who
knew the system. They were found by running the code against real data and
looking at what came out. The float-pruning bug in particular had been sitting
in production, silently returning incomplete results, and it did not surface
until someone compared what was stored against what was read.

**Correctness bugs that don't fail are the expensive ones.** None of these
threw. No query errored. No test went red. A wrong statistic degrades a query
plan silently; a wrongly-pruned file returns a smaller result set that looks
entirely plausible. The only defense is checking the invariant directly —
what did we write, and does what we read back mean the same thing?

## Where it ended up

`ANALYZE TABLE` now computes complete per-file statistics — null counts,
min/max, histograms, string lengths, byte-class distributions — natively, with
no Python in the per-row path, for both local and catalog-backed datasets.
`LIKE '%needle%'` selectivity comes from real per-column statistics with a
tunable decay, falling back to the old constant when statistics are absent.
Telemetry records which estimator fired, so the fallback rate is observable
rather than assumed.

On a small test table, `WHERE name LIKE '%o%'` now estimates 29 rows out of
177. The true answer is 59. The old estimate was 18.

Still wrong! Just considerably less wrong, and now wrong in a way we can
measure.

— Justin
