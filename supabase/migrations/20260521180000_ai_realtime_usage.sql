CREATE TABLE IF NOT EXISTS ai_realtime_usage (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  seconds_reserved INTEGER DEFAULT 0 NOT NULL CHECK (seconds_reserved >= 0),
  sessions_started INTEGER DEFAULT 0 NOT NULL CHECK (sessions_started >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE ai_realtime_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_realtime_usage FORCE ROW LEVEL SECURITY;

CREATE POLICY "ai_realtime_usage_select_own" ON ai_realtime_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ai_realtime_usage_no_client_insert" ON ai_realtime_usage
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "ai_realtime_usage_no_client_update" ON ai_realtime_usage
  FOR UPDATE
  USING (false);

CREATE POLICY "ai_realtime_usage_no_client_delete" ON ai_realtime_usage
  FOR DELETE
  USING (false);

CREATE TRIGGER update_ai_realtime_usage_updated_at
  BEFORE UPDATE ON ai_realtime_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE ai_realtime_usage IS 'Per-user reserved realtime voice coach usage by calendar day.';
