# Cost Model

Opteryx uses a simple, usage-based pricing model.
You pay only for the resources you consume, with a Free allowance included.

**Allowances are daily.** Every meter is assessed against a daily allowance, and
an allowance you do not use is not carried forward — a quiet day does not earn
you a larger allowance tomorrow. See [Free allowance](#free-allowance).

## Unit definitions

- **Storage** — the amount of data stored in your Opteryx workspaces, measured in gigabytes (GB). Storage is sampled hourly based on the total size of all datasets in your workspace, and those samples are totalled into a daily figure.
- **Queries** — the number of individual query executions performed in your workspace.
- **Queried data** — the total amount of data processed by all queries executed in your workspace, measured in gigabytes (GB). This includes all data read from datasets during query execution.

## Currency and units

All prices are shown in GBP, exclusive of VAT or other applicable taxes.

1 GB = 1,000,000,000 bytes.

## Free allowance

An allowance belongs to a **billing account**, not to a user or a workspace. It
is shared across every workspace and every user under that account: ten people
working in one billing account share one allowance between them, they do not get
one each.

A user who is not attached to a billing account is their own billing account for
this purpose, and receives a full allowance of their own. Such a user cannot
incur charges — usage above the allowance is blocked rather than billed.

A billing account with billing configured receives **five times the base
allowance** — the base being the unbilled-user figures in the first column
below — so that bringing several users together under one account is not
penalised.

| Meter | Unbilled user (base) | Billing account (billing configured) |
|---|---|---|
| Storage | 5 GB of storage at any time (up to 120 GB-hours per day) | 25 GB of storage at any time (up to 600 GB-hours per day) |
| Queries | 100 queries per day | 500 queries per day |
| Queried data | 0.167 GB per day (approximately 5 GB per month) | 0.835 GB per day (approximately 25 GB per month) |

The five-times allowance is a flat figure. It does not scale with the number of
users on the account: an account with fifty users receives the same allowance as
an account with two.

The storage allowance is a threshold, not a quantity you spend. Storage is
sampled every hour, and each sample is compared against the threshold on its
own: you are charged for whatever that sample exceeds the threshold by. Staying
under it for all 24 samples costs nothing, which is where the daily GB-hour
figures above come from — but the allowance is not a pool of GB-hours to use as
you like, so storing 120 GB for a single hour is chargeable.

Two rules follow from the allowance being daily, and both matter:

- **Unused allowance is not carried forward.** Each day starts with the same
  allowance regardless of what you used the day before. Ten quiet days do not
  accumulate into a larger allowance on the eleventh.
- **Usage is assessed day by day, not pooled across the month.** A single heavy
  day can be billable even if your total for the month is below the monthly
  approximation, because that day's usage is measured against that day's
  allowance.

Monthly figures on this page are illustrations only, calculated on a 30-day,
720-hour month. Nothing in the billing arithmetic is denominated in months, so
the length of any particular calendar month does not change what you are
allowed or what you are charged.

## Plans

- **Free** — the unbilled-user daily allowance above, at no charge. Usage above it is blocked rather than billed.
- **Paid** — includes the billing account daily allowance above, at five times the base figures; additional usage is billed as follows:
	- Storage: £0.00003 per GB per hour (approximately £0.02 per GB per month, on a 720-hour month)
	- Queries: £0.1 per 1,000 queries
	- Queried data: £0.001 per GB (equivalent to £1 per TB)
- **Enterprise** — contact sales for custom pricing and volume discounts.

## Billing terms

- User accounts are associated with a single billing account. All costs accrued by a user are collected under their associated billing account, which receives a single consolidated invoice each month.
- The Free allowance is applied first, to each day's usage; paid usage is only billed for consumption above that day's included limits.
- The Free allowance is applied per day and does not accumulate. An allowance that goes unused on one day is not available on any later day.
- The full daily allowance is available on every day an account exists, including the day it is created — it is not reduced for a partial first day.
- Charges accrue daily and are invoiced monthly in GBP.
- Usage is rounded up to the next whole unit (e.g., 10.1 GB is billed as 11 GB).
- Charges are rounded up to the nearest penny (£0.01).
- Billing accounts can have multiple workspaces and multiple users; the allowance is shared across all of them and is not granted per workspace or per user.
- A billing account with billing configured receives five times the base allowance on every meter. This is a flat multiple and does not vary with the number of users on the account.
- If a billing account is not configured, the user is treated as their own billing account and receives the base allowance. Usage is capped at that allowance and additional usage is blocked rather than billed.
- Queries that scan zero bytes of data still count toward query limits, as they consume compute resources even when no data is read.
- Prices exclude VAT or other applicable taxes, which will be added where required by law.
- Data maintenance (for example, compaction, or cleanup) can change the size or layout of stored data; as a result, the amount of data processed by queries may vary over time and may be different after maintenance.
- For versioned datasets, each retained version of a dataset counts toward storage usage and is included in storage charges.

