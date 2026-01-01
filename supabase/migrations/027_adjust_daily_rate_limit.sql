-- Migration: Increase daily AI rate limit from 25 to 30
-- This gives users more flexibility while maintaining reasonable limits

-- Update the default for new rows
ALTER TABLE ai_rate_limits
ALTER COLUMN max_per_day SET DEFAULT 30;

-- Update existing rows that have the old default
UPDATE ai_rate_limits
SET max_per_day = 30
WHERE max_per_day = 25;
