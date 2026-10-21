---
title: Time Travel and Temporal Tables
description: Opteryx doesn't keep a history table. Every commit is a snapshot, and time travel is choosing which one to read. How a snapshot is built, what its timeline does and doesn't mean, and how to replay the data behind a past decision and compare it with what you know now.
date: 2026-10-21
author: Justin Joyce
role: Opteryx Engineering
tags:
  - time-travel
  - temporal-tables
  - catalog
  - snapshots
  - audit
  - engineering
---

# Time Travel and Temporal Tables

## TL;DR

* The usual answer to "what did this row look like yesterday?" is a history table: Type 2 rows with validity dates, or Type 4 with a separate table. Someone has to design it, write to it, and keep it in step.
* [Opteryx](https://opteryx.app) doesn't need one. Every commit writes a **snapshot**: a complete, immutable list of the files that make up the table at that moment. Time travel is choosing which snapshot to read.
* A snapshot timeline measures one kind of time: when the table *changed*, not when the fact became true. That's a limit for some questions and exactly the right clock for others, like proving what you knew when you made a decision.
* Join a table to its own past and the anti join is your delta: what was added, removed and changed, with no change table.
* The engineering is mostly in the places where "the latest commit" and "the current data" stop being the same thing: maintenance commits, rollbacks, deletes and expiry.
* It is not a backup. Untagged snapshots are reclaimed.

## The question

A customer changes their address. An analyst needs last month's report to reconcile with last month's numbers. A pipeline went wrong at 3am and someone wants to know what the table looked like before it did.

All three are the same question, and the traditional modelling answer is to keep the history yourself. In a Type 2 slowly changing dimension, each change closes the old row with an end date and inserts a new one. In Type 4, the current table stays small and a separate history table receives a copy of every row that changes.

Both work. Both put the work on you:

* **You decide up front what to track.** A column nobody listed has no history.
* **Every writer has to cooperate.** One job that updates the table directly leaves a hole in the record, and nothing tells you.
* **Readers need to know the schema.** "As of" queries become range predicates on validity columns, written by hand.

What if the table itself kept its history, for every column, whoever wrote to it? That's what a snapshot gives you.

~~~sql
SELECT *
  FROM my_workspace.sales.orders
   TIMESTAMP AS OF CURRENT_TIMESTAMP - INTERVAL '1' DAY
 WHERE order_id = 42;
~~~

The rest of this post is how that query works, what the time in it means, and one thing it makes possible that a history table struggles with.

## A snapshot is a manifest

An Opteryx table is a set of immutable Parquet files. Nothing ever edits one in place. A **manifest** is a Parquet file that lists the data files a table is made of, with a row count, a size and per-column statistics for each. A **snapshot** is a small record that points at one manifest.

When a commit lands, the catalog does four things, in this order:

1. Writes the new data file.
2. Writes a new manifest. It contains *every* file in the table, the parent's files plus the new one. It is not a delta.
3. Writes the snapshot record: an id, the parent's id, who committed, what kind of commit it was, the schema it was written under, and counts of what was added and removed.
4. Moves the table's `current` pointer to the new snapshot.

<figure class="doc-figure">
<svg viewBox="0 0 680 292" width="100%" role="img" aria-labelledby="snapshot-structure-title snapshot-structure-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="snapshot-structure-title">Three snapshots, each with its own manifest</title>
<desc id="snapshot-structure-desc">Three snapshots in a chain, each pointing at its parent. Snapshot 1 is an append, and its manifest lists one file, F1. Snapshot 2 is an append, and its manifest lists F1, reused, and a new file F2. Snapshot 3 is a delete. Its manifest lists F1 and F2, both carried over, plus a delete vector that marks rows in F1 as deleted. No file is rewritten. A current pointer sits on snapshot 3.</desc>
<rect x="530" y="6" width="100" height="24" rx="12" style="fill: var(--accent-soft-2); stroke: var(--opteryx-teal);"/>
<text x="580" y="22" text-anchor="middle" style="fill: var(--opteryx-teal); font-size: 11px; font-weight: 700; font-family: var(--font-mono);">current</text>
<line x1="580" y1="30" x2="580" y2="54" style="stroke: var(--opteryx-teal); stroke-width: 1.5;"/>
<polygon points="576,52 584,52 580,60" style="fill: var(--opteryx-teal);"/>

<rect x="10" y="62" width="180" height="52" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="22" y="84" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600;">snapshot 1</text>
<text x="22" y="102" style="fill: var(--muted); font-size: 11px; font-family: var(--font-mono);">append</text>
<rect x="250" y="62" width="180" height="52" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="262" y="84" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600;">snapshot 2</text>
<text x="262" y="102" style="fill: var(--muted); font-size: 11px; font-family: var(--font-mono);">append</text>
<rect x="490" y="62" width="180" height="52" rx="6" style="fill: var(--surface); stroke: var(--opteryx-teal); stroke-width: 2;"/>
<text x="502" y="84" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600;">snapshot 3</text>
<text x="502" y="102" style="fill: var(--muted); font-size: 11px; font-family: var(--font-mono);">delete</text>

<line x1="248" y1="88" x2="198" y2="88" style="stroke: var(--muted); stroke-width: 1.25;"/>
<polygon points="200,84 192,88 200,92" style="fill: var(--muted);"/>
<text x="220" y="80" text-anchor="middle" style="fill: var(--muted); font-size: 10px;">parent</text>
<line x1="488" y1="88" x2="438" y2="88" style="stroke: var(--muted); stroke-width: 1.25;"/>
<polygon points="440,84 432,88 440,92" style="fill: var(--muted);"/>
<text x="460" y="80" text-anchor="middle" style="fill: var(--muted); font-size: 10px;">parent</text>

<line x1="100" y1="114" x2="100" y2="140" style="stroke: var(--muted); stroke-width: 1.25;"/>
<polygon points="96,138 104,138 100,146" style="fill: var(--muted);"/>
<line x1="340" y1="114" x2="340" y2="140" style="stroke: var(--muted); stroke-width: 1.25;"/>
<polygon points="336,138 344,138 340,146" style="fill: var(--muted);"/>
<line x1="580" y1="114" x2="580" y2="140" style="stroke: var(--muted); stroke-width: 1.25;"/>
<polygon points="576,138 584,138 580,146" style="fill: var(--muted);"/>

<rect x="10" y="148" width="180" height="76" rx="6" style="fill: var(--panel-2); stroke: var(--border);"/>
<text x="22" y="166" style="fill: var(--muted); font-size: 11px;">manifest</text>
<rect x="22" y="178" width="44" height="26" rx="4" style="fill: var(--opteryx-teal);"/>
<text x="44" y="195" text-anchor="middle" style="fill: var(--on-accent); font-size: 11.5px; font-weight: 700; font-family: var(--font-mono);">F1</text>

<rect x="250" y="148" width="180" height="76" rx="6" style="fill: var(--panel-2); stroke: var(--border);"/>
<text x="262" y="166" style="fill: var(--muted); font-size: 11px;">manifest</text>
<rect x="262" y="178" width="44" height="26" rx="4" style="fill: var(--surface); stroke: var(--muted-2);"/>
<text x="284" y="195" text-anchor="middle" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-mono);">F1</text>
<rect x="314" y="178" width="44" height="26" rx="4" style="fill: var(--opteryx-teal);"/>
<text x="336" y="195" text-anchor="middle" style="fill: var(--on-accent); font-size: 11.5px; font-weight: 700; font-family: var(--font-mono);">F2</text>

<rect x="490" y="148" width="180" height="76" rx="6" style="fill: var(--panel-2); stroke: var(--border);"/>
<text x="502" y="166" style="fill: var(--muted); font-size: 11px;">manifest</text>
<rect x="502" y="178" width="44" height="26" rx="4" style="fill: var(--surface); stroke: var(--muted-2);"/>
<text x="524" y="195" text-anchor="middle" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-mono);">F1</text>
<rect x="554" y="178" width="44" height="26" rx="4" style="fill: var(--surface); stroke: var(--muted-2);"/>
<text x="576" y="195" text-anchor="middle" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-mono);">F2</text>
<rect x="606" y="178" width="56" height="26" rx="4" style="fill: var(--opteryx-orange); fill-opacity: 0.2; stroke: var(--opteryx-orange); stroke-width: 1.5;"/>
<text x="634" y="195" text-anchor="middle" style="fill: var(--orange-ink); font-size: 11.5px; font-weight: 700; font-family: var(--font-mono);">del-3</text>

<text x="22" y="244" style="fill: var(--muted); font-size: 11px;">one new file</text>
<text x="262" y="244" style="fill: var(--muted); font-size: 11px;">one new file, F1 reused</text>
<text x="502" y="244" style="fill: var(--muted); font-size: 11px;">no new file: rows in F1 are</text>
<text x="502" y="258" style="fill: var(--muted); font-size: 11px;">marked deleted by del-3</text>

<rect x="10" y="272" width="14" height="12" rx="2" style="fill: var(--opteryx-teal);"/>
<text x="30" y="282" style="fill: var(--muted); font-size: 11px;">new in this commit</text>
<rect x="190" y="272" width="14" height="12" rx="2" style="fill: var(--surface); stroke: var(--muted-2);"/>
<text x="210" y="282" style="fill: var(--muted); font-size: 11px;">carried over, never modified</text>
<rect x="420" y="272" width="14" height="12" rx="2" style="fill: var(--opteryx-orange); fill-opacity: 0.2; stroke: var(--opteryx-orange);"/>
<text x="440" y="282" style="fill: var(--muted); font-size: 11px;">delete vector</text>
</svg>
<figcaption>Each snapshot has a complete manifest of its own. Files are shared between manifests and never modified, so an old snapshot keeps describing exactly what it described when it was written.</figcaption>
</figure>

Reading a table at any point in its history is therefore a single choice: which manifest do I plan the scan from? After that the query is the same query. The pruner, the Parquet reader and the join don't know whether the manifest they were handed is today's or last month's.

Two details matter more than they look.

**Manifests are cumulative and rewritten whole.** Writing the full list on every commit costs more than appending a delta, and we pay it deliberately. A snapshot is self-describing, so nothing has to replay a chain of changes to reconstruct it. An old manifest is also never modified once written, which makes it trivially cacheable: the engine keys its decoded-manifest cache on the manifest's location.

**The snapshot id is the commit time.** Ids are wall-clock milliseconds. That's why the docs show `VERSION AS OF 1755000000000`, and why `TIMESTAMP AS OF` can order snapshots without reading them. Two commits in the same millisecond would collide, so ids are allocated as the larger of the clock and one more than the highest existing id. That rule has a sharper edge than it sounds: a delete commit also names its delete file after its snapshot id, so a collision wouldn't just race two documents, it would silently overwrite the earlier commit's delete state.

## The commit is a conditional pointer swap

A snapshot only exists once the pointer moves. Two writers can build a commit against the same parent at the same time, and only one is allowed to win.

The pointer lives on the table's document in Firestore. The write is a single transaction that reads `current-snapshot-id` and writes only if it still holds the value the commit was built against. If it has moved, the commit is refused with a `SnapshotRaceError`, and the files it wrote become orphans that the reclamation sweeps collect. Nothing has been published, so no reader ever sees a half-finished version.

An earlier version of this check read in one transaction and wrote outside it, which narrows the race without closing it. The fix was putting the comparison and the write in the same transaction. We mention it because history is only trustworthy if the commit log is: a lost commit isn't an old version you can travel to, it's a version that never existed.

## Deletes and updates don't rewrite history

If a snapshot is a list of immutable files, what does `DELETE` do? Rewriting a 4 GB file to remove one row would make the old snapshot's files differ from what the old snapshot said, or force a full copy.

Opteryx uses **merge-on-read positional deletes**. A delete commit records which row ordinals are gone from which file, and the read path skips them. The data file isn't touched. That's the `del-3` chip in the diagram above.

We chose one bitmap per data file over a stack of delete files, and positional deletes over equality deletes. Because manifests are cumulative, a delete commit can merge its new positions into the previous bitmap for that file and write one fresh vector. The new manifest points at the new vector. Every snapshot's manifest then carries the complete delete state for that moment, so there are no sequence-number rules to apply and no delete files to reconcile at read time.

The consequence for time travel is the point of the design. The previous snapshot's manifest still points at the previous bitmap, which still has fewer deleted rows, so reading it returns the rows that were there. `UPDATE` leans on the same machinery: the old row is marked deleted and its replacement written, in one atomic commit. No snapshot is ever edited, so none can disagree with itself.

The cost is write amplification on the bitmap: deleting one more row from a file rewrites that file's whole vector. For a 40-million-row file that's tens of kilobytes compressed, which is the trade we wanted. Compaction later folds deleted rows into rewritten files, and it writes a snapshot of its own to do it.

## From SQL to a snapshot

A time-travel clause takes a surprising number of hops to reach the catalog, because each layer of the stack only understands part of the syntax.

~~~sql
SELECT * FROM orders VERSION AS OF PREVIOUS;
SELECT * FROM orders VERSION AS OF 'report_202602';
SELECT * FROM orders TIMESTAMP AS OF '2026-10-01 00:00:00'::TIMESTAMP;
~~~

1. **The SQL rewriter** handles the words the parser can't carry. The grammar for `VERSION AS OF` accepts a number and nothing else, so `PREVIOUS` is rewritten to `VERSION AS OF 0`, a sentinel the planner knows how to resolve (and a literal `0` typed by a user is refused, so the sentinel is unambiguous). A tag name is rewritten into the version-function slot the grammar *will* accept a name in.
2. **The logical planner** evaluates the clause. A timestamp expression is reduced to a single constant before the query runs, which is why it can't reference a column. The result lands on the scan node as one of three fields: a snapshot id, a tag name, or a point in time.
3. **The binder** passes those to the connector through a `Diachronic` capability. A tag is carried separately from an id rather than resolved into one: resolving it is a catalog read, and a constructor isn't the place for one.
4. **The connector** settles on a snapshot in one place, `_resolve_snapshot`. It's shared by the schema read and the manifest read so that a statement can't resolve one way at bind time and another at run time.

Each form has its own cost, and they differ:

| Form | How it resolves | Reads |
| --- | --- | --- |
| `VERSION AS OF <id>` | Fetch the snapshot by id | One document |
| `VERSION AS OF '<tag>'` | Fetch `tags/<name>`, then the snapshot | Two documents, no history |
| `VERSION AS OF PREVIOUS` | Walk the parent chain from the head | A few documents |
| `TIMESTAMP AS OF <t>` | Load the table's snapshot history, then pick | The whole history |

The last row is the expensive one. A timestamp has to be compared against every candidate, so it loads the history; ids and tags go straight to the snapshot they name. If you're hard-coding a point in a scheduled job, a tag is both safer (more on that below) and cheaper.

A snapshot also carries the id of the schema it was written under, and a time-travel read uses that schema. Read a snapshot from before an `ADD COLUMN` and the new column isn't there.

### What a timestamp means

`TIMESTAMP AS OF t` selects the newest snapshot committed at or before `t`. Two edges needed a decision:

* **Before the first commit is an error**, naming the first snapshot that exists. An empty result would be a plausible-looking answer to a question the table can't answer.
* **After the newest commit returns the newest snapshot.** A timestamp in the future is just "now", which is what a read with no clause returns.

## Two kinds of time

The word "timestamp" is carrying more than it looks like. Any fact in a table has two times attached to it, and a snapshot timeline only records one.

* **Valid time** is when something became true in the world. The customer moved house on 1 September.
* **Transaction time** is when the database learned it. We recorded the move on 3 October, after the customer rang to correct us.

The SQL:2011 standard calls tables that track transaction time *system-versioned*, and tables that track valid time *application-time period tables*. A table that tracks both is *bitemporal*. A snapshot timeline is system time. (It's `TIMESTAMP AS OF` here, not the standard's `FOR SYSTEM_TIME AS OF`, and the second spelling is refused rather than accepted as an alias.)

The diagram shows what that means for one customer's address, and for a decision made on 15 September.

<figure class="doc-figure">
<svg viewBox="0 0 680 262" width="100%" role="img" aria-labelledby="two-clocks-title two-clocks-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="two-clocks-title">The world and the table, on two clocks</title>
<desc id="two-clocks-desc">Two parallel lanes on one timeline. In the world, a customer's address is London until 1 September and Leeds from then on. In the table, it says London until a correction is committed on 3 October, and Leeds after that. For the 32 days between 1 September and 3 October the table disagrees with the world. A decision made on 15 September reads London when the table is read as of that date, which is what was known then, even though the world already said Leeds. Reading the table now returns Leeds.</desc>
<text x="326.7" y="34" text-anchor="middle" style="fill: var(--orange-ink); font-size: 12px; font-weight: 700;">15 Sep: decision</text>
<text x="626.7" y="34" text-anchor="middle" style="fill: var(--muted); font-size: 12px; font-weight: 700;">21 Oct: now</text>
<text x="210" y="64" text-anchor="middle" style="fill: var(--text-deep); font-size: 11px;">1 Sep: customer moves</text>
<line x1="210" y1="68" x2="210" y2="74" style="stroke: var(--text-deep);"/>

<text x="0" y="90" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600;">The world</text>
<text x="0" y="105" style="fill: var(--muted); font-size: 10.5px;">valid time</text>
<rect x="110" y="74" width="100" height="36" rx="4" style="fill: var(--panel-2); stroke: var(--border-2);"/>
<text x="160" y="96" text-anchor="middle" style="fill: var(--text); font-size: 12px;">London</text>
<rect x="210" y="74" width="450" height="36" rx="4" style="fill: var(--accent-soft-2); stroke: var(--opteryx-teal);"/>
<text x="435" y="96" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600;">Leeds</text>

<rect x="210" y="110" width="266.7" height="34" style="fill: var(--opteryx-orange); fill-opacity: 0.16;"/>
<text x="338" y="131" text-anchor="start" style="fill: var(--orange-ink); font-size: 11.5px; font-weight: 600;">the table disagrees</text>

<text x="0" y="160" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600;">The table</text>
<text x="0" y="175" style="fill: var(--muted); font-size: 10.5px;">transaction time</text>
<rect x="110" y="144" width="366.7" height="36" rx="4" style="fill: var(--panel-2); stroke: var(--border-2);"/>
<text x="293" y="166" text-anchor="middle" style="fill: var(--text); font-size: 12px;">London</text>
<rect x="476.7" y="144" width="183.3" height="36" rx="4" style="fill: var(--accent-soft-2); stroke: var(--opteryx-teal);"/>
<text x="568" y="166" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600;">Leeds</text>

<line x1="476.7" y1="180" x2="476.7" y2="190" style="stroke: var(--text-deep);"/>
<text x="476.7" y="203" text-anchor="middle" style="fill: var(--text-deep); font-size: 11px;">3 Oct: correction committed</text>

<line x1="326.7" y1="40" x2="326.7" y2="214" style="stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-dasharray: 5 4;"/>
<line x1="626.7" y1="40" x2="626.7" y2="214" style="stroke: var(--muted-2); stroke-width: 1.5; stroke-dasharray: 5 4;"/>

<text x="326.7" y="232" text-anchor="middle" style="fill: var(--orange-ink); font-size: 12px; font-weight: 700;">TIMESTAMP AS OF 15 Sep: London</text>
<text x="326.7" y="248" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">what the decision knew</text>
<text x="626.7" y="232" text-anchor="middle" style="fill: var(--opteryx-teal); font-size: 12px; font-weight: 700;">now: Leeds</text>
</svg>
<figcaption>Time travel reads the table's lane, not the world's. On 15 September the world said Leeds and the table said London. The table was right about what it knew, and wrong about the world, for 32 days.</figcaption>
</figure>

For some questions this is a limitation. "What was this customer's address on 15 September, as we now understand it?" can't be answered from the snapshot timeline, because as far as the timeline is concerned the correction didn't exist until 3 October. A Type 2 dimension with explicit effective dates can answer it, because it models the valid-time axis as columns. If your questions are about effective dates, put them in the model.

For other questions it is the whole point.

## Keeping the past costs something

None of this is free to keep. Every snapshot references files, and old files are bytes you're storing.

Expiration works to a retention window. A snapshot outside it is **tombstoned**: its record is marked rather than deleted, it disappears from normal reads and `SHOW SNAPSHOTS FOR`, and its files become candidates for cleanup. They aren't deleted at once. The files wait in a quarantine (two independent sightings, a day apart) before reaching storage deletion, which on GCS is a 7-day soft delete. The record itself is purged after seven days. Until the files hard-delete there's an operational restore path; after that, there isn't.

So an untagged snapshot is best-effort. It exists until maintenance runs. A timestamp that resolved last week may not resolve today, and a dashboard hard-coded to an old date will quietly start failing.

A **tag** is the exception. `ALTER TABLE ... CREATE TAG report_202602` binds a name to one snapshot and holds that snapshot, and every file it references, out of expiry for as long as the tag exists. The rules are strict because the guarantee is:

* **A tag is immutable.** To move a name you drop it and create it again, so unpinning is always a visible act.
* **Its bytes are billed**, because they're held on your behalf. A table can hold 100 tags.
* **`current` and `previous` are reserved.** They're virtual tags: names that resolve, which pin nothing. A real tag called `current` would stop meaning "the head" the moment it was created, while the name kept resolving to a frozen snapshot.
* **A broken pin is an error, not a fallback.** If a tag resolves to a snapshot that can't be read, the read fails and says so. It never falls back to current data, which would answer a question about February with March's numbers. The same rule covers an unknown tag: it errors, and it deliberately doesn't list the tags that do exist, because someone who can't see a table's tags shouldn't learn them from a failed guess.
* **Tagged snapshots are protected even if the tag set can't be read.** An unreadable tag set aborts the expiry run rather than being treated as empty. An empty set is the reading that deletes exactly what the tags exist to keep.

## "Previous" is not the parent

The first version of `VERSION AS OF PREVIOUS` resolved to the current snapshot's parent. It was wrong in the quietest possible way.

Compaction and statistics refresh both commit snapshots. They rewrite files and recompute statistics, but they change no rows. On any table with maintenance running, the literal parent of the head is routinely a compaction, and a compaction's data is identical to what a plain read returns. So `PREVIOUS` returned the same rows as no clause at all: no error, no empty result, nothing to say anything was wrong. Someone comparing "now" against "before" gets two identical counts and concludes nothing changed.

<figure class="doc-figure">
<svg viewBox="0 0 680 206" width="100%" role="img" aria-labelledby="previous-walk-title previous-walk-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="previous-walk-title">Why PREVIOUS skips maintenance commits</title>
<desc id="previous-walk-desc">Four snapshots in order, oldest to newest. The first is an append by a user, and the second is an update by a user. The third is a compaction and the fourth is a statistics refresh, both maintenance commits that changed no rows. The fourth is current. Its parent is the compaction, which holds the same rows as the second snapshot, so using the parent would return the same data as a plain read. VERSION AS OF PREVIOUS instead walks back past the two maintenance commits to the update, which is the data a plain read returns, and then to its parent, the append, which is the previous version of the data.</desc>
<line x1="80" y1="112" x2="530" y2="112" style="stroke: var(--border-2); stroke-width: 2;"/>
<path d="M530 96 C 530 10, 80 10, 80 96" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.75;"/>
<polygon points="75,90 85,90 80,100" style="fill: var(--opteryx-teal);"/>
<text x="305" y="20" text-anchor="middle" style="fill: var(--opteryx-teal); font-size: 12px; font-weight: 700; font-family: var(--font-mono);">VERSION AS OF PREVIOUS</text>
<text x="450" y="104" text-anchor="middle" style="fill: var(--orange-ink); font-size: 10.5px; font-weight: 600;">parent: same rows</text>

<circle cx="80" cy="112" r="10" style="fill: var(--opteryx-navy);"/>
<circle cx="230" cy="112" r="10" style="fill: var(--opteryx-navy);"/>
<circle cx="380" cy="112" r="7" style="fill: var(--bg); stroke: var(--muted); stroke-width: 2;"/>
<circle cx="530" cy="112" r="14" style="fill: var(--accent-soft-2); stroke: var(--opteryx-teal); stroke-width: 2;"/>
<circle cx="530" cy="112" r="6" style="fill: var(--bg); stroke: var(--muted); stroke-width: 2;"/>

<text x="80" y="144" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600;">append</text>
<text x="80" y="160" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">user commit</text>
<text x="80" y="176" text-anchor="middle" style="fill: var(--opteryx-teal); font-size: 11px; font-weight: 700;">PREVIOUS lands here</text>
<text x="230" y="144" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600;">update</text>
<text x="230" y="160" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">user commit</text>
<text x="230" y="176" text-anchor="middle" style="fill: var(--opteryx-teal); font-size: 11px; font-weight: 700;">the data a read sees</text>
<text x="380" y="144" text-anchor="middle" style="fill: var(--muted); font-size: 12px; font-weight: 600;">compaction</text>
<text x="380" y="160" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">no rows changed</text>
<text x="530" y="144" text-anchor="middle" style="fill: var(--muted); font-size: 12px; font-weight: 600;">statistics refresh</text>
<text x="530" y="160" text-anchor="middle" style="fill: var(--muted); font-size: 11px;">no rows changed</text>
<text x="530" y="176" text-anchor="middle" style="fill: var(--opteryx-teal); font-size: 11px; font-weight: 700;">current</text>

<line x1="80" y1="194" x2="530" y2="194" style="stroke: var(--border);"/>
<polygon points="530,190 538,194 530,198" style="fill: var(--border-2);"/>
<text x="80" y="204" style="fill: var(--muted-2); font-size: 10.5px;">older</text>
<text x="530" y="204" text-anchor="end" style="fill: var(--muted-2); font-size: 10.5px;">newer</text>
</svg>
<figcaption>Filled circles are commits a person made; hollow ones are maintenance. The parent of the head holds the same rows as the head. <code>PREVIOUS</code> walks past both maintenance commits to the data the head rests on, then one version further back.</figcaption>
</figure>

The fix is that `PREVIOUS` means the previous version of the *data*. Every snapshot records whether a person or a background job made it (`user_created`), and the resolver walks the parent chain twice, skipping maintenance commits: once to find the user commit the head currently rests on, then again from that commit's parent. `user_created` has to be explicitly true. A missing value means "not known to be a user commit", and guessing otherwise would put a maintenance commit in front of someone who asked what they changed.

The walk is bounded, and failing the bound is an error rather than a `None`. "There is no previous version" and "I gave up looking" are different facts, and answering the second with the first would send someone hunting for data that exists.

## Rollback moves a pointer, and breaks things

`ALTER TABLE ... ROLLBACK TO VERSION` makes an older snapshot the current one for every reader. It is a pointer move: one conditional write, with nothing copied and nothing deleted. We considered the alternative, a rollback that commits a *new* snapshot whose manifest is the old one's, so the history only ever moves forward. It's tidier, but it turns a cheap operation into a commit and puts "undo" into the log as a new version, which is exactly what people find confusing about systems that do it that way.

What the pointer move cost us was every place that assumed the head was the newest snapshot. While the head only advanced, "current" and "latest" were the same thing, and code freely reached for the last snapshot in a list. After a rollback they diverge, and each of these had to change:

* **Expiration** identified the head as the last snapshot in the list. Left alone, it would have expired the data every reader sees, or rolled a rolled-back table forward again on its next run.
* **History loading** took the head from the order Firestore returns documents. That's document-id order, which is lexicographic on the id string and only accidentally chronological. The ordering was already a latent bug when ids changed width; rollback made it wrong every time.
* **`TIMESTAMP AS OF`** would have happily landed on the version that was rolled back, the one version the table's owner had said nobody should read.

They now share a single rule, `visible_history`, which is **ancestry** from the head and not recency. Ordering can't do the job: after a rollback the next commit's sequence number comes from what its writer had in memory, so a rolled-off snapshot can share a sequence number with a live one.

Naming a rolled-off snapshot's id still reads it. The version is retired, not hidden. That detail matters in the next section.

We also renamed the pointer. It was `latest` in the code and is now `current` everywhere, including the SQL surface (`VERSION AS OF CURRENT`, the `is_current` column of `SHOW SNAPSHOTS FOR`). `latest` claims a recency that a rollback makes false.

## Temporal joins: a delta without a change log

Each side of a join can read a different snapshot, so a table can be joined to its own past. That's the simplest way to get a delta, and it is what a Type 2 dimension or a Type 4 history table is built to provide: what was added, what was removed and what changed between two points.

The key is the **anti join**, which returns the rows on one side that have no match on the other. Anti join the table against its own past and you have the rows that arrived:

~~~sql
SELECT *
  FROM orders AS n
  LEFT ANTI JOIN orders TIMESTAMP AS OF CURRENT_DATE - INTERVAL '7' DAY AS o
    ON o.id = n.id;
~~~

Swap the sides and you have the rows that went:

~~~sql
SELECT *
  FROM orders TIMESTAMP AS OF CURRENT_DATE - INTERVAL '7' DAY AS o
  LEFT ANTI JOIN orders AS n
    ON n.id = o.id;
~~~

A row that's in both but different is a plain join with a condition on the columns you care about:

~~~sql
SELECT n.id, o.status AS status_then, n.status AS status_now
  FROM orders AS n
  JOIN orders TIMESTAMP AS OF CURRENT_DATE - INTERVAL '7' DAY AS o
    ON o.id = n.id
 WHERE n.status IS DISTINCT FROM o.status;
~~~

Use `IS DISTINCT FROM` rather than `<>`. A comparison with a `NULL` is unknown, so `<>` would silently miss a value that went from `NULL` to something, or the other way.

<figure class="doc-figure">
<svg viewBox="0 0 680 240" width="100%" role="img" aria-labelledby="delta-title delta-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="delta-title">Three questions that give a delta</title>
<desc id="delta-desc">Two versions of the same table, seven days ago on the left and now on the right, with four keys. Key 1 is the same in both. Key 2 is in both but its name changed from Brin to Brian. Key 3 is only in the old version, so it was removed. Key 4 is only in the new version, so it was added. On the right, three results: changed, found with a join and IS DISTINCT FROM; removed, found by anti joining the old version against the new; added, found by anti joining the new version against the old. Key 1 is unchanged and appears in none of them.</desc>
<text x="90" y="22" text-anchor="middle" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600;">7 days ago</text>
<text x="360" y="22" text-anchor="middle" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600;">now</text>
<text x="580" y="22" text-anchor="middle" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600;">delta</text>

<line x1="160" y1="61" x2="290" y2="61" style="stroke: var(--muted-2); stroke-width: 1.5;"/>
<line x1="160" y1="109" x2="290" y2="109" style="stroke: var(--opteryx-orange); stroke-width: 2;"/>
<line x1="160" y1="157" x2="290" y2="157" style="stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 4 3;"/>
<line x1="160" y1="205" x2="290" y2="205" style="stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-dasharray: 4 3;"/>

<rect x="20" y="44" width="140" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="32" y="66" style="fill: var(--text); font-size: 12px; font-family: var(--font-mono);">1  Ada</text>
<rect x="20" y="92" width="140" height="34" rx="4" style="fill: var(--surface); stroke: var(--opteryx-orange);"/>
<text x="32" y="114" style="fill: var(--text); font-size: 12px; font-family: var(--font-mono);">2  Brin</text>
<rect x="20" y="140" width="140" height="34" rx="4" style="fill: var(--surface); stroke: var(--muted); stroke-width: 1.5;"/>
<text x="32" y="162" style="fill: var(--text); font-size: 12px; font-family: var(--font-mono);">3  Cho</text>
<rect x="20" y="188" width="140" height="34" rx="4" style="fill: none; stroke: var(--muted-2); stroke-dasharray: 4 3;"/>
<text x="90" y="209" text-anchor="middle" style="fill: var(--muted-2); font-size: 11px;">no row</text>

<rect x="290" y="44" width="140" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="302" y="66" style="fill: var(--text); font-size: 12px; font-family: var(--font-mono);">1  Ada</text>
<rect x="290" y="92" width="140" height="34" rx="4" style="fill: var(--surface); stroke: var(--opteryx-orange);"/>
<text x="302" y="114" style="fill: var(--text); font-size: 12px; font-family: var(--font-mono);">2  Brian</text>
<rect x="290" y="140" width="140" height="34" rx="4" style="fill: none; stroke: var(--muted-2); stroke-dasharray: 4 3;"/>
<text x="360" y="161" text-anchor="middle" style="fill: var(--muted-2); font-size: 11px;">no row</text>
<rect x="290" y="188" width="140" height="34" rx="4" style="fill: var(--surface); stroke: var(--opteryx-teal); stroke-width: 1.5;"/>
<text x="302" y="210" style="fill: var(--text); font-size: 12px; font-family: var(--font-mono);">4  Dee</text>

<text x="500" y="65" style="fill: var(--muted); font-size: 11px;">unchanged: not in the delta</text>

<line x1="430" y1="109" x2="486" y2="109" style="stroke: var(--opteryx-orange); stroke-width: 1.5;"/>
<rect x="490" y="92" width="180" height="34" rx="4" style="fill: var(--opteryx-orange); fill-opacity: 0.12; stroke: var(--opteryx-orange);"/>
<text x="500" y="106" style="fill: var(--orange-ink); font-size: 12px; font-weight: 700;">changed</text>
<text x="500" y="120" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">JOIN, IS DISTINCT FROM</text>

<line x1="430" y1="157" x2="486" y2="157" style="stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 4 3;"/>
<rect x="490" y="140" width="180" height="34" rx="4" style="fill: var(--panel-2); stroke: var(--muted);"/>
<text x="500" y="154" style="fill: var(--text-deep); font-size: 12px; font-weight: 700;">removed</text>
<text x="500" y="168" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">then ANTI JOIN now</text>

<line x1="430" y1="205" x2="486" y2="205" style="stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-dasharray: 4 3;"/>
<rect x="490" y="188" width="180" height="34" rx="4" style="fill: var(--accent-soft-2); stroke: var(--opteryx-teal);"/>
<text x="500" y="202" style="fill: var(--opteryx-teal); font-size: 12px; font-weight: 700;">added</text>
<text x="500" y="216" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">now ANTI JOIN then</text>
</svg>
<figcaption>Join the table to its own past on the key. Rows on only one side are the added and the removed, and rows on both sides that differ are the changed.</figcaption>
</figure>

If you want all three in one pass, a `FULL JOIN` on the key does it, and the sides that come back empty say which kind of change each row is:

~~~sql
SELECT COALESCE(n.id, o.id) AS id,
       CASE WHEN o.id IS NULL THEN 'added'
            WHEN n.id IS NULL THEN 'removed'
            ELSE 'changed' END AS change
  FROM orders AS n
  FULL JOIN orders TIMESTAMP AS OF CURRENT_DATE - INTERVAL '7' DAY AS o
    ON o.id = n.id
 WHERE o.id IS NULL
    OR n.id IS NULL
    OR n.status IS DISTINCT FROM o.status;
~~~

Three things to know about a delta made this way.

**It's a net change, not a log.** The join compares two states and knows nothing about the path between them. A row updated three times shows once, as the difference between its first and last value. A row inserted and deleted between the two points shows nowhere. If you need every step, list the commits with `SHOW SNAPSHOTS FOR` and compare adjacent ids, one pair at a time with `VERSION AS OF`, or use `VERSION AS OF PREVIOUS` to see what the last write did.

**It needs a key to match on.** Without one you can still anti join on every column, but an updated row then appears twice, as a removed row and an added one, and nothing says they were the same row.

**Both sides must still exist.** If the older timestamp is earlier than the oldest surviving snapshot, the query fails with an error rather than comparing against something else. A fixed point for a recurring delta should be a tag, not a timestamp.

This is the same argument as for the snapshot timeline itself. There's no change table to build, no trigger to add, and no writer that has to remember to feed it, so the delta is still right when someone updates the table by hand.

## Replaying a decision

Here is the use case where transaction time is the right clock.

Someone, a regulator, an auditor, a customer or your own incident review, asks you to show what you knew when you made a decision. Not what the data says now: what it said then. And when the answer today would be different, they want to know why.

That is two jobs. **Replay** the inputs as they stood at the moment of the decision. **Compare** them with the inputs as they stand now, and find the commit that explains the difference.

A history table keyed on effective dates can't do the first job honestly. It gives you the corrected picture of 15 September, which is the picture nobody had on 15 September. A transaction-time timeline gives you the data as it was committed, including the stale address and the late payment, which is the evidence you need.

<figure class="doc-figure">
<svg viewBox="0 0 680 280" width="100%" role="img" aria-labelledby="replay-title replay-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="replay-title">Replaying a decision and comparing it with now</title>
<desc id="replay-desc">A timeline of five snapshots, S1 to S5. S1, S2 and S3 are commits by a user, all before the decision. The decision is made after S3. S4 is a maintenance commit after the decision. S5 is a user commit after the decision that corrects earlier data, and it is the current snapshot. Reading the table as of the decision time selects S3, the newest commit at or before the decision, which shows what the decision saw. Reading the table now selects S5. Comparing the two shows what changed, and the difference is caused by S5.</desc>
<line x1="40" y1="100" x2="650" y2="100" style="stroke: var(--border-2); stroke-width: 2;"/>
<line x1="330" y1="52" x2="330" y2="120" style="stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-dasharray: 5 4;"/>
<text x="330" y="40" text-anchor="middle" style="fill: var(--orange-ink); font-size: 12px; font-weight: 700;">decision made</text>

<circle cx="70" cy="100" r="10" style="fill: var(--opteryx-navy);"/>
<circle cx="170" cy="100" r="10" style="fill: var(--opteryx-navy);"/>
<circle cx="270" cy="100" r="10" style="fill: var(--opteryx-navy);"/>
<circle cx="410" cy="100" r="7" style="fill: var(--bg); stroke: var(--muted); stroke-width: 2;"/>
<circle cx="560" cy="100" r="14" style="fill: var(--accent-soft-2); stroke: var(--opteryx-teal); stroke-width: 2;"/>
<circle cx="560" cy="100" r="8" style="fill: var(--opteryx-orange);"/>
<text x="70" y="80" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-mono);">S1</text>
<text x="170" y="80" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-mono);">S2</text>
<text x="270" y="80" text-anchor="middle" style="fill: var(--text-deep); font-size: 11px; font-weight: 700; font-family: var(--font-mono);">S3</text>
<text x="410" y="80" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-mono);">S4</text>
<text x="560" y="74" text-anchor="middle" style="fill: var(--text-deep); font-size: 11px; font-weight: 700; font-family: var(--font-mono);">S5</text>
<text x="574" y="132" text-anchor="start" style="fill: var(--opteryx-teal); font-size: 11px; font-weight: 700;">current</text>
<text x="574" y="146" text-anchor="start" style="fill: var(--orange-ink); font-size: 11px;">late correction</text>

<line x1="270" y1="112" x2="270" y2="176" style="stroke: var(--opteryx-teal); stroke-width: 1.5;"/>
<polygon points="266,170 274,170 270,178" style="fill: var(--opteryx-teal);"/>
<text x="150" y="140" text-anchor="middle" style="fill: var(--opteryx-teal); font-size: 11px; font-weight: 700; font-family: var(--font-mono);">TIMESTAMP AS OF</text>
<text x="150" y="154" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px;">newest commit at or</text>
<text x="150" y="167" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px;">before the decision</text>

<line x1="560" y1="116" x2="560" y2="176" style="stroke: var(--opteryx-teal); stroke-width: 1.5;"/>
<polygon points="556,170 564,170 560,178" style="fill: var(--opteryx-teal);"/>

<rect x="140" y="180" width="200" height="62" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="154" y="202" style="fill: var(--text-deep); font-size: 13px; font-weight: 700;">Then</text>
<text x="154" y="219" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-mono);">snapshot S3</text>
<text x="154" y="234" style="fill: var(--muted); font-size: 11px;">what the decision saw</text>

<rect x="480" y="180" width="180" height="62" rx="6" style="fill: var(--surface); stroke: var(--opteryx-teal); stroke-width: 2;"/>
<text x="494" y="202" style="fill: var(--text-deep); font-size: 13px; font-weight: 700;">Now</text>
<text x="494" y="219" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-mono);">snapshot S5</text>
<text x="494" y="234" style="fill: var(--muted); font-size: 11px;">what we know today</text>

<line x1="344" y1="208" x2="474" y2="208" style="stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="472,204 480,208 472,212" style="fill: var(--muted);"/>
<text x="410" y="200" text-anchor="middle" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 700;">compare</text>
<text x="410" y="226" text-anchor="middle" style="fill: var(--orange-ink); font-size: 11px;">caused by S5</text>

<circle cx="46" cy="266" r="6" style="fill: var(--opteryx-navy);"/>
<text x="58" y="270" style="fill: var(--muted); font-size: 11px;">user commit</text>
<circle cx="170" cy="266" r="5" style="fill: var(--bg); stroke: var(--muted); stroke-width: 2;"/>
<text x="182" y="270" style="fill: var(--muted); font-size: 11px;">maintenance</text>
<circle cx="296" cy="266" r="6" style="fill: var(--opteryx-orange);"/>
<text x="308" y="270" style="fill: var(--muted); font-size: 11px;">committed after the decision</text>
</svg>
<figcaption>Replay reads the newest commit at or before the decision. Compare reads the head. The commits in between, found with <code>SHOW SNAPSHOTS FOR</code>, are the explanation.</figcaption>
</figure>

### Replay

Run the decision's inputs with the decision's timestamp. A decision usually reads more than one table, so give each table the same moment:

~~~sql
SELECT c.customer_id,
       c.address_city,
       SUM(p.amount) AS paid_90d
  FROM crm.customers TIMESTAMP AS OF '2026-09-15 10:32:07'::TIMESTAMP AS c
  JOIN finance.payments TIMESTAMP AS OF '2026-09-15 10:32:07'::TIMESTAMP AS p
    ON p.customer_id = c.customer_id
 WHERE c.customer_id = 42
 GROUP BY c.customer_id, c.address_city;
~~~

Each table resolves independently to its newest commit at or before that moment, and the query then runs like any other.

### Compare

Run the same inputs against now, then diff the two. For one table that's the delta from the previous section, with the decision time as the older side. The changed-rows query looks like this, and the two anti joins find what appeared or vanished since:

~~~sql
SELECT at_decision.customer_id,
       at_decision.address_city AS city_then,
       today.address_city       AS city_now
  FROM crm.customers TIMESTAMP AS OF '2026-09-15 10:32:07'::TIMESTAMP AS at_decision
  JOIN crm.customers AS today
    ON today.customer_id = at_decision.customer_id
 WHERE at_decision.address_city <> today.address_city;
~~~

That tells you *what* changed. To find *why*, read the commits between the decision and now:

~~~sql
SHOW SNAPSHOTS FOR crm.customers;
~~~

Each row has a commit time, an author, an operation type, a commit message, and whether a person or a background job made it. The commit on 3 October, with a message along the lines of "correct address after customer call", is the explanation, and its author is the person who made the change.

### What makes this hold up

The replay is only as good as three properties, and the engineering earlier in this post is what provides them.

**The data is immutable.** A snapshot's files are never edited, and a delete is a bitmap in a different file, so reading S3 today returns what reading it on 15 September would have. There is no "restored" copy to doubt.

**The history has to still exist.** This is the one you must plan for. Untagged snapshots are reclaimed. If a decision may need replaying in a year, **tag the snapshot at decision time**:

~~~sql
ALTER TABLE crm.customers CREATE TAG decisions_20260915;
~~~

Tags are billed and capped at 100 per table, so tag per run, per day or per batch of decisions rather than per decision. Record the tag name, and the snapshot id, with each decision.

**Record ids, not only timestamps.** A timestamp is resolved to "the newest commit at or before it", which is only as exact as the clock the decision system used and the clock the commit was stamped with. A snapshot id is exact. There's also a case where a timestamp gives the wrong answer on purpose. `TIMESTAMP AS OF` will not select a version that has since been rolled back, because a rollback is the table's owner saying nobody should read it. If a decision was made on a version that was later rolled back, the evidence is that version, and only its id (or a tag on it) will reach it. This is why the previous section ended where it did.

Opteryx also records the provenance of its own writes. When a statement writes a result into the catalog, whether that's a task, a materialized view refresh or a `CREATE TABLE ... AS SELECT`, the commit carries a receipt of the source snapshots it read and how each was chosen, and [`SHOW LINEAGE FOR`](/docs/reference/sql/statements/show-lineage) lists them. If the decision's output is a table in the catalog, its commit already names the input versions. A receipt doesn't pin what it names, so tags are still what keep those inputs readable.

What this does not cover is anything that happened outside the catalog. If a decision used a spreadsheet, a model that was retrained, or an API response, the table can reproduce its own inputs and nothing else.

## What this isn't

**It isn't a backup.** It's a read of history that still happens to be there. Recovery after reclamation is an operational restore, not something a query can reach. If a point has to survive, tag it, or copy it out with `CREATE TABLE ... AS SELECT ... TIMESTAMP AS OF`.

**It isn't valid-time history.** Covered above, and it bears repeating because it is the most common mistake: a snapshot timeline records when the table changed, and effective dates are a modelling decision that stays with you.

**Its resolution is the commit, not the row change.** Two updates in one commit share a snapshot, and a delta between two points is a net change. Step through the commits one at a time if you need every one.

**It needs a table with a commit log.** A plain Parquet path in object storage has no snapshots. A catalog-backed Opteryx table does, and so does an Iceberg table read through `opteryx-iceberg`, which resolves the same clauses against Iceberg's own snapshot list (and likewise treats a branch name as an error, because answering with the branch head would answer a different question).

## Where this leaves the history table

For "what did this row look like yesterday?", a snapshot answers it for every column, from every writer, with no table to design and no job to maintain. For effective-dated truth that outlives retention, it doesn't, and you'll still want the dimension. The practical split is that operational history (what was in the table, what changed, what a decision was built from) belongs to the table, and business history belongs in your model.

What makes the first kind cheap is a decision made at the bottom: files are immutable and a snapshot is a list. Everything else in this post, from deletes that don't rewrite, to rollbacks that move a pointer, to `PREVIOUS` skipping a compaction, is working out what each of those words has to mean once the table is allowed to move.

If you want to try it, [your first table](/docs/getting-started/your-first-table) walks through a write, an update and a `VERSION AS OF PREVIOUS` read, and the [time travel reference](/docs/reference/sql/advanced/adv-time-travel) covers reclamation and tags in full.
