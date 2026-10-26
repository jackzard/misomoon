-- What a site's reports are built from: goals, funnels and saved segments.

CREATE TABLE IF NOT EXISTS goals (
	id TEXT PRIMARY KEY,
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	kind TEXT NOT NULL CHECK (kind IN ('event', 'page')),
	match TEXT NOT NULL,
	created_at INTEGER NOT NULL,
	UNIQUE (site_id, name)
);

CREATE TABLE IF NOT EXISTS funnels (
	id TEXT PRIMARY KEY,
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	steps TEXT NOT NULL,
	mode TEXT NOT NULL DEFAULT 'sequential' CHECK (mode IN ('sequential', 'strict', 'flexible')),
	created_at INTEGER NOT NULL
);

-- Segments: named, saved filter sets. user_id set = personal segment.
CREATE TABLE IF NOT EXISTS segments (
	id TEXT PRIMARY KEY,
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	user_id TEXT REFERENCES users (id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	filters TEXT NOT NULL,
	created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS segments_name ON segments (site_id, COALESCE(user_id, ''), name);
