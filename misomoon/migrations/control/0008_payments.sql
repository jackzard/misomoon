-- Revenue from payment providers, credited to the visit that brought the buyer.
-- See packages/core/src/payments.ts and "Payments" in docs/ARCHITECTURE.md.

-- A site's webhook from Stripe, Polar, Lemon Squeezy, Dodo Payments or its own server.
CREATE TABLE IF NOT EXISTS revenue_sources (
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	provider TEXT NOT NULL CHECK (provider IN ('stripe', 'polar', 'lemonsqueezy', 'dodo', 'custom')),
	-- the webhook signing secret; it has to be readable to check signatures
	secret TEXT NOT NULL,
	created_by TEXT REFERENCES users (id) ON DELETE SET NULL,
	created_at INTEGER NOT NULL,
	last_event_at INTEGER,
	last_test_at INTEGER,
	last_error TEXT,
	PRIMARY KEY (site_id, provider)
);

-- What a visit looked like when it handed out a key: a misomoon ref or a checkout id from
-- the tracker (kept 30 days), or a payment's subscription and customer once that payment
-- found its visit (kept 400 days, so yearly renewals still find it).
CREATE TABLE IF NOT EXISTS attribution (
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	key TEXT NOT NULL,
	-- JSON: the visit's columns as on its events (core Visit)
	visit TEXT NOT NULL,
	expires_at INTEGER NOT NULL,
	-- the payment that taught this key ('provider:id'), '' for a key from the tracker: a
	-- payment that moves to a stronger key moves the keys it taught, and no others
	source TEXT NOT NULL DEFAULT '',
	PRIMARY KEY (site_id, key)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS attribution_expires ON attribution (expires_at);

-- Every payment, refund and link a webhook delivered, once (provider ids are unique).
CREATE TABLE IF NOT EXISTS payments (
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	provider TEXT NOT NULL,
	id TEXT NOT NULL,
	kind TEXT NOT NULL CHECK (kind IN ('payment', 'refund', 'link')),
	-- major units; negative for a refund
	amount REAL NOT NULL,
	currency TEXT NOT NULL,
	ts INTEGER NOT NULL,
	-- JSON arrays: keys that may find the visit, and keys this payment teaches once it has one
	keys TEXT NOT NULL,
	links TEXT NOT NULL,
	billing TEXT,
	-- Lemon Squeezy refunds: the payment whose refunded total this one brings up to date
	refund_of TEXT,
	-- the key that found the visit, and that visit (JSON, as in attribution); NULL while the
	-- payment has none. Written last, once what depends on the payment has followed it.
	attributed_by TEXT,
	visit TEXT,
	created_at INTEGER NOT NULL,
	PRIMARY KEY (site_id, provider, id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS payments_refund_of ON payments (site_id, provider, refund_of) WHERE refund_of IS NOT NULL;
-- the payments to move when the key that found their visit leads to another one
CREATE INDEX IF NOT EXISTS payments_attributed_by ON payments (site_id, attributed_by) WHERE attributed_by IS NOT NULL;

-- Keys a payment is still waiting for: all of them while it has no visit, then those stronger
-- than the one that found it, so a key that turns up later moves the payment to its visit.
CREATE TABLE IF NOT EXISTS payment_keys (
	site_id TEXT NOT NULL,
	key TEXT NOT NULL,
	provider TEXT NOT NULL,
	payment_id TEXT NOT NULL,
	created_at INTEGER NOT NULL,
	PRIMARY KEY (site_id, key, provider, payment_id),
	FOREIGN KEY (site_id, provider, payment_id) REFERENCES payments (site_id, provider, id) ON DELETE CASCADE
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS payment_keys_payment ON payment_keys (site_id, provider, payment_id);
CREATE INDEX IF NOT EXISTS payment_keys_created ON payment_keys (created_at);
