---
title: Data Retention and Deletion Policy
status: DRAFT — retention periods must be confirmed against implementation
effective: "{{EFFECTIVE_DATE}}"
version: "1.0-draft"
---

# Data Retention and Deletion Policy

**Effective date: {{EFFECTIVE_DATE}}**

This policy explains what happens to data in Opteryx when you delete it, when
you close your account, and how long we keep the records we generate about your
use of the service. It supports Section 10.5 of the
[Terms of Service](./terms-of-service.md), Section 4.8 of the
[Data Processing Addendum](./data-processing-addendum.md), and Section 8 of the
[Privacy Notice](./privacy-notice.md).

---

## 1. Deleting data yourself

### 1.1 What the engine supports

Opteryx does not support row-level `UPDATE` or `DELETE FROM ... WHERE`. This
shapes how deletion works, and it is worth understanding before you rely on it:

| To remove | Use | Required role |
| --- | --- | --- |
| Every row, keeping the table | `TRUNCATE TABLE` | `writer` |
| The table and its history | `DROP TABLE` | `owner` |
| A whole collection | `DROP COLLECTION` | `owner` |
| Specific rows | Rewrite the dataset without them (`CREATE OR REPLACE TABLE`) | `owner` |

Two consequences follow, and both matter for compliance:

- **`writer` can wipe a table.** Because `TRUNCATE TABLE` is the only deletion
  primitive at that tier, there is no append-only grant that is protected from a
  full wipe. Grant `writer` accordingly.
- **Removing rows means rewriting the dataset.** There is no targeted delete. If
  you need to erase specific records — for example to satisfy a data subject
  erasure request — you rewrite the dataset without them.

### 1.2 Versioned datasets and time travel

Where a dataset retains prior versions, those versions remain queryable through
`TIMESTAMP AS OF` and **continue to count toward your storage usage and
charges**.

This means rewriting a dataset does not on its own remove the earlier data: the
prior version still exists and can still be read. To erase records completely
you must also remove the retained versions that contain them.

Retained versions are removed {{VERSION_RETENTION — describe the actual
behaviour: automatic expiry after N days, retention of the last N versions,
manual expiry only, or a support request}}.

### 1.3 When deleted data actually goes

| Stage | Timing |
| --- | --- |
| Removed from query results | Immediately on completion of the statement |
| Underlying storage reclaimed | {{STORAGE_RECLAIM_PERIOD}} |
| Removed from backups | On expiry of the backup cycle — up to {{BACKUP_RETENTION}} |

Data persists in backups until those backups rotate out. We do not selectively
delete individual records from backups; where a deletion request is satisfied by
a live-system deletion, the backup copy expires on the ordinary schedule and is
not restored into production in the interim.

## 2. Closing your account

| Stage | Timing | What happens |
| --- | --- | --- |
| Closure requested | Day 0 | Access ends. Workspaces are locked. Data is retained but not queryable. |
| Grace period | {{GRACE_PERIOD}} | You may ask us to reinstate the account and recover your data. Storage charges {{GRACE_BILLING — continue to accrue / are suspended}}. |
| Deletion | End of grace period | Customer Data is deleted from live systems. |
| Backup expiry | + {{BACKUP_RETENTION}} | Backup copies expire on the ordinary rotation. |

**Export before you close.** You are responsible for exporting Customer Data
before closure. After the grace period, we cannot recover it. Export options are
described in the Documentation.

**Immediate deletion.** You may request deletion without waiting out the grace
period by writing to {{PRIVACY_EMAIL}} from the billing account contact address.
We will confirm when live-system deletion is complete.

**Deletion certificate.** On request, we will provide written confirmation of
deletion.

## 3. What we retain after closure, and why

Some records survive account closure because we are legally required to keep
them, or need them to defend claims. These are minimised to what the purpose
requires.

| Record | Retained for | Basis |
| --- | --- | --- |
| Invoices, payment records, VAT records | 6 years from the end of the accounting period | Companies Act 2006; VAT Act 1994 record-keeping |
| Usage and metering data underlying invoices | {{USAGE_RETENTION}} | Billing accuracy and dispute resolution |
| Account identity (name, email, account identifier) | {{ACCOUNT_RETENTION}} | Fraud prevention; defence of legal claims |
| Security and audit logs | {{SECURITY_LOG_RETENTION}} | Security investigation; legal obligation |
| Query text logs | {{QUERY_LOG_RETENTION}} | Debugging, abuse detection, capacity planning |
| Support correspondence | {{SUPPORT_RETENTION}} | Service history; defence of legal claims |
| Suppression records (do-not-contact) | Indefinite | Necessary to honour your objection to marketing |

We do not retain the **contents** of Customer Data after deletion for any of
these purposes.

## 4. Operational logs

| Log | Retention |
| --- | --- |
| Application and infrastructure logs | {{APP_LOG_RETENTION}} |
| Access and authentication logs | {{ACCESS_LOG_RETENTION}} |
| Query text and query plans | {{QUERY_LOG_RETENTION}} |
| Error and diagnostic traces | {{ERROR_LOG_RETENTION}} |

Query text may contain personal data if you write values into predicates —
`WHERE email = 'someone@example.com'` puts an email address in the log. Bind
values through parameters where your client supports it if this concerns you.

## 5. Backups

- **Frequency:** {{BACKUP_FREQUENCY}}
- **Retention:** {{BACKUP_RETENTION}}
- **Encryption:** encrypted at rest
- **Location:** {{BACKUP_LOCATION}}
- **Restore testing:** {{RESTORE_TEST_FREQUENCY}}

Backups exist for disaster recovery, not as a customer-facing recovery service.
We do not restore individual datasets from backup on request except as a
goodwill measure, and cannot guarantee it. **Maintain your own copies of data
you cannot afford to lose** — see Section 12.4 of the Terms of Service.

## 6. Data subject erasure requests

If you are a customer and need to erase an individual's records from your
datasets, follow Section 1. We will assist under Section 4.5 of the DPA.

If you are an individual and your data is inside a customer's dataset, we are
the processor, not the controller — contact that organisation. If you contact us
and we can identify them, we will forward your request. See Section 7 of the
[Privacy Notice](./privacy-notice.md).

## 7. Legal holds

Where data is subject to a legal hold, court order, or a live regulatory or law
enforcement request, we may suspend deletion for as long as required. We will
tell you where we are legally permitted to.

## 8. Changes

Material changes to retention periods will be notified in accordance with
Section 15 of the Terms of Service.
