# Recipe: Audit the scheduled queue

**Goal**: Walk your next N days of scheduled posts and flag duplicates,
platform overload, and posting gaps — *before* anything publishes.

**Time**: ~30 seconds. Read-only. Nothing in your queue changes.

**Plan needed**: any plan, including Free. This recipe doesn't consume AI
credits or post slots; it only reads `list_scheduled_posts`.

---

## The prompt

> Use the `audit-queue` prompt with `days_ahead: 14`. Walk my scheduled
> posts and flag anything off.

Or, even simpler:

> Audit my next 14 days of scheduled posts.

Either form invokes the [named MCP
prompt](https://postnext.io/mcp/docs#prompts) `audit-queue`, which is
explicitly read-only — it will never mutate your queue.

## What Claude does under the hood

1. **Invokes the `audit-queue` prompt** — pulls the multi-step audit
   workflow (server-side instruction, not local heuristics)
2. **Calls `list_scheduled_posts`** with `limit: 100` and filters
   client-side to the next 14 days
3. **For each flagged item, calls `get_post`** if it needs the full body
   to judge similarity or context
4. **Flags three issue classes**:
   - **Duplicates**: topic overlap >70% within any 24h window
   - **Overload**: more than 3 posts to the same platform on the same
     calendar day
   - **Gaps**: >48 hours with no posts on any platform
5. **Reports a 3-section summary** — per item shows postId, scheduledAt,
   platform, and a one-line reason
6. **Stops there.** The prompt instructs Claude *not* to propose
   changes unless you ask. If you want to act, you say so.

## Expected output shape

```
AUDIT — Next 14 days
====================

Duplicates (2):
  • postId 6a0c41…d7 + 6a0c41…e9
    Both scheduled Mon 09:00 X and Tue 10:30 X
    Topic overlap: "MCP launch announcement" — >85% similar
  • postId 6a0c42…1a + 6a0c42…2b
    Both Threads, scheduled 3h apart, same hashtag set

Overload (1):
  • Thu Jun 19: 5 X posts queued (09:00, 11:00, 13:00, 15:00, 17:00)
    Recommended max: 3/day on a single platform

Gaps (1):
  • Sat Jun 14 → Mon Jun 16 (52h)
    No posts on any platform across the weekend

Healthy patterns:
  - LinkedIn: 1 post/weekday, well-spaced
  - Instagram: 3 posts this week, all visual content
```

## Variations

**Quick weekly check**:
> Audit my next 7 days.

**Specific platform**:
> Audit my X queue for the next 21 days. Ignore other platforms.

**Pre-launch sanity check**:
> Audit my next 30 days — I'm running a product launch on the 18th and
> don't want anything off-brand near that date.

**After running the audit, fix it**:
> The two duplicate posts you flagged — keep the Tuesday one and cancel
> the Monday one. Use `cancel_scheduled_post`.

(The audit itself doesn't mutate; you have to explicitly ask Claude to
act, then it switches to `cancel_scheduled_post` or `update_post_draft`.)

## Why this exists

People who schedule 30+ posts in a sitting (using a content plan, agency
client work, batch creation) often ship duplicate-feeling content because
the queue is too long to mentally hold. Tools that auto-flag this don't
exist on most schedulers. PostNext's MCP makes it conversational: "audit
my queue" → done.

## Tips

- Run weekly. Sunday evening before the workweek hits is the canonical
  slot
- The `audit-queue` prompt is **read-only by design** — it's safe to run
  from any account, even a shared agency one, without permission to write
- Combine with [`weekly-content-plan`](weekly-content-plan.md): plan
  Sunday, audit Wednesday mid-week
- Topic-overlap detection is fuzzy (semantic, not exact-match) — Claude
  reads post bodies. If you genuinely want two similar posts spaced apart,
  tell it so and it'll stop flagging that pair

## Related

- [Weekly content plan](weekly-content-plan.md) — the planning side
- [Channel connection sweep](channel-connection-sweep.md) — different
  audit, focused on coverage instead of queue health
- [PostNext queue view](https://app.postnext.io/calendar) — see the same
  data visually
