-- Insight snoozes to suppress noisy insight types for a fixed window.

CREATE TABLE IF NOT EXISTS training_insight_snoozes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  snoozed_until DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, type)
);

ALTER TABLE training_insight_snoozes ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_insight_snoozes FORCE ROW LEVEL SECURITY;

CREATE POLICY "training_insight_snoozes_select_own" ON training_insight_snoozes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "training_insight_snoozes_insert_own" ON training_insight_snoozes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "training_insight_snoozes_update_own" ON training_insight_snoozes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_training_insight_snoozes_user
  ON training_insight_snoozes(user_id);

CREATE TRIGGER training_insight_snoozes_updated_at
  BEFORE UPDATE ON training_insight_snoozes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE training_insight_snoozes IS 'User-level snooze window for insight types.';
COMMENT ON COLUMN training_insight_snoozes.type IS 'Insight type being snoozed (e.g., LIFT_STALL_RISK_V1).';
COMMENT ON COLUMN training_insight_snoozes.snoozed_until IS 'Date when this snooze expires (inclusive).';
