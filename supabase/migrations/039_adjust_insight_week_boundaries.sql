-- Align weekly boundaries with user timezone for insights.

-- Weekly workout volume (timezone-aware week start).
DROP VIEW IF EXISTS weekly_workout_volume;

CREATE OR REPLACE VIEW weekly_workout_volume AS
WITH completed_sessions AS (
  SELECT
    ws.id,
    ws.user_id,
    ws.started_at,
    ws.duration_seconds,
    p.preferred_units,
    p.timezone
  FROM workout_sessions ws
  JOIN profiles p ON p.id = ws.user_id
  WHERE ws.completed_at IS NOT NULL
),
session_counts AS (
  SELECT
    user_id,
    DATE_TRUNC('week', started_at AT TIME ZONE timezone)::date AS week_start,
    COUNT(*) AS workouts_count,
    SUM(duration_seconds) AS total_time_seconds
  FROM completed_sessions
  GROUP BY user_id, DATE_TRUNC('week', started_at AT TIME ZONE timezone)::date
),
volume_by_week AS (
  SELECT
    cs.user_id,
    DATE_TRUNC('week', cs.started_at AT TIME ZONE cs.timezone)::date AS week_start,
    SUM(
      CASE
        WHEN COALESCE(wst.is_warmup, FALSE) THEN 0
        WHEN wst.reps IS NULL OR wst.weight IS NULL THEN 0
        WHEN wst.reps <= 0 OR wst.weight <= 0 THEN 0
        ELSE (
          CASE
            WHEN cs.preferred_units = 'metric' THEN
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
  GROUP BY cs.user_id, DATE_TRUNC('week', cs.started_at AT TIME ZONE cs.timezone)::date
)
SELECT
  sc.user_id,
  sc.week_start,
  sc.workouts_count,
  COALESCE(vw.total_volume, 0) AS total_volume,
  sc.total_time_seconds
FROM session_counts sc
LEFT JOIN volume_by_week vw
  ON vw.user_id = sc.user_id
  AND vw.week_start = sc.week_start;

ALTER VIEW weekly_workout_volume SET (security_invoker = on);
COMMENT ON VIEW weekly_workout_volume IS 'Weekly volume stats (timezone-aware).';

-- Exercise exposures + weekly aggregates (timezone-aware week start).
DROP VIEW IF EXISTS exercise_weekly_agg;
DROP VIEW IF EXISTS exercise_exposures;

CREATE OR REPLACE VIEW exercise_exposures AS
WITH completed_sessions AS (
  SELECT
    ws.id,
    ws.user_id,
    ws.started_at,
    p.preferred_units,
    p.timezone
  FROM workout_sessions ws
  JOIN profiles p ON p.id = ws.user_id
  WHERE ws.completed_at IS NOT NULL
),
working_sets AS (
  SELECT
    cs.user_id,
    cs.id AS session_id,
    cs.started_at,
    cs.timezone,
    cs.preferred_units,
    wst.exercise_id,
    wst.reps,
    wst.weight,
    wst.weight_unit,
    COALESCE(wst.is_warmup, FALSE) AS is_warmup
  FROM completed_sessions cs
  JOIN workout_sets wst ON wst.session_id = cs.id
  WHERE COALESCE(wst.is_warmup, FALSE) = FALSE
    AND wst.reps IS NOT NULL
    AND wst.weight IS NOT NULL
    AND wst.reps > 0
    AND wst.weight > 0
),
normalized AS (
  SELECT
    ws.user_id,
    ws.session_id,
    ws.exercise_id,
    ws.started_at,
    ws.timezone,
    ws.reps,
    (
      CASE
        WHEN ws.preferred_units = 'metric' THEN
          CASE
            WHEN ws.weight_unit = 'lbs' THEN ws.weight / 2.20462
            ELSE ws.weight
          END
        ELSE
          CASE
            WHEN ws.weight_unit = 'kg' THEN ws.weight * 2.20462
            ELSE ws.weight
          END
      END
    ) AS weight_norm,
    LEAST(ws.reps, 12) AS reps_clamped
  FROM working_sets ws
),
per_exposure AS (
  SELECT
    user_id,
    exercise_id,
    session_id,
    started_at AS exposure_at,
    DATE_TRUNC('week', started_at AT TIME ZONE timezone)::date AS week_start,
    SUM(weight_norm * reps) AS total_volume,
    MAX(weight_norm * (1 + reps_clamped / 30.0)) AS best_e1rm,
    COUNT(*) AS working_sets
  FROM normalized
  GROUP BY user_id, exercise_id, session_id, started_at, timezone
)
SELECT
  user_id,
  exercise_id,
  session_id,
  exposure_at,
  week_start,
  total_volume,
  best_e1rm,
  working_sets
FROM per_exposure;

ALTER VIEW exercise_exposures SET (security_invoker = on);

CREATE OR REPLACE VIEW exercise_weekly_agg AS
SELECT
  user_id,
  exercise_id,
  week_start,
  COUNT(*) AS exposures,
  SUM(working_sets) AS working_sets,
  SUM(total_volume) AS total_volume,
  MAX(best_e1rm) AS best_e1rm
FROM exercise_exposures
GROUP BY user_id, exercise_id, week_start;

ALTER VIEW exercise_weekly_agg SET (security_invoker = on);

-- Weekly PR counts (timezone-aware week start).
CREATE OR REPLACE FUNCTION get_weekly_pr_counts(
  p_user_id UUID,
  p_week_start DATE
)
RETURNS TABLE (
  this_week INTEGER,
  last_week INTEGER
)
LANGUAGE sql
STABLE
AS $$
WITH resolved_user AS (
  SELECT p_user_id AS user_id
  WHERE p_user_id = auth.uid()
),
prefs AS (
  SELECT preferred_units, timezone
  FROM profiles
  WHERE id = (SELECT user_id FROM resolved_user)
),
sets AS (
  SELECT
    wst.exercise_id,
    (ws.started_at AT TIME ZONE p.timezone) AS started_at_local,
    wst.reps,
    wst.weight,
    wst.weight_unit
  FROM workout_sets wst
  JOIN workout_sessions ws ON ws.id = wst.session_id
  CROSS JOIN prefs p
  WHERE ws.user_id = (SELECT user_id FROM resolved_user)
    AND ws.completed_at IS NOT NULL
    AND COALESCE(wst.is_warmup, FALSE) = FALSE
    AND wst.reps IS NOT NULL
    AND wst.weight IS NOT NULL
    AND wst.reps > 0
    AND wst.weight > 0
),
normalized AS (
  SELECT
    s.exercise_id,
    s.started_at_local,
    (
      CASE
        WHEN p.preferred_units = 'metric' THEN
          CASE
            WHEN s.weight_unit = 'lbs' THEN s.weight / 2.20462
            ELSE s.weight
          END
        ELSE
          CASE
            WHEN s.weight_unit = 'kg' THEN s.weight * 2.20462
            ELSE s.weight
          END
      END
    ) AS weight_norm,
    LEAST(s.reps, 12) AS reps_clamped
  FROM sets s
  CROSS JOIN prefs p
),
e1rm AS (
  SELECT
    exercise_id,
    started_at_local,
    weight_norm * (1 + reps_clamped / 30.0) AS estimated_1rm
  FROM normalized
),
rollups AS (
  SELECT
    exercise_id,
    MAX(estimated_1rm) FILTER (
      WHERE started_at_local >= p_week_start::timestamp
        AND started_at_local < (p_week_start::timestamp + INTERVAL '7 days')
    ) AS this_week_best,
    MAX(estimated_1rm) FILTER (
      WHERE started_at_local >= (p_week_start::timestamp - INTERVAL '7 days')
        AND started_at_local < p_week_start::timestamp
    ) AS last_week_best,
    MAX(estimated_1rm) FILTER (
      WHERE started_at_local < p_week_start::timestamp
    ) AS prior_best_before_this,
    MAX(estimated_1rm) FILTER (
      WHERE started_at_local < (p_week_start::timestamp - INTERVAL '7 days')
    ) AS prior_best_before_last
  FROM e1rm
  GROUP BY exercise_id
)
SELECT
  COUNT(*) FILTER (
    WHERE this_week_best IS NOT NULL
      AND (prior_best_before_this IS NULL OR this_week_best > prior_best_before_this)
  ) AS this_week,
  COUNT(*) FILTER (
    WHERE last_week_best IS NOT NULL
      AND (prior_best_before_last IS NULL OR last_week_best > prior_best_before_last)
  ) AS last_week
FROM rollups;
$$;
