# Federator

`federator` is a platform-managed system identity, not a person. It exists so that automated, long-running platform operations aren't tied to any individual's account - two things run under it today:

- **The identity a materialized view can be pinned to.** By default, a materialized view refreshes with the permissions of whoever created it (`ALTER MATERIALIZED VIEW ... OWNER TO` moves this later). Pinning a view to a person's account instead means every refresh breaks the moment that person's access changes or they leave the org. Pointing it at `federator` instead gives the view a **long-term identity whose own permissions are managed in the workspace like anyone else's**, independent of who wrote the defining query:

  ```sql
  ALTER MATERIALIZED VIEW analytics.sales.daily_totals OWNER TO federator;
  ```

- **The identity the platform's compaction service writes as.** Background compaction periodically merges a table's small files into fewer, larger ones (you'll see this as a `Compaction: <strategy>, N files → 1 file` commit on a dataset's history). Compaction rewrites the table's storage, so it needs write access to whatever it's compacting - `federator` is what that access is granted to.

## It's a grant, not a special case

`federator` gets its access the exact same way a person does - a role on a resource pattern via the [Control API](/docs/reference/api/control-api) (see [Security & Permissions](/docs/core-concepts/access-and-permissions)). That means it shows up as an ordinary row in a workspace's access list (`federator - writer - via collection sales`, for example), and its grants can be reviewed, narrowed, or revoked from Manage Access exactly like anyone else's.

This also means access can be **too narrow**: if `federator` doesn't hold write access somewhere, compaction can't run there, and no materialized view in that scope can be pinned to it. Revoking `federator`'s grant on a collection stops both.

## Recognizing it

In the web app, `federator` - and any other platform identity - is marked with a small robot icon next to its name wherever it appears in an access list, so it isn't mistaken for a person's account.
