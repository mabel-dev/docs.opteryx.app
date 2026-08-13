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

The Free allowance is included on every plan, applies per billing account, and is
shared across all workspaces under that account.

| Meter | Daily allowance |
|---|---|
| Storage | 5 GB of storage at any time (up to 120 GB-hours per day) |
| Queries | 100 queries per day |
| Queried data | 0.167 GB per day (approximately 5 GB per month) |

The storage allowance is a threshold, not a quantity you spend. Storage is
sampled every hour, and each sample is compared against the 5 GB threshold on
its own: you are charged for whatever that sample exceeds 5 GB by. Staying
under 5 GB for all 24 samples costs nothing, which is where the figure of 120
GB-hours per day comes from — but the allowance is not a pool of 120 GB-hours
to use as you like, so storing 120 GB for a single hour is chargeable.

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

- **Free** — the daily allowance above, at no charge.
- **Paid** — includes the daily Free allowance (per billing account); additional usage is billed as follows:
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
- Billing accounts can have multiple workspaces; the Free allowance is shared across all workspaces under the same billing account.
- If a billing account is not configured, usage is capped at the Free plan limits and additional usage is blocked rather than billed.
- Queries that scan zero bytes of data still count toward query limits, as they consume compute resources even when no data is read.
- Prices exclude VAT or other applicable taxes, which will be added where required by law.
- Data maintenance (for example, compaction, or cleanup) can change the size or layout of stored data; as a result, the amount of data processed by queries may vary over time and may be different after maintenance.
- For versioned datasets, each retained version of a dataset counts toward storage usage and is included in storage charges.

