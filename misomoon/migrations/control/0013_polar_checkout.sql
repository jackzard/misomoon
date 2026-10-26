-- The last Polar checkout opened for a team (apps/api/src/billing.ts). A second checkout
-- asks Polar about it first, so a team whose payment is still going through, or whose
-- webhook hasn't come yet, never pays for two subscriptions.
ALTER TABLE teams ADD COLUMN polar_checkout_id TEXT;
