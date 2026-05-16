ALTER TABLE user_program_progress
  ADD COLUMN IF NOT EXISTS next_day_number_override INTEGER;

ALTER TABLE user_program_progress
  DROP CONSTRAINT IF EXISTS user_program_progress_next_day_number_override_check;

ALTER TABLE user_program_progress
  ADD CONSTRAINT user_program_progress_next_day_number_override_check
  CHECK (next_day_number_override IS NULL OR next_day_number_override >= 1);

COMMENT ON COLUMN user_program_progress.next_day_number_override IS
  'Optional user-selected next program workout day number for the active cycle.';
