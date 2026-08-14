# Cost Model

Opteryx charges for what you use. Every account gets a free allowance, and you
pay only for usage beyond it — small workloads generally stay inside the free
allowance and cost nothing.

## Free allowance

How much you get depends on whether you've set up billing. Setting it up gives
you five times as much, and lets you go over the allowance instead of being cut
off when you reach it.

| | Without billing set up | With billing set up |
|---|---|---|
| Storage | 5 GB at any one time | 25 GB at any one time |
| Queries | 100 a day | 500 a day |
| Data queried | 167 MB a day (about 5 GB a month) | 835 MB a day (about 25 GB a month) |

**Your allowance resets every day, and doesn't roll over.** A quiet day doesn't
earn you a bigger allowance tomorrow. Each day is counted on its own, so a
single heavy day can be chargeable even when the month is quiet overall.

**The allowance belongs to the account, not to each person.** Everyone working
under a billing account shares one allowance across every workspace — ten people
on one account share one allowance between them, rather than getting one each.
The five-times figure is flat: an account with fifty users gets the same
allowance as an account with two.

If you haven't set up billing, the smaller allowance is yours alone and you
can't be charged anything. When you reach it, further usage is blocked until the
allowance resets the next day.

## Prices

Usage beyond your free allowance is charged at:

| | Price |
|---|---|
| Storage | £0.00003 per GB per hour (about £0.02 per GB a month) |
| Queries | £0.10 per 1,000 queries |
| Data queried | £0.001 per GB (£1 per TB) |

Monthly figures on this page are rough guides based on a 30-day month. Billing
is worked out day by day, so the length of a calendar month never changes what
you get or what you pay.

## Plans

- **Free** — no billing set up. The smaller allowance at no charge; usage above
  it is blocked rather than billed.
- **Paid** — billing set up. Five times the allowance, with usage above it
  charged at the prices above.
- **Enterprise** — custom pricing and volume discounts. Contact sales.

## How usage is measured

**Storage** — the total size of all datasets in your workspaces. We check your
storage once an hour and compare each check against your allowance on its own.
If you're 1 GB over the allowance for three hours, you pay for 1 GB for those
three hours and nothing for the other twenty-one. Your allowance isn't a pot you
draw down over the day or the month; it's the level above which you're charged
at each check.

**Queries** — the number of queries you run. Queries that read no data still
count, because they still use compute.

**Data queried** — the total amount of data read from your datasets while
running your queries.

For versioned datasets, every retained version counts toward your storage.
Maintenance work such as compaction or cleanup can change how your data is
stored, so the amount of data a query reads may change over time.

1 GB = 1,000,000,000 bytes.

## Billing terms

- Every user belongs to a single billing account, which receives one
  consolidated invoice each month covering all usage under it.
- Your free allowance is applied to each day's usage first. You're charged only
  for what exceeds it that day.
- The full daily allowance is available on every day your account exists,
  including the day you create it — it isn't reduced for a partial first day.
- Charges accrue daily and are invoiced monthly in GBP.
- Usage is rounded up to the next whole unit (10.1 GB is billed as 11 GB), and
  charges are rounded up to the nearest penny (£0.01).
- All prices are exclusive of VAT and any other applicable taxes, which are
  added where required by law.
