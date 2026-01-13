-- Weekly PR counts per user and week (timezone-aware).

CREATE OR REPLACE VIEW weekly_pr_counts AS
WITH weekly AS (
  SELECT
    user_id,
    exercise_id,
    week_start,
    best_e1rm
  FROM exercise_weekly_agg
  WHERE best_e1rm IS NOT NULL
),
with_prior AS (
  SELECT
    user_id,
    exercise_id,
    week_start,
    best_e1rm,
    MAX(best_e1rm) OVER (
      PARTITION BY user_id, exercise_id
      ORDER BY week_start
      ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
    ) AS prior_best
  FROM weekly
)
SELECT
  user_id,
  week_start,
  COUNT(*) FILTER (
    WHERE prior_best IS NULL OR best_e1rm > prior_best
  ) AS pr_count
FROM with_prior
GROUP BY user_id, week_start;

ALTER VIEW weekly_pr_counts SET (security_invoker = on);
COMMENT ON VIEW weekly_pr_counts IS 'Weekly PR counts based on best e1RM per exercise.';
