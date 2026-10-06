# Tool reference

The PostNext MCP server exposes 34 tools. Gating splits across five
classes:

- **Read-only, free**: usable on every plan. Most reads fit here.
- **Read-only, paid**: `get_account_health` and `get_best_time_to_post`.
  Both return `upgrade_required` to Free callers.
- **Mutating, paid**: `update_post_draft`, `update_brand_profile`,
  `create_blog_plan` (which also uses AI credits) and
  `test_blog_connection`. All return `upgrade_required` on Free.
- **Mutating, quota-gated** (available on Free within its limits):
  `create_post_draft` (1 AI credit), `schedule_post` (your plan must allow
  posting), `connect_channel` (needs a free channel slot), `upload_asset`
  and `request_asset_upload` (storage quota).
- **Mutating, no cost**: `cancel_scheduled_post`, `delete_draft`,
  `set_current_team`, and the three bio-page block writers
  (`add_mini_site_block`, `update_mini_site_block`,
  `remove_mini_site_block`), which additionally require a subscription
  that is not lapsed. Cleanup, navigation and page edits.

The Free plan includes 10 AI credits a month, 10 posts a month, 1 channel
and 10 MB of asset storage. Every paid or quota gate also refuses an
account whose subscription is past_due, unpaid, incomplete or
incomplete_expired, with `upgrade_required` and a hint to fix the payment.
See [postnext.io/pricing](https://postnext.io/pricing) for current limits
per plan.

Every tool returns either `structuredContent` (when `outputSchema` is
declared) or `content` (plain text). Errors surface as `isError: true`;
see [error shapes](#error-shapes) below.

## Account + plan

### `get_plan`

Read-only. Returns the user's tier and display name, `isPaid`, `isTrial`,
`gated` (a paid plan whose subscription has lapsed), subscription status,
`renewsAt`, `trialEndsAt`, `cancelAtPeriodEnd`, currency and an
`upgradeUrl`. Useful for showing "you're on Pro" in agent replies.

### `get_plan_limits`

Read-only. Returns the user's tier and the quota buckets with current
usage: channels, storage (MB) and AI credits, plus `posts`, which is an
on/off flag (`allowed`) rather than a count. Also returns the AI credits
still available, including purchased credit packs. Call this before
mutating tools to predict whether they'll be blocked.

### `get_account_health`

Read-only, **paid plan required**. Returns: connected-account count,
scheduled/published/failed post counts, draft count, and tokens expiring
in the next 7 days, plus a per-platform breakdown. Optional `windowDays`
(7, 30, or 90; default 30) and `platform` filter. Useful for "is my
PostNext set up correctly?" sanity checks.

## Teams

### `list_teams`

Read-only. Lists every team the user belongs to with `teamId`, `teamName`,
and `isCurrent`. Cross-team access requires `set_current_team` first.

### `set_current_team`

Mutating (no quota). Takes `teamId` from `list_teams`; the user must be a
member. Switches the active team for subsequent calls in this session.
With OAuth the choice persists across sessions; with an API key it does
not.

## Channels

### `list_connected_accounts`

Read-only. Returns every social account connected to the active team, each
with `platform`, `handle`, `providerId`, `connected` (true/false) and
`lastSyncAt`. `providerId` survives a handle rename, so pass it back to
`create_post_draft` or `get_channel_analytics` when you can.

### `connect_channel`

Mutating. Takes `platform` (`twitter`, `instagram`, `linkedin`, `threads`
or `tiktok`) and checks you have a free channel slot. Returns an `authUrl`
(with `expiresAt`; re-call the tool if it expires) that the user must open
in a browser to authorize. The OAuth flow finishes the connection; the
channel appears in `list_connected_accounts` afterwards.

## Drafts

### `create_post_draft`

Mutating. Consumes 1 AI credit. Creates a new draft post for one platform.
Requires `platform` and `content` (a single string, 1 to 2,200
characters). Optional: `mediaUrls` (up to 10), `channelName` or
`providerId` to pick the account, `clientRequestId` for idempotent retries
within 5 minutes, and `instagramTrialReel` (`auto` or `manual`, Instagram
single-video drafts only). When several accounts are connected on the
platform and none is named, the call fails with
`channel_resolution_failed` and lists the available handles. There is no
separate thread type: one call creates one draft. Drafts are not
auto-published. Returns `postId` and `dashboardUrl`.

### `update_post_draft`

Mutating, **paid plan required**. Update content/media on an existing
draft (`postId`). At least one of `content` or `mediaUrls` is required.
Optional `platform` (and `channelName`) scopes the update to one platform
or account on a multi-platform cross-post. Optional `clientRequestId`.

### `list_drafts`

Read-only. List of draft posts (`limit` 1 to 100, default 20) with
postId, `platforms`, `channelNames`, content preview, and `dashboardUrl`
per draft.

### `delete_draft`

Mutating (no quota cost). Permanently deletes a draft. Refuses to delete
posts that are scheduled or published; use `cancel_scheduled_post` for
those.

## Schedule

### `schedule_post`

Mutating. Requires a plan that allows posting (Free does). Moves a draft
into the publish queue. Requires `postId` and `scheduledAt` (ISO 8601;
include an offset or `Z`). Optional `timezone` (IANA name), and
`platform` plus `channelName` to queue only one platform or account of a
multi-platform cross-post; with neither, every platform in the post is
queued. A `scheduledAt` more than 5 minutes in the past is rejected.

### `cancel_scheduled_post`

Mutating (no quota cost). Removes a scheduled post from the publish
queue. The underlying draft is preserved. Idempotent: safe on
already-cancelled posts.

### `list_scheduled_posts`

Read-only. List of scheduled posts (`limit` 1 to 100, default 20; optional
`from` timestamp), ordered by scheduledAt, with postId, platforms,
channelName, content preview, scheduledAt and status (pending / queued /
processing / published / partial / failed / cancelled, or `orphaned` when
the post behind a queue entry was deleted).

### `get_publish_status`

Read-only. Diagnoses a single scheduled post: queue state, per-platform
success or error, and the worker's processing time. Returns
`isScheduled: false` for drafts that were never queued. Use when a post
didn't publish when expected.

## Posts (read)

### `get_post`

Read-only. Fetches a single post by `postId`. Returns the full
provider-by-platform content map plus status, timestamps, and
`dashboardUrl`, a clickable link to view the post in the PostNext app.

### `search_posts`

Read-only. Case-insensitive text search across the user's draft,
scheduled, and published posts. Requires `query` of 3 to 200 characters.
Filters: `status` (DRAFT, SCHEDULED, PUBLISHED, FAILED, CANCELLED),
`platform`, `limit` (1 to 100, default 20).

### `get_post_metrics`

Read-only. Fetches engagement metrics (likes, comments, shares,
impressions) for a *published* post across every platform it was sent
to, with per-platform entries and totals. Twitter and Instagram return
populated metrics; LinkedIn / Threads / TikTok return publish status and
URL only. When the post has no metrics the call fails with
`Error: get_post_metrics failed`; call `get_publish_status` first to
check the post actually went out.

## Analytics

### `get_best_time_to_post`

Read-only, **paid plan required**. Returns ranked (dayOfWeek, hour) slot
recommendations for a given `platform` (required), based on the user's
own posts over the past 90 days. Twitter and Instagram are ranked by
engagement per post; LinkedIn, Threads and TikTok by post frequency only.
Optional `timezone` (IANA, default UTC) and `topN` (1 to 24).

### `get_channel_analytics`

Read-only, free. Aggregate performance for one connected channel, or for
every channel at once. Returns impressions, reach, likes, comments and
engagement rate for the period, the change against the preceding period
of the same length, and the follower series. Omit `platform` for a
team-wide total; pass `platform` (plus `channelName` or `providerId` when
that platform has more than one account connected) to scope it. `period`
is `7d`, `30d`, `90d` or `all`, defaulting to `30d`. With several
accounts on one platform and no account named it errors rather than
picking one, so a number is never silently attributed to the wrong
account.

## Brand

### `update_brand_profile`

Mutating. Paid plans only; returns `upgrade_required` on Free.
Allow-list of patchable fields: `bio` (string), `brandVoice`,
`personalityTraits`, `mainThemes`, `expertiseAreas`, `preferredHashtags`
(all string arrays), and `audienceSize` (a map of numbers). Mutates the
team's active brand profile (one of: the team default, or the team's
alphabetically-first active profile if none flagged default).

## Meta

### `search_tools`

Read-only. Search and filter the available MCP tool catalog by
free-text `query`, `category`, or `intent`. Useful when you have many MCP
servers connected and want to narrow Claude's tool consideration to
PostNext-specific actions.

## Media

### `upload_asset`

Mutating. Inline base64 upload of an image or video to your asset
library; returns a URL for `create_post_draft.mediaUrls`. Reliable only
for very small files (~8KB); larger base64 truncates in tool args, so
prefer `request_asset_upload`. Server cap 5MB, subject to your plan's
storage limit.

### `request_asset_upload`

Mutating. Recommended upload path for images and videos of any size.
Returns a pre-signed `uploadUrl` plus token; you PUT the bytes and the
response carries the final asset URL for `mediaUrls`, with no follow-up
MCP call. Allowed types: JPEG, PNG, WebP, GIF, MP4, WebM. Per-request
cap 50MB, on top of your plan's storage. Pre-charges storage quota,
refunded automatically if you never complete the PUT.

## Blog planner

### `get_latest_blog_post`

Read-only, free. Reports whether the team is connected to a WordPress
blog and returns a snippet of the most recent post.

### `list_blog_plans`

Read-only, free. Lists the team's blog plans (the "Post Planner"),
newest first, with status, per-status topic counts, and
credit-reservation info. Optional status filter.

### `create_blog_plan`

Mutating. Paid feature (Basic+); consumes credits. Creates a blog
content plan for a brand profile. Requires `startDate` (YYYY-MM-DD);
optional `planDays` (1 to 30, default 7), `brandProfileId`,
`integrationId`, `contentLanguage`, `timezone`, `competitorDomains` (up
to 5) and `autoPublish`. On Business/Teams plans with a connected blog,
generated posts publish to WordPress automatically unless you pass
`autoPublish: false`. Topics generate asynchronously, so it returns
immediately in status `generating`. Poll `list_blog_plans` for progress.

### `test_blog_connection`

Mutating (updates integration health), **paid plan required**. Tests
connectivity to the team's connected WordPress blog (the PostNext
plugin) and returns reachability, token validity, plugin version, and
capabilities. Optional `integrationId` when more than one blog is
connected.

## Bio pages (mini sites)

### `list_mini_sites`

Read-only, free. Lists the bio pages belonging to the selected team with
their public URL, publish state and setup progress. Start here: every
other bio-page tool takes the `siteId` this returns, and can omit it when
the team has exactly one site.

### `get_mini_site`

Read-only, free. Reads one page in full: profile header, social icons,
every content block, SEO metadata, theme and auto-pin settings. Long text
is truncated to a 300-character preview. Never returns email-sync
credentials or tracking pixel IDs.

### `get_mini_site_analytics`

Read-only, free. Views, clicks, best-performing links, visitor source,
device and country, and AI-crawler reads, plus which published posts
drove clicks. Every figure except the attribution rows is an all-time
counter rather than a windowed one. `attributionDays` (1-90, default 30)
sets the attribution window only.

### `add_mini_site_block`

Mutating, no credit cost; requires a healthy subscription. Adds one block:
`link`, `featured`, `header`, `email`, `latestposts`, `embed`, `text`,
`image`, `gallery`, `faq`, `divider`, `product`, `event`, `presave`,
podcast `episode`, `booking`, opening `hours` or `collection`. Required
fields differ by type. Changes a publicly visible page immediately.

### `update_mini_site_block`

Mutating, no credit cost; requires a healthy subscription. Patches one
block by `blockId`. Only the fields you pass change, and the block type
cannot be changed. The response returns the block as stored, so a value
the server rejected is visible rather than silent.

### `remove_mini_site_block`

Mutating, no credit cost; requires a healthy subscription. Removes one
block by `blockId` (call `get_mini_site` first for the id). Changes a
publicly visible page immediately.

## Tool annotations

Every tool declares MCP `annotations` so clients can show appropriate
UI affordances:

| Annotation | What it means |
|---|---|
| `readOnlyHint: true` | Pure reader; never mutates state |
| `destructiveHint: true` | Can permanently delete data (`delete_draft` and `remove_mini_site_block`) |
| `idempotentHint: true` | Same args twice = same result |
| `openWorldHint: true` | Reaches outside PostNext (only `connect_channel`, which returns an OAuth URL) |

## Error shapes

Gate and input errors come back as `result.isError: true` with a
`structuredContent` envelope keyed by `error`:

| `error` value | When it fires | Extra fields |
|---|---|---|
| `upgrade_required` | Tool is paid-only and caller is on Free, or the subscription has lapsed (past_due / unpaid / incomplete) | `tool`, `upgradeUrl`, `freeAlternative` |
| `limit_exceeded` | Quota would be exceeded | `tool`, `kind` (`ai_credits`, `ai_credits_daily`, `posts`, `channels`, `storage`), `limit`, `current`, `upgradeUrl`, `freeAlternative` |
| `insufficient_scope` | Token lacks the scope the tool needs | `tool`, `requiredScope` (`mcp:read` or `mcp:write`) |
| `channel_resolution_failed` | The target account can't be resolved | `tool`, `kind` (`no_channel`, `ambiguous_channel`, `channel_not_connected`), `platform`, `availableHandles`, `requestedChannelName` |
| `upload_input_invalid` | Bad `upload_asset` bytes | `tool`, `kind` (`too_large`, `invalid_base64`, `empty_payload`), `sizeBytes`, `maxBytes` |
| `mini_site_input_invalid` | Bad bio-page tool input | `tool`, `kind` (`block_dropped`, `ambiguous_site`, `site_not_found`, `block_not_found`, `max_blocks`, `collateral_drop`, `no_team`, `type_change`), `requiredFields`, `sites` |

Arguments that don't match a tool's inputSchema return `isError: true`
with text only: `Input validation error: Invalid arguments for tool
<name>: ...`. Other failures also return text only, for example
`Error: post not found` or `Error: <tool_name> failed`.

Rate limits are enforced before the MCP layer: 60 requests per 2
minutes per IP (checked before authentication, so it applies to every
request), then 300 requests per 2 minutes per token. Over a limit you get
HTTP 429 with a JSON-RPC error `{"code": -32002, ...}` and the standard
`RateLimit-*` headers.

## Live catalog

The canonical, always-up-to-date tool list is the server's own
`tools/list` response; call it from any MCP client to see the exact
input/output schemas. The `search_tools` tool also exposes structured
metadata (categories, use-case tags) per tool.

Reference docs at [postnext.io/mcp/docs](https://postnext.io/mcp/docs).
