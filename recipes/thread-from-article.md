# Recipe: Draft a thread from an article

**Goal**: Turn an article, blog post or your own product update into a
5 to 10 post thread in your brand voice, saved as a draft for X or
Threads.

**Time**: ~90 seconds. Output lands as a draft in PostNext; the tool
returns a `dashboardUrl` link to it.

**Plan needed**: any plan, including Free. Each `create_post_draft`
call uses 1 AI credit (Free includes 10 a month).

---

## The prompt

> Use the `draft-thread` prompt with this URL:
> https://example.com/your-source-article
>
> Make it 7 posts, optimized for X. Keep my brand voice. Add a soft CTA at
> the end pointing to my landing page.

Or even shorter:

> Draft a thread from https://example.com/article in my voice.

The first form uses `draft-thread`, a [named MCP
prompt](https://postnext.io/mcp/docs#prompts) that handles the workflow.

## What Claude does under the hood

1. **Invokes the `draft-thread` prompt**: pulls the multi-step workflow
2. **Calls `get_plan_limits`**: stops if you're out of AI credits
3. **Reads `postnext://brand-profiles/active`**: your voice, themes,
   personality traits
4. **Reads the URL, if your client can**: the prompt doesn't fetch
   anything itself, so this depends on your client's own web tools. If
   it can't, paste the article text instead
5. **Drafts 5 to 10 posts**: 280 characters each for X by default (4,000
   or 25,000 if you say you have Premium / Premium+), 500 for Threads,
   with a concrete hook first and a CTA or question last
6. **Shows you the full thread numbered 1/N**: you approve, request
   edits, or kill it
7. **Calls `create_post_draft`** once per platform after you say
   "create it", with `platform: "twitter"` (or `threads`), the thread as
   `content`, and a stable `clientRequestId`

There is no separate thread type in the MCP. `content` is a single
string of up to 2,200 characters, so the whole numbered thread is saved
as the text of one draft. Keep the total under that cap, and open the
returned `dashboardUrl` to check it before you schedule. Nothing
publishes until you schedule it.

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
> conversation, postnext.io/mcp covers X, Instagram, LinkedIn,
> Threads and TikTok.
> (162 chars)

Draft created: 6a0c4117bc2e3849b34c74d7
Review at https://app.postnext.io/publish/6a0c4117bc2e3849b34c74d7
```

## Variations

**From a competitor article (commentary thread)**:
> Read https://competitor.com/article and write a thread that respectfully
> disagrees with their main thesis. Use my brand voice: direct but not
> snarky.

**From your own blog post (distribution thread)**:
> Distill https://yourblog.com/post into an 8-post X thread. End with a
> "read the full piece" link to that URL.

**For Threads instead of X**:
> Same prompt, but draft for Threads. Up to 500 characters per post.

**Multi-platform variant**:
> Draft this as a 7-post X thread AND a single LinkedIn post of about
> 1,800 characters. Create both drafts.

## Tips

- One draft is one `create_post_draft` call and costs 1 AI credit,
  however many numbered posts it contains
- The draft's `content` is capped at 2,200 characters. A 7-post thread
  at 280 characters each fits; long Premium-length posts will not
- The first post does most of the work on X. If you don't like the
  hook, ask Claude to redraft just post 1: "rewrite post 1 with a
  contrarian framing"
- If your client can read web pages, paste the **URL** rather than your
  own summary. Claude working from the source usually produces a better
  thread

## Related

- [Weekly content plan](weekly-content-plan.md): for breadth, not depth
- [PostNext X scheduler](https://postnext.io/x-scheduler): see what
  publishing looks like once scheduled
- [PostNext Threads scheduler](https://postnext.io/threads-scheduler)
