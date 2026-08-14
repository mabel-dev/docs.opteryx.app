# Billing Accounts

A billing account is who pays. Every workspace is registered to exactly one, and all usage in that workspace - storage, queries, queried data, AI requests - is charged to it. See the [Cost Model](/docs/core-concepts/cost-model) for what those units cost.

A billing account is a separate thing from a workspace, and membership of one grants no access to data. Being a member of the billing account that pays for a workspace does not let you query anything in that workspace; that needs a grant, covered in [Security & Permissions](/docs/core-concepts/access-and-permissions).

## Roles and capabilities

| Action | member | billing admin |
| --- | :---: | :---: |
| See the account and which workspaces it pays for | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| See the account's usage and current charges | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Add or change the payment method | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Incur charges against the account | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Edit the account record (name, tax ID, billing address) | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Invite and remove members | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Change another member's role | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Create workspaces billed to the account | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Delete workspaces billed to the account | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Close the account | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |

**member** is the ordinary state: your usage is charged here, and you can see what it is costing. That is the whole of it. A member cannot change what the account says on an invoice, cannot change who else is on it, and cannot create or delete anything. If you are a member and you need something on this list changed, a billing admin has to do it.

The one thing a member can do that looks administrative is **attach a payment method**. That is deliberate: an account with no card can't be charged, so nothing on it can run, and anyone blocked by that should be able to unblock it without waiting for an admin. Adding a card cannot remove one that is already there.

## Two-person rules

Deleting a workspace is guarded in two steps that cannot be taken by the same person:

1. An **owner of the workspace** turns deletion protection off (this is a workspace role, not a billing one - see [Security & Permissions](/docs/core-concepts/access-and-permissions)).
2. A **different** billing admin performs the deletion.

Whoever removed the guard cannot be the one who uses the opening. This is enforced by the service, not just by the UI.

## New accounts

A newly created billing admin cannot create workspaces for the first 24 hours. The account carries a `billing_eligible_at` timestamp and workspace creation is refused until it passes. This is an anti-abuse measure, not a permission error - the rejection is expected, and the web UI says so up front rather than letting you discover it at the point of failure.

## Closing an account

An account can only be closed once no workspaces are billed to it. Each one has to be deleted or reassigned to another billing account first. Closing removes the account and every membership on it; it does not delete data, because by that point there is no workspace left attached to delete.
