-- Migration: Expire stale pending actions
-- Adds a function to clean up expired pending actions and an index for efficient queries

-- Function to expire stale pending actions (can be called manually or via cron)
CREATE OR REPLACE FUNCTION expire_stale_pending_actions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE ai_pending_actions
  SET status = 'expired', resolved_at = NOW()
  WHERE status = 'pending' AND expires_at < NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- Add partial index for efficient pending action queries with expiration filtering
CREATE INDEX IF NOT EXISTS idx_ai_pending_expires
ON ai_pending_actions(user_id, expires_at)
WHERE status = 'pending';

-- Grant execute permission to authenticated users (for manual cleanup if needed)
GRANT EXECUTE ON FUNCTION expire_stale_pending_actions() TO authenticated;
