# Resource reference

MCP resources are read-on-demand context. Unlike tools, resources don't
take parameters: they're fixed URIs the client (Claude) reads when it
needs the data. Each PostNext resource is scoped to the authenticated
user's currently-selected team.

PostNext exposes 4 resources, all read-only and free to read on every plan.

| URI | Title | What it returns |
|---|---|---|
| `postnext://account/summary` | Account summary | Plan, AI credits, draft/scheduled/channel counts |
| `postnext://teams/current` | Active team | Active team for this token |
| `postnext://channels/connected` | Connected social channels | Social accounts connected to the active team |
| `postnext://brand-profiles/active` | Active brand profile | Voice, themes, hashtags |

---

## `postnext://account/summary`

High-level snapshot of the user's PostNext account. Claude reads this when
asked anything plan-related ("what plan am I on", "how many credits
left"). For full quota numbers (channel slots, storage, posting allowed)
call `get_plan_limits`.

`plan` is the effective tier, so an account whose subscription has lapsed
reports the tier it is actually gated to, with `gated: true`. Draft and
scheduled counts are capped at 100 each.

**Example payload**:

```json
{
  "email": "you@example.com",
  "user": "yourusername",
  "plan": "pro",
  "gated": false,
  "subscriptionStatus": "active",
  "connectedChannels": 5,
  "draftsCount": 12,
  "scheduledPostsCount": 8,
  "aiCreditsUsedThisMonth": 47,
  "aiCreditsLimit": 150
}
```

## `postnext://teams/current`

The team the current token is scoped to. PostNext supports multi-team
accounts (one user can belong to several teams), and the token carries a
`currentTeamId` that determines which team tools target.

**Example payload**:

```json
{
  "teamId": "a3f8d15c-6a4f-4...",
  "teamName": "Acme Marketing",
  "totalTeamsAvailable": 2
}
```

Switch teams with the `set_current_team` tool. With OAuth the choice
persists across conversations; with an API key it lasts for the session.

## `postnext://channels/connected`

Every social account connected to the active team. A read-only mirror of
the `list_connected_accounts` tool. Each entry has the platform, the
handle, a `providerId` (stable across handle renames; pass it to tools
that target a specific account), whether the connection is active, and
when it last synced.

**Example payload**:

```json
{
  "accounts": [
    {
      "platform": "twitter",
      "handle": "@yourhandle",
      "providerId": "1234567890",
      "connected": true,
      "lastSyncAt": "2026-10-05T10:00:00.000Z"
    },
    {
      "platform": "instagram",
      "handle": "yourhandle",
      "providerId": "17841400000000000",
      "connected": false,
      "lastSyncAt": "2026-09-20T08:00:00.000Z"
    }
  ]
}
```

`connected: false` means the connection is inactive and needs to be
re-authorized.

## `postnext://brand-profiles/active`

The team's active brand profile: the source of truth Claude uses to
ground generated content in your voice. Resolution: the team's default
profile first; if none flagged default, the team's alphabetically-first
active profile.

Returns a curated subset of fields (`id`, `bio`, `expertiseAreas`,
`personalityTraits`, `brandVoice`, `mainThemes`, `audienceSize`,
`preferredHashtags`), only what the LLM needs to generate on-brand
content. Fields that are not set are left out.

**Example payload**:

```json
{
  "active": {
    "id": "65eb479dfd4e...",
    "bio": "Independent coffee roaster shipping single-origin beans across Europe.",
    "expertiseAreas": ["specialty coffee", "home brewing", "sourcing"],
    "personalityTraits": ["warm", "knowledgeable", "plain-spoken"],
    "brandVoice": ["friendly", "practical", "no jargon"],
    "mainThemes": ["new harvests", "brew guides", "farm stories"],
    "audienceSize": { "instagram": 12000, "linkedin": 3500 },
    "preferredHashtags": ["#specialtycoffee", "#coffeeroaster", "#brewguide"]
  }
}
```

If the team has no brand profile yet:

```json
{
  "active": null,
  "hint": "Create a brand profile in PostNext to give Claude context about your voice."
}
```

Create profiles in the PostNext web app. Claude can patch the active one
with the `update_brand_profile` tool (paid plans).

---

## When Claude reads these

Claude reads resources when it judges them helpful. You can also
explicitly invoke one:

> Read `postnext://brand-profiles/active` and summarize what you find.

Claude will dispatch an MCP `resources/read` against the URI.

## Full reference

The resource list is exposed via MCP's `resources/list` from the server.
Reference docs at [postnext.io/mcp/docs](https://postnext.io/mcp/docs).
