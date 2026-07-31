---
title: Replacing a Magic Number
description: Replacing one hardcoded LIKE selectivity constant with a real estimator uncovered an unfinished statistics pipeline — and a production bug that was silently dropping matching rows.
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

* **Problem:** every `LIKE '%needle%'` predicate used the same invented 10% selectivity, leading the optimizer to choose unnecessarily expensive plans.
* **Action:** we tested several compact per-column estimators, selected decayed byte classes, and rebuilt the statistics pipeline needed to supply it.
* **Outcome:** mean absolute error fell from **14.5%** to **4.45%**; real-data validation also exposed and fixed a latent float-pruning bug that could silently drop matching rows.

## Why the magic number matters

Somewhere in every query engine there is a number someone made up.

Ours was `0.1`. When the optimizer saw `WHERE description LIKE '%buffer%'`, it
had no idea how many rows would match, so it guessed ten percent. That guess
feeds join ordering, memory reservations, and whether a filter runs early or
late.

The problem is not just that ten percent is imprecise. It treats every text
column and every needle alike: prose, a templated identifier, and a structured
CVSS vector all get the same answer. A selective filter estimated as broad may
run late, after a large join has already done unnecessary work. A broad filter
estimated as selective can make the optimizer choose a plan that under-reserves
memory or builds the wrong side of a join. The query still returns the right
answer; it simply returns it slowly, which is harder to notice and harder to
attribute.

We set out to replace the magic number. We did. But the more interesting part
of this story is what we found on the way there, and how we found it.

## Part 1: Finding an estimator

This was an experiment in competing hypotheses: what small summary of a text
column can predict whether a needle occurs, and which model gives the optimizer
a better estimate than a constant?

### The hypotheses

The common starting point was a compact per-column summary. We classify every
byte into one of eight classes — uppercase, lowercase, digit, whitespace, text
punctuation, semantic markers, extended, control — and store each class's
proportion. That is eight numbers per column. For a needle, the model estimates
a per-position match probability and folds it over the available positions:

```
n_positions = max(avg_length - len(needle) + 1, 0)
selectivity = 1 - exp(-n_positions * p_pos)
```

We tested four variants:

* **Entropy:** collapse the distribution to one number
  (`2**-entropy_bits`) as a per-character probability.
* **Plain char classes:** multiply the class probabilities across the needle.
* **Char classes with geometric decay:** discount later characters' contribution
  to the probability.
* **Markov bigrams:** add class-to-class transition probabilities to model
  some of the correlation the independent-character model ignores.

The models are all approximations. English is not i.i.d.; overlapping positions
are not independent. The test was not whether one was true. It was whether one
was useful enough to beat `0.1`.

### How we tested them

We measured estimates against true selectivity on 371,000 real rows from the
NVD vulnerability database: CVE identifiers, prose descriptions, and CVSS
vectors. Those columns have genuinely different shapes, which matters more than
a single average score.

We calculated the true values independently of the engine's `LIKE`
implementation, so a matcher bug could not quietly grade its own homework.
Five out of five cross-checks matched exactly. After selecting the strongest
models on NVD, we checked them again against a real ClickBench
`LIKE '%google%'` query — a separate data distribution, not more of the same
corpus.

### Down to two

Entropy was out quickly: one number could not distinguish mostly-lowercase
prose from mostly-hexadecimal identifiers. Plain char classes beat the
constant, but multiplied every extra character toward zero; on correlated,
templated content, it became wildly pessimistic for longer needles.

That left two candidates worth the secondary validation: decayed char classes
and Markov bigrams. Both retain the useful class distribution; the difference
is where they spend their complexity. The first limits how much a long needle
can compound the estimate. The second adds a transition table in an attempt to
model character-class correlation directly.

### Comparing the finalists

**Markov bigrams** were the more ambitious model. We tested the transition table
at full precision, then quantized it to fp16 and 8-bit fixed point to establish
whether its additional storage was affordable. It lost its first head-to-head:
7.41% mean absolute error versus 5.72% for the simpler class model. Adding
decay improved the simpler model further.

The aggregate result mattered, but the mechanism mattered more. Bigrams
substantially improved `description` while badly damaging `cvss_vector`. Its
"OTHER" bucket measured P(OTHER→OTHER) as genuinely 0% for the rigidly
structured vector column. We floored that probability at the 10% baseline to
correct aggregation noise elsewhere, overwriting a correct zero with a wrong
non-zero.

That is a general trap worth naming: **when you smooth away noise, check
whether you are also smoothing away signal.** The same correction that helped
the noisy column damaged the clean one.

**Decayed char classes** need only the eight stored proportions. They apply a
geometric decay to each position's *log*-contribution:

```
log(p_pos) = sum(decay**i * log(p_char(c_i)) for i, c_i in enumerate(needle))
```

The decay caps how far a long needle can drive the estimate toward zero —
characters past roughly the first `1/(1-decay)` positions contribute a
vanishing share. Every term is ≤ 0, so the estimate remains monotonically
non-increasing as the needle grows.

That invariant was non-negotiable. An earlier hand-derived variant compared
each character against a fixed 1/256 reference rather than discounting its own
log-probability. On a column using only about 16 distinct bytes, it concluded
that `'CVE-20'` was *more* likely to match than `'CVE'`. A model that says a
string is more common than its own prefix is not a model.

### The choice, and how we applied it

We selected decayed char classes at `decay = 0.7`: aggregate MAE was **4.45%**,
versus **14.5%** for the flat constant. That is not a promise of a correct
cardinality estimate. It is a considerably better signal for choosing a plan.

We also tested clamping the result to `[lo, hi]`. It was not the safety measure
it appeared to be: our largest errors are underestimates, so a ceiling was
nearly a no-op (MAE 4.45% → 4.57%, worst case unchanged at ~99.6%). A floor
would improve those errors only by raising correctly-near-zero estimates. We
declined it.

The selected model is intentionally small: `ANALYZE TABLE` records the byte
class distribution and average length for each text column; planning uses them
to estimate `LIKE '%needle%'`. When statistics are absent, it retains the old
constant and records which estimator was used in telemetry.

It cannot see character *identity*, only class and length. `'google'`,
`'abcdef'`, and a needle absent from the corpus receive the same estimate if
they have the same shape. On a templated ID column, a needle that matches
nearly every row can therefore be estimated near zero.

We looked for a cheap way to identify those dangerous needles and fall back to
the constant. There isn't one — detecting them is approximately the same
problem as estimating them correctly. We shipped the trade deliberately:
typical-case accuracy improves roughly threefold; worst-case risk gets worse.
That is acceptable for a cost estimate, which biases plans rather than answers.
It would be the wrong trade for anything load-bearing on correctness.

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
