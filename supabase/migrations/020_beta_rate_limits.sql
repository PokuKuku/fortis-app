-- =====================================================
-- 020: Beta Rate Limits
-- =====================================================
-- Adds weekly and monthly rate limit windows for beta budget control.
-- Updates default limits for beta: 5/min, 15/hour, 25/day, 75/week, 150/month.
-- =====================================================

-- Add weekly and monthly columns to ai_rate_limits
ALTER TABLE ai_rate_limits
ADD COLUMN IF NOT EXISTS actions_this_week INTEGER DEFAULT 0 NOT NULL CHECK (actions_this_week >= 0),
ADD COLUMN IF NOT EXISTS actions_this_month INTEGER DEFAULT 0 NOT NULL CHECK (actions_this_month >= 0),
ADD COLUMN IF NOT EXISTS week_window_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
ADD COLUMN IF NOT EXISTS month_window_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
ADD COLUMN IF NOT EXISTS max_per_week INTEGER DEFAULT 75 NOT NULL CHECK (max_per_week > 0),
ADD COLUMN IF NOT EXISTS max_per_month INTEGER DEFAULT 150 NOT NULL CHECK (max_per_month > 0);

-- Update default limits for beta (generous limits for ~50 testers)
ALTER TABLE ai_rate_limits
ALTER COLUMN max_per_minute SET DEFAULT 5,
ALTER COLUMN max_per_hour SET DEFAULT 15,
ALTER COLUMN max_per_day SET DEFAULT 25;

-- Update existing rows to beta limits
UPDATE ai_rate_limits SET
  max_per_minute = 5,
  max_per_hour = 15,
  max_per_day = 25,
  max_per_week = 75,
  max_per_month = 150
WHERE max_per_minute = 10 OR max_per_minute = 3;  -- Update from old defaults or previous beta

-- =====================================================
-- Replace check_ai_rate_limit function with week/month support
-- =====================================================

CREATE OR REPLACE FUNCTION check_ai_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limits ai_rate_limits%ROWTYPE;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Get or create rate limit record with row lock
  SELECT * INTO v_limits FROM ai_rate_limits WHERE user_id = p_user_id FOR UPDATE;

  IF v_limits.user_id IS NULL THEN
    -- Create initial record with beta defaults
    INSERT INTO ai_rate_limits (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_limits;
  END IF;

  -- Reset minute window if expired
  IF v_limits.minute_window_start < v_now - INTERVAL '1 minute' THEN
    v_limits.actions_this_minute := 0;
    v_limits.minute_window_start := v_now;
  END IF;

  -- Reset hour window if expired
  IF v_limits.hour_window_start < v_now - INTERVAL '1 hour' THEN
    v_limits.actions_this_hour := 0;
    v_limits.hour_window_start := v_now;
  END IF;

  -- Reset day window if expired (24 hours rolling)
  IF v_limits.day_window_start < v_now - INTERVAL '1 day' THEN
    v_limits.actions_this_day := 0;
    v_limits.day_window_start := v_now;
  END IF;

  -- Reset week window if expired (7 days rolling)
  IF v_limits.week_window_start < v_now - INTERVAL '7 days' THEN
    v_limits.actions_this_week := 0;
    v_limits.week_window_start := v_now;
  END IF;

  -- Reset month window if expired (30 days rolling)
  IF v_limits.month_window_start < v_now - INTERVAL '30 days' THEN
    v_limits.actions_this_month := 0;
    v_limits.month_window_start := v_now;
  END IF;

  -- Check all limits (fail-closed: any limit exceeded = blocked)
  IF v_limits.actions_this_minute >= v_limits.max_per_minute THEN
    RETURN FALSE;
  END IF;

  IF v_limits.actions_this_hour >= v_limits.max_per_hour THEN
    RETURN FALSE;
  END IF;

  IF v_limits.actions_this_day >= v_limits.max_per_day THEN
    RETURN FALSE;
  END IF;

  IF v_limits.actions_this_week >= v_limits.max_per_week THEN
    RETURN FALSE;
  END IF;

  IF v_limits.actions_this_month >= v_limits.max_per_month THEN
    RETURN FALSE;
  END IF;

  -- All checks passed - increment all counters and save
  UPDATE ai_rate_limits
  SET
    actions_this_minute = v_limits.actions_this_minute + 1,
    actions_this_hour = v_limits.actions_this_hour + 1,
    actions_this_day = v_limits.actions_this_day + 1,
    actions_this_week = v_limits.actions_this_week + 1,
    actions_this_month = v_limits.actions_this_month + 1,
    minute_window_start = v_limits.minute_window_start,
    hour_window_start = v_limits.hour_window_start,
    day_window_start = v_limits.day_window_start,
    week_window_start = v_limits.week_window_start,
    month_window_start = v_limits.month_window_start
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

COMMENT ON FUNCTION check_ai_rate_limit IS 'Check and increment AI rate limit with minute/hour/day/week/month windows. Returns FALSE if any limit exceeded.';
