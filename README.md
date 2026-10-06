# PostNext MCP

Connect [Claude](https://claude.ai), Claude Code, Cursor, Codex or any other
MCP-aware client to [PostNext](https://postnext.io) via the Model Context
Protocol. Schedule posts, draft threads, audit your queue, and generate
content across X, Instagram, LinkedIn, Threads, and TikTok, all from inside a
chat, your editor, or your terminal.

The MCP server is hosted and free to connect. You only need a PostNext account.

- **Server URL**: `https://mcp.postnext.io/api`
- **Status**: production, [v1.5.1](#versioning)
- **Tools**: 34 · **Resources**: 4 · **Prompts**: 4

> **Prefer a portable, no-connector setup?** The
> [`postnext-social-manager`](https://github.com/postnextio/postnext-social-manager)
> skill drives the same PostNext account over the public REST API with an API
> key. Works in Claude Code, scripts, or any agent, with no MCP connector to
> configure.

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

All actions happen against your PostNext account through your own auth token.
PostNext sees what you authorize, nothing more.

## Quick start

You need a PostNext account. Sign up free at
[postnext.io](https://postnext.io). No API key is needed for the connector
flows below; OAuth handles auth.

> Client setup steps are dated, not evergreen. The steps below were last
> checked against each vendor's own documentation on **2026-10-06**. Vendor
> menus move. The per-client pages at [postnext.io/mcp](https://postnext.io/mcp)
> are the ones kept current.
>
> `npx postnext-mcp <client>` prints the config for `claude-code`,
> `claude-desktop`, `cursor`, `codex` or `chatgpt`. It is a setup helper only;
> the server is hosted, so there is nothing to run locally.

### Claude Desktop (one-click)

Visit [postnext.io/mcp/connect](https://postnext.io/mcp/connect) and click
**Open in Claude Desktop**. The deep link configures the MCP server for you
and walks you through the OAuth grant.

### Claude Desktop and claude.ai (connector)

PostNext is a remote server, so it is added as a custom connector, not in
`claude_desktop_config.json` (that file only starts local servers, and a `url`
entry there does not connect).

In Claude (desktop or [claude.ai](https://claude.ai)), go to **Customize** →
**Connectors** → **+ Add** → **Add custom connector**, paste
`https://mcp.postnext.io/api`, keep OAuth, and click **Add**. Approve the
PostNext sign-in when asked. On Team and Enterprise plans an owner adds it
once under **Organization settings** → **Connectors**, then members click
**Connect**.

### Claude Code

Register PostNext as an HTTP MCP server once, from a terminal:

```bash
claude mcp add --transport http postnext https://mcp.postnext.io/api
```

It is available in every Claude Code session from then on. The first PostNext
tool call opens the OAuth grant in a browser; approve it once.

### Cursor

Open Settings → MCP and add a global server, or edit `~/.cursor/mcp.json`
directly (the per-project file is `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "postnext": {
      "url": "https://mcp.postnext.io/api"
    }
  }
}
```

Save, approve the sign-in on first use, and the tools are available to the
agent in any chat.

### Codex

Codex reads MCP servers from `config.toml` in your `.codex` folder. Add:

```toml
[mcp_servers.postnext]
url = "https://mcp.postnext.io/api"
```

Codex picks the HTTP transport automatically when an entry has a `url` instead
of a `command`. On an older Codex that only reads stdio servers, also set
`experimental_use_rmcp_client = true` under `[features]`, or upgrade.

### ChatGPT

Turn on **Developer mode** in ChatGPT's Apps settings, create a new app with
the URL `https://mcp.postnext.io/api`, and choose **OAuth** as the
authentication. `npx postnext-mcp chatgpt` prints the current menu path.

### Programmatic clients (API key)

For scripts, agents, or non-Claude clients that don't do OAuth, generate
an API key at
[postnext.io/account/api-keys](https://postnext.io/account/api-keys) and pass
it as `Authorization: Bearer apikey_<uuid>` on every request.

### Try it

```
You: What's scheduled for this week?
Claude: [calls list_scheduled_posts, summarizes]

You: Draft a LinkedIn post about the new MCP launch.
Claude: [reads postnext://brand-profiles/active for voice,
         shows the draft, then calls create_post_draft once you approve]

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
| **Analytics** | `get_best_time_to_post`, `get_channel_analytics` |
| **Media** | `upload_asset`, `request_asset_upload` |
| **Blog planner** | `get_latest_blog_post`, `list_blog_plans`, `create_blog_plan`, `test_blog_connection` |
| **Bio pages** | `list_mini_sites`, `get_mini_site`, `get_mini_site_analytics`, `add_mini_site_block`, `update_mini_site_block`, `remove_mini_site_block` |
| **Brand** | `update_brand_profile` |
| **Meta** | `search_tools` |

Six tools need a paid plan: `get_account_health`, `get_best_time_to_post`,
`update_post_draft`, `update_brand_profile`, `create_blog_plan` and
`test_blog_connection`. Everything else works on the Free plan.
Tools that create, schedule, connect or upload are limited by your plan's
monthly quota; Free includes 10 posts, 10 AI credits, 1 connected channel and
10 MB of storage. See [postnext.io/pricing](https://postnext.io/pricing) for
current limits.

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
| `weekly-plan` | Proposes 5 to 10 drafts for next Monday to Friday across your active platforms, in your brand voice. Creates them only after you confirm |
| `draft-thread` | Drafts a 5 to 10 post X or Threads thread from a topic or URL and shows it numbered. Saves drafts only after you confirm |
| `audit-queue` | Walks the next N days (1 to 30, default 7) of scheduled posts and flags duplicates, overload and gaps. Read-only |
| `channel-sweep` | Lists connected and missing channels, flags stale ones (not synced for 7+ days) and suggests what to connect. Asks before creating any sign-in link |

## Versioning

| Endpoint | Status | Notes |
|---|---|---|
| `https://mcp.postnext.io/api` | **Canonical** | Use this |
| `https://postnext.io/mcp/api` | Deprecated | Still served for older integrations but will be removed; do not use for new ones |

The server reports `version: 1.5.1` on `initialize`. Breaking changes are
versioned; non-breaking additions (new tools, resources) ship without a bump.

## Auth + security

- Two auth modes: **OAuth 2.0** (Claude Desktop and claude.ai connector flows)
  or **API key** (`Bearer apikey_<uuid>`, manage at
  [postnext.io/account/api-keys](https://postnext.io/account/api-keys))
- Tokens are revocable at any time from your account dashboard
- Tool calls are rate-limited: 300 per 2 minutes per token once signed in,
  60 per 2 minutes per IP before sign-in. Live limits are in the
  `RateLimit-*` response headers, and a limited call gets HTTP 429
- Security disclosure: [postnext.io/security](https://postnext.io/security) ·
  RFC 9116 `security.txt` published at `/.well-known/security.txt`
- Privacy: [postnext.io/privacy](https://postnext.io/privacy). The MCP data
  flow is detailed under "MCP Server and AI Assistant Access"

## Recipes

Worked examples for common workflows. Each is a paste-ready prompt with
notes on what Claude does under the hood.

- [Weekly content plan](recipes/weekly-content-plan.md): plan next week's
  posts across your connected channels, grounded in your brand voice
- [Draft a thread from an article](recipes/thread-from-article.md): turn
  a URL into a 5 to 10 post thread in your voice
- [Audit the scheduled queue](recipes/audit-scheduled-queue.md): a read-only
  walk through your next N days, flagging duplicates, overload and gaps
- [Channel-connection sweep](recipes/channel-connection-sweep.md): review
  which channels are connected or stale, and connect the missing ones

## Documentation

Full hosted reference at [postnext.io/mcp/docs](https://postnext.io/mcp/docs).
Repo-local reference (handy for offline / fork use):

- [Quickstart](docs/quickstart.md): connect from Claude Desktop, claude.ai,
  Claude Code, Cursor, Codex, ChatGPT or a programmatic client
- [Tool reference](docs/tools.md): all 34 tools, gating, error envelopes
- [Resource reference](docs/resources.md): the 4 MCP resources Claude reads
  on demand, with example payloads
- [Prompt reference](docs/prompts.md): the 4 named workflows and their argument
  schemas

## License

[MIT](LICENSE). Documentation and examples are free to copy, fork, and adapt.
The MCP server itself is hosted by PostNext; see
[Terms of Service](https://postnext.io/terms).

## Links

- Marketing site: [postnext.io](https://postnext.io)
- Pricing: [postnext.io/pricing](https://postnext.io/pricing)
- MCP landing: [postnext.io/mcp](https://postnext.io/mcp)
- Account dashboard: [app.postnext.io](https://app.postnext.io)
- API keys: [postnext.io/account/api-keys](https://postnext.io/account/api-keys)
- Social-manager skill: [github.com/postnextio/postnext-social-manager](https://github.com/postnextio/postnext-social-manager)
- Support: [contact@postnext.io](mailto:contact@postnext.io)

---

Built by the team at [PostNext](https://postnext.io). Pull requests on these
docs welcome.
