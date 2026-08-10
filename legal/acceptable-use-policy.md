---
title: Acceptable Use Policy
status: DRAFT — requires legal review before publication
effective: "{{EFFECTIVE_DATE}}"
version: "1.0-draft"
---

# Acceptable Use Policy

**Effective date: {{EFFECTIVE_DATE}}**

This Acceptable Use Policy (the "**AUP**") governs your use of the Opteryx
hosted service and forms part of the [Terms of Service](./terms-of-service.md).
Capitalised terms have the meanings given there.

The AUP exists for two reasons. Opteryx is a **multi-tenant service running on
shared compute**, so one account's behaviour can degrade every other account's
experience. And Opteryx **stores and queries data you supply**, so we need a
clear basis on which to act when that data or its use is unlawful.

This policy applies to the hosted service only. It does not apply to the
open source Opteryx engine, which you may run on your own infrastructure under
its own licence.

---

## 1. Prohibited content

You must not upload to, store in, or process through the Service any data that:

- is unlawful in {{JURISDICTION}}, or unlawful in the jurisdiction from which
  you access the Service;
- you do not have the rights or lawful basis to process, including personal data
  processed without a valid legal basis;
- infringes copyright, trade marks, database rights, trade secrets or other
  intellectual property rights;
- constitutes child sexual abuse material, or content that sexualises minors;
- promotes terrorism or violent extremism, or incites violence against any
  person or group;
- is defamatory, harassing, or constitutes an unlawful invasion of privacy;
- contains malware, exploit code, or other material designed to damage or gain
  unauthorised access to any system; or
- consists of special category personal data (as defined by UK GDPR Article 9),
  payment card data subject to PCI DSS, or protected health information, unless
  you have separately agreed appropriate terms with us in writing.

## 2. Prohibited conduct

You must not, and must not permit any Authorised User to:

**Security and access**

- attempt to gain unauthorised access to the Service, to another customer's
  Workspace, or to any account, system or network connected to the Service;
- probe, scan or test the vulnerability of the Service except as expressly
  permitted by the
  [Vulnerability Disclosure Policy](./vulnerability-disclosure-policy.md);
- circumvent or attempt to circumvent authentication, rate limiting, quota
  enforcement, workspace isolation, or the access-control model described in the
  Documentation;
- share, resell or publish credentials, API tokens or client secrets;
- interfere with or disrupt the integrity or performance of the Service or the
  data it contains.

**Resource use**

- use the Service for cryptocurrency mining, distributed computation unrelated
  to data analysis, or any workload whose primary purpose is to consume compute
  rather than to query data;
- use the Service primarily as bulk file storage or as a content distribution
  network, rather than as a query engine over data you analyse;
- create multiple accounts, Billing Accounts or Workspaces in order to obtain
  additional Free plan allowances, or otherwise evade quotas, rate limits or
  billing;
- run automated query loads that materially degrade the Service for other
  customers, or issue queries at a rate that a reasonable operator would regard
  as abusive;
- deliberately construct queries whose purpose is to exhaust memory, provoke
  engine faults, or trigger denial of service.

**Legal and commercial**

- resell, sublicense, or provide the Service to third parties as a standalone
  service, except as expressly agreed in writing;
- use the Service to build a competing query service, or to benchmark it for
  publication without our prior written consent;
- use the Service to send unsolicited commercial communications, or to support
  phishing, fraud or any deceptive practice;
- misrepresent your identity or affiliation, or impersonate any person or
  organisation;
- use the Service in breach of applicable export control or sanctions law.

## 3. Reasonable use of the Free plan

The Free plan is provided for evaluation, learning, personal projects and small
workloads. Published Free plan allowances are technical ceilings, not a licence
to consume the full allowance by automated means for no analytical purpose. We
may apply additional rate limits to Free plan accounts, and may withdraw Free
plan access where usage is inconsistent with these purposes.

## 4. Security expectations for your account

You are expected to:

- treat API tokens, client secrets and personal access tokens as passwords, and
  rotate them if exposed;
- grant Workspace roles on the principle of least privilege — note in particular
  that, as described in the Documentation, the `writer` role includes
  `TRUNCATE TABLE`, so `writer` is not an append-only grant;
- remove access for Authorised Users promptly when they leave your organisation;
- report suspected compromise of your account to {{SECURITY_EMAIL}} without
  undue delay.

## 5. Reporting abuse

To report content or conduct that breaches this policy, email
**{{ABUSE_EMAIL}}** with the Workspace or dataset identifier where known, a
description of the issue, and your contact details. We aim to acknowledge
reports within {{ABUSE_ACK_HOURS}} hours.

Rights holders reporting alleged infringement should include sufficient detail
to identify the material and a statement of their good-faith belief that the use
is not authorised.

## 6. Enforcement

Where we determine that this policy has been breached, we may take any of the
following steps, proportionate to the seriousness of the breach:

1. **Contact you** and ask you to remedy the issue;
2. **Throttle or rate-limit** the offending workload;
3. **Restrict or remove** access to specific datasets or Workspaces;
4. **Suspend** the account under Section 10.4 of the Terms of Service;
5. **Terminate** the account for material breach;
6. **Report** the matter to law enforcement or a relevant authority where we
   believe a criminal offence has occurred.

We will normally contact you first and give you an opportunity to remedy the
breach. We may act immediately and without prior notice where the breach
involves unlawful content, an active security threat, a risk to other customers,
or where we are required to act by law.

Where we act without prior notice, we will tell you what we have done and why as
soon as reasonably practicable, and will restore access promptly once the cause
is resolved. To appeal an enforcement decision, write to {{LEGAL_EMAIL}}.

## 7. Changes

We may update this policy to address new forms of abuse or changes in law.
Material changes will be notified in accordance with Section 15 of the Terms of
Service. The current version is always published at {{AUP_URL}}.
