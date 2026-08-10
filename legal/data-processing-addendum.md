---
title: Data Processing Addendum
status: DRAFT — requires legal review before publication
effective: "{{EFFECTIVE_DATE}}"
version: "1.0-draft"
---

# Data Processing Addendum

**Effective date: {{EFFECTIVE_DATE}}**

This Data Processing Addendum ("**DPA**") forms part of the
[Terms of Service](./terms-of-service.md) between **{{LEGAL_ENTITY}}**
("**Processor**", "we") and the Customer ("**Controller**", "you"), and applies
where we process Personal Data on your behalf in providing the Service.

It is entered into to satisfy Article 28(3) of the UK GDPR. Where this DPA
conflicts with the Terms of Service, this DPA prevails in respect of the
processing of Personal Data.

---

## 1. Definitions

"**UK GDPR**", "**Personal Data**", "**Processing**", "**Controller**",
"**Processor**", "**Data Subject**", "**Personal Data Breach**" and
"**Supervisory Authority**" have the meanings given in the UK GDPR.

"**Data Protection Law**" means the UK GDPR, the Data Protection Act 2018, the
Privacy and Electronic Communications Regulations 2003, and any successor or
amending legislation, together with the EU GDPR where it applies to the
processing.

"**Customer Personal Data**" means Personal Data contained within Customer Data.

"**Sub-processor**" means a third party engaged by us to process Customer
Personal Data.

"**Standard Contractual Clauses**" or "**SCCs**" means the clauses approved by
the European Commission under Decision 2021/914; "**UK Addendum**" means the
International Data Transfer Addendum to the SCCs issued by the Information
Commissioner under section 119A of the Data Protection Act 2018.

## 2. Roles of the parties

2.1 You are the Controller and we are the Processor in respect of Customer
Personal Data.

2.2 You are responsible for the lawfulness of the Personal Data you upload,
including having a valid legal basis, providing any required transparency
information to Data Subjects, and obtaining any necessary consents.

2.3 We are an independent Controller in respect of account, billing, security
and usage data about your Authorised Users, as described in our
[Privacy Notice](./privacy-notice.md). This DPA does not apply to that
processing.

## 3. Scope of processing

The details required by Article 28(3) are set out in **Annex 1**.

## 4. Our obligations

We will:

4.1 **Process only on your instructions.** Process Customer Personal Data only
on your documented instructions, including as to international transfers, unless
required to do otherwise by law — in which case we will inform you first unless
that law prohibits it. Your use of the Service, and the configuration you apply
to it, constitute your documented instructions. If we consider an instruction to
infringe Data Protection Law, we will tell you.

4.2 **Not use it for our own purposes.** We will not sell Customer Personal
Data, use it to train machine learning models, or use it for our own purposes.
We may derive aggregated, de-identified statistics that cannot be attributed to
you or to any Data Subject.

4.3 **Ensure confidentiality.** Ensure that personnel authorised to process
Customer Personal Data are bound by confidentiality obligations and have
received appropriate data protection training.

4.4 **Implement security measures.** Implement and maintain the technical and
organisational measures set out in **Annex 2**, appropriate to the risk, as
required by Article 32.

4.5 **Assist with Data Subject rights.** Taking account of the nature of the
processing, assist you by appropriate technical and organisational measures in
responding to Data Subject requests. Where we receive a request directly from a
Data Subject relating to Customer Personal Data, we will not respond to it
ourselves (except to acknowledge and redirect) and will forward it to you
without undue delay.

  **A practical note on erasure.** The Service does not currently support
  row-level `UPDATE` or `DELETE FROM ... WHERE`. Erasing individual records from
  a dataset is therefore achieved by rewriting the dataset without them, and
  by removing retained prior versions where time-travel queries would otherwise
  still surface the erased rows. We will assist you with this. You should factor
  it into your own erasure procedures.

4.6 **Assist with your compliance obligations.** Provide reasonable assistance
with data protection impact assessments, prior consultation with a Supervisory
Authority, and your obligations under Articles 32 to 36, taking into account the
nature of processing and the information available to us.

4.7 **Notify breaches.** Notify you **without undue delay, and in any event
within 48 hours**, after becoming aware of a Personal Data Breach affecting
Customer Personal Data. The notification will describe the nature of the breach,
the categories and approximate volume of data and Data Subjects affected, the
likely consequences, the measures taken or proposed, and a contact point. Where
full information is not available immediately, we will provide it in phases. We
will not notify Data Subjects or a Supervisory Authority on your behalf unless
you ask us to or we are required to.

4.8 **Delete or return data.** At the end of the Service, delete or return
Customer Personal Data at your choice, in accordance with the
[Data Retention and Deletion Policy](./data-retention-and-deletion.md), and
delete existing copies unless required by law to retain them. Backups are
deleted in the ordinary course of the backup rotation described in that policy.

4.9 **Demonstrate compliance.** Make available the information reasonably
necessary to demonstrate compliance with Article 28, and allow for and
contribute to audits under section 7.

## 5. Sub-processors

5.1 **General authorisation.** You give general written authorisation for us to
engage Sub-processors. The current list is published at
[Sub-processors](./sub-processors.md).

5.2 **Notice of changes.** We will give at least **{{SUBPROCESSOR_NOTICE_DAYS}}
days' notice** before adding or replacing a Sub-processor, by
{{SUBPROCESSOR_NOTICE_METHOD}}. You may subscribe to notifications at
{{SUBPROCESSOR_SUBSCRIBE_URL}}.

5.3 **Objection.** You may object on reasonable data protection grounds within
the notice period. We will work with you in good faith to address the objection.
If we cannot, you may terminate the affected part of the Service without penalty
and receive a pro-rata refund of prepaid Fees for the unused period.

5.4 **Flow-down and liability.** We will impose on each Sub-processor data
protection obligations no less protective than those in this DPA, and remain
fully liable to you for their performance.

## 6. International transfers

6.1 Customer Personal Data is hosted in {{HOSTING_REGION}}. Sub-processors may
process it outside the UK, as identified in the sub-processor list.

6.2 Where we transfer Customer Personal Data outside the UK to a country without
adequacy regulations, the transfer is made under the **SCCs as amended by the UK
Addendum**, which are incorporated into this DPA by reference and completed as
follows:

- Module Two (Controller to Processor) applies where you are a Controller;
  Module Three (Processor to Processor) applies where you are a Processor acting
  for a third-party Controller.
- Clause 7 (docking clause): **applies**.
- Clause 9 (sub-processors): **Option 2**, general written authorisation, with
  the notice period in section 5.2.
- Clause 11 (redress): the optional independent dispute resolution body
  language does **not** apply.
- Clause 17 (governing law) and Clause 18 (forum): {{JURISDICTION}}.
- Annexes I, II and III are populated by Annexes 1 and 2 of this DPA and the
  published sub-processor list.
- UK Addendum Table 4: neither party may end the Addendum as set out in
  Section 19 of the Addendum {{— confirm this choice with counsel}}.

6.3 Where the EU GDPR applies to your processing, the SCCs apply in their
unamended form with the equivalent selections, governed by the law of Ireland.

6.4 We will carry out and document transfer risk assessments where required, and
make them available to you on request.

## 7. Audit

7.1 We will make available, on request and no more than once in any 12-month
period, information reasonably necessary to demonstrate compliance with this
DPA, including {{AUDIT_ARTEFACTS — e.g. our security overview, penetration test
summary, and any third-party certifications or reports we hold}}.

7.2 Where that information is not sufficient for you to meet your obligations
under Data Protection Law, you may carry out an audit, on at least 30 days'
written notice, no more than once in any 12-month period (unless required by a
Supervisory Authority or following a Personal Data Breach), during business
hours, subject to confidentiality undertakings, and conducted so as not to
disrupt the Service or compromise other customers' data.

7.3 You bear your own costs and our reasonable costs of supporting an on-site
audit.

## 8. Liability

Each party's liability under this DPA is subject to the exclusions and cap in
Section 12 of the Terms of Service, except to the extent Data Protection Law
prohibits a limitation.

## 9. Term

This DPA takes effect on the effective date and continues while we process
Customer Personal Data. Clauses that by their nature should survive, survive.

---

# Annex 1 — Details of processing (UK GDPR Art. 28(3))

**Subject matter.** Provision of the hosted Opteryx data warehouse and query
service.

**Duration.** For the term of the Terms of Service, plus the retention periods
in the Data Retention and Deletion Policy.

**Nature of the processing.** Receiving, storing, indexing, compacting,
versioning, retrieving, querying, transforming, transmitting, backing up and
deleting Customer Data; and hosting and administering the Service.

**Purpose.** To provide the Service in accordance with the Terms of Service and
your configuration and queries.

**Types of Personal Data.** Determined by you. We do not control what you
upload. It may include any Personal Data present in the datasets you load. You
must not upload special category data, payment card data or health data without
a separate written agreement (see the Acceptable Use Policy, section 1).

For Authorised Users of the Service, we process: name, email address, identity
provider account identifier, profile image, username, workspace and role
assignments, IP address, and authentication and audit events.

**Categories of Data Subject.** Determined by you in respect of Customer Data —
typically your customers, employees, suppliers or other individuals whose
records you analyse. For Service metadata: your Authorised Users and billing
contacts.

**Frequency.** Continuous, for the duration of the Service.

**Retention.** As set out in the Data Retention and Deletion Policy.

**Sub-processors.** As published at [Sub-processors](./sub-processors.md).

**Controller contact.** Your billing account contact, or the data protection
contact you notify to us.

**Processor contact.** {{PRIVACY_EMAIL}}.

---

# Annex 2 — Technical and organisational measures (UK GDPR Art. 32)

> These measures must be verified against what the platform actually implements
> before this DPA is published or signed. Anything below that is aspirational
> rather than in place must be removed — an inaccurate Annex 2 is a
> misrepresentation to every customer who signs.

**Access control**

- Workspace-scoped authorisation with `reader` / `writer` / `owner` roles
  granted over resource patterns; `admin` role scoped to policy administration
  only.
- `public.*` schemas are read-only for all principals; `personal.<username>.*`
  schemas are accessible only to the owning user.
- Authentication via OAuth 2.0 / OpenID Connect through Google, Microsoft and
  GitHub, with enterprise SSO available.
- Short-lived bearer tokens issued from client credentials; secrets displayed
  once at creation and stored hashed.
- Role-based, least-privilege internal access to production, granted on business
  need and reviewed {{ACCESS_REVIEW_FREQUENCY}}.
- Multi-factor authentication required for staff access to production systems.

**Encryption**

- TLS {{TLS_VERSION}} or higher in transit for all API and web endpoints.
- Encryption at rest for stored datasets, backups and metadata using
  {{ENCRYPTION_AT_REST_DETAIL}}.

**Isolation**

- Workspaces are the tenant isolation boundary; authorisation is enforced
  server-side on every query and API call.

**Logging and monitoring**

- Audit logging of authentication events, permission grants and revocations, and
  administrative actions.
- Operational monitoring and alerting, with public status reporting at
  `status.opteryx.app`.

**Resilience and recovery**

- Backups taken {{BACKUP_FREQUENCY}}, retained {{BACKUP_RETENTION}}, restore
  tested {{RESTORE_TEST_FREQUENCY}}.
- Recovery objectives: RTO {{RTO}}, RPO {{RPO}}.

**Organisational**

- Confidentiality obligations in all staff and contractor agreements.
- Background screening for staff with production access, where lawful.
- Data protection and security awareness training on joining and
  {{TRAINING_FREQUENCY}} thereafter.
- Documented incident response process, including breach notification under
  section 4.7.
- Secure development practices, code review, and dependency vulnerability
  scanning.
- Vulnerability disclosure process published at {{VDP_URL}}.
- Documented offboarding process revoking access on termination.
