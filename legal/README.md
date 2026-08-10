# Opteryx legal and policy documents

Drafts of the policy set for the **hosted Opteryx service**. Nothing here is
published yet, and nothing here has been reviewed by a lawyer.

Every document is a working draft with `{{PLACEHOLDER}}` tokens where a fact is
needed that could not be determined from this repository. **A document is not
publishable while it still contains placeholders.**

```bash
grep -rn "{{" legal/ docs-site/public/.well-known/security.txt
```

---

## The documents

| Document | Purpose | Needs a lawyer? |
| --- | --- | --- |
| [terms-of-service.md](./terms-of-service.md) | The contract. Liability, payment, suspension, termination, governing law. | **Yes — before publication** |
| [privacy-notice.md](./privacy-notice.md) | UK GDPR Art. 13/14 transparency notice. Legally mandatory. | **Yes** |
| [data-processing-addendum.md](./data-processing-addendum.md) | UK GDPR Art. 28 processor contract, with SCC/UK Addendum transfer terms. | **Yes** |
| [acceptable-use-policy.md](./acceptable-use-policy.md) | What you may not do with the service; the basis for suspension. | Review recommended |
| [sub-processors.md](./sub-processors.md) | Required by the DPA. Must match reality exactly. | No, but must be verified |
| [service-level-agreement.md](./service-level-agreement.md) | Availability commitment and service credits. | Review recommended |
| [data-retention-and-deletion.md](./data-retention-and-deletion.md) | What happens to data on delete and on account closure. | No |
| [security-overview.md](./security-overview.md) | Trust page for security reviews and questionnaires. | No |
| [vulnerability-disclosure-policy.md](./vulnerability-disclosure-policy.md) | How to report vulnerabilities; safe harbour for researchers. | No |
| [support-policy.md](./support-policy.md) | Severity levels and response targets. | No |
| [`../docs-site/public/.well-known/security.txt`](../docs-site/public/.well-known/security.txt) | RFC 9116 machine-readable security contact. | No |

## Facts verified against the codebase

These were checked against `../web.opteryx` and this repo, and are stated as
fact in the drafts rather than left as placeholders:

- **No cookies, no analytics, no tracking.** Nothing sets `document.cookie` in
  application code, and there is no Google Analytics, Sentry, PostHog, Plausible
  or any other third-party tag on `opteryx.app`, in Studio, or on
  `docs.opteryx.app`. Studio uses `localStorage`/`sessionStorage` only.
- **Payments are Stripe.** Card details go to a Stripe-hosted element; the
  billing client stores only `stripe_payment_method_id`, brand and last4.
- **Sign-in is Google and GitHub.** Microsoft was removed in `a1f4245`.
- **Workspace protections exist** — `deletion_protection` and
  `egress_protection`, set via `ALTER WORKSPACE`.

## Two inconsistencies found while checking

1. **The docs still offer Microsoft sign-in.**
   [`getting-started/registration.md`](../docs-site/content/docs/getting-started/registration.md)
   says OAuth is supported with "Google, Microsoft and GitHub" and that SSO is
   available "via Google and Microsoft". The login page offers only GitHub and
   Google. This is a documentation bug independent of the legal work.
2. **`opteryx.app` advertises policies that do not exist.**
   `static/index.html:489` renders `Privacy · Terms · Acceptable use` as **plain
   text, not links**, and the Company column's About / Security / Contact /
   Careers links all point at `#`. Publishing these drafts is what makes that
   footer honest.

## Follow-ups in `../web.opteryx`

Not made — that repo was read, not modified:

- **`firebase.json` has the same `**/.*` ignore problem.** `opteryx.app` is the
  canonical location for `security.txt` under RFC 9116, and it would be silently
  dropped from the deploy. Same fix as applied here.
- **Wire up the footer** once these are published.
- Consider adding `Content-Security-Policy` beyond `frame-ancestors 'self'` —
  Studio loads Stripe and Monaco, so a `connect-src`/`script-src` policy is
  worth having, and it is the kind of thing a security questionnaire asks about.

## Where these should live

These govern the **service**, not the documentation, so they belong on
`opteryx.app/legal/*`, not in the docs nav. They are drafted here because this is
where the source of truth for the product's behaviour lives.

The exceptions are `security-overview.md` and `support-policy.md`, which are
reasonable candidates for `docs.opteryx.app` if you would rather keep them
alongside the technical documentation.

**The docs site footer currently has no legal links at all.** Once these are
published, [`docs-site/app/components/Footer.tsx`](../docs-site/app/components/Footer.tsx)
should link to Terms, Privacy and Status.

## security.txt deployment note

`security.txt` is served from `docs-site/public/.well-known/`. Verified present
at `out/.well-known/security.txt` after `npm run build`.

`firebase.json`'s `ignore` list previously contained `**/.*`, which would have
silently excluded the entire `.well-known/` directory from the Firebase deploy.
It has been replaced with explicit dotfile patterns (`**/.DS_Store`,
`**/.git/**`). **Do not reinstate `**/.*`.** The nginx path (Cloud Run) serves
dotfiles by default and needs no change.

`security.txt` should also be served from `opteryx.app/.well-known/security.txt`
— that is the canonical location researchers check first.

---

## Placeholder register

### Company identity — needed by almost every document

| Placeholder | What it needs |
| --- | --- |
| `LEGAL_ENTITY` | Registered company name. The marketing site footer says "© 2026 Mabel", `about.md` says "Mabel Dev", and the GCP project is `mabeldev`. None of these is a registered entity name — confirm what is at Companies House, and make the three consistent. |
| `COMPANY_NUMBER` | Companies House registration number |
| `REGISTERED_ADDRESS` | Registered office address |
| `VAT_NUMBER` | VAT registration number — the cost model already charges VAT |
| `JURISDICTION` | England and Wales / Scotland / Northern Ireland |
| `EFFECTIVE_DATE` | Publication date for each document |

### Contact addresses

`LEGAL_EMAIL`, `PRIVACY_EMAIL`, `SECURITY_EMAIL`, `SUPPORT_EMAIL`,
`ABUSE_EMAIL`, `ESCALATION_CONTACT`.

These can all be aliases to one inbox to begin with, but they should exist as
distinct published addresses — a single `hello@` on a privacy notice reads as
an unstaffed process.

### URLs

`TERMS_URL`, `PRIVACY_URL`, `AUP_URL`, `VDP_URL`, `SUBSCRIBE`/
`SUBPROCESSOR_SUBSCRIBE_URL`, `COMMUNITY_CHANNEL`, `ENTERPRISE_CHANNEL`.

### Infrastructure facts — **cannot be inferred from this repo**

| Placeholder | Notes |
| --- | --- |
| `HOSTING_REGION` | Where Customer Data actually lives. Neither repo reveals it — the docs site deploys to `us-central1`, but that says nothing about the product. It matters for the privacy notice, the DPA and every transfer assessment. |
| `EMAIL_PROVIDER`, `SUPPORT_TOOL`, `ERROR_MONITORING` + locations and transfer mechanisms | No error monitoring or analytics SDK appears in the web app, so `ERROR_MONITORING` may simply be "none" — confirm server-side. |
| `ADDITIONAL_INFRA_PROVIDER` | Any infrastructure beyond GCP |
| `AFFILIATE_STATEMENT` | Group companies with access to personal data, or "None." |
| `TLS_VERSION`, `ENCRYPTION_AT_REST_DETAIL`, `NETWORK_CONTROLS`, `SECRETS_MANAGEMENT`, `ENDPOINT_CONTROLS` | |
| `TRANSFER_MECHANISM` and the per-provider variants | Adequacy / UK Addendum to SCCs / DPF |

### Retention periods

`ACCOUNT_RETENTION`, `USAGE_RETENTION`, `QUERY_LOG_RETENTION`,
`SECURITY_LOG_RETENTION`, `SUPPORT_RETENTION`, `ACCESS_LOG_RETENTION`,
`APP_LOG_RETENTION`, `ERROR_LOG_RETENTION`, `CONSENT_RECORD_RETENTION`,
`STORAGE_RECLAIM_PERIOD`, `GRACE_PERIOD`, `GRACE_BILLING`, `VERSION_RETENTION`.

These must describe what the platform **actually does**, not what would be
tidy. The privacy notice and the retention policy have to agree.

`VERSION_RETENTION` is the one to pin down first: retained dataset versions stay
queryable through `TIMESTAMP AS OF` and keep accruing storage charges, so how
and when they expire determines whether "delete" means anything.

### Backup and DR

`BACKUP_FREQUENCY`, `BACKUP_RETENTION`, `BACKUP_LOCATION`,
`RESTORE_TEST_FREQUENCY`, `RTO`, `RPO`, `DR_TEST_STATEMENT`.

### Commercial terms

`PAYMENT_TERMS_DAYS`, `LATE_INTEREST_RATE`, `SUSPENSION_DAYS`,
`LIABILITY_FLOOR`, `SUBPROCESSOR_NOTICE_DAYS`, `SUBPROCESSOR_NOTICE_METHOD`.

`LIABILITY_FLOOR` deserves thought. The cap is "greater of X or 12 months'
fees", and on usage-based pricing a small customer's 12-month fees may be a few
pounds — which is not a credible cap to offer, and reads badly in diligence.

### SLA

`SLA_TARGET`, `SLA_TIER_2`, `SLA_TIER_3`, `CREDIT_1`, `CREDIT_2`, `CREDIT_3`,
`CREDIT_CAP`, `MAINTENANCE_WINDOW`, `MAINTENANCE_NOTICE`,
`INCIDENT_UPDATE_INTERVAL`, `POSTMORTEM_SEVERITY`, `POSTMORTEM_DAYS`.

### Support

`SUPPORT_HOURS`, `HOLIDAYS`, `PAID_S1`–`PAID_S4`, `ENT_S1`–`ENT_S4`,
`UPDATE_INTERVAL_S1`, `UPDATE_INTERVAL_S2`, `ENTERPRISE_HOURS_STATEMENT`,
`DEPRECATION_NOTICE`.

### Vulnerability disclosure

`VDP_ACK_TIME`, `VDP_TRIAGE_TIME`, `VDP_UPDATE_INTERVAL`, `VDP_FIX_CRITICAL`,
`VDP_FIX_MEDIUM`, `VDP_DISCLOSURE_WINDOW`, `PGP_KEY_URL`, `PGP_FINGERPRINT`,
`BOUNTY_STATEMENT`, `HALL_OF_FAME`, `SECURITY_TXT_EXPIRES`.

### Statements requiring a yes/no decision

| Placeholder | Decision |
| --- | --- |
| ~~`STUDIO_COOKIE_STATEMENT`~~ | **Resolved.** Verified against `../web.opteryx`: no cookies, no analytics, no third-party tags anywhere. Studio uses `localStorage`/`sessionStorage` only, all strictly necessary or user-requested. Section 2.7 of the privacy notice now lists every key. **No consent banner is required.** |
| `DPO_STATEMENT` | Are you required to appoint a DPO under UK GDPR Art. 37? Probably not, but decide and record it. |
| `CERTIFICATION_STATEMENT` | ISO 27001 / SOC 2 / Cyber Essentials, or state plainly that you hold none. |
| `PENTEST_STATEMENT` | Independent test, or delete the line. |
| `SAST_STATEMENT`, `AUDIT_LOG_CUSTOMER_ACCESS`, `RESIDENCY_OPTIONS`, `AUDIT_ARTEFACTS` | Confirm or delete. |
| `ACCESS_REVIEW_FREQUENCY`, `TRAINING_FREQUENCY`, `VULN_REMEDIATION_SLA` | Set a cadence you will keep. |
| `ABUSE_ACK_HOURS` | Abuse report acknowledgement target. |
| `OPTIONAL` (SLA) | Whether to commit to a latency metric alongside availability. |

---

## Suggested order of work

1. **Company identity and contact addresses.** Everything else is blocked on
   these.
2. **Privacy notice.** Legally mandatory right now. The cookie audit is done and
   the answer was the good one — no banner needed. What remains is company
   identity, the hosting region, and the retention periods.
3. **Terms of service.** The biggest commercial exposure — you are taking money
   with no contract. Note that
   [`cost-model.md`](../docs-site/content/docs/core-concepts/cost-model.md)
   currently reads as billing terms but has no contractual force and no
   price-change mechanism; Section 6.7 of the Terms fixes that, and the two
   need to stay consistent.
4. **AUP.** Short, and it is what lets you suspend an abusive Free-tier account
   defensibly.
5. **DPA + sub-processor list.** Needed the first time a customer with a
   procurement process asks. The sub-processor list has to be verified against
   real infrastructure, not assumed.
6. **Retention, security overview, VDP, support policy, security.txt.** No
   lawyer needed; these are statements of fact about how you operate. Their only
   requirement is that they are true.
7. **SLA last.** Do not commit to a number you cannot measure. Until then, say
   Free has no SLA and Paid service levels are available on request.

## A note on Annex 2 and the security overview

Two documents contain claims about controls that are **in place**: Annex 2 of
the DPA, and the security overview. Both are drafted from what the product
documentation implies, which is not the same as what is deployed.

Delete anything not true today rather than leaving it aspirational. An
overstatement in Annex 2 is a misrepresentation to every customer who signs the
DPA, and the security overview is read by people whose job is to check.
