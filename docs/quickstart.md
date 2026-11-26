# Quickstart

Connect your AI assistant (Claude, ChatGPT, Cursor, Codex and others) to
your [PostNext](https://postnext.io) account in a few minutes. After this
guide you'll be able to draft posts, schedule them and audit your queue from
inside a chat, your editor or your terminal.

## Prerequisites

- A PostNext account. Sign up at [postnext.io](https://postnext.io) and
  finish the plan step in the web app: a 7-day free trial (it asks for a card)
  or **Continue with Free**. Until then your assistant can draft but not
  schedule
- At least one social account connected in PostNext (or ask your assistant
  for a connect link once it is set up)
- One of:
  - **Claude Desktop** (Mac, Windows): one-click link, or add it as a connector
  - **Claude Code**: one CLI line, no config file
  - **claude.ai** web: add it as a custom connector
  - **Cursor** or **Codex**: one entry in their MCP config
  - **ChatGPT**: a custom MCP server added from Plugins
  - Any other MCP client: the same URL with OAuth (see
    [postnext.io/ai-agents](https://postnext.io/ai-agents))
  - Your own scripts: an API key

> Client setup steps are dated, not evergreen. The steps below were matched
> on **2026-11-26** to the postnext.io guides, which were checked against
> each vendor's own documentation on **2026-11-18**. Vendor menus move. The
> per-client guides at [postnext.io/ai-agents](https://postnext.io/ai-agents)
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
4. Keep the options marked Detected and click **Add**
5. Select **Connect** and approve the PostNext sign-in

On a Team or Enterprise plan, an owner adds the connector once under
**Organization settings** → **Connectors**, and each member then clicks
**Connect** under **Customize** → **Connectors**.

## Option C: Claude Code

Register PostNext as an HTTP MCP server from a terminal:

```bash
claude mcp add --transport http --scope user postnext https://mcp.postnext.io/api
```

Then start Claude Code, type `/mcp`, select postnext and sign in to PostNext
in your browser. That is the whole setup: there is no config file to edit, and
`--scope user` makes the server available in every project.

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

3. Sign in once with `codex mcp login postnext`. It opens the PostNext
   sign-in in your browser, and the token is kept for 30 days.

## Option G: ChatGPT

1. In ChatGPT on the web, open **Plugins**, select **+** and choose **Add
   custom MCP server**.
2. Name it PostNext, paste `https://mcp.postnext.io/api` under Connection,
   choose **OAuth** and tick **I understand and want to continue**.
3. Select **Create as a plugin**, install it, and sign in to PostNext when
   ChatGPT asks. In a chat, type **@** and pick PostNext.

OpenAI says full MCP access, with write tools, is on ChatGPT Business,
Enterprise and Edu; Pro can connect custom servers with read access. In a
Business workspace, an admin or owner creates the plugin. Older
guides that send you to Developer mode describe menus ChatGPT has replaced.
Steps checked on 18 November 2026; the current ones are kept at
[postnext.io/ai-agents/chatgpt](https://postnext.io/ai-agents/chatgpt).

## Option H: Your own scripts and agents (API key)

For your own scripts and agents, or any client that can't do OAuth:

1. Generate an API key at
   [postnext.io/account/api-keys](https://postnext.io/account/api-keys)
2. Send it to `https://mcp.postnext.io/api` as
   `Authorization: Bearer apikey_<uuid>` on every request
3. Use the standard MCP `initialize` → `tools/list` → `tools/call` flow

API keys don't expire automatically. Revoke any time from the dashboard.

## First conversation

After connecting, paste any of these into your assistant:

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

Your assistant will use [tools](tools.md), [resources](resources.md), and
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

- The Free plan includes 10 posts and 10 AI credits a month, 1 connected
  channel and 10 MB of storage. Each saved draft uses 1 AI credit. Creating,
  scheduling and uploading work on Free until those run out
- "Posts can be scheduled once this account has chosen a plan in the
  PostNext web app" (`limit_exceeded`, kind `trial_required`): a new account
  has not finished the plan step yet. Open the PostNext web app and start the
  free trial or choose **Continue with Free**, then ask again
- Four tools need a paid plan: `get_account_health`, `get_best_time_to_post`,
  `update_post_draft` and `update_brand_profile`
- The error includes a `freeAlternative` hint (often a read-only tool that
  still works). See
  [postnext.io/pricing](https://postnext.io/pricing) for plan limits

### "Resource not found" on `postnext://...`

- Resource URIs are case-sensitive. Correct: `postnext://teams/current`
  (plural). Wrong: `postnext://team/current`

## What's next

- [Tool reference](tools.md): all 25 tools, what they do, what they
  return
- [Resource reference](resources.md): read-on-demand context your
  assistant pulls automatically
- [Prompt reference](prompts.md): named multi-step workflows you can
  invoke directly
- [Recipes](../recipes): full worked examples for common tasks
- [Full docs at postnext.io/mcp/docs](https://postnext.io/mcp/docs)
