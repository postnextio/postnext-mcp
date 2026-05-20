# Tool reference

The PostNext MCP server exposes 21 tools. Gating splits across four
classes:

- **Read-only, free** — usable on every plan. Most reads fit here.
- **Read-only, paid** — `get_account_health` and `get_best_time_to_post`.
  Both return `UpgradeRequiredError` to Free callers.
- **Mutating, paid + quota** — `create_post_draft`, `schedule_post`,
  `connect_channel`, `update_post_draft`, `update_brand_profile`.
- **Mutating, no cost** — `cancel_scheduled_post`, `delete_draft`,
  `set_current_team`. Cleanup and navigation; available on every plan.

See [postnext.io/pricing](https://postnext.io/pricing) for current limits
per plan.

Every tool returns either `structuredContent` (when `outputSchema` is
declared) or `content` (plain text). Errors surface as `isError: true`
with a structured error envelope — see [error shapes](#error-shapes)
below.

## Account + plan

### `get_plan`

Read-only. Returns the user's plan name, tier, and active subscription
status (active, trialing, past_due, etc.). Useful for showing "you're on
Pro" in agent replies.

### `get_plan_limits`

Read-only. Returns the user's tier, the four quota buckets (AI credits,
posts, channels, storage), and current usage against each. Call this
before mutating tools to predict whether they'll be blocked.

### `get_account_health`

Read-only, **paid plan required**. Returns: connected-account count,
scheduled/published/failed post counts, draft count, and tokens expiring
in the next 7 days. Optional `windowDays` (7, 30, or 90; default 30) and
`platform` filter. Useful for "is my PostNext set up correctly?" sanity
checks.

## Teams

### `list_teams`

Read-only. Lists every team the user belongs to with `teamId`, `teamName`,
and `isCurrent`. Cross-team access requires `set_current_team` first.

### `set_current_team`

Mutating (no quota; updates the token's `currentTeamId`). Switch active
team for subsequent calls. The token remembers the choice across
conversations.

## Channels

### `list_connected_accounts`

Read-only. Returns every social handle connected to the active team:
platform, handle, accountId, and a per-platform `status` (healthy /
token_expiring / token_expired).

### `connect_channel`

Mutating. Consumes one channel slot per successful connection. Returns
an `authUrl` (short-lived; re-call the tool if it expires) that the user
must open in a browser to authorize. The OAuth flow finishes the
connection; the channel appears in `list_connected_accounts` afterwards.

## Drafts

### `create_post_draft`

Mutating. Consumes 1 AI credit. Creates a new draft post for a platform.
Requires `platform`, `content`, and `channelName` (when the user has
multiple accounts on the same platform). Drafts are not auto-published.

### `update_post_draft`

Mutating, **paid plan required**. Update content/media on an existing
draft. At least one of `content` or `mediaUrls` is required. Optional
`platform` scopes the update to one platform on a multi-platform
cross-post.

### `list_drafts`

Read-only. Paginated list of draft posts with postId, platform-list,
content preview, and `dashboardUrl` per draft.

### `delete_draft`

Mutating (no quota cost). Permanently deletes a draft. Refuses to delete
posts that are scheduled or published — use `cancel_scheduled_post` for
those.

## Schedule

### `schedule_post`

Mutating. Consumes 1 post-quota slot. Moves a draft into the publish
queue at a future time. Idempotent: same `clientRequestId` returns the
existing scheduled row instead of duplicating.

### `cancel_scheduled_post`

Mutating (no quota cost). Removes a scheduled post from the publish
queue. The underlying draft is preserved. Idempotent — safe on
already-cancelled posts.

### `list_scheduled_posts`

Read-only. Paginated list of scheduled posts with postId, platform-list,
scheduledAt, status (queued / processing / published / partial / failed
/ cancelled).

### `get_publish_status`

Read-only. Diagnoses a single scheduled post: queue state, per-platform
success or error, and the last attempt's outcome. Use when a post didn't
publish when expected.

## Posts (read)

### `get_post`

Read-only. Fetches a single post by `postId`. Returns the full
provider-by-platform content map plus status, timestamps, and
`dashboardUrl` — a clickable link to view the post in the PostNext app.

### `search_posts`

Read-only. Text-search across the user's draft, scheduled, and published
posts. Requires `query` of 3+ characters. Filters: `status`, `platform`,
`limit`.

### `get_post_metrics`

Read-only. Fetches engagement metrics (likes, comments, shares,
impressions) for a *published* post across every platform it was sent
to. Twitter and Instagram return populated metrics; LinkedIn / Threads /
TikTok return frequency-only data. Errors with `post not found` if the
postId belongs to a draft, a still-queued scheduled post, or any post
without metrics yet — call `get_publish_status` first to check.

## Analytics

### `get_best_time_to_post`

Read-only, **paid plan required**. Returns engagement-weighted
(dayOfWeek, hour) slot recommendations for a given platform, based on
the user's own historical post performance. Falls back to post-frequency
analysis when engagement data is sparse. Supports `twitter`, `instagram`,
`linkedin`, `threads`, `tiktok`.

## Brand

### `update_brand_profile`

Mutating. Paid plans only — returns `UpgradeRequiredError` on Free.
Allow-list of patchable fields: `bio`, `brandVoice`, `personalityTraits`,
`mainThemes`, `expertiseAreas`, `preferredHashtags`, `audienceSize`.
Mutates the team's active brand profile (one of: the team default, or
the team's alphabetically-first active profile if none flagged default).

## Meta

### `search_tools`

Read-only. Search and filter the available MCP tool catalog by
free-text query, category, or intent. Useful when you have many MCP
servers connected and want to narrow Claude's tool consideration to
PostNext-specific actions.

## Tool annotations

Every tool declares MCP `annotations` so clients can show appropriate
UI affordances:

| Annotation | What it means |
|---|---|
| `readOnlyHint: true` | Pure reader; never mutates state |
| `destructiveHint: true` | Can permanently delete data (only `delete_draft`) |
| `idempotentHint: true` | Same args twice = same result |
| `openWorldHint: true` | Reaches outside PostNext (only `connect_channel` — opens an OAuth URL) |

## Error shapes

Tools return errors as `result.isError: true` with a structured envelope:

| `error` value | When it fires | Extra fields |
|---|---|---|
| `upgrade_required` | Tool is paid-only and caller is on Free | `upgradeUrl`, `freeAlternative` |
| `limit_exceeded` | Quota would be exceeded | `kind`, `limit`, `current`, `upgradeUrl`, `freeAlternative` |
| `subscription_inactive` | Plan is past_due / incomplete / unpaid | `status`, `actions.{retryUrl, updateCardUrl, downgradeUrl}` |
| `validation_failed` | Args don't satisfy the inputSchema | `details: [...]` |
| `not_found` | Resource (post, team, etc.) doesn't exist | `kind`, `id` |
| `team_membership_unverified` | `user.teamId` couldn't be resolved | — |

Transport-level failures (rate-limit, auth, 5xx) return `isError: false`
on the response but `error.code` set per JSON-RPC 2.0 spec. The most
common: `-32002` for rate limit, `-32602` for invalid params.

## Live catalog

The canonical, always-up-to-date tool list is the server's own
`tools/list` response — call it from any MCP client to see the exact
input/output schemas. The `search_tools` tool also exposes structured
metadata (categories, use-case tags) per tool.

Reference docs at [postnext.io/mcp/docs](https://postnext.io/mcp/docs).
