import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Cost Model

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Overview

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Cost Components

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
# Cost Model

Prices are shown in GBP.

## Plans

- **Free** — 1 GB storage and 10 GB of query data per month included at no charge.
- **Paid** — includes the Free allowance; additional usage is billed monthly as follows:
  - Storage: £0.04 per GB per month
  - Queries: £1 per 1,000 queries
  - Queried data transfer: £10 per queried TB
- **Enterprise** — contact sales for custom pricing and volume discounts.

## Billing rules

- The Free plan allowance is applied first; paid usage is only for consumption above the included limits.
- Charges are calculated per calendar month and invoiced in GBP.

## Examples

- If you store 5 GB in a month on the Paid plan: 1 GB free + 4 GB charged → 4 × £0.04 = £0.16 for storage.
- If you run 12,000 queries in a month: 12,000 − 10,000 free (example allowance only applies to data, not query count) → billed according to plan; consult billing portal for query allowances tied to plans.

## Notes

- Costing examples are indicative. The billing portal provides exact usage and charges.
- For Enterprise agreements or GBP currency rounding/policies, contact sales or your account manager.
### I/O Cost
