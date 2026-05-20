# Prompt reference

MCP prompts are named, server-side workflows. Unlike free-form prompting,
they ship as part of the PostNext server and execute deterministic
multi-step instructions — they're versioned and curated, not generated
on the fly.

PostNext exposes 4 prompts. All are free to invoke on every plan, but
the tools they call internally may hit your quota.

| Name | What it does | Arguments |
|---|---|---|
| `weekly-plan` | Plan + draft a week of posts grounded in brand profile | None |
| `draft-thread` | Draft a 5–10 post thread from a topic or URL | `topic_or_url` (required) |
| `audit-queue` | Walk scheduled posts, flag duplicates / overload / gaps | `days_ahead` (optional, default 7) |
| `channel-sweep` | Review platform coverage vs brand strategy | None |

---

## `weekly-plan`

**Arguments**: none.

**Workflow**:
1. Reads `postnext://brand-profiles/active` for voice + themes
2. Reads `postnext://channels/connected` to discover platforms
3. Calls `get_plan_limits` to size the plan to remaining quota
4. Calls `list_scheduled_posts` to avoid duplicating existing queue
5. Proposes a 7-day outline (typically 1–3 posts/day, mixed platforms)
6. After user approves, calls `create_post_draft` per post
7. Outputs a summary with the draft IDs and `dashboardUrl` for review

**Invoke**:

```
Use the weekly-plan prompt.
```

**Full recipe**: [recipes/weekly-content-plan.md](../recipes/weekly-content-plan.md)

---

## `draft-thread`

**Arguments**:
- `topic_or_url` (string, required, min 2 chars) — a topic to draft
  from, or a URL whose contents Claude will read and turn into a
  thread

**Workflow**:
1. Reads `postnext://brand-profiles/active` for voice
2. If `topic_or_url` is a URL, fetches it (via Claude's built-in web
   fetch, outside PostNext MCP)
3. Drafts a 5–10 post thread, respecting platform char limits
4. Shows the user the full thread for approval
5. After approval, calls `create_post_draft` with a thread shape
   (array of segments under `providers.twitter.content`)
6. Returns the draft `postId` + `dashboardUrl`

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
- `days_ahead` (number → string on the wire, optional, default 7, min 1,
  max 30) — how many days forward to audit

**Workflow** (explicitly read-only):
1. Calls `list_scheduled_posts` with `limit: 100`, filters client-side
   to posts scheduled within `days_ahead` days from now
2. Calls `get_post` for any flagged item that needs full body context
3. Flags three classes:
   - **Duplicates** — topic overlap >70% within any 24h window
   - **Overload** — >3 posts to the same platform on the same calendar
     day
   - **Gaps** — >48h with no posts on any platform
4. Outputs a 3-section summary (Duplicates / Overload / Gaps)
5. **Does not propose changes** — the user must explicitly ask Claude
   to mutate the queue afterwards

**Invoke**:

```
Use the audit-queue prompt with days_ahead: 14.
```

> **Gotcha**: MCP wire protocol passes `prompts/get` arguments as
> strings. Numeric args (`days_ahead: 14`) are JSON-encoded as strings
> (`"14"`) on the wire; the server schema coerces them back. You don't
> have to do anything special — just pass the number naturally and it
> works.

**Full recipe**: [recipes/audit-scheduled-queue.md](../recipes/audit-scheduled-queue.md)

---

## `channel-sweep`

**Arguments**: none.

**Workflow**:
1. Reads `postnext://channels/connected` for current connections
2. Reads `postnext://account/summary` for plan + remaining channel slots
3. Reads `postnext://brand-profiles/active` for audience + content goals
4. Compares against PostNext's MCP-supported platforms (X, Instagram,
   LinkedIn, Threads, TikTok)
5. Recommends priorities — weighted by brand audience + content goals,
   not generic "everyone should be on TikTok"
6. Asks if the user wants to connect any missing platforms
7. If yes, calls `connect_channel` per platform, returns a short-lived
   OAuth URL for the user to open

**Invoke**:

```
Use the channel-sweep prompt.
```

**Full recipe**: [recipes/channel-connection-sweep.md](../recipes/channel-connection-sweep.md)

---

## Workflow safety

Every PostNext prompt that *might* mutate state includes an explicit
"wait for my confirmation" or "do not call X" instruction in its
workflow text. This means:

- `weekly-plan` proposes the outline, waits for approval, then drafts
- `draft-thread` writes the thread, waits, then creates the draft
- `channel-sweep` recommends, asks, then connects

`audit-queue` is the only one explicitly marked read-only — it has no
mutation paths at all.

This guardrail is server-side, not client-trust. If a prompt's workflow
text says "ask the user before mutating," that text is part of the
prompt that gets returned to Claude on `prompts/get` — bypassing it
requires the user to explicitly override.

## Live catalog

The canonical, always-up-to-date prompt list is the server's
`prompts/list` response. Argument schemas come from `prompts/get` per
prompt.

Reference docs at [postnext.io/mcp/docs](https://postnext.io/mcp/docs).
