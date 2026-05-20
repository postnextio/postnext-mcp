# Recipe: Draft a thread from an article

**Goal**: Read a URL (article, blog post, your own product update) and turn
it into a 5–10 post thread in your brand voice — ready to schedule on X or
Threads.

**Time**: ~90 seconds. Output lands as a draft in your
[PostNext dashboard](https://app.postnext.io).

**Plan needed**: any paid plan. Threads consume one post-quota slot
regardless of segment count.

---

## The prompt

> Use the `draft-thread` prompt with this URL:
> https://example.com/your-source-article
>
> Make it 7 posts, optimized for X. Keep my brand voice. Add a soft CTA at
> the end pointing to my landing page.

Or even shorter:

> Draft a thread from https://example.com/article in my voice.

Either form works — `draft-thread` is a [named MCP
prompt](https://postnext.io/mcp/docs#prompts) that handles the workflow.

## What Claude does under the hood

1. **Invokes the `draft-thread` prompt** — pulls the multi-step workflow
2. **Reads `postnext://brand-profiles/active`** — your voice, themes,
   personality traits
3. **Fetches the URL** — uses Claude's built-in web fetch to read the source
   (this part doesn't go through PostNext MCP)
4. **Extracts the 5–10 strongest points** — re-ranked by what fits your
   brand voice and themes, not the source author's emphasis
5. **Drafts each segment** — respecting standard platform character limits,
   structured so the first post pulls people in and the last delivers the
   CTA. (X Premium / Premium+ users get longer per-post limits at publish
   time; the draft can store the long form.)
6. **Shows you the full thread** — you approve, request edits, or kill it
7. **Calls `create_post_draft`** — with `platform: "twitter"` and
   `content` as an **array** of segments (the thread shape), tying it to
   the X channel handle from `list_connected_accounts`

The draft appears in your [PostNext drafts
list](https://app.postnext.io/drafts) as a single PostGroup with a thread
attached. Nothing publishes until you schedule it.

## Expected output shape

```
Thread preview (7 posts):

1/7 [HOOK]
> Most "MCP tutorials" miss the one thing that actually matters: …
> (236 chars)

2/7
> The protocol itself is boring. The interesting question is …
> (272 chars)

3/7 … etc

7/7 [CTA]
> If you build with Claude and want to schedule social posts from
> conversation, postnext.io/mcp covers all 6 platforms.
> (158 chars)

Draft created: 6a0c4117bc2e3849b34c74d7
Review at https://app.postnext.io/drafts/6a0c4117bc2e3849b34c74d7
```

## Variations

**From a competitor article (commentary thread)**:
> Read https://competitor.com/article and write a thread that respectfully
> disagrees with their main thesis. Use my brand voice — direct but not
> snarky.

**From your own blog post (distribution thread)**:
> Distill https://yourblog.com/post into an 8-post X thread. End with a
> "read the full piece" link to that URL.

**For Threads instead of X**:
> Same prompt, but draft for Threads. Use the platform's longer-form vibe
> — no character pressure, more whitespace.

**Multi-platform variant**:
> Draft this as a 7-post X thread AND a single 1 800-char LinkedIn version.
> Create both drafts.

## Tips

- A thread counts as **one** post against your quota, not one per
  segment
- Long X drafts (4 000 or 25 000 chars for Premium / Premium+) are
  accepted by the MCP — the draft stores whatever you write. The publish
  step is where per-tier limits actually enforce
- The first post drives 90% of impressions on X. If you don't like the
  hook, ask Claude to redraft just post 1: "rewrite post 1 with a
  contrarian framing"
- Don't paste in a transcript or summary — paste the **URL**. Claude
  reading the source itself produces meaningfully better threads than
  re-summarizing your summary

## Related

- [Weekly content plan](weekly-content-plan.md) — for breadth, not depth
- [PostNext X scheduler](https://postnext.io/x-scheduler) — see what
  publishing looks like once scheduled
- [PostNext Threads scheduler](https://postnext.io/threads-scheduler)
