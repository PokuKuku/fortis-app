-- =====================================================
-- ADD CONSERVATISM LEVEL TO PROFILES
-- =====================================================
--
-- Adds conservatism_level column to profiles table for insight
-- sensitivity tuning. Three levels:
-- - chill: Higher thresholds, fewer alerts
-- - standard: Balanced defaults (default)
-- - aggressive: Lower thresholds, more proactive alerts
--
-- From: TRAINING_INTELLIGENCE_ROADMAP.md
-- =====================================================

-- Add conservatism_level column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS conservatism_level TEXT NOT NULL DEFAULT 'standard';

-- Add check constraint safely (avoid duplicate constraint error on db reset)
-- Postgres doesn't support ADD CONSTRAINT IF NOT EXISTS, so we use a DO block
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_profiles_conservatism_level'
    AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT check_profiles_conservatism_level
    CHECK (conservatism_level IN ('chill', 'standard', 'aggressive'));
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN profiles.conservatism_level IS 'Insight sensitivity: chill (fewer alerts), standard (balanced), aggressive (more alerts)';
