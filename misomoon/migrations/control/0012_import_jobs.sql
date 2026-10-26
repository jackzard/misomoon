-- Imports from another tool's API (packages/core/src/importers) run as jobs that the
-- five-minute cron moves forward a few days at a time (apps/api/src/jobs.ts).

-- `source` names the importer too now, so it loses its CHECK: SQLite changes a CHECK
-- only by building the table again.
CREATE TABLE imports_next (
	id TEXT PRIMARY KEY,
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	-- csv, google, or an importer id such as umami
	source TEXT NOT NULL,
	label TEXT NOT NULL,
	from_day TEXT,
	to_day TEXT,
	status TEXT NOT NULL DEFAULT 'importing' CHECK (status IN ('importing', 'done', 'failed')),
	error TEXT,
	rows INTEGER NOT NULL DEFAULT 0,
	created_at INTEGER NOT NULL,
	skipped_days INTEGER NOT NULL DEFAULT 0
);
INSERT INTO imports_next (id, site_id, source, label, from_day, to_day, status, error, rows, created_at, skipped_days)
	SELECT id, site_id, source, label, from_day, to_day, status, error, rows, created_at, skipped_days FROM imports;
DROP TABLE imports;
ALTER TABLE imports_next RENAME TO imports;

-- One running API import. Deleted when it finishes or fails, with the sign-in it holds.
CREATE TABLE IF NOT EXISTS import_jobs (
	import_id TEXT PRIMARY KEY REFERENCES imports (id) ON DELETE CASCADE,
	site_id TEXT NOT NULL,
	importer TEXT NOT NULL,
	-- JSON: the form's fields, API key or password included
	input TEXT NOT NULL,
	from_day TEXT NOT NULL,
	to_day TEXT NOT NULL,
	-- the next day to read; the job walks back from to_day and ends after from_day
	next_day TEXT NOT NULL,
	days_done INTEGER NOT NULL DEFAULT 0,
	days_total INTEGER NOT NULL,
	-- runs in a row that ended with an error the tool may get over, such as a 503
	retries INTEGER NOT NULL DEFAULT 0,
	run_after INTEGER NOT NULL DEFAULT 0,
	-- a run holds the job until then, so two runs never read the same day
	lease_until INTEGER NOT NULL DEFAULT 0,
	updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS import_jobs_due ON import_jobs (run_after);
