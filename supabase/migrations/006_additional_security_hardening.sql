-- =====================================================
-- MIGRATION 006: Additional Security Hardening
-- =====================================================
-- Fixes:
--   1. Add WITH CHECK to ownership update policies
--   2. Relax global uniqueness for custom exercises
-- =====================================================

-- =====================================================
-- 1. UPDATE POLICIES WITH WITH CHECK
-- =====================================================

-- Profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Workout sessions
DROP POLICY IF EXISTS "Users can update own workout sessions" ON workout_sessions;
CREATE POLICY "Users can update own workout sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Workout sets
DROP POLICY IF EXISTS "Users can update own workout sets" ON workout_sets;
CREATE POLICY "Users can update own workout sets"
  ON workout_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE id = session_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE id = session_id
      AND user_id = auth.uid()
    )
  );

-- Program progress
DROP POLICY IF EXISTS "program_progress_update_own" ON user_program_progress;
CREATE POLICY "program_progress_update_own" ON user_program_progress
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Exercise sticky notes
DROP POLICY IF EXISTS "sticky_notes_update_own" ON exercise_sticky_notes;
CREATE POLICY "sticky_notes_update_own" ON exercise_sticky_notes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Session exercise notes
DROP POLICY IF EXISTS "session_notes_update_own" ON session_exercise_notes;
CREATE POLICY "session_notes_update_own" ON session_exercise_notes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Training summaries
DROP POLICY IF EXISTS "training_summaries_update_own" ON training_summaries;
CREATE POLICY "training_summaries_update_own" ON training_summaries
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 2. CUSTOM EXERCISE UNIQUENESS (PER-USER)
-- =====================================================

-- Drop global unique constraints from initial schema
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_name_key;
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_slug_key;

-- Public exercises remain globally unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_name_public
  ON exercises(name)
  WHERE is_custom = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_slug_public
  ON exercises(slug)
  WHERE is_custom = FALSE;

-- Custom exercises are unique per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_name_custom
  ON exercises(created_by, name)
  WHERE is_custom = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_slug_custom
  ON exercises(created_by, slug)
  WHERE is_custom = TRUE;
