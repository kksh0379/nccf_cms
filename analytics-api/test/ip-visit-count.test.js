const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../../portfolio/reports-8f3d2a/index.html'), 'utf8');
const server = fs.readFileSync(require('node:path').join(__dirname, '../server.js'), 'utf8');
const migration = fs.readFileSync(require('node:path').join(__dirname, '../migrations/001_init.sql'), 'utf8');

const snippet = html.slice(html.indexOf('    const esc='), html.indexOf('    async function load(){'));
const context = vm.createContext({});
vm.runInContext(snippet + '\nthis.showIp = displayIp;', context);

test('known IPs show their owner-defined names rather than a visit counter', () => {
  assert.match(context.showIp('211.109.218.86', 12), /시댁/);
  assert.match(context.showIp('112.147.189.34', 3), /회사/);
  assert.match(context.showIp('211.211.43.183', 7), /우리집/);
  assert.doesNotMatch(context.showIp('112.147.189.34', 3), /누적/);
});

test('unknown IP shows its historical as-of-log visit count', () => {
  assert.match(context.showIp('203.0.113.17', 1), /누적 1회/);
  assert.match(context.showIp('203.0.113.17', 1234), /누적 1,234회/);
  assert.doesNotMatch(context.showIp('보존기간 만료', null), /누적/);
  assert.doesNotMatch(context.showIp('203.0.113.17', 0), /누적/);
  assert.match(html, /displayIp\(v\.ip,v\.ip_visits\)/);
});

test('historical counts are derived in SQL before the recent 100 rows are limited', () => {
  const index = server.indexOf('FROM page_views earlier');
  const limit = server.indexOf('LIMIT 100', index);
  assert.ok(index !== -1 && limit > index);
  const query = server.slice(index - 140, limit);
  assert.match(query, /earlier\.ip_address\s*=\s*pv\.ip_address/);
  assert.match(query, /\(earlier\.visited_at, earlier\.id\)\s*<=\s*\(pv\.visited_at, pv\.id\)/);
  assert.match(query, /AS ip_visits/);
  assert.match(migration, /ON page_views \(ip_address, visited_at, id\)/);
});
