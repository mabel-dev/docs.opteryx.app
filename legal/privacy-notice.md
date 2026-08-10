---
title: Privacy Notice
status: DRAFT — requires legal review before publication
effective: "{{EFFECTIVE_DATE}}"
version: "1.0-draft"
---

# Privacy Notice

**Effective date: {{EFFECTIVE_DATE}}**

This notice explains how **{{LEGAL_ENTITY}}** ("Opteryx", "we", "us") collects
and uses personal data, and what rights you have. It is provided under Articles
13 and 14 of the UK GDPR.

## Two different roles

It matters which of these applies to you:

- **When we run the Opteryx service**, we are the **controller** for account,
  billing, support and security data about the people who use it. That is what
  this notice covers.
- **When you load your own data into a Workspace**, we are a **processor**
  acting on your instructions. If that data contains personal data, you are the
  controller and you decide why it is processed. Our obligations there are set
  out in the [Data Processing Addendum](./data-processing-addendum.md), not in
  this notice. We do not access the contents of your datasets except as
  described in section 4 below.

If you are an individual whose personal data appears **inside** a customer's
dataset, we are not the controller of it — please contact that organisation.
We will assist them in responding to you.

---

## 1. Who we are

{{LEGAL_ENTITY}}, company number {{COMPANY_NUMBER}}, registered at
{{REGISTERED_ADDRESS}}.

Contact for privacy matters: **{{PRIVACY_EMAIL}}**.

{{DPO_STATEMENT — either name your Data Protection Officer and contact details,
or delete this line if you are not required to appoint one under UK GDPR
Art. 37}}

## 2. What we collect

### 2.1 Account and identity data

You sign in through Google or GitHub, or through your organisation's single
sign-on. We receive from that provider:

- your name and email address;
- your provider account identifier;
- your profile image, where the provider supplies one.

We do not receive or store your password for those providers.

We also store the username you choose, your workspace and organisation
memberships, and the access grants configured for you.

### 2.2 Billing data

Billing account details, billing contact name and email, billing address, VAT
number where supplied, invoices and payment history.

**Payment card details are collected and processed directly by Stripe.** The
card form in Opteryx Studio is a Stripe-hosted element served from Stripe's own
domain; card numbers are sent to Stripe and never reach our servers. We store
only Stripe's payment method identifier and limited metadata — the card brand
and last four digits — so we can show you which card is attached.

### 2.3 Usage and metering data

To operate and bill the service we record: query counts, bytes scanned, storage
volumes, query timing and resource consumption, job status, and the workspace
and user each of these is attributed to.

We also log query text. Query text is metadata about how you use the service,
but it can contain personal data if you write it into a filter or literal — see
section 8 on how long we keep it.

### 2.4 Technical and security data

IP address, user agent, timestamps, API endpoint and response status,
authentication and token-issuance events, and audit records of permission
changes. We use these for security, abuse prevention, debugging and capacity
planning.

### 2.5 Support and correspondence

Messages you send us, and records of support requests and their resolution.

### 2.6 Customer Data

The datasets you upload. As explained above, we handle these as a processor.

### 2.7 Cookies and browser storage

**We set no cookies, and we run no analytics, advertising or tracking scripts —
on `opteryx.app`, in Opteryx Studio, or on `docs.opteryx.app`.** There is no
Google Analytics, no product analytics, and no third-party tag of any kind.

Studio does store information in your browser's `localStorage` and
`sessionStorage`. UK law (PECR regulation 6) treats that the same way as
cookies, so here is what is stored and why:

| Stored item | Where | Purpose |
| --- | --- | --- |
| `opteryx_access_token`, `opteryx_auth_token`, `opteryx_token_expires_at`, `opteryx_access_token_issued_at`, `opteryx_session_info` | `sessionStorage` | Keeping you signed in for the current session |
| `opteryx_refresh_token`, `opteryx_auth_token` | `localStorage` | Keeping you signed in across sessions |
| `opteryx-theme` | `localStorage` | Remembering light/dark preference |
| `opteryx_last_query`, query history, `opteryx_row_limit`, `opteryx_plan_details_expert`, editor layout and chart settings | `localStorage` | Remembering your work and preferences in the SQL editor between visits |

All of these are **strictly necessary for, or directly requested as part of,
the service you have asked for**, so no consent banner is required. None is used
to track you, build a profile, or share anything with a third party.

Two things worth knowing:

- **Your recent query text is stored in your own browser.** If you type personal
  data into a query, it stays in that browser's storage until cleared. Sign out,
  or clear site data, on a shared machine.
- **Signing out clears these items.** You can also clear them at any time
  through your browser's site-data controls, though clearing the authentication
  items signs you out.

## 3. Why we use it, and our legal basis

| Purpose | Data used | Legal basis (UK GDPR Art. 6) |
| --- | --- | --- |
| Create and administer your account | Account, identity | Contract — Art. 6(1)(b) |
| Provide the service and execute your queries | Account, usage, Customer Data | Contract — Art. 6(1)(b) |
| Meter usage, invoice and collect payment | Billing, usage | Contract — Art. 6(1)(b) |
| Comply with tax, accounting and legal duties | Billing, correspondence | Legal obligation — Art. 6(1)(c) |
| Secure the service, detect and prevent abuse | Technical, usage | Legitimate interests — Art. 6(1)(f): keeping a multi-tenant service secure and available |
| Diagnose faults and improve reliability and performance | Technical, usage | Legitimate interests — Art. 6(1)(f): operating and improving a service our customers rely on |
| Respond to support requests | Correspondence, account | Contract / Legitimate interests |
| Send service and incident notices | Account, billing contact | Contract / Legitimate interests |
| Send marketing about our products | Account | Consent — Art. 6(1)(a), withdrawable at any time |

Where we rely on legitimate interests, we have assessed that our interest is not
overridden by your rights. You can ask us for that assessment at
{{PRIVACY_EMAIL}}, and you can object under section 7.

We do not carry out automated decision-making producing legal or similarly
significant effects, and we do not carry out profiling.

## 4. When we access the contents of your data

We do not routinely read Customer Data. Our staff access dataset contents only:

- where you ask us to, in order to diagnose a problem you have reported;
- where necessary to investigate a security incident or a credible report of a
  breach of the [Acceptable Use Policy](./acceptable-use-policy.md); or
- where we are legally compelled to.

Such access is limited to authorised personnel, is logged, and is limited to
what the purpose requires.

## 5. Who we share it with

- **Sub-processors and service providers** — hosting, payment processing, email
  delivery, status page and support tooling. The current list, with each
  provider's role and location, is published at
  [Sub-processors](./sub-processors.md).
- **Identity providers** — Google or GitHub, at the point you sign in. Their
  handling of your data is governed by their own privacy notices.
- **Professional advisers** — accountants, auditors and lawyers, under duties of
  confidentiality.
- **Authorities** — where required by law, court order, or to establish,
  exercise or defend legal claims. Where we are legally permitted, we will tell
  you before disclosing.
- **A successor** — if we are involved in a merger, acquisition or sale of
  assets, subject to this notice continuing to apply.

**We do not sell personal data, and we do not use Customer Data to train machine
learning models.**

## 6. International transfers

The service is hosted in {{HOSTING_REGION}}. Some sub-processors are located
outside the UK, including in the United States.

Where personal data is transferred outside the UK, we rely on one of: UK
adequacy regulations; the UK International Data Transfer Addendum to the EU
Standard Contractual Clauses; or the UK Extension to the EU–US Data Privacy
Framework where the recipient is certified. We carry out transfer risk
assessments where required. The legal mechanism for each sub-processor is noted
in the [sub-processor list](./sub-processors.md).

You can request a copy of the relevant safeguards at {{PRIVACY_EMAIL}}.

## 7. Your rights

Under UK GDPR you have the right to: **access** your personal data; have
inaccurate data **rectified**; have data **erased**; **restrict** processing;
**object** to processing based on legitimate interests or to direct marketing;
receive your data in a portable format; and **withdraw consent** at any time
where processing is based on consent.

To exercise any of these, email **{{PRIVACY_EMAIL}}**. We will respond within
one month, extendable by two further months for complex requests, and we will
tell you if we need the extension. We do not charge, unless a request is
manifestly unfounded or excessive.

We may need to verify your identity before acting.

**If your personal data is inside a customer's dataset**, direct your request to
that customer — they are the controller. If you send it to us, we will pass it
on where we can identify them.

**Complaints.** You can complain to the Information Commissioner's Office at
[ico.org.uk](https://ico.org.uk), by calling 0303 123 1113, or by writing to
Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF. We would appreciate the
chance to address your concern first.

## 8. How long we keep it

| Data | Retention |
| --- | --- |
| Account and identity data | For the life of the account, then {{ACCOUNT_RETENTION}} after closure |
| Customer Data (your datasets) | Per the [Data Retention and Deletion Policy](./data-retention-and-deletion.md) |
| Billing records and invoices | 6 years from the end of the accounting period (UK tax and Companies Act requirements) |
| Usage and metering records | {{USAGE_RETENTION}} |
| Query text logs | {{QUERY_LOG_RETENTION}} |
| Security and audit logs | {{SECURITY_LOG_RETENTION}} |
| Support correspondence | {{SUPPORT_RETENTION}} |
| Marketing consent records | Until consent is withdrawn, plus {{CONSENT_RECORD_RETENTION}} to evidence withdrawal |

Data in backups persists until the backup rotates out of the cycle described in
the retention policy.

## 9. Security

We describe our security measures in the
[Security Overview](./security-overview.md). No system is perfectly secure, but
we take appropriate technical and organisational measures under UK GDPR
Article 32. If a breach affects your personal data and is likely to result in a
high risk to your rights, we will notify you without undue delay.

## 10. Children

The service is not directed at children and we do not knowingly collect personal
data from anyone under 18. If you believe we have, contact {{PRIVACY_EMAIL}} and
we will delete it.

## 11. Changes

We may update this notice. Material changes will be notified by email or in the
service before they take effect. The current version, with its effective date,
is always published at {{PRIVACY_URL}}. Previous versions are available on
request.
