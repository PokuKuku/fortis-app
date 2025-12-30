-- Migration 025: Fix workout duration aggregation in analytics views
-- The previous views joined workout_sets directly, which multiplied duration_seconds by set count.

DROP VIEW IF EXISTS user_workout_stats;

CREATE VIEW user_workout_stats AS
WITH session_agg AS (
  SELECT
    ws.user_id,
    COUNT(ws.id) as total_workouts,
    COUNT(DISTINCT DATE(ws.started_at)) as total_workout_days,
    SUM(ws.duration_seconds) as total_time_seconds,
    AVG(ws.duration_seconds) as avg_workout_duration,
    MAX(ws.started_at) as last_workout_date
  FROM workout_sessions ws
  WHERE ws.completed_at IS NOT NULL
  GROUP BY ws.user_id
),
set_agg AS (
  SELECT
    ws.user_id,
    COUNT(DISTINCT wst.exercise_id) as unique_exercises_performed,
    SUM(wst.reps * wst.weight) as total_volume
  FROM workout_sessions ws
  LEFT JOIN workout_sets wst ON ws.id = wst.session_id
  WHERE ws.completed_at IS NOT NULL
  GROUP BY ws.user_id
)
SELECT
  s.user_id,
  s.total_workouts,
  s.total_workout_days,
  s.total_time_seconds,
  s.avg_workout_duration,
  s.last_workout_date,
  sa.unique_exercises_performed,
  sa.total_volume
FROM session_agg s
LEFT JOIN set_agg sa ON s.user_id = sa.user_id;

ALTER VIEW user_workout_stats SET (security_invoker = on);
COMMENT ON VIEW user_workout_stats IS 'User workout statistics - RLS enforced via security_invoker (migration 009)';

DROP VIEW IF EXISTS weekly_workout_volume;

CREATE VIEW weekly_workout_volume AS
WITH session_agg AS (
  SELECT
    ws.user_id,
    DATE_TRUNC('week', ws.started_at) as week_start,
    COUNT(ws.id) as workouts_count,
    SUM(ws.duration_seconds) as total_time_seconds
  FROM workout_sessions ws
  WHERE ws.completed_at IS NOT NULL
  GROUP BY ws.user_id, DATE_TRUNC('week', ws.started_at)
),
set_agg AS (
  SELECT
    ws.user_id,
    DATE_TRUNC('week', ws.started_at) as week_start,
    SUM(wst.reps * wst.weight) as total_volume
  FROM workout_sessions ws
  LEFT JOIN workout_sets wst ON ws.id = wst.session_id
  WHERE ws.completed_at IS NOT NULL
  GROUP BY ws.user_id, DATE_TRUNC('week', ws.started_at)
)
SELECT
  s.user_id,
  s.week_start,
  s.workouts_count,
  sa.total_volume,
  s.total_time_seconds
FROM session_agg s
LEFT JOIN set_agg sa
  ON s.user_id = sa.user_id
  AND s.week_start = sa.week_start;

ALTER VIEW weekly_workout_volume SET (security_invoker = on);
COMMENT ON VIEW weekly_workout_volume IS 'Weekly volume stats - RLS enforced via security_invoker (migration 009)';
