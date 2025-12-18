-- Migration: Add AI tracking and last performed columns to workout_programs
-- This enables:
-- 1. Showing AI badge on programs created by AI
-- 2. Tracking when a program was last used for a workout

-- Add is_ai_created column to track AI-generated programs
ALTER TABLE workout_programs
ADD COLUMN IF NOT EXISTS is_ai_created BOOLEAN DEFAULT false;

-- Add last_performed_at to track when the program was last used
ALTER TABLE workout_programs
ADD COLUMN IF NOT EXISTS last_performed_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN workout_programs.is_ai_created IS 'True if this program was created by AI assistant';
COMMENT ON COLUMN workout_programs.last_performed_at IS 'Timestamp of when this program was last used for a workout';

-- Create index for efficient queries on AI-created programs
CREATE INDEX IF NOT EXISTS idx_workout_programs_is_ai_created
ON workout_programs(is_ai_created)
WHERE is_ai_created = true;

-- Create index for sorting by last performed
CREATE INDEX IF NOT EXISTS idx_workout_programs_last_performed
ON workout_programs(last_performed_at DESC NULLS LAST);
