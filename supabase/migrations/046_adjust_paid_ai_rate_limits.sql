-- Migration: Adjust AI rate limits for paid plan usage.
-- Targets a balanced plan: 30/min, 200/hour, 80/day, 600/week, 1000/month.

ALTER TABLE ai_rate_limits
ALTER COLUMN max_per_minute SET DEFAULT 30,
ALTER COLUMN max_per_hour SET DEFAULT 200,
ALTER COLUMN max_per_day SET DEFAULT 80,
ALTER COLUMN max_per_week SET DEFAULT 600,
ALTER COLUMN max_per_month SET DEFAULT 1000;

-- Update existing rows that still match the previous beta defaults.
UPDATE ai_rate_limits
SET
  max_per_minute = 30,
  max_per_hour = 200,
  max_per_day = 80,
  max_per_week = 600,
  max_per_month = 1000
WHERE max_per_minute = 5
  AND max_per_hour = 20
  AND max_per_day = 30
  AND max_per_week = 75
  AND max_per_month = 150;
