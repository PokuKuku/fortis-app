-- =====================================================
-- MIGRATION 017: Data integrity constraints for workouts
-- =====================================================

ALTER TABLE workout_sessions
  ADD CONSTRAINT workout_sessions_duration_non_negative
  CHECK (duration_seconds IS NULL OR duration_seconds >= 0);

ALTER TABLE workout_sets
  ADD CONSTRAINT workout_sets_set_number_positive
  CHECK (set_number > 0);

ALTER TABLE workout_sets
  ADD CONSTRAINT workout_sets_reps_non_negative
  CHECK (reps IS NULL OR reps >= 0);

ALTER TABLE workout_sets
  ADD CONSTRAINT workout_sets_weight_non_negative
  CHECK (weight IS NULL OR weight >= 0);

ALTER TABLE workout_sets
  ADD CONSTRAINT workout_sets_rest_seconds_non_negative
  CHECK (rest_seconds IS NULL OR rest_seconds >= 0);
