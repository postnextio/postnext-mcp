// Guards every tool count and tool list in this repo against docs/tools.md.
//
// Why: these numbers have gone stale twice without anyone noticing. The README
// claimed 27 tools from 2026-08-02 (when the six bio-page tools shipped) until
// 2026-09-10, and the marketing site made the same mistake independently. Both
// were found by accident, months late. docs/tools.md is the reference, so it is
// the source of truth here: every other count and list in the repo must agree
// with the tools it documents.
//
// The server itself lives in another repo. When a postnext-main-app-backend
// checkout sits beside this one, its allTools array is cross-checked too. When
// it does not, the test SAYS SO rather than skipping quietly - a silent skip is
// how the drift survived.
//
// Run: npm test   (or: node test/tool-consistency.test.js)

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

let failures = 0;
const fail = (m) => { failures++; console.error('FAIL: ' + m); };
const pass = (m) => console.log('PASS  ' + m);

// ---- the reference ----------------------------------------------------------
const tools = read('docs/tools.md');
const documented = [...tools.matchAll(/^### `([a-z_]+)`$/gm)].map((m) => m[1]);
const canonical = new Set(documented);

if (documented.length === 0) {
    fail('docs/tools.md documents no tools at all - the selector is broken, not the docs');
    console.error('1 failure(s)');
    process.exit(1);
}
if (canonical.size !== documented.length) fail('docs/tools.md documents a tool twice');
const N = documented.length;
pass('docs/tools.md documents ' + N + ' tools');

// ---- counts stated in prose -------------------------------------------------
const stated = [
    ['docs/tools.md', tools, /exposes (\d+) tools/],
    ['README.md', read('README.md'), /\*\*Tools\*\*: (\d+)/],
    ['README.md link', read('README.md'), /all (\d+) tools, gating/],
    ['docs/quickstart.md', read('docs/quickstart.md'), /all (\d+) tools/],
];
for (const [label, body, re] of stated) {
    const m = body.match(re);
    if (!m) fail(label + ': could not find its tool count at all (pattern moved?)');
    else if (Number(m[1]) !== N) fail(label + ' says ' + m[1] + ' tools, docs/tools.md documents ' + N);
    else pass(label + ' says ' + N);
}

// ---- the README table must list exactly the documented tools ----------------
const readme = read('README.md');
const tableRows = [...readme.matchAll(/^\| \*\*[^|]+\*\* \| (.+) \|$/gm)].map((m) => m[1]);
const inTable = new Set();
for (const row of tableRows) for (const m of row.matchAll(/`([a-z_]+)`/g)) inTable.add(m[1]);
if (inTable.size === 0) {
    fail('README tool table parsed to nothing - selector broken');
} else {
    const missing = documented.filter((t) => !inTable.has(t));
    const unknown = [...inTable].filter((t) => !canonical.has(t));
    if (missing.length) fail('README table omits: ' + missing.join(', '));
    if (unknown.length) fail('README table lists tools docs/tools.md does not document: ' + unknown.join(', '));
    if (!missing.length && !unknown.length) pass('README table covers all ' + N + ' documented tools');
}

// ---- cross-check the server, loudly when it is not reachable ----------------
const indexTs = path.join(root, '..', 'postnext-main-app-backend', 'src', 'mcp', 'tools', 'index.ts');
if (!fs.existsSync(indexTs)) {
    console.log('NOTE  backend checkout not found at ' + indexTs);
    console.log('NOTE  the documented tool list was NOT cross-checked against the server this run.');
} else {
    const src = fs.readFileSync(indexTs, 'utf8');
    const start = src.indexOf('= [', src.indexOf('export const allTools'));
    const end = src.indexOf('];', start);
    if (start < 0 || end < 0) {
        fail('could not parse allTools from ' + indexTs);
    } else {
        const registered = new Set(src.slice(start + 3, end)
            .replace(/\/\/.*/g, '').split(',').map((s) => s.trim()).filter(Boolean)
            .map((s) => s.replace(/Tool$/, '').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()));
        const missing = [...registered].filter((t) => !canonical.has(t));
        const extra = documented.filter((t) => !registered.has(t));
        if (missing.length) fail('the server registers tools this repo does not document: ' + missing.join(', '));
        if (extra.length) fail('this repo documents tools the server does not register: ' + extra.join(', '));
        if (!missing.length && !extra.length) pass('backend allTools matches all ' + N + ' documented tools');
    }
}

if (failures) { console.error(failures + ' failure(s)'); process.exit(1); }
console.log('tool-consistency: OK (' + N + ' tools)');
