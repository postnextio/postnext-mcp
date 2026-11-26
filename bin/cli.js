#!/usr/bin/env node
'use strict';

// Prints the PostNext MCP connection config for a given client.
//
// The snippets here follow the /ai-agents/<client> pages on postnext.io,
// and the README and docs/quickstart.md carry the same steps. Three copies is two too many, so if one changes, change all three:
// postnextio config/ai-agents.js is the source its own test pins.

var URL = 'https://mcp.postnext.io/api';

var CLIENTS = {
  'claude-code': {
    title: 'Claude Code',
    how: 'Run this once, from a terminal:',
    body: 'claude mcp add --transport http --scope user postnext ' + URL,
    note: 'Available in every project from then on. Check it with: claude mcp list',
    signin: 'Then start Claude Code, type /mcp, select postnext and sign in to PostNext in the browser.'
  },
  'claude-desktop': {
    title: 'Claude Desktop / claude.ai',
    how: 'Customize > Connectors > + Add > Add custom connector, keep OAuth, and paste:',
    body: URL,
    note: 'Or use the one-click deep link at https://postnext.io/mcp/connect\n' +
      'Do not put it in claude_desktop_config.json: that file only starts local servers.'
  },
  cursor: {
    title: 'Cursor',
    how: 'Add to ~/.cursor/mcp.json (per-project: .cursor/mcp.json):',
    body: JSON.stringify({ mcpServers: { postnext: { url: URL } } }, null, 2),
    note: 'Settings > MCP also opens this file.'
  },
  codex: {
    title: 'Codex',
    how: 'Add to config.toml in your .codex folder:',
    body: '[mcp_servers.postnext]\nurl = "' + URL + '"',
    note: 'On an older Codex that only reads stdio servers, also set\nexperimental_use_rmcp_client = true under [features], or upgrade.',
    signin: 'Then sign in once with: codex mcp login postnext'
  },
  chatgpt: {
    title: 'ChatGPT',
    how: 'In ChatGPT on the web: Plugins > + > Add custom MCP server. Name it PostNext and paste this URL under Connection:',
    body: URL,
    after: 'Choose OAuth, tick I understand and want to continue, select Create as a plugin and install it.\n' +
      'In a chat, type @ and pick PostNext.',
    note: 'Write tools need ChatGPT Business, Enterprise or Edu; Pro connects with read access.\n' +
      'In a Business workspace, an admin or owner creates the plugin.\n' +
      'Current steps: https://postnext.io/ai-agents/chatgpt',
    signin: 'ChatGPT asks you to sign in to PostNext when you install the plugin.'
  }
};

function print(key) {
  var c = CLIENTS[key];
  console.log('\n' + c.title + '\n');
  console.log(c.how + '\n');
  console.log(c.body + '\n');
  if (c.after) console.log(c.after + '\n');
  console.log((c.signin || 'First tool call opens the PostNext sign-in in a browser. Approve it once.') + '\n');
  if (c.note) console.log(c.note + '\n');
}

function usage() {
  console.log('\nPostNext MCP  ' + URL + '\n');
  console.log('Connection config for your client:\n');
  Object.keys(CLIENTS).forEach(function (k) {
    console.log('  npx postnext-mcp ' + (k + '              ').slice(0, 15) + ' ' + CLIENTS[k].title);
  });
  console.log('\n  npx postnext-mcp --url     print just the server URL');
  console.log('  npx postnext-mcp --json    print the mcpServers block (Cursor and other url-based clients)\n');
  console.log('You need a PostNext account (free): https://postnext.io');
  console.log('Finish the plan step in the web app (free trial or Continue with Free) before scheduling.');
  console.log('Docs: https://postnext.io/mcp  |  https://github.com/postnextio/postnext-mcp\n');
  console.log('This package is a setup helper. The MCP server itself is hosted;');
  console.log('there is nothing to run locally.\n');
}

var arg = (process.argv[2] || '').replace(/^--/, '').toLowerCase();

if (arg === 'url') {
  console.log(URL);
} else if (arg === 'json') {
  console.log(JSON.stringify({ mcpServers: { postnext: { url: URL } } }, null, 2));
} else if (arg === 'version' || arg === 'v') {
  console.log(require('../package.json').version);
} else if (CLIENTS[arg]) {
  print(arg);
} else if (arg === '' || arg === 'help' || arg === 'h') {
  usage();
} else {
  console.error('Unknown client: ' + arg);
  usage();
  process.exit(1);
}
