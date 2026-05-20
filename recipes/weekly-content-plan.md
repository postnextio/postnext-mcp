# Recipe: Weekly content plan

**Goal**: Plan and draft a full week of posts across your connected channels,
grounded in your brand voice. No back-and-forth, no copy-paste between tabs.

**Time**: ~3 minutes of conversation. Posts land as drafts in your
[PostNext dashboard](https://app.postnext.io); you review and one-click
schedule.

**Plan needed**: a paid plan with available quota. Free can run the
planning conversation but can't create the drafts at the end — see
[pricing](https://postnext.io/pricing).

---

## The prompt

Paste this into a fresh Claude conversation with [PostNext
MCP](https://postnext.io/mcp) connected:

> Use the `weekly-plan` prompt. Plan posts for the next 7 days across all my
> connected channels. Ground everything in my brand profile — voice, themes,
> hashtags. After you've outlined the week, create the drafts in PostNext so
> I can review them before scheduling.

That's it. The named prompt does the heavy lifting.

## What Claude does under the hood

1. **Invokes the `weekly-plan` prompt** — gets the workflow template
   (it's a server-side multi-step instruction set, not just a hint to Claude)
2. **Reads `postnext://brand-profiles/active`** — pulls your bio, brand voice,
   personality traits, expertise areas, main themes, and preferred hashtags
3. **Reads `postnext://channels/connected`** — discovers which platforms you
   can actually post to
4. **Calls `get_plan_limits`** — checks how many AI credits and post slots
   you have left this month so it doesn't overplan
5. **Calls `list_scheduled_posts`** — sees what's already queued so it
   doesn't propose duplicates
6. **Proposes a 7-day outline** — typically 1–3 posts per day, mixed across
   platforms, themed around your brand
7. **You confirm or edit the outline** — Claude waits for your approval
   before writing drafts
8. **Calls `create_post_draft` per post** — writes each one with the right
   channel handle, content shaped for each platform's quirks (X char limit,
   Instagram hashtag conventions, LinkedIn paragraph breaks)

You can stop at step 7 if you'd rather hand-write the actual copy from
Claude's outline.

## Expected output shape

```
DAY 1 (Mon)
  X @yourhandle    | 09:00 — Hook about <theme>, 240 chars [DRAFT]
  LinkedIn @you    | 13:00 — Long-form thought on <theme> [DRAFT]

DAY 2 (Tue)
  Instagram @you   | 10:30 — Carousel idea, 8 slides [DRAFT]
  Threads @you     | 18:00 — Reply-bait question on <theme> [DRAFT]

… etc through DAY 7

Summary: 12 drafts created. Review at https://app.postnext.io/drafts.
You used 12/100 AI credits this month.
```

## Variations

**Plan a specific week**:
> Plan posts for the week of June 16–22. Skip Wednesday — I'm out.

**One-platform mode**:
> Plan 5 X-only posts for next week. Don't touch other channels.

**Auto-schedule everything**:
> After creating the drafts, schedule each one at the best time
> `get_best_time_to_post` suggests for that platform.

**Theme-specific**:
> Plan a week focused on the MCP launch announcement.

## Tips

- Run it on **Sunday evening** — Claude reads your existing queue first, so
  planning from a quiet state is cleaner
- Update your brand profile at
  [postnext.io/brand-profiles](https://app.postnext.io/brand-profiles) before
  running this if you've drifted off-voice — the resource is read fresh
  every time
- The drafts land in your PostNext dashboard untouched; nothing publishes
  without your explicit "schedule" step
- Each generated post counts toward your monthly AI quota — Claude
  shows you `get_plan_limits` early so you can pace

## Related

- [Draft a thread from an article](thread-from-article.md) — different shape
  (one long thread vs. one-off posts)
- [Audit the scheduled queue](audit-scheduled-queue.md) — read-only sanity
  check after planning
- [PostNext pricing](https://postnext.io/pricing) — see AI credit limits per
  plan
