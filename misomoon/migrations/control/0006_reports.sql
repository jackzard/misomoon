-- Sharing a site's stats: shared links, email reports and alerts, and chart annotations.

-- Read-only dashboard links, optionally password protected and limited to a segment.
CREATE TABLE IF NOT EXISTS shared_links (
	slug TEXT PRIMARY KEY,
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	password_hash TEXT,
	segment_id TEXT REFERENCES segments (id) ON DELETE SET NULL,
	expires_at INTEGER,
	created_at INTEGER NOT NULL
);

-- Scheduled email reports and traffic alerts. kind: weekly, monthly, spike, drop.
CREATE TABLE IF NOT EXISTS email_reports (
	id TEXT PRIMARY KEY,
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	email TEXT NOT NULL,
	kind TEXT NOT NULL CHECK (kind IN ('weekly', 'monthly', 'spike', 'drop')),
	threshold INTEGER,
	last_sent_at INTEGER,
	created_at INTEGER NOT NULL,
	UNIQUE (site_id, email, kind)
);

-- Notes on the timeline (deploys, campaigns), shown on the chart.
CREATE TABLE IF NOT EXISTS annotations (
	id TEXT PRIMARY KEY,
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	ts INTEGER NOT NULL,
	text TEXT NOT NULL,
	source TEXT NOT NULL DEFAULT 'manual',
	created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS annotations_site_ts ON annotations (site_id, ts);
