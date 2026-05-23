ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS training_environment TEXT
  CHECK (training_environment IN ('gym', 'home', 'hybrid'));

DROP FUNCTION IF EXISTS get_user_preferences_for_ai(UUID);

CREATE OR REPLACE FUNCTION get_user_preferences_for_ai(p_user_id UUID)
RETURNS TABLE (
  preferred_units TEXT,
  timezone TEXT,
  lifting_experience TEXT,
  training_environment TEXT,
  goals JSONB,
  latest_body_weight DECIMAL(10, 2),
  latest_body_weight_unit TEXT,
  latest_body_weight_at TIMESTAMPTZ
) AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required';
    END IF;

    IF auth.uid() != p_user_id THEN
      RAISE EXCEPTION 'Can only access own preferences';
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    p.preferred_units,
    p.timezone,
    p.lifting_experience,
    p.training_environment,
    CASE
      WHEN p.fitness_goal IS NULL OR length(trim(p.fitness_goal)) = 0 THEN '[]'::jsonb
      ELSE jsonb_build_array(
        jsonb_build_object(
          'goal_type', p.fitness_goal,
          'goal_name', p.fitness_goal,
          'source', 'profile'
        )
      )
    END AS goals,
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
'Get limited user preferences for AI, including goals, training experience, training environment, and latest body weight. Never exposes PII.';
