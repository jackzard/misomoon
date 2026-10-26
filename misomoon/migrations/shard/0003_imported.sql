-- Daily aggregates imported from Google or a CSV export.
-- One row per local day, dimension and value. `ts` is
-- the local midnight of the day, so rows route to shards and windows like events.
-- dim '' holds the site totals.
CREATE TABLE IF NOT EXISTS imported (
	site_id TEXT NOT NULL,
	import_id TEXT NOT NULL,
	ts INTEGER NOT NULL,
	dim TEXT NOT NULL,
	key TEXT NOT NULL,
	visitors INTEGER NOT NULL DEFAULT 0,
	visits INTEGER NOT NULL DEFAULT 0,
	pageviews INTEGER NOT NULL DEFAULT 0,
	bounces INTEGER NOT NULL DEFAULT 0,
	duration INTEGER NOT NULL DEFAULT 0,
	events INTEGER NOT NULL DEFAULT 0,
	time_s INTEGER NOT NULL DEFAULT 0,
	time_n INTEGER NOT NULL DEFAULT 0,
	scroll INTEGER NOT NULL DEFAULT 0,
	scroll_n INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (site_id, dim, ts, key, import_id)
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS imported_import ON imported (site_id, import_id);
