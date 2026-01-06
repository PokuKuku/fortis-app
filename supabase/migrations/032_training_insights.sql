-- =====================================================
-- TRAINING INSIGHTS TABLE
-- Server-computed insights for the Insights feature
-- =====================================================
--
-- Design principles:
-- 1. Server-truth model: Insights are computed server-side (Edge Function)
--    and persisted. Mobile only renders persisted insights.
-- 2. Column-based dedupe: subject_key enables clean ON CONFLICT upsert
-- 3. RLS: Clients can SELECT and UPDATE (dismiss), not INSERT or DELETE
--
-- From: TRAINING_INTELLIGENCE_ROADMAP.md, INSIGHTS_NORTH_STAR.md
-- =====================================================

-- Training Insights table for persisted server-computed insights
CREATE TABLE IF NOT EXISTS training_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Insight classification
  type TEXT NOT NULL,
  window TEXT NOT NULL DEFAULT '7d',
  anchor_date DATE NOT NULL,

  -- Dedupe key: 'global' | 'exercise:<uuid>' | 'muscle:<group>'
  -- Using a single column avoids COALESCE complexity in ON CONFLICT
  subject_key TEXT NOT NULL DEFAULT 'global',

  -- Severity and status
  severity TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'active',

  -- Content
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '[]',
  recommendation JSONB NOT NULL DEFAULT '[]',

  -- Schema versioning (at insight level, not per-evidence)
  schema_version TEXT NOT NULL DEFAULT '1',

  -- Optional filtering columns (not part of dedupe key)
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  muscle_group TEXT,

  -- CHECK constraints for data integrity
  CONSTRAINT check_ti_severity CHECK (severity IN ('low', 'medium', 'high')),
  CONSTRAINT check_ti_window CHECK (window IN ('7d', '4w', '12w')),
  CONSTRAINT check_ti_status CHECK (status IN ('active', 'dismissed'))
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable and force RLS
ALTER TABLE training_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_insights FORCE ROW LEVEL SECURITY;

-- RLS Policies: Server-truth model
-- SELECT: Users can read their own insights
CREATE POLICY "training_insights_select_own" ON training_insights
  FOR SELECT USING (auth.uid() = user_id);

-- UPDATE: Users can update their own insights (for dismiss/reactivate)
-- Note: Edge Function with service_role can update anything
CREATE POLICY "training_insights_update_own" ON training_insights
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- NO INSERT policy for clients - server (Edge Function) inserts via service_role
-- NO DELETE policy for clients - insights are dismissed, not deleted

-- =====================================================
-- INDEXES
-- =====================================================

-- Primary query: user's insights ordered by created_at
CREATE INDEX idx_training_insights_user_created
  ON training_insights(user_id, created_at DESC);

-- Filtered query: active insights only
CREATE INDEX idx_training_insights_user_status
  ON training_insights(user_id, status) WHERE status = 'active';

-- Unique constraint for dedupe/upsert (column-based, no COALESCE)
-- Allows: INSERT ... ON CONFLICT (user_id, type, window, anchor_date, subject_key) DO UPDATE
CREATE UNIQUE INDEX idx_training_insights_dedupe
  ON training_insights(user_id, type, window, anchor_date, subject_key);

-- Optional: Index for exercise-specific queries
CREATE INDEX idx_training_insights_exercise
  ON training_insights(exercise_id) WHERE exercise_id IS NOT NULL;

-- =====================================================
-- TRIGGER
-- =====================================================

-- updated_at trigger (function already exists in 000_initial_schema.sql)
CREATE TRIGGER training_insights_updated_at
  BEFORE UPDATE ON training_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE training_insights IS 'Server-computed training insights for the Insights feature. Follows server-truth model.';
COMMENT ON COLUMN training_insights.type IS 'Insight type (versioned): WEEKLY_VERDICT_V1, LIFT_STALL_RISK_V1, etc.';
COMMENT ON COLUMN training_insights.subject_key IS 'Dedupe key: global | exercise:<uuid> | muscle:<group>';
COMMENT ON COLUMN training_insights.evidence IS 'JSONB array of EvidenceItem objects with key, label, value, unit, etc.';
COMMENT ON COLUMN training_insights.recommendation IS 'JSONB array of Recommendation objects (can be empty in MVP)';
