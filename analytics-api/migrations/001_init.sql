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

