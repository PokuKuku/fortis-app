-- Week-to-date PR counts per user and week.
-- PR definition: estimated 1RM in the WTD window exceeds prior best for that exercise.

CREATE OR REPLACE FUNCTION get_week_to_date_pr_counts(
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
  SELECT COALESCE(timezone, 'UTC') AS timezone
  FROM profiles
  WHERE id = (SELECT user_id FROM resolved_user)
),
params AS (
  SELECT
    p_week_start::timestamp AS current_week_start_local,
    (p_week_start::timestamp - INTERVAL '7 days') AS last_week_start_local,
    (now() AT TIME ZONE prefs.timezone) AS now_local,
    prefs.timezone AS timezone
  FROM prefs
),
window AS (
  SELECT
    current_week_start_local,
    last_week_start_local,
    now_local,
    GREATEST(
      INTERVAL '0',
      LEAST(INTERVAL '7 days', now_local - current_week_start_local)
    ) AS elapsed,
    timezone
  FROM params
),
exposures AS (
  SELECT
    ee.exercise_id,
    (ee.exposure_at AT TIME ZONE window.timezone) AS exposure_at_local,
    ee.best_e1rm
  FROM exercise_exposures ee
  CROSS JOIN window
  WHERE ee.user_id = (SELECT user_id FROM resolved_user)
    AND ee.best_e1rm IS NOT NULL
),
rollups AS (
  SELECT
    exercise_id,
    MAX(best_e1rm) FILTER (
      WHERE exposure_at_local >= current_week_start_local
        AND exposure_at_local <= now_local
    ) AS this_week_best,
    MAX(best_e1rm) FILTER (
      WHERE exposure_at_local >= last_week_start_local
        AND exposure_at_local <= last_week_start_local + elapsed
    ) AS last_week_best,
    MAX(best_e1rm) FILTER (
      WHERE exposure_at_local < current_week_start_local
    ) AS prior_best_before_this,
    MAX(best_e1rm) FILTER (
      WHERE exposure_at_local < last_week_start_local
    ) AS prior_best_before_last
  FROM exposures, window
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
