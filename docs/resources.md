# Resource reference

MCP resources are read-on-demand context. Unlike tools, resources don't
take parameters — they're fixed URIs the client (Claude) reads when it
needs the data. Each PostNext resource is scoped to the authenticated
user's currently-selected team.

PostNext exposes 4 resources, all read-only and free to read on every plan.

| URI | Title | What it returns |
|---|---|---|
| `postnext://account/summary` | Account summary | Plan, usage this month, channels connected |
| `postnext://teams/current` | Current team | Active team for this token |
| `postnext://channels/connected` | Connected channels | Social handles connected to the active team |
| `postnext://brand-profiles/active` | Active brand profile | Voice, themes, hashtags |

---

## `postnext://account/summary`

High-level snapshot of the user's PostNext account. Claude reads this when
asked anything plan-related ("what plan am I on", "how many credits left",
"can I connect another channel"). Avoids a separate `get_plan_limits` call
for read-only inspection.

**Example payload** (numbers vary by plan — see
[postnext.io/pricing](https://postnext.io/pricing)):

```json
{
  "plan": "pro",
  "tier": "PRO",
  "subscriptionStatus": "active",
  "usage": {
    "aiCalls":   { "used": 47,  "limit": "<plan limit>" },
    "posts":     { "used": 92,  "limit": "<plan limit>" },
    "channels":  { "used": 5,   "limit": "<plan limit>" },
    "storageMB": { "used": 1240,"limit": "<plan limit>" }
  },
  "channelsConnected": 5,
  "billingPeriodEnd": "2026-06-12T00:00:00Z"
}
```

## `postnext://teams/current`

The team the current token is scoped to. PostNext supports multi-team
accounts (one user can belong to several teams), and the token carries a
`currentTeamId` that determines which team mutating tools target.

**Example payload**:

```json
{
  "teamId": "team_a3f8d15c-6a4f-4...",
  "teamName": "Acme Marketing",
  "teamRole": "admin",
  "memberCount": 4,
  "createdAt": "2025-01-14T09:22:00Z"
}
```

Switch teams with the `set_current_team` tool — the token then remembers
the choice across conversations.

## `postnext://channels/connected`

Every social handle connected to the active team. Each entry includes
the platform, the handle, an internal accountId (used by mutating tools
that need to target a specific account when the user has multiples on
the same platform), and a per-token health signal.

**Example payload**:

```json
{
  "accounts": [
    {
      "platform": "twitter",
      "handle": "@yourhandle",
      "accountId": "soc_84f1...",
      "status": "healthy",
      "tokenExpiresAt": "2026-06-15T10:00:00Z"
    },
    {
      "platform": "instagram",
      "handle": "yourhandle",
      "accountId": "soc_91d2...",
      "status": "token_expiring",
      "tokenExpiresAt": "2026-05-22T08:00:00Z"
    }
  ],
  "totalCount": 2
}
```

`status` values: `healthy`, `token_expiring` (refresh inside 7 days),
`token_expired` (re-auth required).

## `postnext://brand-profiles/active`

The team's active brand profile — the source of truth Claude uses to
ground generated content in your voice. Resolution: the team's default
profile first; if none flagged default, the team's alphabetically-first
active profile.

Returns a curated subset of fields — only what the LLM actually needs to
generate on-brand content. Internal fields (settings, folderId, raw
scraper output) are omitted.

**Example payload**:

```json
{
  "active": {
    "id": "bp_65eb479d-fd4e-...",
    "bio": "Operator + founder, building five SaaS brands. AI-native social media tools.",
    "expertiseAreas": ["AI tooling", "social media", "MCP"],
    "personalityTraits": ["direct", "curious", "no-BS"],
    "brandVoice": "concise, technical, dry humor",
    "mainThemes": ["MCP launches", "founder economics", "AI agents"],
    "audienceSize": { "twitter": 12000, "linkedin": 3500 },
    "preferredHashtags": ["#mcp", "#postnext", "#aiagents"]
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

Create or update profiles at
[app.postnext.io/brand-profiles](https://app.postnext.io/brand-profiles).

---

## When Claude reads these

Resources fire automatically inside named prompts (see [prompts.md](prompts.md))
or when Claude judges them helpful. You can also explicitly invoke:

> Read `postnext://brand-profiles/active` and summarize what you find.

Claude will dispatch an MCP `resources/read` against the URI. Resources
are cached per conversation — re-asking for the same URI in the same
session reuses the prior fetch.

## Full reference

Live JSON Schema for each resource is exposed via MCP's
`resources/list` from the server. Reference docs at
[postnext.io/mcp/docs](https://postnext.io/mcp/docs).
