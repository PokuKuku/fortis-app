ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS workout_schedule_history JSONB;

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_workout_schedule_history_valid;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_workout_schedule_history_valid
  CHECK (
    workout_schedule_history IS NULL
    OR jsonb_typeof(workout_schedule_history) = 'array'
  );

COMMENT ON COLUMN profiles.workout_schedule_history IS
  'Historical workout schedule entries for streak calculations. Shape: [{effectiveDateKey: YYYY-MM-DD, scheduleDays: number[]}].';

UPDATE profiles
SET workout_schedule_history = jsonb_build_array(
  jsonb_build_object(
    'effectiveDateKey', '1970-01-01',
    'scheduleDays', to_jsonb(workout_schedule_days)
  )
)
WHERE workout_schedule_history IS NULL
  AND workout_schedule_days IS NOT NULL;
