-- Sites and their settings, and the managed first-party proxy.

CREATE TABLE IF NOT EXISTS sites (
	id TEXT PRIMARY KEY,
	domain TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	timezone TEXT NOT NULL DEFAULT 'UTC',
	team_id TEXT NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
	-- ISO 4217; revenue is reported in this currency only
	currency TEXT NOT NULL DEFAULT 'USD',
	public INTEGER NOT NULL DEFAULT 0,
	created_at INTEGER NOT NULL,
	-- Most events the site may store per UTC day. NULL takes INGEST_DAILY_CAP (no cap when
	-- that is unset too); 0 blocks the site. See "Ingest cap" in docs/ARCHITECTURE.md.
	ingest_cap INTEGER CHECK (ingest_cap IS NULL OR ingest_cap >= 0),
	-- What the site collects beyond pageviews (FEATURES in packages/core/src/features.ts):
	-- comma-separated names, NULL for the defaults. The Worker serves m.js?s=<site> with the
	-- tracker code for these only.
	features TEXT,
	-- URL parameters that hold the site search term, comma-separated; NULL for q, s, search,
	-- query and keyword.
	search_params TEXT,
	-- Path rules, so the tracker carries no code for them: comma-separated globs (* within a
	-- segment, ** across). NULL counts every path.
	include_paths TEXT,
	exclude_paths TEXT,
	-- Privacy settings (packages/core/src/privacy.ts). Visitor IP addresses and CIDR ranges
	-- whose beacons are dropped, comma-separated; NULL for none.
	exclude_ips TEXT,
	-- 1 drops beacons from browsers that send Global Privacy Control or Do Not Track.
	privacy_signals INTEGER NOT NULL DEFAULT 0,
	-- Days events and visits are kept; NULL keeps them as long as RETENTION_DAYS does.
	retention_days INTEGER,
	-- Where the site's events are stored: eu, us or apac, set when the site is added
	-- (packages/core/src/shard.ts). NULL places it on any shard, as on a server without
	-- regional shards.
	region TEXT
);
CREATE INDEX IF NOT EXISTS sites_team ON sites (team_id);

-- Managed first-party proxy: a site's own subdomain (stats.example.com) CNAMEd to
-- misomoon and registered as a Cloudflare for SaaS custom hostname. One per site.
CREATE TABLE IF NOT EXISTS proxy_domains (
	hostname TEXT PRIMARY KEY,
	site_id TEXT NOT NULL UNIQUE REFERENCES sites (id) ON DELETE CASCADE,
	cf_id TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'pending',
	ssl_status TEXT,
	-- JSON: TXT records Cloudflare asks for when the CNAME isn't visible yet
	verification TEXT,
	created_at INTEGER NOT NULL,
	checked_at INTEGER
);
