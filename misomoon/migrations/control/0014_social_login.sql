-- Sign-in with Google (apps/api/src/social.ts). A person who signs up this way
-- has no password: users.password_hash is '' until they set one.

-- The Google account behind a misomoon user, by the provider's own id, so a
-- changed email address still signs in to the same account.
CREATE TABLE IF NOT EXISTS user_logins (
	provider TEXT NOT NULL CHECK (provider IN ('google')),
	subject TEXT NOT NULL,
	user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	created_at INTEGER NOT NULL,
	PRIMARY KEY (provider, subject)
);
CREATE INDEX IF NOT EXISTS user_logins_user ON user_logins (user_id);

-- A sign-in on its way through the provider: the OAuth state, the PKCE verifier, the
-- hash of the invitation code it accepts, and `user_id` when a signed-in person connects
-- Google to their account. Each row is used once, within 10 minutes.
CREATE TABLE IF NOT EXISTS login_states (
	id TEXT PRIMARY KEY,
	provider TEXT NOT NULL,
	verifier TEXT NOT NULL,
	invite TEXT,
	user_id TEXT REFERENCES users (id) ON DELETE CASCADE,
	created_at INTEGER NOT NULL
);

-- The one-time code the callback hands the dashboard in the URL, which it trades for a
-- session. Stored as a hash, used once, within a minute, and only by the browser whose
-- state cookie matches `browser`.
CREATE TABLE IF NOT EXISTS login_codes (
	hash TEXT PRIMARY KEY,
	browser TEXT NOT NULL,
	user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	site_id TEXT,
	expires_at INTEGER NOT NULL
);
