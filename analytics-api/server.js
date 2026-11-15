const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const { Pool } = require('pg');
const {queryIp, lookupable, UNKNOWN} = require('./ip-enrichment');
const {
  normalizePortfolioPath,
  verifyPassword,
  tokenDigest,
  bearerToken,
  forwardedClientIp
} = require('./lib');

const PORT = Number(process.env.PORT || 10000);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://kksh0379.github.io';
const SESSION_TTL_MINUTES = 30;
const IP_RETENTION_DAYS = 90;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '8kb', strict: true }));
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  });
  const origin = req.get('origin');
  if (origin === ALLOWED_ORIGIN) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') return origin === ALLOWED_ORIGIN ? res.sendStatus(204) : res.sendStatus(403);
  next();
});

function requireAllowedOrigin(req, res, next) {
  if (req.get('origin') !== ALLOWED_ORIGIN) return res.status(403).json({ error: 'forbidden_origin' });
  next();
}

const failedLogins = new Map();
function loginRateLimit(req, res, next) {
  const key = forwardedClientIp(req.get('x-forwarded-for'), req.socket.remoteAddress) || 'unknown';
  const now = Date.now();
  const entry = failedLogins.get(key);
  if (entry && entry.resetAt > now && entry.count >= 5) {
    res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'too_many_attempts' });
  }
  if (entry && entry.resetAt <= now) failedLogins.delete(key);
  req.loginRateKey = key;
  next();
}

function recordFailedLogin(key) {
  const now = Date.now();
  const entry = failedLogins.get(key);
  if (!entry || entry.resetAt <= now) {
    failedLogins.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    entry.count += 1;
  }
}

async function requireAdmin(req, res, next) {
  const token = bearerToken(req.get('authorization'));
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const result = await pool.query(
      'SELECT 1 FROM admin_sessions WHERE token_hash = $1 AND expires_at > NOW()',
      [tokenDigest(token)]
    );
    if (!result.rowCount) return res.status(401).json({ error: 'session_expired' });
    next();
  } catch (error) {
    next(error);
  }
}

app.get('/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/pageviews', requireAllowedOrigin, async (req, res, next) => {
  const pagePath = normalizePortfolioPath(req.body && req.body.path);
  const ip = forwardedClientIp(req.get('x-forwarded-for'), req.socket.remoteAddress);
  if (!pagePath || !ip) return res.status(400).json({ error: 'invalid_request' });
  try {
    await pool.query('INSERT INTO page_views (page_path, ip_address) VALUES ($1, $2::inet)', [pagePath, ip]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', requireAllowedOrigin, loginRateLimit, async (req, res, next) => {
  const password = req.body && req.body.password;
  if (!verifyPassword(password, process.env.ADMIN_PASSWORD_SCRYPT)) {
    recordFailedLogin(req.loginRateKey);
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  failedLogins.delete(req.loginRateKey);
  const token = crypto.randomBytes(32).toString('base64url');
  try {
    const result = await pool.query(
      `INSERT INTO admin_sessions (token_hash, expires_at)
       VALUES ($1, NOW() + ($2 * INTERVAL '1 minute'))
       RETURNING expires_at`,
      [tokenDigest(token), SESSION_TTL_MINUTES]
    );
    res.json({ token, expiresAt: result.rows[0].expires_at });
  } catch (error) {
    next(error);
  }
});

app.post('/api/book/unlock', requireAllowedOrigin, loginRateLimit, (req, res) => {
  const password = req.body && req.body.password;
  if (!verifyPassword(password, process.env.ADMIN_PASSWORD_SCRYPT)) {
    recordFailedLogin(req.loginRateKey);
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  failedLogins.delete(req.loginRateKey);
  res.json({ key: process.env.BOOK_CONTENT_KEY });
});

// A lookup is performed only when the owner opens the protected analytics page.
// Limit new external requests, keep the page usable on provider failure, and reuse
// the result across repeat visits from the same IP.
async function enrichRecentLogs(rows) {
  const ips = [...new Set(rows.map(r => r.ip).filter(lookupable))];
  if (!ips.length) return rows.map(row => ({...row,country_code:null,network_type:UNKNOWN}));
  const existing = await pool.query(
    `SELECT host(ip_address) AS ip,country_code,network_type,checked_at
       FROM ip_network_cache WHERE ip_address = ANY($1::inet[])
       AND checked_at > NOW() - INTERVAL '30 days'`, [ips]
  );
  const known = new Map(existing.rows.filter(row =>
    (row.country_code != null || Date.now() - new Date(row.checked_at).getTime() < 86400000)
  ).map(row => [row.ip,row]));
  const toFetch = ips.filter(ip => !known.has(ip)).slice(0, 8);
  // Eight parallel requests cap the cold-start latency near one provider timeout.
  const fetched = await Promise.all(toFetch.map(async ip => ({ip,...await queryIp(ip)})));
  await Promise.all(fetched.map(async row => {
    known.set(row.ip,row);
    try {
      await pool.query(
        `INSERT INTO ip_network_cache (ip_address,country_code,network_type,checked_at)
         VALUES ($1::inet,$2,$3,NOW())
         ON CONFLICT (ip_address) DO UPDATE
           SET country_code=EXCLUDED.country_code,
               network_type=EXCLUDED.network_type,checked_at=NOW()`,
        [row.ip,row.country_code,row.network_type]
      );
    } catch {
      // Enrichment is best-effort. Never break the private statistics view.
    }
  }));
  return rows.map(row => ({
    ...row,country_code:known.get(row.ip)?.country_code || null,
    network_type:known.get(row.ip)?.network_type || UNKNOWN
  }));
}

app.get('/api/admin/stats', requireAllowedOrigin, requireAdmin, async (_req, res, next) => {
  try {
    const [totals, logs] = await Promise.all([
      pool.query(`
        SELECT page_path AS path,
               COUNT(*)::int AS total,
               COUNT(*) FILTER (
                 WHERE visited_at >= date_trunc('day', NOW() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul'
               )::int AS today
        FROM page_views
        GROUP BY page_path
        ORDER BY total DESC, page_path ASC
      `),
      pool.query(`
        SELECT pv.visited_at AS time,
               COALESCE(host(pv.ip_address), '보존기간 만료') AS ip,
               pv.page_path AS path,
               CASE WHEN pv.ip_address IS NULL THEN NULL ELSE (
                 SELECT COUNT(*)::int
                 FROM page_views earlier
                 WHERE earlier.ip_address = pv.ip_address
                   AND (earlier.visited_at, earlier.id) <= (pv.visited_at, pv.id)
               ) END AS ip_visits
        FROM page_views pv
        ORDER BY pv.visited_at DESC, pv.id DESC
        LIMIT 100
      `)
    ]);
    let recent = logs.rows;
    try { recent = await enrichRecentLogs(logs.rows); }
    catch { recent = logs.rows.map(row => ({...row,country_code:null,network_type:UNKNOWN})); }
    res.json({ pages: totals.rows, recent, timezone: 'Asia/Seoul' });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error && error.message ? error.message : 'Unhandled server error');
  if (!res.headersSent) {
    const badJson = error && error.type === 'entity.parse.failed';
    res.status(badJson ? 400 : 500).json({ error: badJson ? 'invalid_json' : 'server_error' });
  }
});

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', '001_init.sql'), 'utf8');
  await pool.query(sql);
  await cleanupExpiredData();
}

async function cleanupExpiredData() {
  await pool.query('DELETE FROM admin_sessions WHERE expires_at <= NOW()');
  await pool.query(
    `UPDATE page_views SET ip_address = NULL
     WHERE ip_address IS NOT NULL AND visited_at < NOW() - ($1 * INTERVAL '1 day')`,
    [IP_RETENTION_DAYS]
  );
  await pool.query(`
    DELETE FROM ip_network_cache
    WHERE checked_at < NOW() - INTERVAL '90 days'
       OR NOT EXISTS (
         SELECT 1 FROM page_views WHERE page_views.ip_address = ip_network_cache.ip_address
       )
  `);
  await pool.query(`
    DELETE FROM page_views
    WHERE ip_address <<= inet '10.0.0.0/8'
       OR ip_address <<= inet '172.16.0.0/12'
       OR ip_address <<= inet '192.168.0.0/16'
       OR ip_address <<= inet '127.0.0.0/8'
       OR ip_address <<= inet 'fc00::/7'
       OR ip_address <<= inet 'fe80::/10'
       OR ip_address = inet '::1'
  `);
}

async function start() {
  for (const key of ['DATABASE_URL', 'ADMIN_PASSWORD_SCRYPT', 'BOOK_CONTENT_KEY']) {
    if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
  }
  await migrate();
  const cleanupTimer = setInterval(() => {
    cleanupExpiredData().catch((error) => console.error(error && error.message ? error.message : 'Cleanup failed'));
  }, 24 * 60 * 60 * 1000);
  cleanupTimer.unref();
  app.listen(PORT, '0.0.0.0', () => console.log(`Analytics API listening on ${PORT}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error(error && error.message ? error.message : 'Startup failed');
    process.exit(1);
  });
}

module.exports = { app, migrate, cleanupExpiredData, start };

