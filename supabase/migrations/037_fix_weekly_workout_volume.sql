-- Fix weekly workout volume to normalize units and exclude warmups.
-- Volume is computed in the user's preferred units (profiles.preferred_units).

DROP VIEW IF EXISTS weekly_workout_volume;

CREATE OR REPLACE VIEW weekly_workout_volume AS
WITH completed_sessions AS (
  SELECT
    id,
    user_id,
    started_at,
    duration_seconds
  FROM workout_sessions
  WHERE completed_at IS NOT NULL
),
session_counts AS (
  SELECT
    user_id,
    DATE_TRUNC('week', started_at) AS week_start,
    COUNT(*) AS workouts_count,
    SUM(duration_seconds) AS total_time_seconds
  FROM completed_sessions
  GROUP BY user_id, DATE_TRUNC('week', started_at)
),
volume_by_week AS (
  SELECT
    cs.user_id,
    DATE_TRUNC('week', cs.started_at) AS week_start,
    SUM(
      CASE
        WHEN COALESCE(wst.is_warmup, FALSE) THEN 0
        WHEN wst.completed IS NOT NULL AND wst.completed = FALSE THEN 0
        WHEN wst.reps IS NULL OR wst.weight IS NULL THEN 0
        WHEN wst.reps <= 0 OR wst.weight <= 0 THEN 0
        ELSE (
          CASE
            WHEN p.preferred_units = 'metric' THEN
              CASE
                WHEN wst.weight_unit = 'lbs' THEN wst.weight / 2.20462
                ELSE wst.weight
              END
            ELSE
              CASE
                WHEN wst.weight_unit = 'kg' THEN wst.weight * 2.20462
                ELSE wst.weight
              END
          END
        ) * wst.reps
      END
    ) AS total_volume
  FROM completed_sessions cs
  LEFT JOIN workout_sets wst ON wst.session_id = cs.id
  LEFT JOIN profiles p ON p.id = cs.user_id
  GROUP BY cs.user_id, DATE_TRUNC('week', cs.started_at)
),
rpe_by_week AS (
  SELECT
    cs.user_id,
    DATE_TRUNC('week', cs.started_at) AS week_start,
    AVG(wst.rpe) AS avg_rpe
  FROM completed_sessions cs
  LEFT JOIN workout_sets wst ON wst.session_id = cs.id
  WHERE COALESCE(wst.is_warmup, FALSE) = FALSE
    AND (wst.completed IS NULL OR wst.completed = TRUE)
    AND wst.rpe IS NOT NULL
  GROUP BY cs.user_id, DATE_TRUNC('week', cs.started_at)
)
SELECT
  sc.user_id,
  sc.week_start,
  sc.workouts_count,
  COALESCE(vw.total_volume, 0) AS total_volume,
  sc.total_time_seconds,
  rw.avg_rpe
FROM session_counts sc
LEFT JOIN volume_by_week vw
  ON vw.user_id = sc.user_id
  AND vw.week_start = sc.week_start
LEFT JOIN rpe_by_week rw
  ON rw.user_id = sc.user_id
  AND rw.week_start = sc.week_start;

ALTER VIEW weekly_workout_volume SET (security_invoker = on);
COMMENT ON VIEW weekly_workout_volume IS 'Weekly volume stats - RLS enforced via security_invoker (migration 009)';
