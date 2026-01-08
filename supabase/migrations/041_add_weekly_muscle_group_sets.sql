-- Weekly muscle group working sets (timezone-aware).

DROP VIEW IF EXISTS weekly_muscle_group_sets;

CREATE OR REPLACE VIEW weekly_muscle_group_sets AS
WITH completed_sessions AS (
  SELECT
    ws.id,
    ws.user_id,
    ws.started_at,
    p.timezone
  FROM workout_sessions ws
  JOIN profiles p ON p.id = ws.user_id
  WHERE ws.completed_at IS NOT NULL
),
working_sets AS (
  SELECT
    cs.user_id,
    cs.started_at,
    cs.timezone,
    wst.exercise_id,
    wst.reps
  FROM completed_sessions cs
  JOIN workout_sets wst ON wst.session_id = cs.id
  WHERE COALESCE(wst.is_warmup, FALSE) = FALSE
    AND wst.reps IS NOT NULL
    AND wst.reps > 0
),
expanded AS (
  SELECT
    ws.user_id,
    DATE_TRUNC('week', ws.started_at AT TIME ZONE ws.timezone)::date AS week_start,
    unnest(e.primary_muscles) AS muscle_group
  FROM working_sets ws
  JOIN exercises e ON e.id = ws.exercise_id
)
SELECT
  user_id,
  week_start,
  muscle_group,
  COUNT(*) AS working_sets
FROM expanded
GROUP BY user_id, week_start, muscle_group;

ALTER VIEW weekly_muscle_group_sets SET (security_invoker = on);
COMMENT ON VIEW weekly_muscle_group_sets IS 'Weekly working sets by muscle group (timezone-aware).';
