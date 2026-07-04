-- Migration: Adjust AI action limits.
-- Targets 30/min, 80/hour, 200/day, 600/week, 1000/month.

ALTER TABLE ai_rate_limits
ALTER COLUMN max_per_hour SET DEFAULT 80,
ALTER COLUMN max_per_day SET DEFAULT 200;

-- Update rows that match the previous paid-plan defaults.
UPDATE ai_rate_limits
SET
  max_per_hour = 80,
  max_per_day = 200
WHERE max_per_hour = 200
  AND max_per_day = 80;
