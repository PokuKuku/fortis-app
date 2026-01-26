-- =====================================================
-- Add training experience to AI preferences
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_preferences_for_ai(p_user_id UUID)
RETURNS TABLE (
  preferred_units TEXT,
  timezone TEXT,
  lifting_experience TEXT,
  goals JSONB,
  latest_body_weight DECIMAL(10, 2),
  latest_body_weight_unit TEXT,
  latest_body_weight_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Security check: only allow if called for authenticated user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Can only access own preferences';
  END IF;

  RETURN QUERY
  SELECT
    p.preferred_units,
    p.timezone,
    p.lifting_experience,
    COALESCE(
      (
        SELECT jsonb_agg(goal_row)
        FROM (
          SELECT jsonb_build_object(
            'id', ug.id,
            'goal_name', ug.goal_name,
            'goal_type', ug.goal_type,
            'description', ug.description,
            'target_metrics', ug.target_metrics,
            'target_date', ug.target_date,
            'priority', ug.priority,
            'is_active', ug.is_active,
            'created_at', ug.created_at
          ) AS goal_row
          FROM user_goals ug
          WHERE ug.user_id = p_user_id
          ORDER BY ug.is_active DESC, ug.priority ASC, ug.created_at DESC
        ) ordered_goals
      ),
      '[]'::jsonb
    ) AS goals,
    latest_weight.weight,
    latest_weight.unit,
    latest_weight.recorded_at
  FROM profiles p
  LEFT JOIN LATERAL (
    SELECT ubm.weight, ubm.unit, ubm.recorded_at
    FROM user_body_metrics ubm
    WHERE ubm.user_id = p_user_id
    ORDER BY ubm.recorded_at DESC
    LIMIT 1
  ) latest_weight ON TRUE
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION public.get_user_preferences_for_ai(UUID) SET search_path = public, pg_temp;

COMMENT ON FUNCTION get_user_preferences_for_ai IS
'Get limited user preferences for AI, including goals, training experience, and latest body weight. Never exposes PII.';
