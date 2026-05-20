# Quickstart

Connect [Claude](https://claude.ai) to your [PostNext](https://postnext.io)
account in 60 seconds. After this guide you'll be able to schedule posts,
draft threads, and audit your queue from inside a Claude conversation.

## Prerequisites

- A PostNext account — sign up free at [postnext.io](https://postnext.io)
- One of:
  - **Claude Desktop** (Mac, Windows) — for the one-click flow
  - **claude.ai** web — for the custom-connector flow
  - Any other MCP-aware client — for programmatic use with an API key

## Option A — Claude Desktop, one-click

1. Visit [postnext.io/mcp/connect](https://postnext.io/mcp/connect)
2. Click **Open in Claude Desktop**
3. Claude Desktop opens and asks to add the PostNext MCP server. Confirm.
4. On first tool use, a browser tab opens for the OAuth grant. Approve.
5. PostNext tools appear in Claude's tool picker.

This is the fastest path. The deep link is `claude://mcp/connect?url=…` —
nothing to copy or paste.

## Option B — Claude Desktop, manual

If the deep link doesn't work (some Linux distros, older Claude Desktop
versions), edit your Claude Desktop config file directly.

**Config file paths:**

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

(Claude Desktop is officially Mac + Windows. Linux users on community builds
should consult the project that packages their version.)

Add the `postnext` entry under `mcpServers`:

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

If you already have other MCP servers configured, merge — keep them all
under the same `mcpServers` object.

Restart Claude Desktop. Same OAuth grant on first tool use.

## Option C — claude.ai (web)

1. Open [claude.ai](https://claude.ai)
2. Click your profile menu → **Connectors**
3. Click **Add custom connector**
4. Paste `https://mcp.postnext.io/api`
5. Click **Connect** → approve the OAuth grant

PostNext tools become available across all your Claude.ai conversations.

## Option D — Programmatic / non-Claude clients

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
Draft a thread about <topic> in my brand voice.
```

```
Plan a week of posts across all my channels.
```

Claude will use [tools](tools.md), [resources](resources.md), and
[prompts](prompts.md) as needed — you don't have to know which.

## Troubleshooting

### "PostNext tools don't appear in Claude"

- Restart Claude Desktop fully (quit + reopen, not just close the window)
- Check the config file syntax — invalid JSON silently disables the
  server. Run `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .`
  on macOS to validate
- Look at Claude Desktop's MCP logs: in Claude → Settings → Developer →
  View MCP logs

### "Authorization failed" or 401 errors

- Your OAuth grant may have expired. Disconnect + reconnect from
  claude.ai → Connectors, or restart Claude Desktop and re-approve
- If using an API key directly, verify it starts with `apikey_` and
  isn't revoked at
  [postnext.io/account/api-keys](https://postnext.io/account/api-keys)

### "Rate limit exceeded"

- The server rate-limits per token and per IP. Limits are exposed in
  the `RateLimit-*` response headers — slow your calls down or wait
  for the window to reset

### "Upgrade required" / "Limit exceeded"

- Mutating tools require a paid plan with available quota. The error
  envelope includes an `upgradeUrl` plus a `freeAlternative` hint
  (often pointing you at a read-only equivalent). See
  [postnext.io/pricing](https://postnext.io/pricing) for plan limits

### "Resource not found" on `postnext://...`

- Resource URIs are case-sensitive. Correct: `postnext://teams/current`
  (plural). Wrong: `postnext://team/current`

## What's next

- [Tool reference](tools.md) — all 21 tools, what they do, what they
  return
- [Resource reference](resources.md) — read-on-demand context Claude
  pulls automatically
- [Prompt reference](prompts.md) — named multi-step workflows you can
  invoke directly
- [Recipes](../recipes) — full worked examples for common tasks
- [Full docs at postnext.io/mcp/docs](https://postnext.io/mcp/docs)
