---
title: Replacing a Magic Number
description: Replacing one hardcoded LIKE selectivity constant with a real estimator.
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

* Every `LIKE '%needle%'` predicate was assumed to match 10% of rows. For prose, identifiers, and structured strings alike, the optimizer had one invented number to plan with.
* We tested compact per-column estimators against real data, selected decayed character classes, and rebuilt the statistics pipeline needed to supply them.
* Mean absolute error fell from **14.5%** to **4.45%**. Running the completed path against real data also exposed and fixed a float-pruning bug that could silently drop matching rows.

## Why the magic number matters

When the optimizer saw `WHERE description LIKE '%needle%'`, it
had no idea how many rows would match so it just guessed ten percent. That guess
feeds join ordering, memory reservations, and whether a filter runs early or
late - and honestly considering the lack of nuance and roundness of the number - it wasn't a terrible - we tested it to have a Mean Average Error of about 14%.

The problem is that it treats every text
column and every needle alike: prose, a templated identifier, and a structured
CVSS vector all get the same answer. Filter selectivity estimates are used by the
optimizer when deciding things like the order of key activities and how to
divide up pieces of work. The query still returns the right
answer; it simply returns it slowly.

So we set out to replace the magic number with something which gave a more accurate estimate.

## Part 1: Finding an estimator

This was an experiment in competing hypotheses: what small summary of a text
column can predict whether a needle occurs, and which model gives the optimizer
a better estimate than a constant?

There were two hard constraints. The estimator runs while the optimizer is
planning a query, so it has to be cheap. And its inputs live alongside the
column statistics, so they have to be small.

That ruled out the tempting answers early. Full character counts and full
bigram tables would likely make better estimates — they know much more about
the data — but they cost kilobytes per column. This is a lightweight statistics
layer, not a second copy of the column. We needed something that could live in
the manifest and be folded across files without becoming a planning cost of its
own.

### The candidates

We had three models, plus the `0.1` baseline we were trying to beat:

* **Entropy:** reduce the column's character distribution to one number, then
  use `2**-entropy_bits` as a per-character probability.
* **Character-class counts:** classify every byte into one of eight groups —
  upper and lowercase letters, digits, whitespace, text punctuation, semantic
  punctuation, extended bytes, and controls — and retain the eight counts.
* **Compressed Markov bigrams:** a later variation of the bigram idea, using 64
  broad character categories rather than all 256 byte values.

The character-class model starts from a deliberately imperfect assumption: a
needle's characters occur independently and are identically distributed —
usually written i.i.d. In plain English, it treats each byte as a fresh draw
from the same distribution. Real text plainly does not work that way: after
`t` in English, `h` is more likely than `z`; repeated and overlapping positions
are correlated. But the purpose here was not to model language perfectly. It
was to give the optimizer a better signal than one number for every column.

### The first test

We ran each estimator against 50 scenarios on roughly 350,000 rows from the
NVD vulnerability database: CVE identifiers, prose descriptions, and CVSS
vectors. For each scenario, we compared the estimate with the actual fraction
of rows matching the needle.

The true selectivity was calculated independently of Opteryx's `LIKE`
implementation, then cross-checked against it. Five out of five checks matched
exactly. A bug in the matcher could not quietly grade its own homework.

The first chart made the direction clear. The baseline is a horizontal line at
10%, whatever the true selectivity. Entropy moved, but erratically. Character
classes tracked the diagonal — where estimate and reality agree — far more
often.

![All initial selectivity evaluations on a log-log scale. The x-axis is actual selectivity and the y-axis is the estimator's prediction; points on the diagonal are exact estimates.](/blog/2026-07-31-magic-numbers-evaluations.png)

### What we tried next

The initial result was promising, not sufficient. We tried clamping estimates
between 0.1 and 0.9, averaging models, and moving the fixed baseline to 0.15,
0.2, and 0.25.

We also gave the bigram idea another chance. Rather than store every byte pair,
the compressed Markov model grouped characters into alphanumerics, whitespace,
and several broad categories. It reduced the range of errors, but not the mean
absolute error. Runs of non-alphanumeric, non-whitespace characters received a
large likelihood boost — exactly the wrong behaviour for columns full of URLs,
where strings such as `http___www_google_com_` are common but not independent.

Entropy was out: one number cannot distinguish mostly-lowercase prose from a
mostly-hexadecimal identifier. The baseline is not an estimator at all; it is a
last resort. That left two useful directions: model correlations explicitly
with compressed Markov transitions, or keep the character classes and fix the
way their probabilities were combined.

### The two finalists

**Compressed Markov bigrams** were the more ambitious option. We tested their
transition table at full precision, then quantized it to fp16 and 8-bit fixed
point to establish whether the extra storage could be justified. It was a net
loss: 7.41% mean absolute error versus 5.72% for the simpler character-class
model in the head-to-head comparison.

The aggregate result mattered, but the mechanism mattered more. Bigrams
substantially improved `description` while badly damaging `cvss_vector`. Our
noise correction floored an `OTHER → OTHER` transition at the 10% baseline;
on the rigidly structured vector column, its true probability was genuinely
zero. We had smoothed away real signal.

That is a general trap worth naming: **when you smooth away noise, check
whether you are also smoothing away signal.**

**Character classes with decay** kept the small eight-count summary and changed
the combination rule. A straightforward product treats every character match
as independent, so a long needle drives the estimate rapidly toward zero. We
considered a Bayesian combination, then used a geometric dampening factor on
each character's log-probability instead:

```
log(p_pos) = Σ decay**i × log(p_char(class(needle[i])))
```

The decay discounts later characters without inventing probability. Every
`log(p_char)` is zero or negative, so the estimate can only stay the same or
fall as the needle gets longer. That monotonicity is not a nice-to-have. An
earlier variant compared every byte with a fixed 1/256 reference and concluded
that `'CVE-20'` was more likely to match than `'CVE'` on a column using only
about 16 distinct bytes. A model that says a string is more common than its
own prefix is not a model.

### The choice

We selected decayed character classes at `decay = 0.7`: aggregate MAE was
**4.45%**, versus **14.5%** for the flat constant.

Clamping was not the safety measure it appeared to be. Our largest errors are
underestimates, so a ceiling was nearly a no-op (MAE 4.45% → 4.57%, worst case
unchanged at ~99.6%). A floor improves those errors only by raising
correctly-near-zero estimates. We declined it.

The model deliberately cannot see character *identity*, only class and length.
`'google'`, `'abcdef'`, and a needle absent from the corpus get the same
estimate if they have the same shape. On a templated ID column, a needle that
matches nearly every row can therefore be estimated near zero.

We looked for a cheap way to identify these dangerous needles and fall back to
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
null-count popcount, and an ordinal min/max.

### How the estimator ships

At `ANALYZE` time, the classifier makes one native pass over each non-null text
column. For every byte it increments one of eight class
counters; it also totals the bytes and tracks string lengths. Per file and
column, we persist `char_class_counts` and `char_total_bytes` alongside the
other statistics.

At planning time, a native fold combines those counts across the live files.
From them, we derive the class proportions and average non-null string length;
the average is not stored separately because it is one division away from
values we already have. A class proportion becomes a byte probability by
splitting it evenly across the bytes in that class: in a column that is 70%
lowercase, `e` starts at `0.70 / 26`.

For each needle position, the planner takes that byte probability's logarithm,
weights it by `decay**position`, then adds the contributions. It converts the
result back to a probability and asks how likely it is to occur in the available
positions of an average string:

```
p_char      = class_proportion / bytes_in_class
log(p_pos)  = Σ decay**i × log(p_char(needle[i]))
selectivity = 1 - exp(-n_positions × p_pos)
```

A class absent from the observed data gets a very small floor rather than an
absolute zero. One unseen byte should make a needle very unlikely, not declare
it impossible. The estimator fires only when a column has the required
statistics and a non-zero average length; otherwise, the planner explicitly
uses the old `0.1` constant. Telemetry records which path was used.

## Where it ended up

`LIKE '%needle%'` selectivity comes from real per-column statistics with a
tunable decay, falling back to the old constant when statistics are absent.
Telemetry records which estimator fired, so the fallback rate is observable
rather than assumed.

On a small test table, `WHERE name LIKE '%o%'` now estimates 29 rows out of
177. The true answer is 59. The old estimate was 18.

Still wrong, just considerably less wrong. Perfect was never going to be possible, cheap to store, fast to calculate and, on average closer to the right answer was always the goal.

— Justin
