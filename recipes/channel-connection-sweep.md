# Recipe: Channel connection sweep

**Goal**: Review which social platforms you have connected to PostNext,
spot gaps against your brand strategy, and (optionally) connect the
missing ones — all in one conversation. Supported platforms: X,
Instagram, LinkedIn, Threads, TikTok.

**Time**: ~60 seconds for the review. Each new channel connection takes
another ~30 seconds (OAuth in the browser).

**Plan needed**: any plan. The review is read-only; adding new channels
consumes one of your plan's channel slots. See
[pricing](https://postnext.io/pricing) for current channel-slot counts.

---

## The prompt

> Use the `channel-sweep` prompt. Which platforms am I connected to, which
> am I missing, and which should I prioritize based on my brand profile?

That single line drives the whole sweep.

## What Claude does under the hood

1. **Invokes the `channel-sweep` prompt** — pulls the workflow template
2. **Reads `postnext://channels/connected`** — lists every social handle
   tied to the active team
3. **Reads `postnext://account/summary`** — current plan + how many
   channel slots are left
4. **Reads `postnext://brand-profiles/active`** — your niche, audience
   types, geographic markets, content goals
5. **Compares against MCP-supported platforms**: X, Instagram, LinkedIn,
   Threads, TikTok
6. **Recommends priorities** — for example, an enterprise B2B brand
   gets LinkedIn before TikTok; a Gen-Z creator gets the inverse
7. **Asks if you want to connect any missing ones** — if yes, calls
   `connect_channel` per platform and hands you a one-time OAuth URL
8. **You open the URL, approve in the browser** — the OAuth flow takes
   you back to PostNext, the channel appears in your dashboard, Claude
   confirms

## Expected output shape

```
CONNECTED (3 / 5 supported via MCP)
  X         @yourhandle      ✓ healthy, last post 2d ago
  LinkedIn  /in/you          ✓ healthy
  Threads   @yourhandle      ✓ healthy

NOT CONNECTED (2)
  Instagram  ─ HIGH priority for your brand:
               "Content goals: visual + creator audience"
  TikTok     ─ HIGH priority for your brand:
               "Audience: Gen Z + creators"

Channel slots: 3 used / N available on your plan.

Want me to connect Instagram and TikTok now? (yes/no)
```

If you say yes, Claude calls `connect_channel` for each, gets back a
fresh OAuth URL, and you open them in order. URLs are short-lived —
re-run the tool if a link expires before you click it.

## Variations

**Just the review, no actions**:
> Run `channel-sweep` but don't propose connecting anything. Just show
> me coverage vs strategy.

**Plan-aware**:
> Run `channel-sweep`. Don't recommend platforms beyond my channel slot
> limit — show me what fits.

**Inverse — what should I disconnect?**:
> Look at my connected channels and tell me which I should remove. Use
> `list_connected_accounts` and `get_post_metrics` for the last 30 days
> on each. If anything has near-zero engagement, suggest disconnecting.

## Why this exists

Most creators and small teams pick platforms once at signup and never
revisit. Your brand evolves; your audience shifts; new platforms emerge.
A 60-second conversation that surfaces "you're spending zero time on the
platform your ideal customer actually uses" is high-leverage.

It also catches the inverse: posting to a platform that's eating slot
quota but not pulling weight. PostNext's per-plan channel limits (Free=1,
Basic=5, Pro=15, Business=20) make this a real constraint, not theory.

## Tips

- Re-run quarterly — strategy drifts faster than you think
- The audit reads `BrandProfile.audienceTypes`, `geographicMarkets`,
  `contentGoals` — keep those fresh at
  [postnext.io/brand-profiles](https://app.postnext.io/brand-profiles)
  for sharper recommendations
- OAuth URLs from `connect_channel` are short-lived. If a link goes
  stale, re-run the tool to generate a fresh one
- If you've upgraded plans recently, `get_plan_limits` reflects the new
  slot allowance immediately

## Related

- [Weekly content plan](weekly-content-plan.md) — once you have the right
  channels, plan content for them
- [PostNext channels page](https://postnext.io/channels) — see all 6
  supported platforms and their connect pages
- [PostNext pricing](https://postnext.io/pricing) — channel slots per
  plan
