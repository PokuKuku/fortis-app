-- Add set_details column to program_exercises table
-- This stores per-set weight/reps data for templates to populate the Previous column

ALTER TABLE program_exercises
ADD COLUMN IF NOT EXISTS set_details JSONB DEFAULT NULL;

COMMENT ON COLUMN program_exercises.set_details IS
'Per-set performance data for templates (array of {weight, reps} objects). Used to populate Previous column when starting from template.';
