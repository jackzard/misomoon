-- Event data for the sites routed to this shard. Every shard has the same schema.
-- Each index adds a written row to every insert (D1 bills rows written), so `events` keeps
-- only the indexes a query needs. packages/core/test/indexes.test.ts lists them.

CREATE TABLE IF NOT EXISTS events (
	-- random id given at the edge: a queue retry replays the batch, and a replayed event is ignored
	event_id TEXT NOT NULL,
	site_id TEXT NOT NULL,
	ts INTEGER NOT NULL,
	name TEXT NOT NULL,
	visitor_id TEXT NOT NULL,
	session_id TEXT NOT NULL,
	hostname TEXT,
	pathname TEXT,
	title TEXT,
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
	viewport INTEGER,
	language TEXT,
	engaged_ms INTEGER,
	scroll_depth INTEGER,
	lcp REAL,
	inp REAL,
	cls REAL,
	fcp REAL,
	ttfb REAL,
	revenue REAL,
	currency TEXT,
	props TEXT,
	-- Page interactions, as JSON (EventDetail in packages/core/src/types.ts): a pageview's site
	-- search term, and the clicks, errors, forms, media and content its engagement beacons
	-- carried, appended in the order they arrived.
	detail TEXT,
	-- The engagement beacons added to this pageview (pingStmts in packages/core/src/ingest.ts):
	-- a 7-character hash of each one's event id and a space, so a replayed beacon adds nothing. An
	-- engagement beacon is never a row of its own: it adds its time, scroll depth, Web Vitals
	-- and `detail` here, with one update that touches no indexed column.
	pings TEXT
);

-- Deduplicates replayed events, and finds one event by id (payments, the ingest cap).
CREATE UNIQUE INDEX IF NOT EXISTS events_event_id ON events (event_id);
-- Every report, purge and shard move reads a site's events by time.
CREATE INDEX IF NOT EXISTS events_site_ts ON events (site_id, ts);
