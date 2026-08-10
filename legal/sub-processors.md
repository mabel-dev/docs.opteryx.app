---
title: Sub-processors
status: DRAFT — must be verified against actual infrastructure before publication
effective: "{{EFFECTIVE_DATE}}"
version: "1.0-draft"
---

# Sub-processors

**Last updated: {{EFFECTIVE_DATE}}**

This page lists the third parties that {{LEGAL_ENTITY}} engages to process
personal data in providing the Opteryx service, as required by Section 5 of the
[Data Processing Addendum](./data-processing-addendum.md).

> **Before publishing:** every row below must be checked against what is
> actually deployed, and any provider not in use must be deleted. A
> sub-processor list that names a provider you do not use — or omits one you do
> — is a breach of the DPA you have given every customer. Confirm in particular
> the hosting regions, the payment processor, and the email/support tooling,
> none of which are determinable from the documentation repository.

## How to be notified of changes

We give **{{SUBPROCESSOR_NOTICE_DAYS}} days' notice** before adding or replacing
a sub-processor. Subscribe at {{SUBPROCESSOR_SUBSCRIBE_URL}} to receive those
notices. You may object on reasonable data protection grounds — see DPA
section 5.3.

---

## Infrastructure sub-processors

These process Customer Data — the datasets you load into the service.

| Sub-processor | Role | Data processed | Location | Transfer mechanism |
| --- | --- | --- | --- | --- |
| Google Cloud Platform (Google Cloud EMEA Ltd / Google LLC) | Compute, object storage, container hosting, networking for the Opteryx platform | All Customer Data; service metadata | {{HOSTING_REGION}} | {{TRANSFER_MECHANISM — UK adequacy where data stays in the UK/EEA; UK Addendum to SCCs otherwise}} |
| {{ADDITIONAL_INFRA_PROVIDER — delete if none}} | | | | |

## Service sub-processors

These process account, billing, support and operational metadata — **not** the
contents of your datasets.

| Sub-processor | Role | Data processed | Location | Transfer mechanism |
| --- | --- | --- | --- | --- |
| Stripe (Stripe Payments Europe Ltd / Stripe Inc.) | Card collection and processing, payment method storage | Billing contact details, billing address, card details (collected directly by Stripe), transaction records | Ireland / United States | UK Addendum to SCCs {{— confirm against your signed Stripe DPA}} |
| Atlassian (Statuspage) | Public status page and incident subscriber notifications at `status.opteryx.app` | Subscriber email addresses (self-supplied); no customer data | United States | UK Addendum to SCCs |
| {{EMAIL_PROVIDER}} | Transactional and service notification email | Recipient name and email address, message content | {{EMAIL_PROVIDER_LOCATION}} | {{EMAIL_PROVIDER_TRANSFER}} |
| {{SUPPORT_TOOL}} | Support ticketing and correspondence | Name, email address, support correspondence, any data you include in a ticket | {{SUPPORT_TOOL_LOCATION}} | {{SUPPORT_TOOL_TRANSFER}} |
| {{ERROR_MONITORING}} | Application error and performance monitoring | Technical diagnostics, IP address, user identifier | {{ERROR_MONITORING_LOCATION}} | {{ERROR_MONITORING_TRANSFER}} |

## Identity providers — not sub-processors

When you sign in with Google or GitHub, you authenticate **directly with that
provider**. They act as independent controllers for that authentication, under
their own privacy notices, and are not our sub-processors. We receive your name,
email address and provider account identifier as a result.

The same applies where your organisation uses its own SSO identity provider.

## Corporate affiliates

{{AFFILIATE_STATEMENT — list any group companies that access personal data in
providing or supporting the service, or state "None." if {{LEGAL_ENTITY}} has no
affiliates involved in processing.}}

## Change history

| Date | Change | Notice given |
| --- | --- | --- |
| {{EFFECTIVE_DATE}} | Initial publication | n/a |
