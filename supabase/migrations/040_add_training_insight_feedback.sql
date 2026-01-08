-- Insight feedback for suppression rules and quality tracking.

CREATE TABLE IF NOT EXISTS training_insight_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insight_id UUID REFERENCES training_insights(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('helpful', 'not_helpful')),
  anchor_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE training_insight_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own insight feedback"
  ON training_insight_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insight feedback"
  ON training_insight_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_insight_feedback_user_type_created
  ON training_insight_feedback(user_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_insight_feedback_user_insight
  ON training_insight_feedback(user_id, insight_id);
