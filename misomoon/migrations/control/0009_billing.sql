-- misomoon Cloud billing through Polar: what teams pay for misomoon itself. See
-- apps/api/src/billing.ts and docs/billing.md. Customers' own Polar sales are revenue
-- (0008_payments.sql), a separate feature.

-- Every Polar subscription a team has paid with, in the newest state a webhook or a plan
-- switch brought. The team's plan columns (teams.plan, plan_status, plan_period_end,
-- polar_subscription_id) follow the team's newest live subscription.
CREATE TABLE IF NOT EXISTS polar_subscriptions (
	-- Polar's subscription id
	id TEXT PRIMARY KEY,
	team_id TEXT NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
	customer_id TEXT NOT NULL,
	-- the plan its Polar product is (POLAR_PRODUCT_STARTER, _GROWTH, _SCALE)
	plan TEXT NOT NULL,
	-- Polar's status: active, trialing, past_due, canceled, unpaid, paused, incomplete...
	status TEXT NOT NULL,
	-- 1 while it pays for a plan: active, trialing or past_due, and not ended
	live INTEGER NOT NULL,
	-- what teams.plan_status shows while it is live: active, past_due or canceled
	plan_status TEXT,
	-- the end of the paid period, ms; for a canceled subscription, when it ends
	period_end INTEGER,
	-- when it started, ms; the newest live one sets the team's plan
	started_at INTEGER NOT NULL,
	-- Polar's modified_at (created_at before any change), in microseconds. A webhook with an
	-- older one arrived out of order and changes nothing.
	modified_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS polar_subscriptions_team ON polar_subscriptions (team_id);

-- The webhook-id of each Polar webhook handled in the last 30 days. Polar sends a retry
-- with the same id, so a second delivery changes nothing.
CREATE TABLE IF NOT EXISTS polar_webhooks (
	id TEXT PRIMARY KEY,
	received_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS polar_webhooks_received ON polar_webhooks (received_at);
