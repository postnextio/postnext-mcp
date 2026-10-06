# Quickstart

Connect [Claude](https://claude.ai) to your [PostNext](https://postnext.io)
account in 60 seconds. After this guide you'll be able to schedule posts,
draft posts, and audit your queue from inside a Claude conversation.

## Prerequisites

- A PostNext account. Sign up free at [postnext.io](https://postnext.io)
- One of:
  - **Claude Desktop** (Mac, Windows): one-click link, or add it as a connector
  - **Claude Code**: one CLI line, no config file
  - **claude.ai** web: add it as a custom connector
  - **Cursor** or **Codex**: one entry in their MCP config
  - **ChatGPT**: a custom app in Developer mode
  - Any other MCP-aware client: for programmatic use with an API key

> Client setup steps are dated, not evergreen. The steps below were last
> checked against each vendor's own documentation on **2026-10-06**. Vendor
> menus move. The per-client pages at [postnext.io/mcp](https://postnext.io/mcp)
> are the ones kept current.

`npx postnext-mcp <client>` prints the same config for `claude-code`,
`claude-desktop`, `cursor`, `codex` and `chatgpt`. It is a setup helper only;
the server is hosted, so there is nothing to run locally.

## Option A: Claude Desktop, one-click

1. Visit [postnext.io/mcp/connect](https://postnext.io/mcp/connect)
2. Click **Open in Claude Desktop**
3. Claude Desktop opens and asks to add the PostNext MCP server. Confirm.
4. On first tool use, a browser tab opens for the OAuth grant. Approve.
5. PostNext tools appear in Claude's tool picker.

The deep link is `claude://mcp/connect?url=…`, so there is nothing to copy or
paste.

## Option B: Claude Desktop, add as a connector

PostNext is a remote MCP server, so it is added as a **custom connector**, not
in `claude_desktop_config.json`. That file only starts local servers, and a
`url` entry there does not connect.

1. In Claude (desktop or [claude.ai](https://claude.ai)), go to
   **Customize** → **Connectors**
2. Click **+ Add**, then **Add custom connector**
3. Name it `PostNext` and paste `https://mcp.postnext.io/api`, then
   **Continue**
4. Keep OAuth as the sign-in method and click **Add**
5. Approve the PostNext sign-in when Claude asks for it

On a Team or Enterprise plan, an owner adds the connector once under
**Organization settings** → **Connectors**, and each member then clicks
**Connect** under **Customize** → **Connectors**.

## Option C: Claude Code

Register PostNext as an HTTP MCP server from a terminal:

```bash
claude mcp add --transport http postnext https://mcp.postnext.io/api
```

That is the whole setup. There is no config file to edit, and the server is
available in every Claude Code session from then on. The first time Claude
calls a PostNext tool it opens the OAuth grant in your browser; approve it
once.

Check it registered with `claude mcp list`.

## Option D: claude.ai (web)

Same steps as Option B: **Customize** → **Connectors** → **+ Add** →
**Add custom connector**, paste `https://mcp.postnext.io/api`, and approve the
sign-in. The connector is then available in your Claude conversations.

## Option E: Cursor

1. In Cursor, open **Settings** → **MCP** and add a new global server.
   Depending on your Cursor version that opens either a form or the config
   file. The global file is `~/.cursor/mcp.json`; a per-project one is
   `.cursor/mcp.json`.
2. Add the `postnext` entry and save:

```json
{
  "mcpServers": {
    "postnext": {
      "url": "https://mcp.postnext.io/api"
    }
  }
}
```

3. Cursor opens the PostNext sign-in screen on first use. Approve it once, and
   the tools are available to the agent in any chat.

## Option F: Codex

1. Codex reads MCP servers from `config.toml` in your `.codex` folder. Open
   it, or create it if it does not exist.
2. Paste the block below:

```toml
[mcp_servers.postnext]
url = "https://mcp.postnext.io/api"
```

Codex picks the HTTP transport automatically when an entry has a `url`
instead of a `command`. On an older Codex that only reads stdio servers, also
set `experimental_use_rmcp_client = true` under `[features]`, or upgrade.

3. Start Codex. The first PostNext tool call opens the sign-in screen in your
   browser; approve it once and the token is kept for 30 days.

## Option G: ChatGPT

Turn on **Developer mode** in ChatGPT's Apps settings, create a new app with
the URL `https://mcp.postnext.io/api`, and choose **OAuth** as the
authentication. ChatGPT then lists the PostNext tools and asks you to sign in.
`npx postnext-mcp chatgpt` prints the current menu path.

## Option H: Programmatic / non-Claude clients

For your own scripts, agents, or non-Claude MCP clients that don't do OAuth:

1. Generate an API key at
   [postnext.io/account/api-keys](https://postnext.io/account/api-keys)
2. Pass it as `Authorization: Bearer apikey_<uuid>` on every request
3. Use the standard MCP `initialize` → `tools/list` → `tools/call` flow

API keys don't expire automatically. Revoke any time from the dashboard.

## First conversation

After connecting, paste any of these into Claude:

```
What's scheduled for the next 7 days?
```

```
Audit my queue. Flag anything off.
```

```
Draft a post about <topic> in my brand voice.
```

```
Plan next week's posts across all my channels.
```

Claude will use [tools](tools.md), [resources](resources.md), and
[prompts](prompts.md) as needed. You don't have to know which.

## Troubleshooting

### "PostNext tools don't appear in Claude"

- Check **Customize** → **Connectors**: PostNext should be listed and
  connected. If it shows a **Connect** button, click it and approve the
  sign-in
- If you added a `postnext` entry to `claude_desktop_config.json`, remove it.
  That file is for local servers only; use the connector instead
- Restart Claude Desktop fully (quit and reopen, not just close the window)

### "Authorization failed" or 401 errors

- Your OAuth grant may have expired (tokens last 30 days). Disconnect and
  reconnect PostNext under **Customize** → **Connectors**
- If using an API key directly, verify it starts with `apikey_` and
  isn't revoked at
  [postnext.io/account/api-keys](https://postnext.io/account/api-keys)

### "Rate limit exceeded"

- Signed-in calls are limited to 300 per 2 minutes per token; calls before
  sign-in to 60 per 2 minutes per IP. A limited call gets HTTP 429, and the
  `RateLimit-*` response headers say when the window resets

### "Upgrade required" / "Limit exceeded"

- The Free plan includes 10 posts, 10 AI credits, 1 connected channel and
  10 MB of storage a month. Creating, scheduling and uploading work on Free
  until those run out
- Six tools need a paid plan: `get_account_health`, `get_best_time_to_post`,
  `update_post_draft`, `update_brand_profile`, `create_blog_plan` and
  `test_blog_connection`
- The error includes an `upgradeUrl` and a `freeAlternative` hint (often a
  read-only tool that still works). See
  [postnext.io/pricing](https://postnext.io/pricing) for plan limits

### "Resource not found" on `postnext://...`

- Resource URIs are case-sensitive. Correct: `postnext://teams/current`
  (plural). Wrong: `postnext://team/current`

## What's next

- [Tool reference](tools.md): all 34 tools, what they do, what they
  return
- [Resource reference](resources.md): read-on-demand context Claude
  pulls automatically
- [Prompt reference](prompts.md): named multi-step workflows you can
  invoke directly
- [Recipes](../recipes): full worked examples for common tasks
- [Full docs at postnext.io/mcp/docs](https://postnext.io/mcp/docs)
