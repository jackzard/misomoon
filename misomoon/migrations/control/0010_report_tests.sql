-- When each test report was sent, so a site sends at most a few an hour. The hourly run
-- deletes rows older than an hour.
CREATE TABLE IF NOT EXISTS report_tests (
	site_id TEXT NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
	sent_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS report_tests_site ON report_tests (site_id, sent_at);
