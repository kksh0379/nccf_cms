CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL CHECK (char_length(page_path) BETWEEN 1 AND 300),
  ip_address INET,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS page_views_path_visited_idx
  ON page_views (page_path, visited_at DESC);

CREATE INDEX IF NOT EXISTS page_views_visited_idx
  ON page_views (visited_at DESC);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx
  ON admin_sessions (expires_at);


-- Efficient per-IP as-of visit counts for the private recent-visit log.
CREATE INDEX IF NOT EXISTS page_views_ip_visited_id_idx
  ON page_views (ip_address, visited_at, id)
  WHERE ip_address IS NOT NULL;

-- Admin-only IP enrichment, retained no longer than the existing IP logs.
CREATE TABLE IF NOT EXISTS ip_network_cache (
  ip_address INET PRIMARY KEY,
  country_code CHAR(2),
  network_type TEXT NOT NULL DEFAULT '확인 불가',
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ip_network_cache_checked_idx
  ON ip_network_cache (checked_at);
