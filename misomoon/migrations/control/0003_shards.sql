-- The shard registry and the routing table. See "Sharding" in docs/ARCHITECTURE.md.

-- Registry of shard databases. `binding` is the Worker binding name, e.g. SHARD_0.
CREATE TABLE IF NOT EXISTS shards (
	name TEXT PRIMARY KEY,
	binding TEXT NOT NULL,
	weight REAL NOT NULL DEFAULT 1,
	status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draining', 'readonly', 'retiring')),
	-- bytes on disk, refreshed hourly; placement favours shards with more free space
	size_bytes INTEGER NOT NULL DEFAULT 0,
	created_at INTEGER NOT NULL
);

-- Which shard holds which UTC days of a site. Ranges never overlap; to_day NULL is open.
CREATE TABLE IF NOT EXISTS shard_map (
	site_id TEXT NOT NULL,
	from_day INTEGER NOT NULL,
	to_day INTEGER,
	shard TEXT NOT NULL REFERENCES shards (name),
	PRIMARY KEY (site_id, from_day)
);

-- A closed range being copied off a retiring shard. `stage` walks events, sessions,
-- imported, then switch (shard_map points at to_shard) and purge (the old copy goes).
-- `cursor` is the JSON keyset of the last row copied in the current stage.
CREATE TABLE IF NOT EXISTS shard_moves (
	site_id TEXT NOT NULL,
	from_day INTEGER NOT NULL,
	to_day INTEGER NOT NULL,
	from_shard TEXT NOT NULL REFERENCES shards (name),
	to_shard TEXT NOT NULL REFERENCES shards (name),
	stage TEXT NOT NULL DEFAULT 'events' CHECK (stage IN ('events', 'sessions', 'imported', 'switch', 'purge')),
	cursor TEXT,
	switched_at INTEGER,
	PRIMARY KEY (site_id, from_day)
);
