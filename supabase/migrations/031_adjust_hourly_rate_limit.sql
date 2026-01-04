-- Migration: Increase hourly AI rate limit from 15 to 20
-- Keeps daily/monthly caps unchanged while allowing a bit more burst usage

-- Update the default for new rows
ALTER TABLE ai_rate_limits
ALTER COLUMN max_per_hour SET DEFAULT 20;

-- Update existing rows that have the old default
UPDATE ai_rate_limits
SET max_per_hour = 20
WHERE max_per_hour = 15;
