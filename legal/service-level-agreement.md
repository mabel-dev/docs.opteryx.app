---
title: Service Level Agreement
status: DRAFT — commit to no number you cannot measure
effective: "{{EFFECTIVE_DATE}}"
version: "1.0-draft"
---

# Service Level Agreement

**Effective date: {{EFFECTIVE_DATE}}**

This Service Level Agreement ("**SLA**") forms part of the
[Terms of Service](./terms-of-service.md) and sets out our availability
commitment for the Opteryx hosted service.

> **Before publishing:** do not commit to an availability percentage you cannot
> measure and evidence. An SLA is a contractual promise backed by refunds, and
> the numbers below are placeholders, not recommendations. If you are not yet
> ready to commit, publish only Section 2 (Free plan) and Section 8, and say
> that Paid plan service levels are available on request — that is a defensible
> position, and it is better than a number you cannot honour. Note that
> `status.opteryx.app` already creates an availability expectation, so saying
> nothing at all is the worst of the three options.

---

## 1. Scope

This SLA applies to Paid and Enterprise plan customers, in respect of the
following components:

| Component | Endpoint |
| --- | --- |
| Query execution (Jobs API) | `jobs.opteryx.app` |
| Authentication API | `authenticate.opteryx.app` |
| OData API | `odata.opteryx.app` |
| Upload API | `upload.opteryx.app` |
| Policy API | `policy.opteryx.app` |
| Billing API | `billing.opteryx.app` |
| Opteryx Studio | `opteryx.app` |

Components not listed — including the documentation site, the status page, and
any feature designated beta, preview or experimental — are excluded.

## 2. Free plan

**The Free plan carries no availability commitment and no service credits.** It
is provided as-is. We may apply rate limits, and may change or withdraw it on
reasonable notice.

## 3. Availability commitment

For each calendar month, we commit to a **Monthly Uptime Percentage** of at
least **{{SLA_TARGET}}%** for the components in Section 1.

**Monthly Uptime Percentage** is calculated as:

```
(Total Minutes in Month − Unavailable Minutes) ÷ Total Minutes in Month × 100
```

**Unavailable Minutes** are minutes during which the component returned errors
for all valid requests, or was unreachable, measured by our monitoring, and
excluding minutes attributable to Section 5.

A minute counts as unavailable only if the condition persists for the whole
minute. Isolated request failures, and errors caused by a single customer's
workload, are not counted.

{{OPTIONAL — if you want to commit to query latency or job start time as well,
add a separate metric here with its own definition and target. Do not fold
performance into an availability number; they fail differently.}}

## 4. Service credits

Where the Monthly Uptime Percentage falls below the commitment, you may claim a
credit against the Fees for the affected month:

| Monthly Uptime Percentage | Service credit |
| --- | --- |
| Below {{SLA_TARGET}}% but at least {{SLA_TIER_2}}% | {{CREDIT_1}}% of monthly Fees |
| Below {{SLA_TIER_2}}% but at least {{SLA_TIER_3}}% | {{CREDIT_2}}% of monthly Fees |
| Below {{SLA_TIER_3}}% | {{CREDIT_3}}% of monthly Fees |

**Claiming.** Submit a claim to {{SUPPORT_EMAIL}} within **30 days** of the end
of the affected month, including the dates and times of unavailability, the
affected component, and your request logs or error responses. We will respond
within 30 days.

**Form of credit.** Credits are applied against future invoices. They are not
refunds, are not payable in cash, and expire on termination.

**Cap.** Total credits in any month will not exceed {{CREDIT_CAP}}% of the Fees
for that month.

**Exclusive remedy.** Service credits are your sole and exclusive remedy for any
failure to meet the availability commitment. This does not limit your right to
terminate for material breach under Section 10.3 of the Terms of Service.

## 5. Exclusions

Unavailable Minutes exclude any period of unavailability arising from:

- **Scheduled maintenance**, announced at least {{MAINTENANCE_NOTICE}} in
  advance on `status.opteryx.app`, within the maintenance window described in
  Section 6;
- **Emergency maintenance** reasonably necessary to address a security
  vulnerability or imminent service failure;
- factors outside our reasonable control, including internet or network failures
  beyond our infrastructure boundary, and force majeure events;
- failure of a **third-party identity provider** (Google, GitHub, or your own
  SSO provider) where our authentication service is otherwise operating;
- **your** equipment, software, network or configuration, or that of a third
  party acting on your behalf;
- use of the Service in breach of the Terms of Service or the
  [Acceptable Use Policy](./acceptable-use-policy.md);
- **suspension or termination** of your account in accordance with the Terms of
  Service;
- queries that fail because they exceed a documented limit, exhaust an
  allowance, or are rejected by the engine as designed — including result sets
  exceeding `sql_select_limit`, which the engine rejects rather than truncates;
- beta, preview or experimental features;
- your failure to follow documented usage requirements or to act on a
  deprecation notice.

## 6. Maintenance

**Scheduled maintenance window:** {{MAINTENANCE_WINDOW}}.

We aim to perform maintenance without downtime. Where downtime is required, we
will announce it on `status.opteryx.app` at least {{MAINTENANCE_NOTICE}} in
advance, and will keep it within the window where practicable.

## 7. Status and incident communication

Current and historical status is published at `status.opteryx.app`. During an
incident affecting a Section 1 component, we will post an initial
acknowledgement, updates at least {{INCIDENT_UPDATE_INTERVAL}} while the
incident is open, and a resolution notice.

For {{POSTMORTEM_SEVERITY}} incidents we will publish a post-incident review
within {{POSTMORTEM_DAYS}} working days.

## 8. Enterprise plans

Enterprise customers may agree different availability commitments, credits,
support response times and maintenance arrangements in an order form or master
agreement, which take precedence over this SLA to the extent of any conflict.

## 9. Changes

We may update this SLA. Changes that reduce the availability commitment or
service credits take effect no earlier than 30 days after notice, and no earlier
than the start of your next billing month.
