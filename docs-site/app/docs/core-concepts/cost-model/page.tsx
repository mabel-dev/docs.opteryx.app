import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Cost Model

## Overview

Opteryx uses a simple, usage-based pricing model.
You pay only for the resources you consume, with a Free allowance included each month.

## Unit definitions

- **Storage** — the amount of data stored in your Opteryx workspaces, measured in gigabytes (GB). Storage is calculated hourly based on the total size of all datasets in your workspace.
- **Queries** — the number of individual query executions performed in your workspace.
- **Queried data** — the total amount of data processed by all queries executed in your workspace, measured in gigabytes (GB). This includes all data read from datasets during query execution.

## Currency and units

All prices are shown in GBP, exclusive of VAT or other applicable taxes.

1 GB = 1,000,000,000 bytes.

## Plans

- **Free** — includes 5 GB storage, 5 GB of queried data per calendar month, and 500 queries per day, available at no charge.
- **Paid** — includes the Free allowance (per billing account); additional usage is billed monthly as follows:
	- Storage: £0.00003 per GB per hour (~£0.02 per GB per month)
	- Queries: £1 per 10,000 queries
	- Queried data: £0.001 per GB (equivalent to £1 per TB)
- **Enterprise** — contact sales for custom pricing and volume discounts.

## Billing terms

- User accounts are associated with a single billing account. All costs accrued by a user are collected under their associated billing account, which receives a single consolidated invoice each month.
- The Free plan allowance is applied first; paid usage is only billed for consumption above the included limits.
- The full Free allowance is available for each calendar month, regardless of when during the month an account is created.
- Charges are calculated per calendar month and invoiced in GBP.
- Usage is rounded up to the next whole unit (e.g., 10.1 GB is billed as 11 GB).
- Charges are rounded up to the nearest penny (£0.01).
- Billing accounts can have multiple workspaces; the Free allowance is shared across all workspaces under the same billing account.
- If a billing account is not configured, usage is capped at the Free plan limits and additional usage is blocked rather than billed.
- Queries that scan zero bytes of data still count toward query limits, as they consume compute resources even when no data is read.
- Prices exclude VAT or other applicable taxes, which will be added where required by law.
- Data maintenance (for example, compaction, or cleanup) can change the size or layout of stored data; as a result, the amount of data processed by queries may vary over time and may be different after maintenance.
- For versioned datasets, each retained version of a dataset counts toward storage usage and is included in storage charges.

`
  return <DocRenderer source={source} />
}
