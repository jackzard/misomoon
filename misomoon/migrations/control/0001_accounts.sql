-- Small, hot, relational data. Event data lives in the shards.
-- People, teams, and how they get in: roles, guests, invitations, API keys, sign-in
-- sessions and password resets. See "Auth and team roles" in docs/ARCHITECTURE.md.

-- People. Passwords are PBKDF2 hashes (`salt:hash`).
CREATE TABLE IF NOT EXISTS users (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE COLLATE NOCASE,
	name TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	created_at INTEGER NOT NULL,
	-- misomoon Cloud: when this person's one free trial started, on the first team they
	-- created. A later team of theirs starts without a trial.
	trial_started_at INTEGER
);

-- A team owns sites. Members hold one role on every site of the team.
CREATE TABLE IF NOT EXISTS teams (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	created_at INTEGER NOT NULL,
	-- The misomoon Cloud plan (PLANS in packages/core/src/plans.ts): starter, growth or
	-- scale. Polar's subscription webhooks set it (apps/api/src/billing.ts), and support sets
	-- it by hand for a team without a subscription. NULL is the trial, with the trial plan's
	-- limits. Only a server with PLANS=on reads it ("Plans" in docs/configuration.md).
	plan TEXT,
	-- When the free trial ends; equal to created_at for a team that has no trial. A team
	-- with no plan past this time is lapsed: it stops counting and can't add sites.
	trial_ends_at INTEGER,
	-- Polar billing (docs/billing.md): the customer and subscription behind `plan`, the
	-- subscription's status (active, past_due, canceled) and the end of the paid period.
	polar_customer_id TEXT,
	polar_subscription_id TEXT,
	plan_status TEXT,
	plan_period_end INTEGER
);

CREATE TABLE IF NOT EXISTS team_members (
	team_id TEXT NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
	user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'billing')),
	created_at INTEGER NOT NULL,
	PRIMARY KEY (team_id, user_id)
);
CREATE INDEX IF NOT EXISTS team_members_user ON team_members (user_id);

-- Guests see one site without joining its team.
CREATE TABLE IF NOT EXISTS site_guests (
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
	created_at INTEGER NOT NULL,
	PRIMARY KEY (site_id, user_id)
);
CREATE INDEX IF NOT EXISTS site_guests_user ON site_guests (user_id);

-- Pending invitations to a team (site_id NULL) or to one site as a guest.
CREATE TABLE IF NOT EXISTS invitations (
	id TEXT PRIMARY KEY,
	team_id TEXT NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
	site_id TEXT REFERENCES sites (id) ON DELETE CASCADE,
	email TEXT NOT NULL COLLATE NOCASE,
	role TEXT NOT NULL,
	hash TEXT NOT NULL UNIQUE,
	invited_by TEXT REFERENCES users (id) ON DELETE SET NULL,
	expires_at INTEGER NOT NULL,
	created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS invitations_team ON invitations (team_id);

-- A key acts as the user who made it, optionally limited to one site.
CREATE TABLE IF NOT EXISTS api_keys (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	hash TEXT NOT NULL UNIQUE,
	prefix TEXT NOT NULL,
	user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	site_id TEXT REFERENCES sites (id) ON DELETE CASCADE,
	created_at INTEGER NOT NULL,
	last_used_at INTEGER
);

-- Signed-in browsers and unlocked shared links. Only a SHA-256 of the token is stored.
CREATE TABLE IF NOT EXISTS sessions (
	hash TEXT PRIMARY KEY,
	user_id TEXT REFERENCES users (id) ON DELETE CASCADE,
	share_slug TEXT REFERENCES shared_links (slug) ON DELETE CASCADE,
	expires_at INTEGER NOT NULL,
	created_at INTEGER NOT NULL,
	CHECK ((user_id IS NULL) <> (share_slug IS NULL))
);

CREATE TABLE IF NOT EXISTS password_resets (
	hash TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	expires_at INTEGER NOT NULL
);
