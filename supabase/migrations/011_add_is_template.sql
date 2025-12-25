-- =====================================================
-- MIGRATION 011: Add is_template to workout_programs
-- =====================================================
-- Supports distinguishing single-workout templates from multi-day programs.
-- =====================================================

ALTER TABLE workout_programs
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

COMMENT ON COLUMN workout_programs.is_template IS 'True if this program represents a single-workout template';

CREATE INDEX IF NOT EXISTS idx_workout_programs_is_template
ON workout_programs(is_template)
WHERE is_template = true;
