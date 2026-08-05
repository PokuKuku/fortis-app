-- Collapse historical active insight backlogs. Singleton insight families
-- should expose only their newest row; older records remain available as
-- dismissed history.
WITH ranked_singletons AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, type
      ORDER BY anchor_date DESC, updated_at DESC, created_at DESC, id DESC
    ) AS recency_rank
  FROM training_insights
  WHERE status = 'active'
    AND type IN (
      'WEEKLY_VERDICT_V1',
      'FATIGUE_RISK_V1',
      'IMBALANCE_FLAG_V1',
      'WORKOUT_RECAP_V1',
      'CONSISTENCY_STREAK_V1',
      'WEEKLY_VOLUME_PR_V1'
    )
)
UPDATE training_insights AS insight
SET status = 'dismissed'
FROM ranked_singletons AS ranked
WHERE insight.id = ranked.id
  AND ranked.recency_rank > 1;

-- Stall risks are exercise-specific, so retain the newest active row for each
-- exercise rather than collapsing the entire watchlist to one item.
WITH ranked_stall_risks AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, type, subject_key
      ORDER BY anchor_date DESC, updated_at DESC, created_at DESC, id DESC
    ) AS recency_rank
  FROM training_insights
  WHERE status = 'active'
    AND type = 'LIFT_STALL_RISK_V1'
)
UPDATE training_insights AS insight
SET status = 'dismissed'
FROM ranked_stall_risks AS ranked
WHERE insight.id = ranked.id
  AND ranked.recency_rank > 1;
