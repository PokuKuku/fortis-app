-- =====================================================
-- MIGRATION 005: Security Hardening
-- =====================================================
-- Fixes:
--   1. Scope custom exercises to owner only
--   2. Add missing write policies for program_workouts/program_exercises
--   3. Prevent duplicate sticky notes when set_index is NULL
--   4. Pin search_path on SECURITY DEFINER functions
--   5. Add secure AI mutation audit logger
-- =====================================================

-- =====================================================
-- 1. CUSTOM EXERCISES PRIVACY
-- =====================================================

DROP POLICY IF EXISTS "Exercises are viewable by everyone" ON exercises;

CREATE POLICY "Exercises are viewable if public or owned"
  ON exercises FOR SELECT
  USING (is_custom = FALSE OR created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update own custom exercises" ON exercises;
CREATE POLICY "Users can update own custom exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = created_by AND is_custom = TRUE)
  WITH CHECK (auth.uid() = created_by AND is_custom = TRUE);

DROP POLICY IF EXISTS "Users can delete own custom exercises" ON exercises;
CREATE POLICY "Users can delete own custom exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = created_by AND is_custom = TRUE);

-- =====================================================
-- 2. PROGRAM WORKOUT/EXERCISE WRITE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Program workouts insert own" ON program_workouts;
CREATE POLICY "Program workouts insert own"
  ON program_workouts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE id = program_id
        AND created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Program workouts update own" ON program_workouts;
CREATE POLICY "Program workouts update own"
  ON program_workouts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE id = program_id
        AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE id = program_id
        AND created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Program workouts delete own" ON program_workouts;
CREATE POLICY "Program workouts delete own"
  ON program_workouts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE id = program_id
        AND created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Program exercises insert own" ON program_exercises;
CREATE POLICY "Program exercises insert own"
  ON program_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM program_workouts pw
      JOIN workout_programs wp ON pw.program_id = wp.id
      WHERE pw.id = program_workout_id
        AND wp.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Program exercises update own" ON program_exercises;
CREATE POLICY "Program exercises update own"
  ON program_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM program_workouts pw
      JOIN workout_programs wp ON pw.program_id = wp.id
      WHERE pw.id = program_workout_id
        AND wp.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM program_workouts pw
      JOIN workout_programs wp ON pw.program_id = wp.id
      WHERE pw.id = program_workout_id
        AND wp.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Program exercises delete own" ON program_exercises;
CREATE POLICY "Program exercises delete own"
  ON program_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM program_workouts pw
      JOIN workout_programs wp ON pw.program_id = wp.id
      WHERE pw.id = program_workout_id
        AND wp.created_by = auth.uid()
    )
  );

-- =====================================================
-- 3. STICKY NOTES UNIQUENESS FOR NULL SET INDEX
-- =====================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_sticky_notes_user_exercise_null
  ON exercise_sticky_notes(user_id, exercise_id)
  WHERE set_index IS NULL;

-- =====================================================
-- 4. SECURITY DEFINER SEARCH_PATH PINNING
-- =====================================================

ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_ai_rate_limit(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.expire_pending_actions() SET search_path = public, pg_temp;
ALTER FUNCTION public.view_shared_summary(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_preferences_for_ai(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_notes_for_ai(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_exercise_notes_for_ai(uuid, uuid) SET search_path = public, pg_temp;

-- =====================================================
-- 5. SECURE AI MUTATION AUDIT LOGGER
-- =====================================================

CREATE OR REPLACE FUNCTION log_ai_mutation(
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_previous_state JSONB,
  p_new_state JSONB,
  p_pending_action_id UUID DEFAULT NULL,
  p_request_id UUID,
  p_ai_conversation_id TEXT DEFAULT NULL,
  p_ai_action_summary TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_pending_action_id IS NOT NULL THEN
    PERFORM 1
    FROM ai_pending_actions
    WHERE id = p_pending_action_id
      AND user_id = auth.uid()
      AND status = 'confirmed';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Pending action not confirmed or not owned';
    END IF;
  END IF;

  INSERT INTO ai_mutations (
    user_id,
    pending_action_id,
    action_type,
    entity_type,
    entity_id,
    previous_state,
    new_state,
    request_id,
    ai_conversation_id,
    ai_action_summary
  )
  VALUES (
    auth.uid(),
    p_pending_action_id,
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_previous_state,
    COALESCE(p_new_state, '{}'::jsonb),
    p_request_id,
    p_ai_conversation_id,
    p_ai_action_summary
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
