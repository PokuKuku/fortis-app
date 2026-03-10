ALTER TABLE user_program_progress
  ADD COLUMN IF NOT EXISTS completed_day_numbers INTEGER[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS history JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN user_program_progress.completed_day_numbers IS
  'Completed day numbers in the active cycle for the user/program pair.';

COMMENT ON COLUMN user_program_progress.history IS
  'JSON history of completed cycles with day numbers and completion timestamps.';
