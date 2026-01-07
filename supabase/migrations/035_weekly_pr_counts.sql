-- Weekly PR counts per user and week.
-- PR definition: estimated 1RM in the week exceeds prior best for that exercise.

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
  SELECT preferred_units
  FROM profiles
  WHERE id = (SELECT user_id FROM resolved_user)
),
sets AS (
  SELECT
    wst.exercise_id,
    ws.started_at AT TIME ZONE 'UTC' AS started_at,
    wst.reps,
    wst.weight,
    wst.weight_unit
  FROM workout_sets wst
  JOIN workout_sessions ws ON ws.id = wst.session_id
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
    s.started_at,
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
    started_at,
    weight_norm * (1 + reps_clamped / 30.0) AS estimated_1rm
  FROM normalized
),
rollups AS (
  SELECT
    exercise_id,
    MAX(estimated_1rm) FILTER (
      WHERE started_at >= p_week_start::timestamptz
        AND started_at < (p_week_start::timestamptz + INTERVAL '7 days')
    ) AS this_week_best,
    MAX(estimated_1rm) FILTER (
      WHERE started_at >= (p_week_start::timestamptz - INTERVAL '7 days')
        AND started_at < p_week_start::timestamptz
    ) AS last_week_best,
    MAX(estimated_1rm) FILTER (
      WHERE started_at < p_week_start::timestamptz
    ) AS prior_best_before_this,
    MAX(estimated_1rm) FILTER (
      WHERE started_at < (p_week_start::timestamptz - INTERVAL '7 days')
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
