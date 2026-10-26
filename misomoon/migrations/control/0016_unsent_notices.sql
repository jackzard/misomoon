-- Plan and daily-cap emails the provider refused for everyone wait with `sent_at` or
-- `capped_at` at minus the tries so far (0 or below) for the hourly run to send again
-- (resendPlanNotices, resendCapNotices). Every other reader treats any value but NULL as
-- sent or capped. These partial indexes hold only those rows, so the hourly reads touch
-- nothing else.
CREATE INDEX IF NOT EXISTS plan_notices_unsent ON plan_notices (month) WHERE sent_at <= 0;
CREATE INDEX IF NOT EXISTS usage_daily_unsent ON usage_daily (day) WHERE capped_at <= 0;
