# Recipe: Weekly content plan

**Goal**: Plan and draft a week of posts across your connected channels,
grounded in your brand voice. No back-and-forth, no copy-paste between tabs.

**Time**: ~3 minutes of conversation. Posts land as drafts in PostNext;
each comes back with a `dashboardUrl` so you can review and schedule.

**Plan needed**: any plan with AI credits left. Each draft uses 1 AI
credit, and Free includes 10 a month, so a full 5 to 10 draft week can
use most or all of a Free allowance. See
[pricing](https://postnext.io/pricing).

---

## The prompt

Paste this into a fresh Claude conversation with [PostNext
MCP](https://postnext.io/mcp) connected:

> Use the `weekly-plan` prompt.

That's it. The named prompt does the heavy lifting.

## What Claude does under the hood

1. **Invokes the `weekly-plan` prompt**: gets the workflow (a server-side
   multi-step instruction set, not just a hint to Claude)
2. **Calls `get_plan_limits`**: checks you have AI credits and that your
   plan allows posting; stops and tells you if not
3. **Reads `postnext://brand-profiles/active`**: your bio, brand voice,
   personality traits, expertise areas, main themes, and preferred hashtags
4. **Calls `list_connected_accounts`**: discovers which platforms you
   can actually post to
5. **Calls `list_scheduled_posts`** (limit 50): sees what's already
   queued in the next 14 days so it doesn't propose duplicates
6. **Proposes 5 to 10 drafts**: 1 to 2 per active platform, spread
   Monday to Friday at 9am or 2pm local, skipping platforms that already
   have something queued that week. Every proposal (platform, time, full
   text) comes in one message
7. **You confirm or edit**: Claude waits for "create them" before
   writing drafts
8. **Calls `create_post_draft` per post**: one draft per proposal, on
   the right channel. It schedules them only if you also say "and
   schedule them"

You can stop at step 7 if you'd rather hand-write the actual copy from
Claude's proposals.

## Expected output shape

```
Mon
  X @yourhandle    | 09:00  Hook about <theme>, 240 chars
  LinkedIn @you    | 14:00  Longer thought on <theme>

Tue
  Instagram @you   | 09:00  Photo caption on <theme>
  Threads @you     | 14:00  Question to the audience on <theme>

… through Fri

8 drafts proposed. Say "create them" to save them as drafts.
```

## Variations

**Plan a specific week**:
> Plan posts for the week of June 16 to 22. Skip Wednesday, I'm out.

**One-platform mode**:
> Plan 5 X-only posts for next week. Don't touch other channels.

**Schedule at your best times** (paid plans):
> After creating the drafts, schedule each one at the best time
> `get_best_time_to_post` suggests for that platform.

**Theme-specific**:
> Plan a week focused on the MCP launch announcement.

## Tips

- Run it on **Sunday evening**. Claude reads your existing queue first,
  so planning from a quiet state is cleaner
- Update your brand profile in the PostNext web app before running this
  if you've drifted off-voice. The resource is read fresh every time
- The drafts land in PostNext untouched; nothing publishes without your
  explicit "schedule" step
- Each created draft costs 1 AI credit. Claude checks `get_plan_limits`
  first so you can pace

## Related

- [Draft a thread from an article](thread-from-article.md): different shape
  (one long thread vs. one-off posts)
- [Audit the scheduled queue](audit-scheduled-queue.md): read-only sanity
  check after planning
- [PostNext pricing](https://postnext.io/pricing): see AI credit limits per
  plan
