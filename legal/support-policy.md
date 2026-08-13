---
title: Support Policy
status: DRAFT — response targets must reflect what you can staff
effective: "{{EFFECTIVE_DATE}}"
version: "1.0-draft"
---

# Support Policy

**Effective date: {{EFFECTIVE_DATE}}**

This policy describes the support we provide with the Opteryx hosted service.
It forms part of the [Terms of Service](./terms-of-service.md).

> **Before publishing:** set response targets you can actually meet at your
> current staffing, including at 2am on a bank holiday if you commit to
> 24×7 anywhere below. Targets you miss are worse than modest targets you hit.

---

## 1. What is supported

| | Covered |
| --- | --- |
| The hosted service | ✅ Under this policy |
| Documented APIs and SDKs | ✅ Under this policy |
| The open source engine | ⚠️ Community support via [GitHub issues](https://github.com/mabel-dev/opteryx/issues) — best effort, no response commitment |
| Your SQL, data modelling or application code | ❌ Not covered, though we will point you at documentation |
| Third-party tools connecting to Opteryx | ❌ Beyond confirming our side behaves as documented |
| Beta and preview features | ⚠️ Best effort only |

## 2. Getting help

| Channel | Available to | Use for |
| --- | --- | --- |
| [Documentation](https://docs.opteryx.app) | Everyone | Reference, guides, limits |
| [Status page](https://status.opteryx.app) | Everyone | Current incidents, subscribe for updates |
| [Issue tracker](https://github.com/mabel-dev/opteryx.app/issues/new/choose) | Everyone | Platform bugs, questions, feature requests — public |
| [GitHub issues](https://github.com/mabel-dev/opteryx/issues) | Everyone | Open source engine bugs |
| {{COMMUNITY_CHANNEL}} | Everyone | Questions, discussion |
| {{SUPPORT_EMAIL}} | Paid and Enterprise | Service issues |
| {{ENTERPRISE_CHANNEL}} | Enterprise | Priority routing, named contact |

**Free plan support is community-only.** We read the community channels, but
there is no response commitment on the Free plan.

## 3. Severity levels

| Severity | Definition | Examples |
| --- | --- | --- |
| **S1 — Critical** | Service unusable in production; no workaround | Queries failing service-wide; authentication down; suspected data loss or exposure |
| **S2 — High** | Major function impaired, or severe degradation; workaround painful or absent | Uploads failing; one API down; queries timing out at scale |
| **S3 — Medium** | Function impaired with a reasonable workaround | A SQL function returning wrong results in a specific case; intermittent failures |
| **S4 — Low** | Question, cosmetic issue, or feature request | Documentation gap; UI inconsistency; how-to question |

We set severity on the reported impact and will tell you if we reassess it, with
reasons. If you disagree, say so — we will discuss it rather than argue about
it.

## 4. Response targets

Targets are for **first meaningful response**, not resolution. They run from
receipt within support hours.

| Severity | Paid | Enterprise |
| --- | --- | --- |
| S1 | {{PAID_S1}} | {{ENT_S1}} |
| S2 | {{PAID_S2}} | {{ENT_S2}} |
| S3 | {{PAID_S3}} | {{ENT_S3}} |
| S4 | {{PAID_S4}} | {{ENT_S4}} |

**Support hours:** {{SUPPORT_HOURS}}, excluding {{HOLIDAYS}}.
{{ENTERPRISE_HOURS_STATEMENT — state Enterprise out-of-hours coverage for S1, or
remove.}}

We do not commit to resolution times: a fix depends on the cause. We do commit
to keeping you updated at least {{UPDATE_INTERVAL_S1}} for S1 and
{{UPDATE_INTERVAL_S2}} for S2 while the issue is open, and to telling you when
we have no news rather than going quiet.

These are targets, not contractual guarantees. Service credits apply only to
availability, under the [SLA](./service-level-agreement.md).

## 5. Helping us help you

Please include:

- your workspace and billing account identifiers;
- the **query ID or job ID**, which is the single most useful thing you can
  give us;
- what you expected, what happened, and the exact error text;
- when it started, and whether it is reproducible;
- the SQL (redacted if needed) and how you are connecting — Studio, Jobs API,
  OData, Flight SQL, SQLAlchemy;
- the business impact, so we can set severity correctly.

Before reporting, it is worth checking [status.opteryx.app](https://status.opteryx.app),
the [Limits](https://docs.opteryx.app/docs/reference/sql/limits) page for engine
ceilings, and [Known Limits](https://docs.opteryx.app/docs/roadmap-guarantees/known-limits)
for features that are not implemented rather than broken.

**Never send credentials, API tokens or client secrets in a support request.**
We will never ask for them. If you have sent one, rotate it.

## 6. Access to your data

We do not access the contents of your datasets to investigate a ticket unless
you ask us to. Where diagnosis needs it, we will ask for explicit permission,
scope the access to what the investigation requires, and log it. See Section 4
of the [Privacy Notice](./privacy-notice.md).

## 7. Escalation

If a ticket is not progressing, reply asking for escalation, or write to
{{ESCALATION_CONTACT}} with the ticket reference. Enterprise customers may
escalate through their named contact.

## 8. Deprecation and breaking changes

Where we must make a breaking change to a documented API, we will give at least
{{DEPRECATION_NOTICE}} notice by email and in the release notes at
`docs.opteryx.app/releases`, and will describe the migration path. Security
fixes may require shorter notice; we will explain why.

Beta and preview features may change or be withdrawn without notice.

## 9. Changes

Material changes to this policy will be notified in accordance with Section 15
of the Terms of Service.
