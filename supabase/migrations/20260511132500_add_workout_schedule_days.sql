ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS workout_schedule_days SMALLINT[];

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_workout_schedule_days_valid;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_workout_schedule_days_valid
  CHECK (
    workout_schedule_days IS NULL OR (
      array_length(workout_schedule_days, 1) <= 7
      AND workout_schedule_days <@ ARRAY[0,1,2,3,4,5,6]::SMALLINT[]
    )
  );
