---
title: Moving the Database Next to the Worker Took 800ms Off Every Request
description: Our Firestore databases lived in London and a US multi-region while the services that read them ran in us-east1. We moved them into the same region in two steps, built a platform-wide maintenance switch to do it safely, split up a database that had become a junk drawer, and watched response times on every Firestore-backed service fall from over a second to about 300ms.
date: 2026-11-14
author: Justin Joyce
role: Opteryx Engineering
image: /blog/2026-11-14-firestore-colocation.png
tags:
   - platform
   - performance
   - firestore
   - operations
---

# Moving the Database Next to the Worker Took 800ms Off Every Request

## TL;DR

The Opteryx platform's services run in Google Cloud's `us-east1`. The Firestore databases they read on every request did not: `catalogs`, which holds workspaces and dataset metadata, was in a US multi-region, and `(default)`, which held everything else, was in London. Every request that touched Firestore paid for that distance several times over, because a request rarely makes one read. We moved both into `us-east1`, next to the services.

We did it in two steps. First we moved `catalogs`, the smaller job: one database, one purpose, and already named in every service's configuration. Then we split `(default)` into three databases with clear jobs and moved those. To keep both cutovers safe we built a platform-wide maintenance switch that every service honours, and put the windows on our status page and in the Studio ahead of time.

The result: the services that read Firestore went from a little over a second per request to between 311ms and 398ms, as measured from outside Google Cloud. The services that don't read Firestore didn't move at all, which is the clearest evidence of what the change did.

## Where the Time Was Going

A Firestore read from `us-east1` to a database in the same region is a few milliseconds. To a database in London it's a transatlantic round trip, roughly 80ms before Firestore does any work. The US multi-region was closer, but it isn't `us-east1`, and a multi-region database replicates every write synchronously across regions before it acknowledges it, so writes cost more there by design.

One round trip of extra latency wouldn't have been worth a migration. The problem is that requests don't make one read. Before a query reaches the engine, the platform resolves who the caller is, which billing account they belong to, whether that account is active, what the workspace's access policy allows, the platform's configuration, and the catalog entries for every table the query names. Each of those is a document read, many depend on the one before, and each one paid the distance.

So the extra latency wasn't a constant. It was the distance multiplied by the number of reads a request made in sequence, and that number had grown as the platform did. Ten dependent reads at 80ms each is most of a second, and that's about what we were paying.

## Step One: Move the Catalog

We moved `catalogs` first because it was the easier of the two. It holds one kind of thing, the catalog: workspaces, datasets, snapshots, views and access policies, read through one library. And every service already found it through a setting, `FIRESTORE_DATABASE`, because the catalog library has always been handed the database it should use. Moving it was a matter of copying the data to a new database in `us-east1` while nothing was writing to it, checking it, and pointing the setting at the copy.

That made it a rehearsal for the harder move. It exercised the maintenance switch, the status page notice and the copy-and-verify process on a database where the cutover was a single setting, before we tried any of it on the database that wasn't.

## Step Two: Split and Move `(default)`

`(default)` was the harder one, for two reasons.

The first was that nothing named it. Most services used Firestore's `(default)` database implicitly, which meant the database's identity was baked into the code. Moving it would have meant changing and deploying every service at the same moment as the data moved.

So before any data moved, every service learned to read the database it uses from configuration, by role:

| Config key | What it holds |
|---|---|
| `CLIENTS_FIRESTORE_DATABASE` | Billing accounts, members, identities and OAuth clients |
| `JOBS_FIRESTORE_DATABASE` | The job queue the worker claims from |
| `CONFIG_DATABASE` | The platform configuration document, including the maintenance switch |
| `FIRESTORE_DATABASE` | The catalog, already a setting and already moved |

Every new key defaulted to `(default)`, so the deploy was a no-op: the same reads, against the same database. That's the point of doing it first. A deploy that changes nothing can be shipped across eleven services at whatever pace suits, and checked by the fact that nothing happened. Each service's preflight check, the one that runs before a new revision takes traffic, now verifies it can read the database each key names, so a typo in a key fails a deploy rather than a request.

After that, the cutover was a configuration change, not a code change, just as it had been for the catalog.

### Rethinking What Lived Where

The second reason was what was in it. Making each database a setting forced the question of what belonged in which one, and the answer for `(default)` was "everything". It held accounts, identities, domains, auth tokens, onboarding requests, the job queue and the platform configuration: anything that wasn't catalog metadata had ended up there because it was the database you got without asking for one.

That's convenient until you need to reason about it. The job queue is written constantly and read by a listener on every worker node. Accounts and identities are read on every request and written rarely. The configuration document is tiny and read by everything. They have different access patterns, different blast radii and different reasons to change, and they were sharing one database for no reason except history.

So instead of copying `(default)` from London to `us-east1` as it was, we split it on the way. Users and accounts went to a clients database, the queue to a jobs database, and the platform's own state, its configuration and the SRE control layer's records, to a platform database, all three in `us-east1`. Once the split was live, the last few places that still reached for `(default)` explicitly, mostly preflight checks and a canary script, were changed to name the database they meant.

The split is also what made the cutover order manageable. Each database could be copied and checked on its own, and a service only depended on the databases its keys named, not on one database that every service needed at once.

## A Switch for the Whole Platform

The hard part of moving a live database isn't copying it, it's the writes that land during the copy. A write that reaches the old database after its documents have been copied is lost when traffic moves to the new one. We needed the platform to stop writing, briefly, everywhere at once, and we didn't have a way to do that.

So we built one: `platform_mode`, a single setting that every service reads, with four modes.

| Service | `operational` | `read_only` | `reject` | `queue` |
|---|---|---|---|---|
| jobs | all | reads | - | all, held |
| worker | all | reads | - | - |
| upload | all | - | - | - |
| flight | all | reads | - | - |
| odata | all | reads | - | - |
| control | all | - | - | - |
| xb500 | all | reads | - | - |

`read_only` is the one a migration wants: queries keep working, anything that writes is refused. `queue` accepts job submissions but has the worker leave them pending, so nothing is lost and nothing runs. Services that answer synchronously, like Flight and OData, treat `queue` as `reject`: a clear refusal now is better than a client left waiting on a connection until it times out. Every refusal is a 503 with a `Retry-After` header, worked out from when the window is due to end.

A few decisions in the switch were less obvious than the table.

**It's one table, in one place.** What each mode allows is defined once in our shared services library, and each service only asks "may I do this?". Seven services each deciding what `read_only` means for themselves is seven chances to get it subtly wrong.

**It doesn't fail open.** Our ordinary configuration does: if it can't be read, services carry on with the defaults. The switch can't work that way, because the outage you set the switch for might be a Firestore outage, and falling back to `operational` on a read error would turn everything back on at the worst moment. So a read error keeps the last mode the process read successfully. Only a process that has never managed a read assumes `operational`, since a service still has to be able to start.

**There's a break-glass outside Firestore.** The switch lives in the configuration document, which is in a database we were about to move. If Firestore itself is unreachable, setting `PLATFORM_MODE` in a deployment's environment overrides the document.

**Some routes must never be gated.** Control refuses everything outside `operational`. If the route that sets the mode were behind the switch, setting `reject` would leave no way back except editing Firestore by hand. Health and status routes stay open too.

**The worker checks before every claim.** Reading the mode once at startup would mean a long-running worker never sees the switch. It reads the mode before each claim, and in `read_only` it fails queued writes inside the claim transaction, so a write sitting at the head of a pool can't hide the reads queued behind it.

## Telling People Before It Happened

A maintenance window that users discover by getting a 503 is an outage with good intentions. We scheduled each window on our status page and improved how the Studio shows it.

The Studio already had a status indicator in its footer, fed by our status page. The gap was that the status page reports nothing until a scheduled window actually starts, so the indicator stayed green right up to the moment things started refusing writes. Scheduled windows now get their own state: inside 24 hours, the footer reads *Maintenance in 1h 42m*, and the popover shows the window's name and times, then *Until 17:00 UTC · 45m left* once it's underway. Anyone working in the Studio sees the window coming without having to go and look for it.

## What We Saw

Our monitor checks every service from Nuremberg every 10 minutes, from outside Google Cloud, so an outage in our own cloud can't silence it. Each service's response time is charted against its own mean and control limits, the band it normally stays within, and a check outside that band is flagged amber.

![The Opteryx services monitor over 24 hours. On the right of each Firestore-backed service's uptime bars, a single red check marks the cutover, followed by a run of amber hours. Their response-time charts drop from a flat line around a second to a flat line around 300ms, with every check since flagged below the lower control limit. app, demo, dispatch and docs show no change.](/blog/2026-11-14-firestore-colocation.png)

Two things show the change.

**The reds.** agent, jobs, odata and upload each show one check with no response, landing during one of the two switchovers. The other fell between checks. One missed check in 144 is what takes them to 99.3% for the day.

**The ambers.** Every service that reads Firestore on its request path stepped down and stayed down. They're amber because they're now outside their control limits, which were computed from a day that was mostly before the change. Amber here doesn't mean something is wrong; it means the service isn't behaving the way it used to. As the window rolls forward, the limits will recompute around the new level and the ambers will clear.

| Service | 24h average | Now |
|---|---|---|
| agent | 1.1s | 311ms |
| authenticate | 1.1s | 315ms |
| register | 1.1s | 341ms |
| odata | 1.1s | 361ms |
| control | 1.1s | 398ms |
| jobs | 952ms | 337ms |
| upload | 1.2s | 687ms |

The 24-hour averages include the hours since the change, so the level before it was a little higher than they show.

The services that don't touch Firestore are the control group: app, demo, dispatch and docs were at about 220ms before and are at about 220ms now. That's also roughly the floor for any check from Nuremberg to `us-east1`: the network round trip and the TLS handshake. Taken against that floor, the Firestore-backed services went from spending around 900ms of their own per request to around 100-180ms. Most of what a request used to cost was the distance between the service and its data.

Upload is the outlier at 687ms, because its requests do more than read Firestore: they write to storage and record what they wrote. It's 40% faster, and the rest of its time is work it actually has to do.

## Engineering Lessons

1. **Latency multiplies by the number of dependent reads.** We'd thought of the database's location as a fixed cost per request. It's a cost per sequential round trip, and the number of those grows quietly every time a request learns to check one more thing.
2. **Move the easy one first.** `catalogs` was one purpose and already a setting, so moving it tested the switch, the notices and the copy-and-verify process with the least that could go wrong. By the time we moved `(default)`, the only new part was the split.
3. **Ship the no-op first.** Making the database a setting, with every setting pointing where it already pointed, turned a coordinated deploy of eleven services into a configuration change. The risky step became the small one.
4. **A migration is a good time to ask what goes together.** `(default)` held everything because it was the database you got without choosing. Splitting it by access pattern made the move easier to stage and leaves us with databases we can reason about separately.
5. **A safety switch has different failure rules from configuration.** Failing open is right for ordinary settings and exactly wrong for the switch you reach for during an outage. Decide what the switch does when it can't read itself before you need it.
6. **Have something that isn't affected.** The services that don't read Firestore are what make the chart convincing. Without them, a drop in latency could have been the network, the monitor, or the time of day.
7. **Read control-limit alerts as "this changed", not "this broke".** A sustained run below the lower limit is the monitor telling you the process is different now. That's the result we wanted, and it'll stop being amber once the limits catch up.

## Final Thought

We spent a long time making query execution fast, and then sent every request across the Atlantic several times before it got to execute. Putting the data next to the code that reads it was the biggest latency win the platform has had this year, and it came with a maintenance switch and a cleaner set of databases we'd have wanted anyway.

— Justin
