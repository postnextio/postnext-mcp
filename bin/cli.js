#!/usr/bin/env node
'use strict';

// Prints the PostNext MCP connection config for a given client.
//
// The snippets here are the same strings the /mcp/<client> pages on
// postnext.io render, and the same ones the README and docs/quickstart.md
// carry. Three copies is two too many, so if one changes, change all three:
// postnextio config/mcp-pages.js is the source its own test pins.

var URL = 'https://mcp.postnext.io/api';

var CLIENTS = {
  'claude-code': {
    title: 'Claude Code',
    how: 'Run this once, from a terminal:',
    body: 'claude mcp add --transport http postnext ' + URL,
    note: 'Available in every session from then on. Check it with: claude mcp list'
  },
  'claude-desktop': {
    title: 'Claude Desktop',
    how: 'Add to your claude_desktop_config.json under "mcpServers", then restart:',
    body: JSON.stringify({ mcpServers: { postnext: { url: URL, transport: 'http' } } }, null, 2),
    note: 'Or use the one-click deep link at https://postnext.io/mcp/connect'
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
    note: 'On an older Codex that only reads stdio servers, also set\nexperimental_use_rmcp_client = true under [features], or upgrade.'
  },
  chatgpt: {
    title: 'ChatGPT',
    how: 'Settings > Apps > Advanced settings > Developer mode, then Create a plugin with this URL and Authentication set to OAuth:',
    body: URL,
    note: 'Before the July 2026 rename this lived under Connectors.'
  }
};

function print(key) {
  var c = CLIENTS[key];
  console.log('\n' + c.title + '\n');
  console.log(c.how + '\n');
  console.log(c.body + '\n');
  if (c.note) console.log(c.note + '\n');
  console.log('First tool call opens the PostNext sign-in in a browser. Approve it once.\n');
}

function usage() {
  console.log('\nPostNext MCP  ' + URL + '\n');
  console.log('Connection config for your client:\n');
  Object.keys(CLIENTS).forEach(function (k) {
    console.log('  npx postnext-mcp ' + (k + '              ').slice(0, 15) + ' ' + CLIENTS[k].title);
  });
  console.log('\n  npx postnext-mcp --url     print just the server URL');
  console.log('  npx postnext-mcp --json    print the mcpServers block\n');
  console.log('You need a PostNext account (free): https://postnext.io');
  console.log('Docs: https://postnext.io/mcp  |  https://github.com/postnextio/postnext-mcp\n');
  console.log('This package is a setup helper. The MCP server itself is hosted;');
  console.log('there is nothing to run locally.\n');
}

var arg = (process.argv[2] || '').replace(/^--/, '').toLowerCase();

if (arg === 'url') {
  console.log(URL);
} else if (arg === 'json') {
  console.log(JSON.stringify({ mcpServers: { postnext: { url: URL, transport: 'http' } } }, null, 2));
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
