-- =====================================================
-- MIGRATION 010: User Goals + Body Metrics
-- =====================================================
-- Adds:
--   1. user_goals (user-defined goals with priority + active flag)
--   2. user_body_metrics (body weight history)
--   3. Update get_user_preferences_for_ai() to include goals + latest weight
-- =====================================================

-- =====================================================
-- 1. USER GOALS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- User-defined goal metadata
  goal_name TEXT NOT NULL CHECK (char_length(trim(goal_name)) >= 1),
  goal_type TEXT, -- Optional, future enum from onboarding
  description TEXT,
  target_metrics JSONB,
  target_date TIMESTAMPTZ,

  -- Prioritization
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1),
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals FORCE ROW LEVEL SECURITY;

CREATE POLICY "user_goals_select_own" ON user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_goals_insert_own" ON user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_goals_update_own" ON user_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_goals_delete_own" ON user_goals
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_goals_user
  ON user_goals(user_id);

CREATE INDEX IF NOT EXISTS idx_user_goals_active_priority
  ON user_goals(user_id, is_active, priority);

CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. USER BODY METRICS (WEIGHT)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_body_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Body weight tracking
  weight DECIMAL(10, 2) NOT NULL CHECK (weight > 0),
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'lb')),
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE user_body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_body_metrics FORCE ROW LEVEL SECURITY;

CREATE POLICY "user_body_metrics_select_own" ON user_body_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_body_metrics_insert_own" ON user_body_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_body_metrics_update_own" ON user_body_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_body_metrics_delete_own" ON user_body_metrics
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_body_metrics_user_recorded
  ON user_body_metrics(user_id, recorded_at DESC);

CREATE TRIGGER update_user_body_metrics_updated_at
  BEFORE UPDATE ON user_body_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_goals IS 'User-defined training goals with priority and active flag';
COMMENT ON TABLE user_body_metrics IS 'User body metrics history (weight only for now)';
COMMENT ON COLUMN user_body_metrics.weight IS 'Body weight recorded in specified unit';

-- =====================================================
-- 3. AI PREFERENCES FUNCTION UPDATE
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_preferences_for_ai(p_user_id UUID)
RETURNS TABLE (
  preferred_units TEXT,
  timezone TEXT,
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

COMMENT ON FUNCTION get_user_preferences_for_ai IS
'Get limited user preferences for AI, including goals and latest body weight. Never exposes PII.';
