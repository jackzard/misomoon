-- When the daily billing check last asked Polar about a team (apps/api/src/billing.ts,
-- reconcileBilling). It reads the teams asked longest ago first, so teams whose
-- subscription it can't settle move to the back instead of holding back the rest.
ALTER TABLE teams ADD COLUMN polar_checked_at INTEGER;

-- The Polar product a subscription was last recorded on (billing.ts, planOf). A running
-- subscription moved to a product that is none of the plans then gets no plan, instead of
-- keeping the one it was recorded with. NULL for subscriptions recorded before this column.
ALTER TABLE polar_subscriptions ADD COLUMN product_id TEXT;
