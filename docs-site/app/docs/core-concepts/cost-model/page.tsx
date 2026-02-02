import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Cost Model

## Overview

Opteryx uses a simple, usage-based pricing model.
You pay only for the resources you consume, with a Free allowance included each month.

All prices are shown in GBP.

## Plans

- **Free** — includes 1 GB storage, 10 GB of queried data per calendar month, and 500 queries per day, available at no charge.
- **Paid** — includes the Free allowance (per billing account); additional usage is billed monthly as follows:
	- Storage: £0.00004 per GB per hour (~£0.03 per GB per month)
	- Queries: £1 per 10,000 queries
	- Queried data: £0.005 per GB (equivalent to £5 per TB)
- **Enterprise** — contact sales for custom pricing and volume discounts.

## Billing rules

- The Free plan allowance is applied first; paid usage is only billed for consumption above the included limits.
- The full Free allowance is available for each calendar month, regardless of when during the month an account is created.
- Charges are calculated per calendar month and invoiced in GBP.
- Usage is rounded up to the next whole unit (e.g., 10.1 GB is billed as 11 GB).
- Charges are rounded up to the nearest penny (£0.01).
- Billing accounts can have multiple projects; the Free allowance is shared across all projects under the same billing account.
- If a billing account is not configured, usage is capped at the Free plan limits and additional usage is blocked rather than billed.
- Queries that scan zero bytes of data still count toward query limits, as they consume compute resources even when no data is read.
- Units: 1 GB = 1,000,000,000 bytes
- Prices exclude VAT or other applicable taxes, which will be added where required by law.

## Examples

**Storage**
If you store 5 GB for a full month on the Paid plan:
- 1 GB free
- 4 GB billable
- Rounded up to 4 GB
- = 4 x £0.03 = £0.12 for storage

**Queried data**  
If your queries process 120 GB of data in a month:
- 10 GB free
- 110 GB billable
- Rounded up to 110 GB
- = 110 x £0.005 = £0.55

**Queries**  
If you run 600 queries a day (18,000 in a month):
- 3,000 billable queries
- Rounded up to 1 billing unit
- = 1 x £1 = £1.00

## Notes

- Costing examples are indicative. The billing portal provides exact usage and charges.
- Data maintenance (for example, compaction, or cleanup) can change the size or layout of stored data; as a result, the amount of data processed by queries may vary over time and may be different after maintenance.
- For versioned datasets, each retained version of a dataset counts toward storage usage and is included in storage charges.
- For Enterprise agreements or GBP currency rounding/policies, contact sales or your account manager.

`
  return <DocRenderer source={source} />
}
