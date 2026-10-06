# Prompt reference

MCP prompts are named, server-side workflows. Each one returns a fixed
set of step-by-step instructions that ship with the PostNext server, so
they're versioned and curated, not generated on the fly. Claude then
carries the steps out with the PostNext tools.

PostNext exposes 4 prompts. All are free to invoke on every plan, but
the tools they call may hit your quota.

| Name | What it does | Arguments |
|---|---|---|
| `weekly-plan` | Propose 5 to 10 drafts for the coming week, grounded in your brand profile | None |
| `draft-thread` | Draft a 5 to 10 post thread from a topic or URL | `topic_or_url` (required) |
| `audit-queue` | Walk scheduled posts, flag duplicates / overload / gaps | `days_ahead` (optional, default 7) |
| `channel-sweep` | Audit connected, stale and missing channels | None |

---

## `weekly-plan`

**Arguments**: none.

**Workflow** (as the prompt instructs):
1. Calls `get_plan_limits` to confirm you have AI credits and posting is
   allowed; stops and tells you if not
2. Reads `postnext://brand-profiles/active` for voice, themes, hashtags
3. Calls `list_connected_accounts` to see active platforms
4. Calls `list_scheduled_posts` (limit 50) to see what is already queued
   in the next 14 days
5. Proposes 1 to 2 drafts per active platform, 5 to 10 in total, spread
   Monday to Friday at 9am or 2pm local, skipping platforms that already
   have a post queued that week
6. Shows every proposal (platform, time, full text) in one message before
   any tool call
7. Calls `create_post_draft` only after you confirm ("create them"), and
   schedules only if you also say "and schedule them"

**Invoke**:

```
Use the weekly-plan prompt.
```

**Full recipe**: [recipes/weekly-content-plan.md](../recipes/weekly-content-plan.md)

---

## `draft-thread`

**Arguments**:
- `topic_or_url` (string, required, min 2 chars): a topic to draft
  from, or a URL to draft commentary on

**Workflow** (as the prompt instructs):
1. Calls `get_plan_limits`; stops if AI credits are exhausted
2. Reads `postnext://brand-profiles/active` for voice + themes
3. Drafts a thread of 5 to 10 posts: Twitter (the default) at 280
   characters per post, or 4,000 / 25,000 if you say you have Premium /
   Premium+; Threads at 500 characters per post. Only one platform
   unless you confirm both
4. Shows the full thread numbered 1/N before any tool call
5. Calls `create_post_draft` (one per platform requested) only after you
   say "create it", with a stable `clientRequestId` so retries are
   idempotent

The server has no separate thread type. `create_post_draft` takes a
single `content` string of up to 2,200 characters, so the whole numbered
thread is saved as the text of one draft per platform. Review it in the
draft's `dashboardUrl` before scheduling.

The prompt does not fetch URLs itself. If you pass a URL, whether Claude
can read the page depends on your client's own web tools.

**Invoke**:

```
Use the draft-thread prompt with topic_or_url:
"How to evaluate an MCP server: 7 questions"
```

Or with a URL:

```
Use the draft-thread prompt with topic_or_url:
"https://example.com/your-source-article"
```

**Full recipe**: [recipes/thread-from-article.md](../recipes/thread-from-article.md)

---

## `audit-queue`

**Arguments**:
- `days_ahead` (number, sent as a string on the wire, optional, default
  7, min 1, max 30): how many days forward to audit

**Workflow** (explicitly read-only):
1. Calls `list_scheduled_posts` with `limit: 100`, filters client-side
   to posts scheduled within `days_ahead` days from now
2. Calls `get_post` for any flagged item that needs full body context
3. Flags three classes:
   - **Duplicates**: topic overlap >70% within any 24h window
   - **Overload**: >3 posts to the same platform on the same calendar
     day
   - **Gaps**: >48h with no posts on any platform
4. Outputs a 3-section summary (Duplicates / Overload / Gaps), with
   postId, scheduledAt, platform and a one-line reason per item
5. **Does not propose changes**: the user must explicitly ask Claude
   to mutate the queue afterwards

**Invoke**:

```
Use the audit-queue prompt with days_ahead: 14.
```

> **Gotcha**: MCP wire protocol passes `prompts/get` arguments as
> strings. Numeric args (`days_ahead: 14`) are sent as strings (`"14"`)
> on the wire; the server schema coerces them back. You don't have to do
> anything special: just pass the number naturally and it works.

**Full recipe**: [recipes/audit-scheduled-queue.md](../recipes/audit-scheduled-queue.md)

---

## `channel-sweep`

**Arguments**: none.

**Workflow** (as the prompt instructs):
1. Calls `list_connected_accounts` and `list_teams` (to show which team
   is being audited)
2. Compares against the five MCP-supported platforms (twitter,
   instagram, linkedin, threads, tiktok) and identifies missing platforms
   and stale channels (`connected: false`, or `lastSyncAt` older than 7
   days)
3. Calls `get_plan_limits` to see how many channel slots are left
4. Outputs a 3-section summary: Connected / Stale (need re-auth) /
   Missing (could add), one line per platform
5. Proposes `connect_channel` for each missing or stale channel but does
   not call it until you say so ("connect twitter")
6. If you're at your channel cap, flags the limit instead of proposing
   new connections

**Invoke**:

```
Use the channel-sweep prompt.
```

**Full recipe**: [recipes/channel-connection-sweep.md](../recipes/channel-connection-sweep.md)

---

## Workflow safety

Every PostNext prompt that *might* mutate state includes an explicit
"wait for my confirmation" or "do not call X yet" instruction in its
workflow text. This means:

- `weekly-plan` proposes the drafts, waits for approval, then creates them
- `draft-thread` writes the thread, waits, then creates the draft
- `channel-sweep` recommends, waits, then generates the auth URL

`audit-queue` is the only one explicitly marked read-only. Its steps
call only read tools.

These instructions are part of the prompt text the server returns on
`prompts/get`. They guide Claude; they are not enforced by the server.
A tool call still runs if the client makes it.

## Live catalog

The canonical, always-up-to-date prompt list is the server's
`prompts/list` response. Argument schemas come from `prompts/list` per
prompt.

Reference docs at [postnext.io/mcp/docs](https://postnext.io/mcp/docs).
