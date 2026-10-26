-- What ingest needs from the control database: the daily salts, the usage the daily
-- ingest cap and the monthly plan limit count, and the plan emails sent. See "Ingest" and
-- "Ingest cap" in docs/ARCHITECTURE.md.

-- One random salt per UTC day; rows older than two days are deleted by the cron.
CREATE TABLE IF NOT EXISTS salts (
	day INTEGER PRIMARY KEY,
	salt TEXT NOT NULL
);

-- What each site stored per UTC day (`day` is days since the epoch), counted from the
-- rows the shard actually inserted, so a replayed queue batch adds nothing.
CREATE TABLE IF NOT EXISTS usage_daily (
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	day INTEGER NOT NULL,
	-- pageviews and custom events: what a plan counts
	events INTEGER NOT NULL DEFAULT 0,
	-- every stored row, engagement pings too: what the cap counts, since each costs a write
	stored INTEGER NOT NULL DEFAULT 0,
	-- events the cap or a block dropped, each once, a retried batch included
	dropped INTEGER NOT NULL DEFAULT 0,
	-- when the cap first dropped an event that day; the owners are emailed once
	capped_at INTEGER,
	-- The room the last statement to take some under the cap got. A queue consumer takes room
	-- by adding it to `stored` in one statement, which returns this, so two consumers can't
	-- both take the last of it; it gives back what it didn't write once the write is done.
	last_grant INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (site_id, day)
) WITHOUT ROWID;

-- The ref-only beacons (payment refs, no event row) already counted, so a retried queue
-- batch counts none twice. Kept for 2 days.
CREATE TABLE IF NOT EXISTS usage_refs (
	event_id TEXT PRIMARY KEY,
	at INTEGER NOT NULL
) WITHOUT ROWID;

-- misomoon Cloud (PLANS=on): the monthly event emails each team got, so each goes out once.
-- `month` is the UTC month as months since January 1970 (core utcMonth); `level` is the
-- percent of the plan's events: 80, 100, and 125, the stop. Keyed by plan too, so a team that
-- moves to another plan mid-month gets that plan's emails. Rows older than 3 months are
-- deleted by the daily cleanup. See "Ingest cap" in docs/ARCHITECTURE.md.
CREATE TABLE IF NOT EXISTS plan_notices (
	team_id TEXT NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
	month INTEGER NOT NULL,
	plan TEXT NOT NULL,
	level INTEGER NOT NULL,
	sent_at INTEGER NOT NULL,
	PRIMARY KEY (team_id, month, plan, level)
) WITHOUT ROWID;
