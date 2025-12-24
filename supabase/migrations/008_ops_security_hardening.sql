-- =====================================================
-- MIGRATION 008: Ops and Policy Hardening
-- =====================================================
-- Fixes:
--   1. Ensure definer functions can bypass RLS when intended
--   2. Prevent users from marking programs as defaults
-- =====================================================

-- =====================================================
-- 1. SECURITY DEFINER RLS BYPASS (INTENTIONAL)
-- =====================================================

ALTER FUNCTION public.handle_new_user() SET row_security = off;
ALTER FUNCTION public.check_ai_rate_limit(uuid) SET row_security = off;
ALTER FUNCTION public.expire_pending_actions() SET row_security = off;
ALTER FUNCTION public.view_shared_summary(text) SET row_security = off;

-- =====================================================
-- 2. PROGRAM DEFAULTS RESTRICTED TO SERVER
-- =====================================================

DROP POLICY IF EXISTS "Users can create own programs" ON workout_programs;
CREATE POLICY "Users can create own programs"
  ON workout_programs FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_default = FALSE);

DROP POLICY IF EXISTS "Users can update own programs" ON workout_programs;
CREATE POLICY "Users can update own programs"
  ON workout_programs FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by AND is_default = FALSE);
