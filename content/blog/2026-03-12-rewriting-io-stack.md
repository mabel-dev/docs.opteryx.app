---
title: Rewriting the I/O Stack
description: The new I/O layer and why it matters.
date: 2026-03-12
author: Justin Joyce
role: Opteryx Engineering
image: /blog/2026-03-12-io-stack.png
tags:
  - performance
  - storage
---

# Rewriting the I/O Stack

## TL;DR

Cold queries over 100 million rows stored as Parquet on object storage originally took **5 minutes** in Opteryx. Profiling showed the execution engine repeatedly stalling while waiting for the IO buffer to refill.

We rewrote the IO stack to schedule **fine-grained byte-range reads based on Parquet metadata (column chunks within row groups)** and pipelined reads, decompression, and decoding.

The same cold query now completes in **~10 seconds**.

The key lesson: **when reading from object storage, throughput alone isn’t enough — the granularity of work matters.**

## The Problem

While profiling Opteryx we noticed queries stalling even though the execution engine itself appeared efficient.

The workload was straightforward:

- ~100 million rows  
- stored as Parquet  
- object storage backend  
- cold query execution  

A simple query was sufficient to surface the issue:

```sql
SELECT DISTINCT column
FROM dataset;
```

Runtime was approximately five minutes.

Profiling showed that the execution engine was frequently idle while waiting for the IO buffer to refill. CPU utilization remained low even though the network and reader threads were active.

The engine wasn’t compute-bound. It was waiting for data.

## Initial Attempts

The first assumption was insufficient read parallelism.

The number of IO workers was increased:

> 8 → 16 → 32

This produced almost no change in query time.

The next hypothesis was runtime contention. To test this, the entire IO subsystem was moved into a dedicated process, communicating with the execution engine via a shared-memory ring buffer. This completely separated network activity from execution.

The stalls remained.

At this point it became clear the system was already close to the available network bandwidth per container. The issue wasn’t CPU scheduling or decode overhead.

The issue was how data was being delivered to the engine.

## The Real Issue: Coarse Units of Work

The Parquet files in the dataset were roughly:

> 128MB uncompressed
> ~30MB compressed in object storage

The IO subsystem was issuing large contiguous reads. Even with many workers the pattern looked roughly like this:

1. issue read
2. wait for blob
3. large chunk arrives
4. engine consumes
5. wait for next read

The network was busy, but usable data arrived in bursts.

The time between issuing a request and receiving data was long enough to starve execution. Increasing worker count did not solve this; it simply queued more large reads.

The bottleneck was not bandwidth, it was granularity.

<figure class="doc-figure">
<svg viewBox="0 0 680 196" width="100%" role="img" aria-labelledby="io-granularity-title io-granularity-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="io-granularity-title">Large reads arrive in bursts; small ones arrive continuously</title>
<desc id="io-granularity-desc">Two schematic timelines, each with a network lane and an engine lane. Before: the network issues one large read per file; each waits on latency, then a large chunk arrives in a burst, and only then does the engine work, so the engine sits idle between bursts. After: many small range reads for individual column chunks overlap on the network, and the engine works almost continuously.</desc>
<text x="0.0" y="14.0" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Before: one read per file</text>
<text x="80.0" y="39.0" text-anchor="end" style="fill: var(--muted); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">Network</text>
<line x1="90.0" y1="46.0" x2="670.0" y2="46.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="80.0" y="67.0" text-anchor="end" style="fill: var(--muted); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">Engine</text>
<line x1="90.0" y1="74.0" x2="670.0" y2="74.0" style="stroke: var(--border); stroke-width: 1;"/>
<rect x="90.0" y="30.0" width="58.0" height="14.0" rx="2" style="fill: none; stroke: var(--muted-2); stroke-width: 1; stroke-dasharray: 2 2;"/>
<rect x="148.0" y="30.0" width="96.7" height="14.0" rx="2" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="244.7" y="58.0" width="48.3" height="14.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="283.3" y="30.0" width="58.0" height="14.0" rx="2" style="fill: none; stroke: var(--muted-2); stroke-width: 1; stroke-dasharray: 2 2;"/>
<rect x="341.3" y="30.0" width="96.7" height="14.0" rx="2" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="438.0" y="58.0" width="48.3" height="14.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="476.7" y="30.0" width="58.0" height="14.0" rx="2" style="fill: none; stroke: var(--muted-2); stroke-width: 1; stroke-dasharray: 2 2;"/>
<rect x="534.7" y="30.0" width="96.7" height="14.0" rx="2" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="631.3" y="58.0" width="48.3" height="14.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<text x="167.3" y="69.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-style: italic; font-family: var(--font-body);">idle</text>
<text x="365.5" y="69.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-style: italic; font-family: var(--font-body);">idle</text>
<text x="558.8" y="69.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-style: italic; font-family: var(--font-body);">idle</text>
<text x="0.0" y="104.0" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">After: range reads per column chunk</text>
<text x="80.0" y="129.0" text-anchor="end" style="fill: var(--muted); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">Network</text>
<line x1="90.0" y1="136.0" x2="670.0" y2="136.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="80.0" y="157.0" text-anchor="end" style="fill: var(--muted); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">Engine</text>
<line x1="90.0" y1="164.0" x2="670.0" y2="164.0" style="stroke: var(--border); stroke-width: 1;"/>
<rect x="90.0" y="118.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="106.9" y="123.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="123.8" y="128.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="140.8" y="118.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="157.7" y="123.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="174.6" y="128.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="191.5" y="118.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="208.4" y="123.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="225.3" y="128.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="242.3" y="118.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="259.2" y="123.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="276.1" y="128.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="293.0" y="118.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="309.9" y="123.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="326.8" y="128.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="343.8" y="118.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="360.7" y="123.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="377.6" y="128.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="394.5" y="118.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="411.4" y="123.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="428.3" y="128.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="445.2" y="118.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="462.2" y="123.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="479.1" y="128.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="496.0" y="118.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="512.9" y="123.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="529.8" y="128.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="546.7" y="118.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="563.7" y="123.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="580.6" y="128.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="597.5" y="118.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="614.4" y="123.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="631.3" y="128.0" width="43.5" height="5.0" rx="1" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<rect x="138.3" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="155.7" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="173.1" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="190.5" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="207.9" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="225.3" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="242.7" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="260.1" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="277.5" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="294.9" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="312.3" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="329.7" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="347.1" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="364.5" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="381.9" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="399.3" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="416.7" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="434.1" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="451.5" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="468.9" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="486.3" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="503.7" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="521.1" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="538.5" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="555.9" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="573.3" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="590.7" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="608.1" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="625.5" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="642.9" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="660.3" y="148.0" width="15.5" height="14.0" rx="1" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="90.0" y="176.0" width="18.0" height="11.0" rx="2" style="fill: none; stroke: var(--muted-2); stroke-width: 1; stroke-dasharray: 2 2;"/>
<text x="114.0" y="186.0" style="fill: var(--text); font-size: 11px; font-family: var(--font-body);">waiting on latency</text>
<rect x="250.0" y="176.0" width="18.0" height="11.0" rx="2" style="fill: var(--opteryx-navy); stroke: none; stroke-width: 1; fill-opacity: 0.7;"/>
<text x="274.0" y="186.0" style="fill: var(--text); font-size: 11px; font-family: var(--font-body);">bytes arriving</text>
<rect x="390.0" y="176.0" width="18.0" height="11.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<text x="414.0" y="186.0" style="fill: var(--text); font-size: 11px; font-family: var(--font-body);">engine working</text>
</svg>
<figcaption>Schematic. The link moves the same bytes in both; what changes is how soon the engine has something to work on.</figcaption>
</figure>

## Rewriting the IO Stack

The solution was to redesign the IO subsystem around smaller units of work.

Parquet files contain detailed structural metadata in the footer:
- row group offsets
- column chunk offsets
- compressed sizes
- exact byte ranges

Using this information, the new IO stack schedules targeted range reads only for the column chunks required by the query.

Reads, decompression, and decoding are pipelined so the execution engine begins receiving usable data earlier.

The unit of work changed from:

> file
> to:
> column chunk within a row group

This allows the system to deliver smaller fragments of data continuously rather than waiting for large reads to complete.

## Results

The initial redesign reduced query time significantly:

> ~5 minutes → ~1 minute

After further improvements to buffering, file sizes and execution scheduling, the same cold query now completes in approximately:

> ~10 seconds

The improvement did not come from increasing available bandwidth. In fact, single-threaded decode performance is slightly slower with the new reader.

Instead of receiving large bursts of data separated by latency gaps, the execution engine now receives smaller fragments continuously. CPU utilization increases because the pipeline is almost never idle.

## Reproducing the Pattern

This issue commonly appears when:
- data is stored in object storage
- reads operate on large blobs
- execution pipelines are faster than IO latency

Typical symptoms include:
- low CPU utilization
- active network traffic
- periodic stalls in execution

In these cases, adding threads or processes rarely helps if the unit of work remains large.

## Conclusion

Object storage behaves very differently from local disks.

Large sequential reads introduce latency gaps that parallelism alone cannot eliminate. Even with many workers, execution pipelines can stall if each unit of work is too large.

The practical takeaway is:

Optimize how finely work can be scheduled, not just how fast it runs.

For Opteryx this meant redesigning the IO stack around fine-grained byte-range reads derived from Parquet metadata.

The system was never limited by Python.
It was never limited by Parquet.

It was limited by treating object storage like a disk.

## What’s Next

This IO redesign changes assumptions elsewhere in the engine.

Several components were originally optimized around file-sized units of work. Moving to fine-grained reads means revisiting parts of the execution pipeline so they can fully benefit from the new architecture.

We expect additional improvements as more of the engine adapts to this model.
