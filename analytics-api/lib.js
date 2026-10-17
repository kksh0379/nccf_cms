const crypto = require('node:crypto');
const net = require('node:net');

const PORTFOLIO_PREFIX = '/nccf_cms/portfolio/';

function normalizePortfolioPath(input) {
  if (typeof input !== 'string') return null;
  let pathname;
  try {
    pathname = new URL(input, 'https://kksh0379.github.io').pathname;
  } catch {
    return null;
  }
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  pathname = pathname.replace(/\/{2,}/g, '/');
  if (!pathname.startsWith(PORTFOLIO_PREFIX) || pathname.length > 300) return null;
  return pathname;
}

function parseScryptRecord(record) {
  if (typeof record !== 'string') return null;
  const [scheme, salt, hash] = record.split('$');
  if (scheme !== 'scrypt' || !salt || !hash || !/^[a-f0-9]{64}$/i.test(hash)) return null;
  return { salt, hash: Buffer.from(hash, 'hex') };
}

function verifyPassword(password, record) {
  const parsed = parseScryptRecord(record);
  if (!parsed || typeof password !== 'string' || password.length > 200) return false;
  const actual = crypto.scryptSync(password, parsed.salt, parsed.hash.length);
  return crypto.timingSafeEqual(actual, parsed.hash);
}

function tokenDigest(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function bearerToken(header) {
  if (typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+([A-Za-z0-9_-]{32,})$/);
  return match ? match[1] : null;
}

function safeIp(value) {
  if (typeof value !== 'string') return null;
  const ip = value.replace(/^::ffff:/, '').trim();
  return net.isIP(ip) ? ip : null;
}

function forwardedClientIp(header, fallback) {
  const firstForwarded = typeof header === 'string' ? header.split(',')[0].trim() : '';
  return safeIp(firstForwarded) || safeIp(fallback);
}

module.exports = {
  PORTFOLIO_PREFIX,
  normalizePortfolioPath,
  parseScryptRecord,
  verifyPassword,
  tokenDigest,
  bearerToken,
  safeIp,
  forwardedClientIp
};

