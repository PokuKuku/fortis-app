-- Exercise exposure and weekly aggregate views for training insights.
-- Exposure = one completed session with >=1 completed non-warmup working set.
-- All volumes are normalized to the user's preferred units.

CREATE OR REPLACE VIEW exercise_exposures AS
WITH completed_sessions AS (
  SELECT
    id,
    user_id,
    started_at
  FROM workout_sessions
  WHERE completed_at IS NOT NULL
),
working_sets AS (
  SELECT
    cs.user_id,
    cs.id AS session_id,
    cs.started_at,
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
    ws.reps,
    (
      CASE
        WHEN p.preferred_units = 'metric' THEN
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
  JOIN profiles p ON p.id = ws.user_id
),
per_exposure AS (
  SELECT
    user_id,
    exercise_id,
    session_id,
    started_at AS exposure_at,
    DATE_TRUNC('week', started_at) AS week_start,
    SUM(weight_norm * reps) AS total_volume,
    MAX(weight_norm * (1 + reps_clamped / 30.0)) AS best_e1rm,
    COUNT(*) AS working_sets
  FROM normalized
  GROUP BY user_id, exercise_id, session_id, started_at
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
