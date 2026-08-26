---
title: Getting Help and Reporting Bugs - Opteryx Support
description: Where to raise bugs, questions and feature requests for opteryx.app, what to include in a ticket, and how to report a security vulnerability.
---

# Getting Help

Bugs, questions and feature requests for the Opteryx platform are raised and
tracked in public on GitHub, at
[mabel-dev/opteryx.app](https://github.com/mabel-dev/opteryx.app/issues).

You will need a GitHub account, and issues there are publicly visible — so
redact anything you would not want read by a stranger.

## Before you raise a ticket

Two minutes here often saves an afternoon:

- **[status.opteryx.app](https://status.opteryx.app)** — if the platform is
  having an incident, it will be there first. Subscribe for updates rather than
  refreshing.
- **[Limits](/docs/reference/sql/limits)** — engine ceilings you might be
  hitting.
- **[Known Limits](/docs/roadmap-guarantees/known-limits)** — features that are
  not implemented yet, rather than broken.
- **[Troubleshooting queries](/docs/guides/troubleshooting)** — for slow queries
  and common errors, this fixes most cases without anyone else's help.
- **[Existing issues](https://github.com/mabel-dev/opteryx.app/issues?q=is%3Aissue)** —
  search the closed ones too.

## Raise a ticket

[**Open an issue**](https://github.com/mabel-dev/opteryx.app/issues/new/choose)
and pick the template that fits:

| Template | Use it for |
| --- | --- |
| **Report a bug** | Something in the platform isn't working as documented |
| **Ask for help** | A question, or something you're stuck on |
| **Feature request** | Something you'd like the platform to do |
| **Documentation problem** | A page that is wrong, missing or confusing |

There is no such thing as too basic a question. If something was hard to work
out, that is usually a gap in these pages rather than a gap in you, and we would
rather hear about it.

## What to include

The templates prompt for all of this, but the more you can give, the faster it
goes:

- **The query ID or job ID.** The single most useful thing you can give us — it
  lets us find the execution rather than reconstruct it. Studio shows it
  alongside each result, and the APIs return it.
- What you expected, what actually happened, and the **exact error text**.
- When it started, with a timezone, and whether it is reproducible or
  intermittent.
- The SQL or API call, redacted if you need to.
- How you are connecting — Studio, Jobs API, OData, Flight SQL, SQLAlchemy, or
  the command line.
- The impact on you, so severity gets set sensibly.
- Your workspace and billing account identifiers.

> **Never send credentials, API tokens or client secrets.** We will never ask
> for them, and a GitHub issue is public. If you have already posted one, rotate
> it immediately.

## Reporting a security vulnerability

Please do **not** open a public issue for a security problem. Report it privately
through
[GitHub's private vulnerability reporting](https://github.com/mabel-dev/opteryx.app/security/advisories/new),
so it can be fixed before it is made public.

Include what you found, how to reproduce it, and what an attacker could do with
it. You will get an acknowledgement and updates as it is resolved.

## Issues with the open source projects

The hosted platform is built on open source projects that have their own issue
trackers. If your problem is in one of those rather than in the platform, it is
quicker to raise it there:

| Project | Issues |
| --- | --- |
| Opteryx query engine (the `opteryx-core` package) | [mabel-dev/opteryx](https://github.com/mabel-dev/opteryx/issues) |
| SQLAlchemy dialect | [mabel-dev/opteryx-sqlalchemy](https://github.com/mabel-dev/opteryx-sqlalchemy/issues) |
| Upload client | [mabel-dev/opteryx-upload](https://github.com/mabel-dev/opteryx-upload/issues) |
| Terraform provider | [mabel-dev/terraform-provider-opteryx](https://github.com/mabel-dev/terraform-provider-opteryx/issues) |

If you pick the wrong tracker, don't worry — we will move it.

## Support plans

Free plan support is community support: we read the issue tracker, but there is
no response commitment. Paid and Enterprise plans have response targets,
additional channels and an escalation route, set out in the support policy.
