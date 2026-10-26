-- Imported history and Google: CSV and Google imports, Google OAuth grants, and the
-- Search Console property a site reads its search terms from.

-- Imported history (rows live in the shards' `imported` table).
CREATE TABLE IF NOT EXISTS imports (
	id TEXT PRIMARY KEY,
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	source TEXT NOT NULL CHECK (source IN ('csv', 'google')),
	label TEXT NOT NULL,
	from_day TEXT,
	to_day TEXT,
	status TEXT NOT NULL DEFAULT 'importing' CHECK (status IN ('importing', 'done', 'failed')),
	error TEXT,
	rows INTEGER NOT NULL DEFAULT 0,
	created_at INTEGER NOT NULL
);

-- Short-lived Google OAuth grants: a Google import, or connecting Search Console. Deleted
-- once used or after a day.
CREATE TABLE IF NOT EXISTS google_auth (
	id TEXT PRIMARY KEY,
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	purpose TEXT NOT NULL CHECK (purpose IN ('import', 'search')),
	access_token TEXT,
	refresh_token TEXT,
	expires_at INTEGER,
	created_at INTEGER NOT NULL
);

-- A site's Google Search Console property, read live for the search terms report.
CREATE TABLE IF NOT EXISTS search_console (
	site_id TEXT PRIMARY KEY REFERENCES sites (id) ON DELETE CASCADE,
	property TEXT NOT NULL,
	access_token TEXT NOT NULL,
	refresh_token TEXT NOT NULL,
	expires_at INTEGER NOT NULL,
	connected_by TEXT REFERENCES users (id) ON DELETE SET NULL,
	created_at INTEGER NOT NULL
);
