-- =====================================================
-- MIGRATION 001: Add Import/Export Support
-- =====================================================
-- Adds fields to support importing from Strong, Hevy, and other workout apps
-- Also optimizes for exporting Fortis data
-- =====================================================

-- Add distance tracking for cardio exercises
ALTER TABLE workout_sets
ADD COLUMN distance DECIMAL(10, 2),
ADD COLUMN distance_unit TEXT CHECK (distance_unit IN ('miles', 'kilometers', 'meters', 'yards'));

-- Add set completion status (for tracking skipped sets)
ALTER TABLE workout_sets
ADD COLUMN completed BOOLEAN DEFAULT TRUE;

-- Add calculated volume (weight * reps)
ALTER TABLE workout_sets
ADD COLUMN volume DECIMAL(12, 2) GENERATED ALWAYS AS (
  CASE
    WHEN weight IS NOT NULL AND reps IS NOT NULL THEN weight * reps
    ELSE NULL
  END
) STORED;

-- Add workout focus/category to sessions
ALTER TABLE workout_sessions
ADD COLUMN workout_focus TEXT CHECK (workout_focus IN (
  'full_body',
  'upper_body',
  'lower_body',
  'push',
  'pull',
  'legs',
  'chest',
  'back',
  'shoulders',
  'arms',
  'core',
  'cardio',
  'other'
));

-- Add source tracking for imports
ALTER TABLE workout_sessions
ADD COLUMN import_source TEXT, -- 'strong', 'hevy', 'fitbod', etc.
ADD COLUMN import_id TEXT, -- Original workout ID from source app
ADD COLUMN imported_at TIMESTAMPTZ;

-- Create unique constraint to prevent duplicate imports
ALTER TABLE workout_sessions
ADD CONSTRAINT unique_import UNIQUE (user_id, import_source, import_id);

-- Add set type enum for better tracking
ALTER TABLE workout_sets
ADD COLUMN set_type TEXT DEFAULT 'normal' CHECK (set_type IN (
  'normal',
  'warmup',
  'working',
  'dropset',
  'failure',
  'rest_pause',
  'super_set',
  'giant_set'
));

-- Migrate existing boolean flags to set_type
UPDATE workout_sets
SET set_type = CASE
  WHEN is_warmup = TRUE THEN 'warmup'
  WHEN is_failure = TRUE THEN 'failure'
  WHEN is_dropset = TRUE THEN 'dropset'
  ELSE 'normal'
END;

-- Add exercise variant tracking (for imports with equipment in name)
ALTER TABLE workout_sets
ADD COLUMN exercise_variant TEXT; -- e.g., "Barbell", "Dumbbell", "Machine"

-- Add comments
COMMENT ON COLUMN workout_sets.distance IS 'Distance for cardio exercises (running, cycling, etc.)';
COMMENT ON COLUMN workout_sets.distance_unit IS 'Unit for distance measurement';
COMMENT ON COLUMN workout_sets.completed IS 'Whether the set was actually completed (vs skipped)';
COMMENT ON COLUMN workout_sets.volume IS 'Calculated volume (weight * reps) - auto-generated';
COMMENT ON COLUMN workout_sessions.workout_focus IS 'Primary focus of the workout session';
COMMENT ON COLUMN workout_sessions.import_source IS 'Source app if imported (strong, hevy, etc.)';
COMMENT ON COLUMN workout_sessions.import_id IS 'Original workout ID from source app';
COMMENT ON COLUMN workout_sets.set_type IS 'Type of set (normal, warmup, failure, dropset, etc.)';
COMMENT ON COLUMN workout_sets.exercise_variant IS 'Equipment variant if different from exercise default';

-- Create index for import lookups
CREATE INDEX idx_workout_sessions_import ON workout_sessions(user_id, import_source, import_id)
  WHERE import_source IS NOT NULL;

-- Create view for export format
CREATE OR REPLACE VIEW workout_export_view AS
SELECT
  ws.id as workout_id,
  ws.name as workout_name,
  ws.workout_focus,
  ws.started_at as date,
  ws.started_at as start_time,
  ws.completed_at as end_time,
  ws.duration_seconds,
  ws.notes as workout_notes,
  e.name as exercise_name,
  COALESCE(wst.exercise_variant, e.equipment) as equipment,
  wst.set_number,
  wst.set_type,
  wst.weight,
  wst.reps,
  wst.distance,
  wst.distance_unit,
  wst.rpe,
  wst.rest_seconds,
  wst.volume,
  wst.notes as set_notes,
  wst.completed,
  wst.order_index,
  ws.user_id
FROM workout_sessions ws
JOIN workout_sets wst ON ws.id = wst.session_id
JOIN exercises e ON wst.exercise_id = e.id
ORDER BY ws.started_at DESC, wst.order_index;

-- RLS policy for export view
ALTER VIEW workout_export_view SET (security_invoker = on);

-- Create materialized view for volume tracking (performance optimization)
CREATE MATERIALIZED VIEW mv_user_volume_stats AS
SELECT
  ws.user_id,
  DATE(ws.started_at) as workout_date,
  e.name as exercise_name,
  e.primary_muscles,
  SUM(wst.volume) as total_volume,
  SUM(wst.reps) as total_reps,
  COUNT(DISTINCT ws.id) as session_count,
  MAX(wst.weight) as max_weight,
  AVG(wst.rpe) as avg_rpe
FROM workout_sessions ws
JOIN workout_sets wst ON ws.id = wst.session_id
JOIN exercises e ON wst.exercise_id = e.id
WHERE ws.completed_at IS NOT NULL
  AND wst.completed = TRUE
  AND wst.set_type IN ('normal', 'working', 'failure')
GROUP BY ws.user_id, DATE(ws.started_at), e.id, e.name, e.primary_muscles;

-- Create index on materialized view
CREATE INDEX idx_mv_user_volume_user_date ON mv_user_volume_stats(user_id, workout_date DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_volume_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_volume_stats;
END;
$$ LANGUAGE plpgsql;

-- Update analytics views to use completed sets only
DROP VIEW IF EXISTS exercise_personal_records;
CREATE OR REPLACE VIEW exercise_personal_records AS
SELECT
  wst.exercise_id,
  ws.user_id,
  e.name as exercise_name,
  MAX(wst.weight) as max_weight,
  MAX(wst.weight * (1 + wst.reps::DECIMAL / 30)) as estimated_1rm,
  MAX(wst.reps) as max_reps,
  MAX(wst.volume) as max_volume,
  MAX(ws.started_at) as achieved_at
FROM workout_sets wst
JOIN workout_sessions ws ON wst.session_id = ws.id
JOIN exercises e ON wst.exercise_id = e.id
WHERE wst.completed = TRUE
  AND wst.set_type IN ('normal', 'working', 'failure')
GROUP BY wst.exercise_id, ws.user_id, e.name;

-- Update weekly volume view
DROP VIEW IF EXISTS weekly_workout_volume;
CREATE OR REPLACE VIEW weekly_workout_volume AS
SELECT
  ws.user_id,
  DATE_TRUNC('week', ws.started_at) as week_start,
  COUNT(DISTINCT ws.id) as workouts_count,
  SUM(wst.volume) as total_volume,
  SUM(ws.duration_seconds) as total_time_seconds,
  AVG(wst.rpe) as avg_rpe
FROM workout_sessions ws
LEFT JOIN workout_sets wst ON ws.id = wst.session_id
WHERE ws.completed_at IS NOT NULL
  AND (wst.completed = TRUE OR wst.completed IS NULL)
GROUP BY ws.user_id, DATE_TRUNC('week', ws.started_at);

-- Update muscle group frequency view
DROP VIEW IF EXISTS muscle_group_frequency;
CREATE OR REPLACE VIEW muscle_group_frequency AS
SELECT
  ws.user_id,
  unnest(e.primary_muscles) as muscle_group,
  COUNT(*) as times_trained,
  SUM(wst.volume) as total_volume,
  MAX(ws.started_at) as last_trained
FROM workout_sets wst
JOIN workout_sessions ws ON wst.session_id = ws.id
JOIN exercises e ON wst.exercise_id = e.id
WHERE ws.completed_at IS NOT NULL
  AND wst.completed = TRUE
GROUP BY ws.user_id, muscle_group;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check new columns exist
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'workout_sets'
  AND column_name IN ('distance', 'distance_unit', 'completed', 'volume', 'set_type', 'exercise_variant')
ORDER BY column_name;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'workout_sessions'
  AND column_name IN ('workout_focus', 'import_source', 'import_id', 'imported_at')
ORDER BY column_name;

-- Verify export view
SELECT COUNT(*) as export_view_columns
FROM information_schema.columns
WHERE table_name = 'workout_export_view';
