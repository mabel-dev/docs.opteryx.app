---
title: Keeping the Compressed Bytes Made Repeat Queries 4x Faster
description: Our chunk cache now holds a remote chunk compressed until it proves it'll be used again. A repeat skips the network, and the change let the cache take on the big scans it used to turn away. Hot ClickBench runs over S3 dropped to 0.23x of their old time.
date: 2026-10-31
author: Justin Joyce
role: Opteryx Engineering
tags:
   - performance
   - caching
   - io
   - parquet
---

# Keeping the Compressed Bytes Made Repeat Queries 4x Faster

## TL;DR

Opteryx caches decompressed Parquet column chunks so repeated queries skip the work. We changed how it treats a remote chunk it hasn't seen before: instead of decompressing it straight away, the cache keeps it compressed, exactly as it came off the network. The next read skips the request and pays only to decompress. Only a chunk that keeps getting used is stored decompressed. Over an S3 server with object-store latency, hot runs of ClickBench's 43 queries now take **0.23x** of the time they did, about 4x faster in total, and 1.8x faster per query. The biggest single query went from 11.1 seconds to under half a second. Two more wins fell out of the change: the cache now takes on big scans it used to refuse, and filtered scans now fill it.

## The Cache We Had

Every repeated query pays for the same work twice: fetch the column chunk, decompress it, decode it. So Opteryx keeps a process-wide cache of decompressed column chunks, and a repeat skips the decompression and, for remote files, the fetch too.

Each entry is a chunk *image*: the column chunk rewritten as if it had been written uncompressed, page headers and all. A hit runs through the ordinary decoder with no special path.

Admission follows S3-FIFO. A new chunk goes on a small probation queue, 10% of the cache. If it's used again while on probation, it moves to the main area; if not, it's evicted, and we keep its key in a short list so that if it comes back soon it goes straight to the main area. The main area is evicted with CLOCK, weighted so chunks that are expensive to rebuild, which mostly means remote ones, outlive cheap ones.

That design treated every chunk on probation the same way: fully decompressed, at full size, before it had shown it would ever be used again.

## The Idea: Pay in Stages

For a remote chunk, the two costs a cache hit saves are very different sizes:

| What a hit saves | Cost for a remote chunk |
|---|---|
| The request | Tens of milliseconds of latency, plus transfer |
| Decompression | A fraction of that |

We'd already measured that a decompressed hit is worth less than profiles suggest: removing decompression saves about a third of the time the profiler attributes to it, because a hit streams the decompressed bytes from main memory rather than decompressing into a buffer that stays in L2.

So most of the value of caching a remote chunk is not having to fetch it again, and the compressed bytes already deliver that. That gives three states, and a chunk pays less each time it comes back:

<figure class="doc-figure">
<svg viewBox="0 0 680 150" width="100%" role="img" aria-labelledby="ccz-life-title ccz-life-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="ccz-life-title">A remote chunk pays less each time it comes back</title>
<desc id="ccz-life-desc">Never seen: fetch and decompress. Second read, held compressed on probation: skip the fetch, pay to decompress. Used again, held decompressed in the main area: skip both.</desc>
<rect x="0" y="20" width="180" height="90" rx="8" style="fill: var(--opteryx-orange); fill-opacity: 0.14; stroke: var(--opteryx-orange); stroke-width: 1.5;"/>
<text x="90.0" y="44" text-anchor="middle" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Never seen</text>
<text x="90.0" y="62" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">not in the cache</text>
<text x="90.0" y="90" text-anchor="middle" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">fetch + decompress</text>
<line x1="180" y1="65" x2="243" y2="65" style="stroke: var(--text-deep); stroke-width: 1.5;"/>
<path d="M250,65 l-8,-4.5 v9 z" style="fill: var(--text-deep);"/>
<text x="215.0" y="57" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">first read</text>
<rect x="250" y="20" width="180" height="90" rx="8" style="fill: var(--muted); fill-opacity: 0.14; stroke: var(--muted); stroke-width: 1.5;"/>
<text x="340.0" y="44" text-anchor="middle" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Probation</text>
<text x="340.0" y="62" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">compressed, as fetched</text>
<text x="340.0" y="90" text-anchor="middle" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">decompress only</text>
<line x1="430" y1="65" x2="493" y2="65" style="stroke: var(--text-deep); stroke-width: 1.5;"/>
<path d="M500,65 l-8,-4.5 v9 z" style="fill: var(--text-deep);"/>
<text x="465.0" y="57" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">used again</text>
<rect x="500" y="20" width="180" height="90" rx="8" style="fill: var(--opteryx-teal); fill-opacity: 0.14; stroke: var(--opteryx-teal); stroke-width: 1.5;"/>
<text x="590.0" y="44" text-anchor="middle" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Main area</text>
<text x="590.0" y="62" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">decompressed image</text>
<text x="590.0" y="90" text-anchor="middle" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">nothing</text>
<text x="340" y="140" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">The image is built by the decode that reads the compressed entry, then swapped in under the same key.</text>
</svg>
<figcaption>The three states a remote column chunk moves through. The cost shown is what a read pays in that state.</figcaption>
</figure>

The compressed form is typically 3-5x smaller than the image, so the same probation space holds 3-5x more chunks, and a chunk that's only ever read once costs a fraction of the memory it used to.

## How It Works

**Remote files only.** For a local file the compressed bytes are already in the operating system's page cache, so holding them again would just double them. Local files keep the cache exactly as it was.

**A miss fills compressed.** When a remote chunk is fetched whole, the cache takes a copy of the fetched bytes: one `memcpy` at compressed size, where filling used to mean decompressing into a staging buffer and then copying again to build the image.

**A hit reads like a fetch.** The IO planner already asks the cache before it fetches and skips the request on a hit. A compressed hit hands its bytes to the decoder exactly as if they had just arrived over the network.

**A complete decode swaps in the image.** That decode decompresses every page anyway, so it builds the image as it goes, and the cache swaps it in for the compressed entry under the same key, straight into the main area. A reader still holding the compressed entry keeps its bytes until it's done with them.

**No demotion.** An image evicted from the main area is dropped. Recompressing it would be wasted work, and keeping both forms of a hot chunk would double its memory.

## Results

We served 50 of the 100 ClickBench files (50 million rows, 6.2 GB) over S3 from [hadro](/blog/2026-10-01-hadro), our S3-compatible test server, shaped to behave like an object store: 120 ms of latency plus up to 30 ms of jitter on every request, 480 Mbps per response and 2000 Mbps in total. Each query ran in its own process, three times, as ClickBench does. The cache was set to 2.4 GiB so it had to make choices, and the two builds alternated which ran first across three rounds. Every query returned the same rows on both.

<figure class="doc-figure">
<svg viewBox="0 0 680 152" width="100%" role="img" aria-labelledby="ccz-total-title ccz-total-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="ccz-total-title">Total time for ClickBench&#x27;s 43 queries over S3, before and after</title>
<desc id="ccz-total-desc">Hot runs: 52.2 s before, 12.1 s after. Cold runs: 109.1 s before, 108.9 s after.</desc>
<rect x="190" y="8" width="12" height="12" rx="2" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"/><text x="208" y="18" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Before</text>
<rect x="268" y="8" width="12" height="12" rx="2" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"/><text x="286" y="18" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">After</text>
<line x1="190" y1="30" x2="190" y2="148" style="stroke: var(--border-2); stroke-width: 1;"/>
<text x="180" y="50" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Hot runs</text>
<text x="180" y="66" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">best of tries 2-3</text>
<rect x="190" y="38" width="191.4" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Hot runs before: 52.2 s</title></rect>
<text x="389.4" y="51.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">52.2 s</text>
<rect x="190" y="60" width="44.4" height="18" rx="3" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"><title>Hot runs after: 12.1 s</title></rect>
<text x="242.4" y="73.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">12.1 s</text>
<text x="180" y="106" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Cold runs</text>
<text x="180" y="122" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">try 1, empty cache</text>
<rect x="190" y="94" width="400.0" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Cold runs before: 109.1 s</title></rect>
<text x="598.0" y="107.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">109.1 s</text>
<rect x="190" y="116" width="399.3" height="18" rx="3" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"><title>Cold runs after: 108.9 s</title></rect>
<text x="597.3" y="129.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">108.9 s</text>
</svg>
<figcaption>All 43 ClickBench queries over 50 files on an S3 server with 120 ms request latency. Hot is 0.23x of before; cold is unchanged.</figcaption>
</figure>

Hot runs went from 52.2 seconds to 12.1 seconds. Cold runs, where every chunk has to come over the network at least once, are where they were.

### Big scans the cache used to refuse

Before a scan starts, the cache estimates how much it would fill, and a scan that won't fit in the remaining space reads from the cache without filling it. That's deliberate: one pass over a table bigger than the cache would otherwise flush everything useful out of it.

The estimate used the decompressed size. With compressed fills, the right estimate for a remote chunk is its compressed size, 3-5x smaller. At 2.4 GiB the old cache turned eight of the 43 queries away completely, so every repeat went back over the network. Now they fit:

<figure class="doc-figure">
<svg viewBox="0 0 680 424" width="100%" role="img" aria-labelledby="ccz-big-title ccz-big-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="ccz-big-title">Hot run time of the eight big-scan queries, before and after</title>
<desc id="ccz-big-desc">Q22: 11,077 ms before, 478 ms after; Q21: 5,109 ms before, 362 ms after; Q28: 4,758 ms before, 617 ms after; Q34: 4,422 ms before, 585 ms after; Q33: 4,420 ms before, 595 ms after; Q27: 4,417 ms before, 336 ms after; Q20: 4,331 ms before, 192 ms after; Q23: 4,183 ms before, 1,300 ms after</desc>
<rect x="190" y="8" width="12" height="12" rx="2" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"/><text x="208" y="18" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Before</text>
<rect x="268" y="8" width="12" height="12" rx="2" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"/><text x="286" y="18" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">After</text>
<line x1="190" y1="30" x2="190" y2="420" style="stroke: var(--border-2); stroke-width: 1;"/>
<text x="180" y="50" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Q22</text>
<rect x="190" y="38" width="400.0" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Q22 before: 11,077 ms</title></rect>
<text x="598.0" y="51.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">11,077 ms</text>
<rect x="190" y="60" width="17.3" height="18" rx="3" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"><title>Q22 after: 478 ms</title></rect>
<text x="215.3" y="73.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">478 ms</text>
<text x="180" y="98" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Q21</text>
<rect x="190" y="86" width="184.5" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Q21 before: 5,109 ms</title></rect>
<text x="382.5" y="99.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">5,109 ms</text>
<rect x="190" y="108" width="13.1" height="18" rx="3" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"><title>Q21 after: 362 ms</title></rect>
<text x="211.1" y="121.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">362 ms</text>
<text x="180" y="146" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Q28</text>
<rect x="190" y="134" width="171.8" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Q28 before: 4,758 ms</title></rect>
<text x="369.8" y="147.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4,758 ms</text>
<rect x="190" y="156" width="22.3" height="18" rx="3" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"><title>Q28 after: 617 ms</title></rect>
<text x="220.3" y="169.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">617 ms</text>
<text x="180" y="194" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Q34</text>
<rect x="190" y="182" width="159.7" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Q34 before: 4,422 ms</title></rect>
<text x="357.7" y="195.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4,422 ms</text>
<rect x="190" y="204" width="21.1" height="18" rx="3" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"><title>Q34 after: 585 ms</title></rect>
<text x="219.1" y="217.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">585 ms</text>
<text x="180" y="242" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Q33</text>
<rect x="190" y="230" width="159.6" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Q33 before: 4,420 ms</title></rect>
<text x="357.6" y="243.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4,420 ms</text>
<rect x="190" y="252" width="21.5" height="18" rx="3" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"><title>Q33 after: 595 ms</title></rect>
<text x="219.5" y="265.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">595 ms</text>
<text x="180" y="290" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Q27</text>
<rect x="190" y="278" width="159.5" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Q27 before: 4,417 ms</title></rect>
<text x="357.5" y="291.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4,417 ms</text>
<rect x="190" y="300" width="12.1" height="18" rx="3" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"><title>Q27 after: 336 ms</title></rect>
<text x="210.1" y="313.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">336 ms</text>
<text x="180" y="338" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Q20</text>
<rect x="190" y="326" width="156.4" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Q20 before: 4,331 ms</title></rect>
<text x="354.4" y="339.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4,331 ms</text>
<rect x="190" y="348" width="6.9" height="18" rx="3" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"><title>Q20 after: 192 ms</title></rect>
<text x="204.9" y="361.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">192 ms</text>
<text x="180" y="386" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Q23</text>
<rect x="190" y="374" width="151.1" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Q23 before: 4,183 ms</title></rect>
<text x="349.1" y="387.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4,183 ms</text>
<rect x="190" y="396" width="46.9" height="18" rx="3" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"><title>Q23 after: 1,300 ms</title></rect>
<text x="244.9" y="409.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1,300 ms</text>
</svg>
<figcaption>The eight scans the old cache refused to admit at a 2.4 GiB budget. Each repeat went back over the network; now each is served from the cache.</figcaption>
</figure>

Q22 went from 11.1 seconds to 478 milliseconds, 23x faster. Q20 is 23x faster, Q21 14x, Q27 13x. Those eight queries alone account for about 42 of the 52 seconds the suite used to spend on hot runs.

### Filtered scans now fill the cache

An image can only be built by a decode that walked every page, so the old cache filled only after a complete decode. A scan that skipped pages using the page index, or a predicate that let the decoder stop early, cached nothing. A compressed entry only needs the bytes to have arrived:

| Query | Before (hot) | After (hot) | Speedup |
|---|---|---|---|
| Q38 | 616 ms | 148 ms | 4.2x |
| Q19 | 706 ms | 158 ms | 4.5x |
| Q17 | 436 ms | 140 ms | 3.1x |
| Q39 | 697 ms | 232 ms | 3.0x |
| Q40 | 328 ms | 158 ms | 2.1x |

The rest of the suite, the queries the old cache already held in full, is where it was: after the first repeat, both builds read the same image.

## Engineering Lessons

1. **Cache the thing that's expensive to get back.** Locally, the compressed bytes are free to re-read and decompression is the cost. Remotely it's the other way round. The same cache now holds different entries for the two, because the costs are different.
2. **An estimate is only as good as what it's estimating.** Our admission control was correct for decompressed fills. Once fills changed form, keeping the estimate in step with them unlocked the biggest wins in the run.
3. **Question the constraints you inherited.** "Only fill after a complete decode" existed because an image needs every page. Compressed bytes don't, so the restriction went with them, and filtered scans started caching.
4. **Attribute the win.** The headline was 4x. Splitting it by query showed where it came from, and that's what turned one change into three findings.

## What's Next

These are development-build numbers on top of 0.9.177, measured on 2026-10-30 on an Apple M5 Pro against hadro on the same machine. Next we're running the same comparison on x86, and on a long-running server process with a mix of users and tables, where the extra room on probation should matter most.

## Final Thought

The cheapest cache entry is the one you didn't decompress until it earned it. Keeping chunks compressed until they're used again did that, and it gave us a cache that takes on the scans it used to turn away.

— Justin
