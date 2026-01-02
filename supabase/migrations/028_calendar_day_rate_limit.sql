-- Migration: Use calendar-day reset in user's timezone for AI rate limits
-- Keeps minute/hour rolling, week/month rolling, but resets daily at local midnight.

CREATE OR REPLACE FUNCTION check_ai_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limits ai_rate_limits%ROWTYPE;
  v_now TIMESTAMPTZ := NOW();
  v_timezone TEXT;
  v_day_start TIMESTAMPTZ;
BEGIN
  -- Get or create rate limit record with row lock
  SELECT * INTO v_limits FROM ai_rate_limits WHERE user_id = p_user_id FOR UPDATE;

  IF v_limits.user_id IS NULL THEN
    -- Create initial record with defaults
    INSERT INTO ai_rate_limits (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_limits;
  END IF;

  -- Resolve user timezone (fallback to UTC if missing/invalid)
  SELECT timezone INTO v_timezone
  FROM profiles
  WHERE id = p_user_id;
  v_timezone := COALESCE(v_timezone, 'UTC');

  IF NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = v_timezone) THEN
    v_timezone := 'UTC';
  END IF;

  -- Compute local midnight for the user's timezone
  v_day_start := (date_trunc('day', v_now AT TIME ZONE v_timezone) AT TIME ZONE v_timezone);

  -- Reset minute window if expired (rolling)
  IF v_limits.minute_window_start < v_now - INTERVAL '1 minute' THEN
    v_limits.actions_this_minute := 0;
    v_limits.minute_window_start := v_now;
  END IF;

  -- Reset hour window if expired (rolling)
  IF v_limits.hour_window_start < v_now - INTERVAL '1 hour' THEN
    v_limits.actions_this_hour := 0;
    v_limits.hour_window_start := v_now;
  END IF;

  -- Reset day window if outside current local day (calendar day)
  IF v_limits.day_window_start < v_day_start
     OR v_limits.day_window_start >= v_day_start + INTERVAL '1 day' THEN
    v_limits.actions_this_day := 0;
    v_limits.day_window_start := v_day_start;
  END IF;

  -- Reset week window if expired (rolling)
  IF v_limits.week_window_start < v_now - INTERVAL '7 days' THEN
    v_limits.actions_this_week := 0;
    v_limits.week_window_start := v_now;
  END IF;

  -- Reset month window if expired (rolling)
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

COMMENT ON FUNCTION check_ai_rate_limit IS
  'Check and increment AI rate limit. Minute/hour are rolling; day resets at local midnight; week/month are rolling.';
