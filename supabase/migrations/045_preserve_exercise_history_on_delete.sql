-- Preserve program/workout history when exercises are deleted.
-- Store snapshots on rows that depend on exercises and remove cascading deletes.

ALTER TABLE program_exercises
ADD COLUMN IF NOT EXISTS exercise_name_snapshot TEXT;

ALTER TABLE workout_sets
ADD COLUMN IF NOT EXISTS exercise_name_snapshot TEXT;

ALTER TABLE workout_sets
ADD COLUMN IF NOT EXISTS primary_muscles_snapshot TEXT[];

ALTER TABLE workout_sets
ADD COLUMN IF NOT EXISTS secondary_muscles_snapshot TEXT[];

-- Backfill snapshots from current exercise rows
UPDATE program_exercises pe
SET exercise_name_snapshot = e.name
FROM exercises e
WHERE pe.exercise_id = e.id
  AND pe.exercise_name_snapshot IS NULL;

UPDATE workout_sets ws
SET exercise_name_snapshot = e.name,
    primary_muscles_snapshot = e.primary_muscles,
    secondary_muscles_snapshot = e.secondary_muscles
FROM exercises e
WHERE ws.exercise_id = e.id
  AND (
    ws.exercise_name_snapshot IS NULL
    OR ws.primary_muscles_snapshot IS NULL
    OR ws.secondary_muscles_snapshot IS NULL
  );

-- Drop cascading FKs so exercise deletes don't remove history
ALTER TABLE program_exercises
  DROP CONSTRAINT IF EXISTS program_exercises_exercise_id_fkey;

ALTER TABLE workout_sets
  DROP CONSTRAINT IF EXISTS workout_sets_exercise_id_fkey;

-- Update views to use snapshots when exercise rows are missing
DROP VIEW IF EXISTS exercise_personal_records;
CREATE VIEW exercise_personal_records AS
SELECT
  wst.exercise_id,
  ws.user_id,
  COALESCE(MAX(e.name), MAX(wst.exercise_name_snapshot), 'Unknown Exercise') as exercise_name,
  MAX(wst.weight) as max_weight,
  MAX(wst.weight * (1 + wst.reps::DECIMAL / 30)) as estimated_1rm,
  MAX(wst.reps) as max_reps,
  MAX(ws.started_at) as achieved_at
FROM workout_sets wst
JOIN workout_sessions ws ON wst.session_id = ws.id
LEFT JOIN exercises e ON wst.exercise_id = e.id
WHERE wst.is_warmup = FALSE
GROUP BY wst.exercise_id, ws.user_id;

ALTER VIEW exercise_personal_records SET (security_invoker = on);
COMMENT ON VIEW exercise_personal_records IS 'Exercise PRs - RLS enforced via security_invoker (migration 009).';

DROP VIEW IF EXISTS muscle_group_frequency;
CREATE VIEW muscle_group_frequency AS
SELECT
  ws.user_id,
  unnest(COALESCE(wst.primary_muscles_snapshot, e.primary_muscles, '{}'::text[])) as muscle_group,
  COUNT(*) as times_trained,
  SUM(wst.reps * wst.weight) as total_volume,
  MAX(ws.started_at) as last_trained
FROM workout_sets wst
JOIN workout_sessions ws ON wst.session_id = ws.id
LEFT JOIN exercises e ON wst.exercise_id = e.id
WHERE ws.completed_at IS NOT NULL
GROUP BY ws.user_id, muscle_group;

ALTER VIEW muscle_group_frequency SET (security_invoker = on);
COMMENT ON VIEW muscle_group_frequency IS 'Muscle group frequency - RLS enforced via security_invoker (migration 009).';
