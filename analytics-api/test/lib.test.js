const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {
  normalizePortfolioPath,
  verifyPassword,
  bearerToken,
  safeIp,
  forwardedClientIp
} = require('../lib');

test('normalizes only portfolio paths', () => {
  assert.equal(normalizePortfolioPath('/nccf_cms/portfolio/'), '/nccf_cms/portfolio/');
  assert.equal(normalizePortfolioPath('https://example.com/nccf_cms/portfolio/case/'), '/nccf_cms/portfolio/case/');
  assert.equal(normalizePortfolioPath('/nccf_cms/book-preview/'), null);
  assert.equal(normalizePortfolioPath('/nccf_cms/portfolio-old/'), null);
});

test('verifies scrypt password records', () => {
  const salt = 'unit-test-salt';
  const expected = crypto.scryptSync('correct horse', salt, 32).toString('hex');
  const record = `scrypt$${salt}$${expected}`;
  assert.equal(verifyPassword('correct horse', record), true);
  assert.equal(verifyPassword('wrong', record), false);
  assert.equal(verifyPassword('correct horse', 'bad-record'), false);
});

test('extracts bearer tokens and validates IP strings', () => {
  assert.equal(bearerToken(`Bearer ${'a'.repeat(32)}`), 'a'.repeat(32));
  assert.equal(bearerToken('Basic abc'), null);
  assert.equal(safeIp('::ffff:203.0.113.7'), '203.0.113.7');
  assert.equal(safeIp('not an ip'), null);
  assert.equal(forwardedClientIp('203.0.113.10, 10.0.0.2', '10.0.0.3'), '203.0.113.10');
  assert.equal(forwardedClientIp(undefined, '::ffff:198.51.100.4'), '198.51.100.4');
});

