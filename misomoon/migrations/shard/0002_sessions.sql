-- Visits. Every event upserts its visit, so bounce, duration, entry and exit pages are
-- single-table reads.

CREATE TABLE IF NOT EXISTS sessions (
	site_id TEXT NOT NULL,
	session_id TEXT NOT NULL,
	visitor_id TEXT NOT NULL,
	-- the visitor's id under the next day's salt, when the visit ran on past 00:00 UTC
	next_visitor_id TEXT,
	started_at INTEGER NOT NULL,
	last_at INTEGER NOT NULL,
	entry_path TEXT,
	exit_path TEXT,
	pageviews INTEGER NOT NULL DEFAULT 0,
	events INTEGER NOT NULL DEFAULT 0,
	engaged_ms INTEGER NOT NULL DEFAULT 0,
	-- first to last pageview or custom event of the visit; engagement pings don't count
	duration_ms INTEGER NOT NULL DEFAULT 0,
	hostname TEXT,
	referrer TEXT,
	referrer_host TEXT,
	source TEXT,
	channel TEXT,
	utm_source TEXT,
	utm_medium TEXT,
	utm_campaign TEXT,
	utm_term TEXT,
	utm_content TEXT,
	country TEXT,
	region TEXT,
	city TEXT,
	continent TEXT,
	timezone TEXT,
	asn_org TEXT,
	browser TEXT,
	browser_version TEXT,
	os TEXT,
	os_version TEXT,
	device TEXT,
	screen TEXT,
	language TEXT,
	PRIMARY KEY (site_id, session_id)
) WITHOUT ROWID;

-- Reports, retention and shard moves read a site's visits by start time.
CREATE INDEX IF NOT EXISTS sessions_site_started ON sessions (site_id, started_at);
-- The open visits of a batch's visitors (openSessionsStmt names these two with INDEXED BY).
-- `last_at` is left out: every event moves it, and an index entry that changes is one more
-- written row. A visitor has a few visits a day, so `last_at` is checked after the seek.
CREATE INDEX IF NOT EXISTS sessions_site_visitor ON sessions (site_id, visitor_id);
CREATE INDEX IF NOT EXISTS sessions_site_next_visitor ON sessions (site_id, next_visitor_id) WHERE next_visitor_id IS NOT NULL;
