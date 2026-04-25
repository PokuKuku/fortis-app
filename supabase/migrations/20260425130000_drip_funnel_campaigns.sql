-- Drip funnel discount campaign state.
-- Schedules a one-time 25% discount push after a user sees a paywall and does not convert.

CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  device_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_active
  ON user_push_tokens(user_id, is_active, last_seen_at DESC);

ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_push_tokens FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own push tokens" ON user_push_tokens;
CREATE POLICY "Users can view own push tokens"
  ON user_push_tokens FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_tokens_no_client_insert" ON user_push_tokens;
CREATE POLICY "push_tokens_no_client_insert" ON user_push_tokens
  FOR INSERT WITH CHECK (FALSE);

DROP POLICY IF EXISTS "push_tokens_no_client_update" ON user_push_tokens;
CREATE POLICY "push_tokens_no_client_update" ON user_push_tokens
  FOR UPDATE USING (FALSE);

DROP POLICY IF EXISTS "push_tokens_no_client_delete" ON user_push_tokens;
CREATE POLICY "push_tokens_no_client_delete" ON user_push_tokens
  FOR DELETE USING (FALSE);

CREATE TABLE IF NOT EXISTS drip_funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'sent', 'converted', 'canceled', 'failed', 'no_token')),
  source_placement TEXT,
  source_paywall_name TEXT,
  source_result_type TEXT,
  first_paywall_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, campaign_key)
);

CREATE INDEX IF NOT EXISTS idx_drip_funnel_events_due
  ON drip_funnel_events(status, scheduled_at)
  WHERE status = 'scheduled';

ALTER TABLE drip_funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_funnel_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own drip funnel events" ON drip_funnel_events;
CREATE POLICY "Users can view own drip funnel events"
  ON drip_funnel_events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "drip_funnel_no_client_insert" ON drip_funnel_events;
CREATE POLICY "drip_funnel_no_client_insert" ON drip_funnel_events
  FOR INSERT WITH CHECK (FALSE);

DROP POLICY IF EXISTS "drip_funnel_no_client_update" ON drip_funnel_events;
CREATE POLICY "drip_funnel_no_client_update" ON drip_funnel_events
  FOR UPDATE USING (FALSE);

DROP POLICY IF EXISTS "drip_funnel_no_client_delete" ON drip_funnel_events;
CREATE POLICY "drip_funnel_no_client_delete" ON drip_funnel_events
  FOR DELETE USING (FALSE);

DROP TRIGGER IF EXISTS update_user_push_tokens_updated_at ON user_push_tokens;
CREATE TRIGGER update_user_push_tokens_updated_at
  BEFORE UPDATE ON user_push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drip_funnel_events_updated_at ON drip_funnel_events;
CREATE TRIGGER update_drip_funnel_events_updated_at
  BEFORE UPDATE ON drip_funnel_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_push_tokens IS 'Expo push tokens registered by authenticated users via Edge Functions.';
COMMENT ON TABLE drip_funnel_events IS 'One-time drip discount campaign schedule and delivery state.';
