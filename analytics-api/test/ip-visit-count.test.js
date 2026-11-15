const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../../portfolio/reports-8f3d2a/index.html'), 'utf8');
const server = fs.readFileSync(require('node:path').join(__dirname, '../server.js'), 'utf8');
const migration = fs.readFileSync(require('node:path').join(__dirname, '../migrations/001_init.sql'), 'utf8');

const snippet = html.slice(html.indexOf('    const esc='), html.indexOf('    async function load(){'));
const context = vm.createContext({});
vm.runInContext(snippet + '\nthis.showIp = displayIp; this.showName = displayIpName; this.showCount = displayVisitCount;', context);

test('all three known IPs including company render identification names in their own column', () => {
  assert.match(context.showName('211.109.218.86'), /시댁/);
  assert.match(context.showName('112.217.189.34'), /회사/);
  assert.match(context.showName('211.211.43.183'), /우리집/);
  assert.match(context.showName(' ::ffff:112.217.189.34 '), /회사/);
  assert.match(context.showIp('112.217.189.34'), /112\.217\.189\.34/);
  assert.doesNotMatch(context.showCount('112.217.189.34', 3), /3회/);
  assert.match(html, /<th>식별명<\/th><th>누적 방문<\/th>/);
});

test('unknown IP has no identification name and a separate numeric count cell', () => {
  assert.match(context.showName('203.0.113.17'), /미식별/);
  assert.match(context.showCount('203.0.113.17', 1), /1<span class="unit">회/);
  assert.match(context.showCount('203.0.113.17', 1234), /1,234<span class="unit">회/);
  assert.doesNotMatch(context.showCount('보존기간 만료', null), /누적|[0-9]회/);
  assert.match(html, /displayIpName\(v\.ip\)/);
  assert.match(html, /displayVisitCount\(v\.ip,v\.ip_visits\)/);
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
