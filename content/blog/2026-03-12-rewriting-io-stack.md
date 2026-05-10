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

---

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

~~~
8 → 16 → 32
~~~

This produced almost no change in query time.

The next hypothesis was runtime contention. To test this, the entire IO subsystem was moved into a dedicated process, communicating with the execution engine via a shared-memory ring buffer. This completely separated network activity from execution.

The stalls remained.

At this point it became clear the system was already close to the available network bandwidth per container. The issue wasn’t CPU scheduling or decode overhead.

The issue was how data was being delivered to the engine.

## The Real Issue: Coarse Units of Work

The Parquet files in the dataset were roughly:

~~~
128MB uncompressed
~30MB compressed in object storage
~~~

The IO subsystem was issuing large contiguous reads. Even with many workers the pattern looked roughly like this:

~~~
issue read
wait for blob
large chunk arrives
engine consumes
wait for next read
~~~

The network was busy, but usable data arrived in bursts.

The time between issuing a request and receiving data was long enough to starve execution. Increasing worker count did not solve this; it simply queued more large reads.

The bottleneck was not bandwidth, it was granularity.

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

~~~
file
~~~
to:
~~~
column chunk within a row group
~~~

This allows the system to deliver smaller fragments of data continuously rather than waiting for large reads to complete.

## Results

The initial redesign reduced query time significantly:

~~~
~5 minutes → ~1 minute
~~~

After further improvements to buffering, file sizes and execution scheduling, the same cold query now completes in approximately:

~~~
~10 seconds
~~~

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
