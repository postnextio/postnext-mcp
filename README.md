# PostNext MCP

Connect [Claude](https://claude.ai) to [PostNext](https://postnext.io) via the
Model Context Protocol. Schedule posts, draft threads, audit your queue, and
generate content across X, Instagram, LinkedIn, Threads, YouTube, and TikTok —
all from inside a Claude conversation.

The MCP server is hosted and free to connect. You only need a PostNext account.

- **Server URL**: `https://mcp.postnext.io/api`
- **Status**: production, [v1.5.1](#versioning)
- **Tools**: 21 · **Resources**: 4 · **Prompts**: 4

---

## What is this?

PostNext exposes its social media management API as a [Model Context
Protocol](https://modelcontextprotocol.io) server. When you connect it to
Claude (desktop, web, or any MCP-aware client), Claude can:

- See your connected social channels and current team
- Read your brand profile (voice, themes, hashtags) so generated posts sound
  like you
- Draft, edit, schedule, and cancel posts
- Audit your scheduled queue for duplicates, overload, or gaps
- Look up post metrics and account health

All actions happen against your PostNext account through your own auth token —
PostNext sees what you authorize, nothing more.

## Quick start

You need a PostNext account. Sign up free at
[postnext.io](https://postnext.io) — no API key required for the Claude
flows below; OAuth handles auth.

### Claude Desktop (one-click)

Visit [postnext.io/mcp/connect](https://postnext.io/mcp/connect) and click
**Open in Claude Desktop**. The deep link configures the MCP server for you
and walks you through the OAuth grant.

### Claude Desktop (manual)

Edit your Claude Desktop config (path varies by OS — see [Anthropic's
docs](https://modelcontextprotocol.io/quickstart/user)) and add:

```json
{
  "mcpServers": {
    "postnext": {
      "url": "https://mcp.postnext.io/api",
      "transport": "http"
    }
  }
}
```

Restart Claude Desktop. On first tool use, Claude opens a browser tab for
the OAuth grant; once approved, the PostNext tools appear in the tools picker.

### Claude.ai (web)

Go to [claude.ai](https://claude.ai) → Connectors → Add custom connector and
paste `https://mcp.postnext.io/api`. OAuth flow handles auth.

### Programmatic clients (API key)

For scripts, agents, or non-Claude clients that don't do OAuth, generate
an API key at
[postnext.io/account/api-keys](https://postnext.io/account/api-keys) and pass
it as `Authorization: Bearer apikey_<uuid>` on every request.

### Try it

```
You: What's scheduled for this week?
Claude: [calls list_scheduled_posts, summarizes]

You: Draft a thread about the new MCP launch.
Claude: [reads postnext://brand-profiles/active for voice,
         calls create_post_draft with a thread shape]

You: Audit my queue for the next 14 days.
Claude: [invokes the audit-queue prompt, flags duplicates and gaps]
```

## What you can do

| Category | Tools |
|---|---|
| **Account + plan** | `get_plan`, `get_plan_limits`, `get_account_health` |
| **Teams** | `list_teams`, `set_current_team` |
| **Channels** | `list_connected_accounts`, `connect_channel` |
| **Drafts** | `create_post_draft`, `update_post_draft`, `list_drafts`, `delete_draft` |
| **Schedule** | `schedule_post`, `cancel_scheduled_post`, `list_scheduled_posts`, `get_publish_status` |
| **Posts** | `get_post`, `search_posts`, `get_post_metrics` |
| **Analytics** | `get_best_time_to_post`, `get_post_metrics` |
| **Brand** | `update_brand_profile` |
| **Meta** | `search_tools` |

Read-only tools work on every plan, including Free. Mutating tools (create,
schedule, channel-connect, brand-profile update) consume your monthly quota
— Free defaults to 0 AI calls and 0 scheduled posts; Basic and above unlock
generous limits. See [postnext.io/pricing](https://postnext.io/pricing).

## Resources

MCP resources are read-on-demand context pulls. Claude reads these to ground
its replies without re-asking you.

| URI | What it returns |
|---|---|
| `postnext://account/summary` | Plan, usage this month, channels connected |
| `postnext://teams/current` | Currently-selected team |
| `postnext://channels/connected` | All connected social handles for the active team |
| `postnext://brand-profiles/active` | Brand voice, themes, hashtags |

## Prompts (named workflows)

Pre-built multi-step prompts you can invoke from any MCP client:

| Name | What it does |
|---|---|
| `weekly-plan` | Builds a 7-day content plan grounded in your brand profile |
| `draft-thread` | Drafts a 5–10 post thread from a topic or URL |
| `audit-queue` | Walks the next N days of scheduled posts, flags duplicates / overload / gaps. Read-only |
| `channel-sweep` | Reviews which platforms you have connected and recommends gaps to fill |

## Versioning

| Endpoint | Status | Notes |
|---|---|---|
| `https://mcp.postnext.io/api` | **Canonical** | Use this |
| `https://postnext.io/mcp/api` | Deprecated | Backward-compat through 2026-06-08; do not use for new integrations |

The server reports `version: 1.5.1` on `initialize`. Breaking changes are
versioned; non-breaking additions (new tools, resources) ship without a bump.

## Auth + security

- Two auth modes: **OAuth 2.0** (Claude Desktop and claude.ai connector flows)
  or **API key** (`Bearer apikey_<uuid>`, manage at
  [postnext.io/account/api-keys](https://postnext.io/account/api-keys))
- Tokens are revocable at any time from your account dashboard
- Each tool call is rate-limited (300 req / 2 min per token, 60 req / 2 min
  per IP pre-auth)
- Security disclosure: [postnext.io/security](https://postnext.io/security) ·
  RFC 9116 `security.txt` published at `/.well-known/security.txt`
- Privacy: [postnext.io/privacy](https://postnext.io/privacy) — MCP-specific
  data flow disclosure under the "MCP" section

## Documentation

Full reference docs live at [postnext.io/mcp/docs](https://postnext.io/mcp/docs).

## License

[MIT](LICENSE) — documentation and examples are free to copy, fork, and adapt.
The MCP server itself is hosted by PostNext; see
[Terms of Service](https://postnext.io/terms).

## Links

- Marketing site: [postnext.io](https://postnext.io)
- Pricing: [postnext.io/pricing](https://postnext.io/pricing)
- MCP landing: [postnext.io/mcp](https://postnext.io/mcp)
- Account dashboard: [app.postnext.io](https://app.postnext.io)
- API keys: [postnext.io/account/api-keys](https://postnext.io/account/api-keys)
- Support: [contact@postnext.io](mailto:contact@postnext.io)

---

Built by the team at [PostNext](https://postnext.io). Pull requests on these
docs welcome.
