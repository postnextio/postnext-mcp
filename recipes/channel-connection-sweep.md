# Recipe: Channel connection sweep

**Goal**: Review which social platforms you have connected to PostNext,
spot stale and missing ones, and (optionally) connect the missing ones,
all in one conversation. Platforms supported over MCP: X (twitter),
Instagram, LinkedIn, Threads, TikTok.

**Time**: ~60 seconds for the review. Each new channel connection takes
another ~30 seconds (OAuth in the browser).

**Plan needed**: any plan. The review is read-only; each connected
channel takes one of your plan's channel slots (Free has 1). See
[pricing](https://postnext.io/pricing) for current channel-slot counts.

---

## The prompt

> Use the `channel-sweep` prompt.

That single line drives the whole sweep.

## What Claude does under the hood

1. **Invokes the `channel-sweep` prompt**: pulls the workflow from the
   server
2. **Calls `list_connected_accounts`**: every social account tied to the
   active team, with `connected` and `lastSyncAt`
3. **Calls `list_teams`**: so you know which team is being audited
4. **Compares against the MCP-supported platforms**: X, Instagram,
   LinkedIn, Threads, TikTok
5. **Flags stale channels**: `connected: false`, or not synced for more
   than 7 days
6. **Calls `get_plan_limits`**: how many channel slots you have left
7. **Reports Connected / Stale / Missing**, one line per platform, and
   proposes `connect_channel` for the gaps. It waits for you to say
   which ones ("connect tiktok"); if you're at your slot cap it flags the
   limit instead
8. **You open the URL, approve in the browser**: the OAuth flow takes
   you back to PostNext and the channel shows up in
   `list_connected_accounts`

## Expected output shape

```
CONNECTED (3 / 5 supported via MCP)
  X         @yourhandle      ok, synced 2d ago
  LinkedIn  /in/you          ok
  Threads   @yourhandle      ok

STALE (0)

MISSING (2)
  Instagram
  TikTok

Channel slots: 3 used / N available on your plan.

Want me to connect Instagram and TikTok? Say "connect instagram" etc.
```

If you say yes, Claude calls `connect_channel` for each, gets back a
fresh OAuth URL, and you open them in order. URLs expire (the tool
returns `expiresAt`); re-run the tool if a link expires before you
click it.

## Variations

**Just the review, no actions**:
> Run `channel-sweep` but don't propose connecting anything. Just show
> me what's connected, stale and missing.

**Prioritize against your brand**:
> Run `channel-sweep`, then read `postnext://brand-profiles/active` and
> tell me which missing platform fits my themes and audience best.

**Inverse: what should I disconnect?**:
> Look at my connected channels and tell me which I should remove. Use
> `get_channel_analytics` with `period: 30d` for each platform. If
> anything has near-zero engagement, suggest disconnecting.

## Why this exists

Most creators and small teams pick platforms once at signup and never
revisit. A 60-second check surfaces connections that have quietly gone
stale and platforms you could add.

It also catches the inverse: a platform that's taking a channel slot but
not pulling weight. Per-plan channel limits (Free 1, Basic 5, Pro 15,
Business 20; trials get fewer) make this a real constraint.

## Tips

- Re-run quarterly
- A stale channel usually needs re-authorizing: run `connect_channel`
  for that platform again
- `connect_channel` URLs are short-lived. If a link goes stale, re-run
  the tool to generate a fresh one
- If you've upgraded plans recently, `get_plan_limits` reflects the new
  slot allowance immediately

## Related

- [Weekly content plan](weekly-content-plan.md): once you have the right
  channels, plan content for them
- [PostNext pricing](https://postnext.io/pricing): channel slots per
  plan
