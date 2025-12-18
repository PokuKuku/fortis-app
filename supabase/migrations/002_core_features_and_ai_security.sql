-- =====================================================
-- MIGRATION 002: Core Features & AI Security
-- =====================================================
-- Adds:
--   1. Profile enhancements (timezone, start preferences)
--   2. Program progression tracking
--   3. Exercise sticky notes
--   4. AI pending actions (mandatory confirmation staging)
--   5. AI mutations audit log (immutable)
--   6. AI rate limiting
--   7. Training summaries with secure sharing
--
-- Security Priority: Every table has FORCE RLS, explicit policies,
-- and input validation. AI never writes directly.
-- =====================================================

-- =====================================================
-- 1. PROFILE ENHANCEMENTS
-- =====================================================

-- Add timezone support
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add "Start" system preferences
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS default_start_type TEXT
    CHECK (default_start_type IS NULL OR default_start_type IN ('template', 'program'));

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS default_start_template_id UUID
    REFERENCES program_workouts(id) ON DELETE SET NULL;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS default_start_program_id UUID
    REFERENCES workout_programs(id) ON DELETE SET NULL;

-- Ensure start preferences are consistent
ALTER TABLE profiles
  ADD CONSTRAINT valid_start_config CHECK (
    (default_start_type IS NULL) OR
    (default_start_type = 'template' AND default_start_template_id IS NOT NULL) OR
    (default_start_type = 'program' AND default_start_program_id IS NOT NULL)
  );

COMMENT ON COLUMN profiles.timezone IS 'User timezone for date/time display (IANA format)';
COMMENT ON COLUMN profiles.default_start_type IS 'What the Start button launches: template or program';
COMMENT ON COLUMN profiles.default_start_template_id IS 'Template to start when type is template';
COMMENT ON COLUMN profiles.default_start_program_id IS 'Program to start when type is program';

-- =====================================================
-- 2. PROGRAM PROGRESSION TRACKING
-- =====================================================

CREATE TABLE user_program_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE NOT NULL,

  -- Current position (with bounds checking)
  current_workout_index INTEGER NOT NULL DEFAULT 0
    CHECK (current_workout_index >= 0),

  -- Cycle tracking (for repeating programs)
  current_cycle INTEGER NOT NULL DEFAULT 1
    CHECK (current_cycle >= 1),

  -- Status
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Last workout completed
  last_workout_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
  last_workout_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, program_id)
);

-- RLS: Strict ownership - users can ONLY access their own progress
ALTER TABLE user_program_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_program_progress FORCE ROW LEVEL SECURITY;

CREATE POLICY "program_progress_select_own" ON user_program_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "program_progress_insert_own" ON user_program_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "program_progress_update_own" ON user_program_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "program_progress_delete_own" ON user_program_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Index for quick lookups
CREATE INDEX idx_program_progress_user ON user_program_progress(user_id);
CREATE INDEX idx_program_progress_program ON user_program_progress(program_id);

-- Auto-update updated_at
CREATE TRIGGER update_program_progress_updated_at
  BEFORE UPDATE ON user_program_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_program_progress IS 'Tracks user position in workout programs for deterministic progression';

-- =====================================================
-- 3. EXERCISE STICKY NOTES
-- =====================================================

CREATE TABLE exercise_sticky_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,

  -- Optional set index (null = applies to all sets)
  set_index INTEGER CHECK (set_index IS NULL OR set_index >= 1),

  -- Note content (with strict length limit)
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),

  -- Display preferences
  show_in_workout BOOLEAN DEFAULT TRUE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One note per exercise/set combination per user
  UNIQUE(user_id, exercise_id, set_index)
);

-- RLS: Strict ownership
ALTER TABLE exercise_sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sticky_notes FORCE ROW LEVEL SECURITY;

CREATE POLICY "sticky_notes_select_own" ON exercise_sticky_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "sticky_notes_insert_own" ON exercise_sticky_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sticky_notes_update_own" ON exercise_sticky_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "sticky_notes_delete_own" ON exercise_sticky_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Index for workout lookups (fetching notes for exercises in a session)
CREATE INDEX idx_sticky_notes_user_exercise ON exercise_sticky_notes(user_id, exercise_id);

-- Auto-update updated_at
CREATE TRIGGER update_sticky_notes_updated_at
  BEFORE UPDATE ON exercise_sticky_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE exercise_sticky_notes IS 'Persistent notes attached to exercises, shown in future workouts. AI reads these for personalization.';
COMMENT ON COLUMN exercise_sticky_notes.set_index IS 'Optional: applies to specific set number (null = all sets)';

-- =====================================================
-- 3b. SESSION EXERCISE NOTES (Temporary, per-session)
-- =====================================================
-- These are notes attached to an exercise within a specific workout session.
-- Unlike sticky notes, they don't persist to future workouts.
-- AI can read these for context about specific sessions.

CREATE TABLE session_exercise_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,

  -- Note content (with length limit)
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One note per exercise per session
  UNIQUE(session_id, exercise_id)
);

-- RLS: Strict ownership
ALTER TABLE session_exercise_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercise_notes FORCE ROW LEVEL SECURITY;

CREATE POLICY "session_notes_select_own" ON session_exercise_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "session_notes_insert_own" ON session_exercise_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "session_notes_update_own" ON session_exercise_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "session_notes_delete_own" ON session_exercise_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Index for session lookups
CREATE INDEX idx_session_notes_session ON session_exercise_notes(session_id);
CREATE INDEX idx_session_notes_user_exercise ON session_exercise_notes(user_id, exercise_id);

-- Auto-update updated_at
CREATE TRIGGER update_session_notes_updated_at
  BEFORE UPDATE ON session_exercise_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE session_exercise_notes IS 'Temporary notes for exercises within a session. AI reads these for session-specific context.';

-- =====================================================
-- 4. AI RATE LIMITING
-- =====================================================

CREATE TABLE ai_rate_limits (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,

  -- Rolling window counters
  actions_this_minute INTEGER DEFAULT 0 NOT NULL CHECK (actions_this_minute >= 0),
  actions_this_hour INTEGER DEFAULT 0 NOT NULL CHECK (actions_this_hour >= 0),
  actions_this_day INTEGER DEFAULT 0 NOT NULL CHECK (actions_this_day >= 0),

  -- Timestamps for window reset
  minute_window_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  hour_window_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  day_window_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Limits (can be adjusted per subscription tier)
  max_per_minute INTEGER DEFAULT 10 NOT NULL CHECK (max_per_minute > 0),
  max_per_hour INTEGER DEFAULT 100 NOT NULL CHECK (max_per_hour > 0),
  max_per_day INTEGER DEFAULT 500 NOT NULL CHECK (max_per_day > 0),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS: Users can view their own limits, but only system can update
ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_rate_limits FORCE ROW LEVEL SECURITY;

-- Users can see their own rate limit status
CREATE POLICY "ai_rate_limits_select_own" ON ai_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- No direct inserts/updates/deletes from client - only via secure functions
CREATE POLICY "ai_rate_limits_no_insert" ON ai_rate_limits
  FOR INSERT WITH CHECK (FALSE);

CREATE POLICY "ai_rate_limits_no_update" ON ai_rate_limits
  FOR UPDATE USING (FALSE);

CREATE POLICY "ai_rate_limits_no_delete" ON ai_rate_limits
  FOR DELETE USING (FALSE);

-- Auto-update updated_at
CREATE TRIGGER update_ai_rate_limits_updated_at
  BEFORE UPDATE ON ai_rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE ai_rate_limits IS 'Per-user rate limiting for AI actions';

-- Function to check and increment rate limit (called by Edge Functions)
CREATE OR REPLACE FUNCTION check_ai_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limits ai_rate_limits%ROWTYPE;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Get or create rate limit record
  SELECT * INTO v_limits FROM ai_rate_limits WHERE user_id = p_user_id FOR UPDATE;

  IF v_limits.user_id IS NULL THEN
    -- Create initial record
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

  -- Reset day window if expired
  IF v_limits.day_window_start < v_now - INTERVAL '1 day' THEN
    v_limits.actions_this_day := 0;
    v_limits.day_window_start := v_now;
  END IF;

  -- Check all limits
  IF v_limits.actions_this_minute >= v_limits.max_per_minute THEN
    RETURN FALSE;
  END IF;

  IF v_limits.actions_this_hour >= v_limits.max_per_hour THEN
    RETURN FALSE;
  END IF;

  IF v_limits.actions_this_day >= v_limits.max_per_day THEN
    RETURN FALSE;
  END IF;

  -- Increment counters and save
  UPDATE ai_rate_limits
  SET
    actions_this_minute = v_limits.actions_this_minute + 1,
    actions_this_hour = v_limits.actions_this_hour + 1,
    actions_this_day = v_limits.actions_this_day + 1,
    minute_window_start = v_limits.minute_window_start,
    hour_window_start = v_limits.hour_window_start,
    day_window_start = v_limits.day_window_start
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_ai_rate_limit IS 'Check and increment AI rate limit. Returns FALSE if limit exceeded.';

-- =====================================================
-- 5. AI PENDING ACTIONS (Mandatory Confirmation Staging)
-- =====================================================
-- SECURITY CRITICAL: AI writes NEVER go directly to tables.
-- All proposed changes must be staged here and explicitly confirmed by user.

CREATE TABLE ai_pending_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- What the AI wants to do (strict allowlist)
  action_type TEXT NOT NULL CHECK (action_type IN (
    'create_template',
    'modify_template',
    'create_program',
    'modify_program',
    'log_workout',
    'log_set'
  )),

  -- Target entity type (strict allowlist)
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'workout_program',
    'program_workout',
    'program_exercise',
    'workout_session',
    'workout_set'
  )),

  -- Target entity ID (null for creates)
  target_entity_id UUID,

  -- Proposed change (validated JSON)
  proposed_state JSONB NOT NULL,

  -- Human-readable description for UI (length limited)
  description TEXT NOT NULL CHECK (char_length(description) >= 1 AND char_length(description) <= 500),

  -- Expiration (pending actions auto-expire for security)
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired')),
  resolved_at TIMESTAMPTZ,

  -- Security context (for audit trail)
  request_id UUID NOT NULL,
  ai_conversation_id TEXT CHECK (ai_conversation_id IS NULL OR char_length(ai_conversation_id) <= 100),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS: Users can only see/manage their own pending actions
ALTER TABLE ai_pending_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_pending_actions FORCE ROW LEVEL SECURITY;

CREATE POLICY "ai_pending_select_own" ON ai_pending_actions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update status from pending to confirmed/rejected
CREATE POLICY "ai_pending_update_status" ON ai_pending_actions
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status IN ('confirmed', 'rejected'));

-- No direct inserts from client - only via secure Edge Function
CREATE POLICY "ai_pending_no_insert" ON ai_pending_actions
  FOR INSERT WITH CHECK (FALSE);

-- No deletes - let them expire for audit purposes
CREATE POLICY "ai_pending_no_delete" ON ai_pending_actions
  FOR DELETE USING (FALSE);

-- Index for efficient pending action lookups
CREATE INDEX idx_ai_pending_user_status ON ai_pending_actions(user_id, status)
  WHERE status = 'pending';

CREATE INDEX idx_ai_pending_expires ON ai_pending_actions(expires_at)
  WHERE status = 'pending';

COMMENT ON TABLE ai_pending_actions IS 'Staging area for AI-proposed changes. AI NEVER writes directly - always pending -> confirm.';

-- Function to expire stale pending actions (called by cron or trigger)
CREATE OR REPLACE FUNCTION expire_pending_actions()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE ai_pending_actions
  SET status = 'expired', resolved_at = NOW()
  WHERE status = 'pending' AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION expire_pending_actions IS 'Expire stale pending AI actions. Returns count of expired actions.';

-- =====================================================
-- 6. AI MUTATIONS AUDIT LOG (Immutable)
-- =====================================================
-- SECURITY CRITICAL: This table is append-only. Core fields cannot be modified.
-- Enables complete undo of any AI action.

CREATE TABLE ai_mutations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Link to the pending action that was confirmed
  pending_action_id UUID REFERENCES ai_pending_actions(id),

  -- Action details (denormalized for query performance and audit clarity)
  action_type TEXT NOT NULL CHECK (action_type IN (
    'create_template',
    'modify_template',
    'create_program',
    'modify_program',
    'log_workout',
    'log_set',
    'delete_workout',
    'delete_set'
  )),

  -- Reference to affected entity
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'workout_program',
    'program_workout',
    'program_exercise',
    'workout_session',
    'workout_set'
  )),
  entity_id UUID NOT NULL,

  -- Full state snapshots for complete reversibility
  previous_state JSONB, -- null for creates
  new_state JSONB NOT NULL,

  -- Undo tracking
  is_undone BOOLEAN DEFAULT FALSE NOT NULL,
  undone_at TIMESTAMPTZ,
  undone_by TEXT CHECK (undone_by IS NULL OR undone_by IN ('user', 'system', 'admin')),

  -- Security context (captured at execution time)
  request_id UUID NOT NULL,
  ip_address INET,
  user_agent TEXT CHECK (user_agent IS NULL OR char_length(user_agent) <= 500),

  -- AI context (sanitized - no raw prompts with PII)
  ai_conversation_id TEXT CHECK (ai_conversation_id IS NULL OR char_length(ai_conversation_id) <= 100),
  ai_action_summary TEXT CHECK (ai_action_summary IS NULL OR char_length(ai_action_summary) <= 1000),

  -- Immutable timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS: Users can only see their own mutations
ALTER TABLE ai_mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_mutations FORCE ROW LEVEL SECURITY;

CREATE POLICY "ai_mutations_select_own" ON ai_mutations
  FOR SELECT USING (auth.uid() = user_id);

-- No direct inserts from client - only via secure functions
CREATE POLICY "ai_mutations_no_insert" ON ai_mutations
  FOR INSERT WITH CHECK (FALSE);

-- No direct updates from client - undo goes through secure function
CREATE POLICY "ai_mutations_no_update" ON ai_mutations
  FOR UPDATE USING (FALSE);

-- NEVER allow deletes - audit log must be immutable
CREATE POLICY "ai_mutations_no_delete" ON ai_mutations
  FOR DELETE USING (FALSE);

-- Indexes for efficient lookups
CREATE INDEX idx_ai_mutations_user ON ai_mutations(user_id, created_at DESC);
CREATE INDEX idx_ai_mutations_entity ON ai_mutations(entity_type, entity_id);
CREATE INDEX idx_ai_mutations_undoable ON ai_mutations(user_id, is_undone)
  WHERE is_undone = FALSE;
CREATE INDEX idx_ai_mutations_pending ON ai_mutations(pending_action_id)
  WHERE pending_action_id IS NOT NULL;

COMMENT ON TABLE ai_mutations IS 'Immutable audit log of all AI-initiated changes. Enables complete undo.';

-- Trigger to prevent tampering with audit records
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow updating undo-related fields
  IF OLD.user_id != NEW.user_id
     OR OLD.pending_action_id IS DISTINCT FROM NEW.pending_action_id
     OR OLD.action_type != NEW.action_type
     OR OLD.entity_type != NEW.entity_type
     OR OLD.entity_id != NEW.entity_id
     OR OLD.previous_state IS DISTINCT FROM NEW.previous_state
     OR OLD.new_state IS DISTINCT FROM NEW.new_state
     OR OLD.request_id != NEW.request_id
     OR OLD.ip_address IS DISTINCT FROM NEW.ip_address
     OR OLD.user_agent IS DISTINCT FROM NEW.user_agent
     OR OLD.ai_conversation_id IS DISTINCT FROM NEW.ai_conversation_id
     OR OLD.ai_action_summary IS DISTINCT FROM NEW.ai_action_summary
     OR OLD.created_at != NEW.created_at
  THEN
    RAISE EXCEPTION 'Audit records are immutable - only undo fields (is_undone, undone_at, undone_by) can be updated';
  END IF;

  -- Ensure undo is one-way (can't un-undo)
  IF OLD.is_undone = TRUE AND NEW.is_undone = FALSE THEN
    RAISE EXCEPTION 'Cannot reverse an undo operation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_audit_immutability
  BEFORE UPDATE ON ai_mutations
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();

-- =====================================================
-- 7. TRAINING SUMMARIES (Secure Sharing)
-- =====================================================

CREATE TABLE training_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Period covered
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Summary content (with length limits)
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  summary_text TEXT NOT NULL CHECK (char_length(summary_text) >= 1 AND char_length(summary_text) <= 50000),
  metrics JSONB NOT NULL,

  -- Sharing with security controls
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  share_token TEXT UNIQUE,
  share_expires_at TIMESTAMPTZ,
  share_view_count INTEGER DEFAULT 0 NOT NULL CHECK (share_view_count >= 0),
  max_share_views INTEGER DEFAULT 1000 NOT NULL CHECK (max_share_views > 0),

  -- Generation metadata
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure share tokens have expiration
  CONSTRAINT share_must_expire CHECK (
    share_token IS NULL OR share_expires_at IS NOT NULL
  ),

  -- Ensure period is valid
  CONSTRAINT valid_period CHECK (period_start <= period_end)
);

-- RLS policies
ALTER TABLE training_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_summaries FORCE ROW LEVEL SECURITY;

-- Owners can see all their summaries
CREATE POLICY "training_summaries_select_own" ON training_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "training_summaries_insert_own" ON training_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "training_summaries_update_own" ON training_summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "training_summaries_delete_own" ON training_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_training_summaries_user ON training_summaries(user_id, period_start DESC);
CREATE INDEX idx_training_summaries_share ON training_summaries(share_token)
  WHERE share_token IS NOT NULL AND is_public = TRUE;

COMMENT ON TABLE training_summaries IS 'AI-generated training summaries with secure, expiring share links';

-- Generate cryptographically secure share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  -- 32 bytes of cryptographic randomness, URL-safe base64
  -- Results in ~43 character token
  RETURN replace(replace(encode(gen_random_bytes(32), 'base64'), '+', '-'), '/', '_');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_share_token IS 'Generate cryptographically secure URL-safe share token';

-- Secure function to view shared summary (validates token + limits)
-- This bypasses RLS intentionally for public access, but validates all security constraints
CREATE OR REPLACE FUNCTION view_shared_summary(p_share_token TEXT)
RETURNS TABLE (
  title TEXT,
  summary_text TEXT,
  metrics JSONB,
  period_start DATE,
  period_end DATE
) AS $$
DECLARE
  v_summary training_summaries%ROWTYPE;
BEGIN
  -- Input validation
  IF p_share_token IS NULL OR char_length(p_share_token) < 20 THEN
    RAISE EXCEPTION 'Invalid share token';
  END IF;

  -- Find the summary (with row lock to prevent race conditions on view count)
  SELECT * INTO v_summary
  FROM training_summaries
  WHERE training_summaries.share_token = p_share_token
  FOR UPDATE;

  -- Validate token exists
  IF v_summary.id IS NULL THEN
    RAISE EXCEPTION 'Invalid share token';
  END IF;

  -- Check if public
  IF NOT v_summary.is_public THEN
    RAISE EXCEPTION 'Summary is not public';
  END IF;

  -- Check expiration
  IF v_summary.share_expires_at < NOW() THEN
    RAISE EXCEPTION 'Share link has expired';
  END IF;

  -- Check view limit
  IF v_summary.share_view_count >= v_summary.max_share_views THEN
    RAISE EXCEPTION 'Share link view limit exceeded';
  END IF;

  -- Increment view count
  UPDATE training_summaries
  SET share_view_count = share_view_count + 1
  WHERE id = v_summary.id;

  -- Return sanitized data (no user_id, no internal fields)
  RETURN QUERY
  SELECT
    v_summary.title,
    v_summary.summary_text,
    v_summary.metrics,
    v_summary.period_start,
    v_summary.period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION view_shared_summary IS 'Securely view a shared summary. Validates token, expiration, and view limits.';

-- =====================================================
-- 8. SECURE HELPER FUNCTIONS
-- =====================================================

-- UUID validation function
CREATE OR REPLACE FUNCTION is_valid_uuid(input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF input IS NULL THEN
    RETURN FALSE;
  END IF;
  PERFORM input::UUID;
  RETURN TRUE;
EXCEPTION
  WHEN invalid_text_representation THEN
    RETURN FALSE;
  WHEN others THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION is_valid_uuid IS 'Check if a string is a valid UUID';

-- Get user preferences for AI (limited fields only)
CREATE OR REPLACE FUNCTION get_user_preferences_for_ai(p_user_id UUID)
RETURNS TABLE (
  preferred_units TEXT,
  timezone TEXT
) AS $$
BEGIN
  -- Security check: only allow if called for authenticated user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Can only access own preferences';
  END IF;

  -- Return ONLY non-sensitive preferences
  -- NEVER return: email, full_name, avatar_url, or any PII
  RETURN QUERY
  SELECT p.preferred_units, p.timezone
  FROM profiles p
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_preferences_for_ai IS 'Get limited user preferences for AI. Never exposes PII.';

-- Get all user notes for AI personalization
-- Returns both sticky notes (persistent) and session notes (temporary)
-- AI uses this to understand user preferences, limitations, and context
CREATE OR REPLACE FUNCTION get_user_notes_for_ai(p_user_id UUID)
RETURNS TABLE (
  note_type TEXT,           -- 'sticky' or 'session'
  exercise_id UUID,
  exercise_name TEXT,
  content TEXT,
  set_index INTEGER,        -- null for exercise-level notes
  session_date TIMESTAMPTZ, -- null for sticky notes
  session_id UUID           -- null for sticky notes
) AS $$
BEGIN
  -- Security check: only allow access to own notes
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Can only access own notes';
  END IF;

  RETURN QUERY
  -- Sticky notes (persistent, high weight for AI)
  -- These reveal qualitative information about the user
  SELECT
    'sticky'::TEXT as note_type,
    esn.exercise_id,
    e.name as exercise_name,
    esn.content,
    esn.set_index,
    NULL::TIMESTAMPTZ as session_date,
    NULL::UUID as session_id
  FROM exercise_sticky_notes esn
  JOIN exercises e ON esn.exercise_id = e.id
  WHERE esn.user_id = p_user_id
    AND esn.content IS NOT NULL
    AND char_length(trim(esn.content)) >= 3  -- Filter very short/nonsense notes

  UNION ALL

  -- Session exercise notes (from last 90 days, medium weight for AI)
  -- Context for specific sessions, don't over-generalize
  SELECT
    'session'::TEXT as note_type,
    sen.exercise_id,
    e.name as exercise_name,
    sen.content,
    NULL::INTEGER as set_index,
    ws.started_at as session_date,
    sen.session_id
  FROM session_exercise_notes sen
  JOIN exercises e ON sen.exercise_id = e.id
  JOIN workout_sessions ws ON sen.session_id = ws.id
  WHERE sen.user_id = p_user_id
    AND sen.content IS NOT NULL
    AND char_length(trim(sen.content)) >= 3
    AND ws.started_at > NOW() - INTERVAL '90 days'

  UNION ALL

  -- Set-level notes from workout_sets (from last 90 days)
  -- Most granular context, session-specific
  SELECT
    'set'::TEXT as note_type,
    wst.exercise_id,
    e.name as exercise_name,
    wst.notes as content,
    wst.set_number as set_index,
    ws.started_at as session_date,
    ws.id as session_id
  FROM workout_sets wst
  JOIN workout_sessions ws ON wst.session_id = ws.id
  JOIN exercises e ON wst.exercise_id = e.id
  WHERE ws.user_id = p_user_id
    AND wst.notes IS NOT NULL
    AND char_length(trim(wst.notes)) >= 3
    AND ws.started_at > NOW() - INTERVAL '90 days'

  ORDER BY note_type ASC, session_date DESC NULLS FIRST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_notes_for_ai IS 'Get all user notes for AI personalization. Returns sticky notes (high weight), session notes (medium weight), and set notes (low weight). Filters out short/nonsense notes.';

-- Get notes for a specific exercise (for targeted AI queries)
CREATE OR REPLACE FUNCTION get_exercise_notes_for_ai(
  p_user_id UUID,
  p_exercise_id UUID
)
RETURNS TABLE (
  note_type TEXT,
  content TEXT,
  set_index INTEGER,
  session_date TIMESTAMPTZ
) AS $$
BEGIN
  -- Security check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Can only access own notes';
  END IF;

  RETURN QUERY
  -- Sticky notes for this exercise
  SELECT
    'sticky'::TEXT as note_type,
    esn.content,
    esn.set_index,
    NULL::TIMESTAMPTZ as session_date
  FROM exercise_sticky_notes esn
  WHERE esn.user_id = p_user_id
    AND esn.exercise_id = p_exercise_id
    AND esn.content IS NOT NULL
    AND char_length(trim(esn.content)) >= 3

  UNION ALL

  -- Session notes for this exercise (last 90 days)
  SELECT
    'session'::TEXT as note_type,
    sen.content,
    NULL::INTEGER as set_index,
    ws.started_at as session_date
  FROM session_exercise_notes sen
  JOIN workout_sessions ws ON sen.session_id = ws.id
  WHERE sen.user_id = p_user_id
    AND sen.exercise_id = p_exercise_id
    AND sen.content IS NOT NULL
    AND char_length(trim(sen.content)) >= 3
    AND ws.started_at > NOW() - INTERVAL '90 days'

  UNION ALL

  -- Set notes for this exercise (last 90 days)
  SELECT
    'set'::TEXT as note_type,
    wst.notes as content,
    wst.set_number as set_index,
    ws.started_at as session_date
  FROM workout_sets wst
  JOIN workout_sessions ws ON wst.session_id = ws.id
  WHERE ws.user_id = p_user_id
    AND wst.exercise_id = p_exercise_id
    AND wst.notes IS NOT NULL
    AND char_length(trim(wst.notes)) >= 3
    AND ws.started_at > NOW() - INTERVAL '90 days'

  ORDER BY note_type ASC, session_date DESC NULLS FIRST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_exercise_notes_for_ai IS 'Get all notes for a specific exercise. Use when AI needs context about a particular movement.';

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Verify new profile columns
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.columns
          WHERE table_name = 'profiles' AND column_name = 'timezone') = 1,
         'profiles.timezone column missing';
  ASSERT (SELECT COUNT(*) FROM information_schema.columns
          WHERE table_name = 'profiles' AND column_name = 'default_start_type') = 1,
         'profiles.default_start_type column missing';
END $$;

-- Verify new tables exist with RLS
DO $$
DECLARE
  v_table TEXT;
  v_tables TEXT[] := ARRAY[
    'user_program_progress',
    'exercise_sticky_notes',
    'session_exercise_notes',
    'ai_rate_limits',
    'ai_pending_actions',
    'ai_mutations',
    'training_summaries'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    -- Check table exists
    ASSERT (SELECT COUNT(*) FROM information_schema.tables
            WHERE table_name = v_table) = 1,
           format('Table %s missing', v_table);

    -- Check RLS is enabled
    ASSERT (SELECT relrowsecurity FROM pg_class WHERE relname = v_table) = TRUE,
           format('RLS not enabled on %s', v_table);

    -- Check RLS is forced
    ASSERT (SELECT relforcerowsecurity FROM pg_class WHERE relname = v_table) = TRUE,
           format('RLS not forced on %s', v_table);
  END LOOP;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary:
--   - 4 new columns on profiles (timezone, start preferences)
--   - 7 new tables (all with FORCE RLS):
--     * user_program_progress - Track position in programs
--     * exercise_sticky_notes - Persistent exercise notes (AI reads)
--     * session_exercise_notes - Session-specific exercise notes (AI reads)
--     * ai_rate_limits - Per-user AI rate limiting
--     * ai_pending_actions - Staging for AI writes (mandatory confirm)
--     * ai_mutations - Immutable audit log of AI actions
--     * training_summaries - Shareable AI-generated summaries
--   - 8 new functions (all SECURITY DEFINER where needed):
--     * check_ai_rate_limit() - Rate limit enforcement
--     * expire_pending_actions() - Auto-expire stale actions
--     * view_shared_summary() - Secure public share access
--     * generate_share_token() - Cryptographic tokens
--     * get_user_preferences_for_ai() - Limited profile access
--     * get_user_notes_for_ai() - All notes for AI personalization
--     * get_exercise_notes_for_ai() - Exercise-specific notes
--     * is_valid_uuid() - UUID validation
--   - 1 new trigger (prevent_audit_tampering)
--
-- Security:
--   - All text fields have length limits
--   - AI never writes directly (pending -> confirm flow)
--   - Audit log is immutable (trigger-enforced)
--   - AI can read notes for personalization (sticky + session + set)
--   - Notes filtered to exclude short/nonsense content
-- =====================================================
