---
title: Security Overview
status: DRAFT — every claim must be true before publication
effective: "{{EFFECTIVE_DATE}}"
version: "1.0-draft"
---

# Security Overview

**Last updated: {{EFFECTIVE_DATE}}**

This page describes how we secure the Opteryx hosted service, for customers
evaluating us and for security teams reviewing us.

It is about **our** security posture as an operator. For how the product's
permission model works — roles, grants, workspace boundaries — see
[Security & Permissions](https://docs.opteryx.app/docs/core-concepts/access-and-permissions)
in the documentation.

> **Before publishing:** delete every claim below that is not true today. A
> trust page is read by people whose job is to check, and an overstatement here
> is a misrepresentation that follows you into every contract and every
> questionnaire. An honest short page beats an aspirational long one. Sections
> marked with a placeholder need a real answer or removal.

---

## Product security

**Tenant isolation.** Workspaces are the isolation boundary. Every query and API
call is authorised server-side against the grants configured for the calling
principal — authorisation is not delegated to the client.

**Access model.** Roles (`reader`, `writer`, `owner`) are granted over resource
patterns covering `collection.dataset`. Roles are hierarchical: `owner` implies
`writer` implies `reader`. A separate `admin` role governs policy administration
only and confers no query access on its own.

Two schemas are handled specially: `public.*` is read-only for every principal
and cannot be granted write access; `personal.<username>.*` is accessible only
to its owning user and cannot be granted to anyone else.

Destructive operations sit above the tier that might be expected:
`CREATE OR REPLACE TABLE`, `DROP`, and `ALTER TABLE ... CLUSTER BY` all require
`owner`, because their blast radius matches `DROP` rather than `INSERT`.
`ALTER WORKSPACE` requires a grant matching the workspace name itself — a
workspace-wide `workspace.*` grant does not confer it.

**Authentication.** Interactive access is via OAuth 2.0 / OpenID Connect through
Google, Microsoft and GitHub. Enterprise SSO is supported where your identity
provider enforces access policy. We never receive or store your identity
provider password.

Programmatic access uses client credentials exchanged for short-lived bearer
tokens at `authenticate.opteryx.app`. Client secrets are displayed once at
creation and stored hashed. Tokens can be revoked from Studio.

**Encryption.** TLS {{TLS_VERSION}} or higher for all API and web traffic.
Encryption at rest for datasets, backups and metadata via
{{ENCRYPTION_AT_REST_DETAIL}}.

**Audit logging.** Authentication events, token issuance, permission grants and
revocations, and administrative actions are logged.
{{AUDIT_LOG_CUSTOMER_ACCESS — state whether customers can retrieve their own
audit logs, and how; remove this claim if they cannot.}}

## Infrastructure

**Hosting.** The service runs on Google Cloud Platform in {{HOSTING_REGION}}.
We inherit GCP's physical and environmental controls; their compliance
certifications are published by Google.

**Network.** {{NETWORK_CONTROLS — describe perimeter controls, private
networking between services, and whether anything is publicly reachable that
should not be.}}

**Secrets management.** {{SECRETS_MANAGEMENT — e.g. Google Secret Manager, with
rotation policy.}}

**Availability.** Operational status is published at `status.opteryx.app`,
hosted independently of our infrastructure so it stays up when we do not.

## Resilience and disaster recovery

| | |
| --- | --- |
| Backup frequency | {{BACKUP_FREQUENCY}} |
| Backup retention | {{BACKUP_RETENTION}} |
| Backup encryption | Encrypted at rest |
| Backup location | {{BACKUP_LOCATION}} |
| Restore testing | {{RESTORE_TEST_FREQUENCY}} |
| Recovery time objective (RTO) | {{RTO}} |
| Recovery point objective (RPO) | {{RPO}} |

Backups serve disaster recovery, not customer-facing restore. Customers should
maintain independent copies of data they cannot afford to lose.

{{DR_TEST_STATEMENT — state when the disaster recovery plan was last exercised,
or remove this section's claim to testing.}}

## Corporate security

**Access to production.** Least-privilege, role-based, granted on documented
business need and reviewed {{ACCESS_REVIEW_FREQUENCY}}. Multi-factor
authentication is required. Access is revoked as part of offboarding.

**Customer data access.** We do not routinely access the contents of customer
datasets. Access occurs only for support you have requested, security incident
investigation, or where legally compelled — and is logged. See Section 4 of the
[Privacy Notice](./privacy-notice.md).

**Personnel.** Confidentiality obligations in all staff and contractor
agreements. Background screening where lawful. Security and data protection
training on joining and {{TRAINING_FREQUENCY}} thereafter.

**Endpoints.** {{ENDPOINT_CONTROLS — disk encryption, screen lock, patching,
and how managed.}}

## Secure development

- Version-controlled source with code review before merge to the main branch.
- Automated dependency vulnerability scanning, with
  {{VULN_REMEDIATION_SLA}} remediation targets for high and critical findings.
- {{SAST_STATEMENT — static analysis and secret scanning in CI, or remove.}}
- Separation of development, staging and production environments.
- Infrastructure defined as code and deployed through an automated pipeline.

{{PENTEST_STATEMENT — if you have had an independent penetration test, state
when and by whom, and that a summary is available under NDA. If you have not,
delete this line rather than implying one.}}

## Incident response

We maintain a documented incident response process covering detection,
triage, containment, eradication, recovery and post-incident review.

**Customer notification.** Where a security incident affects your data, we
notify you without undue delay and in any event within **48 hours** of becoming
aware, per Section 4.7 of the
[Data Processing Addendum](./data-processing-addendum.md). Notifications
describe what happened, what data was affected, what we have done, and what you
should do.

**Regulatory notification.** Where required, we notify the Information
Commissioner's Office within 72 hours under UK GDPR Article 33.

**Service incidents** (availability rather than security) are communicated
through `status.opteryx.app` as described in the
[SLA](./service-level-agreement.md).

## Compliance

**Data protection.** We process personal data under the UK GDPR and the Data
Protection Act 2018. Our [Data Processing Addendum](./data-processing-addendum.md)
is available to all customers, with sub-processors published at
[Sub-processors](./sub-processors.md).

{{CERTIFICATION_STATEMENT — list any certifications actually held (ISO 27001,
SOC 2, Cyber Essentials). If none, say so plainly: "We do not currently hold
formal security certifications." Customers respect that answer; they do not
respect discovering it later.}}

**Data residency.** Customer Data is stored in {{HOSTING_REGION}}.
{{RESIDENCY_OPTIONS — state whether region choice is available, or that it is
not.}}

## Reporting a vulnerability

See our [Vulnerability Disclosure Policy](./vulnerability-disclosure-policy.md).
Report security issues to **{{SECURITY_EMAIL}}**.

## Security questionnaires and due diligence

For security reviews, questionnaires or an NDA-covered documentation pack,
contact {{SECURITY_EMAIL}}.

## Your responsibilities

Security is shared. You are responsible for:

- treating API tokens and client secrets as passwords, and rotating them if
  exposed;
- granting workspace roles on least privilege — remembering that `writer`
  includes `TRUNCATE TABLE` and is therefore not an append-only grant;
- removing access for users who leave your organisation;
- enforcing MFA at your identity provider;
- ensuring you have a lawful basis for the data you upload; and
- maintaining your own copies of critical data.
