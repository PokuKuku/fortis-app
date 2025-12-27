-- Add weight unit tracking for recorded sets

ALTER TABLE workout_sets
  ADD COLUMN weight_unit TEXT;

ALTER TABLE workout_sets
  ADD CONSTRAINT workout_sets_weight_unit_valid
  CHECK (weight_unit IN ('lbs', 'kg') OR weight_unit IS NULL);

COMMENT ON COLUMN workout_sets.weight_unit IS 'Unit recorded for weight (lbs or kg)';
