-- Migration 017: Force RLS and Add Restrictive Subscription Policies
-- Security hardening based on security audit findings

-- ============================================
-- FORCE ROW LEVEL SECURITY on all core tables
-- This ensures RLS is enforced even for table owners and superusers
-- ============================================

ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE exercises FORCE ROW LEVEL SECURITY;
ALTER TABLE workout_programs FORCE ROW LEVEL SECURITY;
ALTER TABLE program_workouts FORCE ROW LEVEL SECURITY;
ALTER TABLE program_exercises FORCE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE workout_sets FORCE ROW LEVEL SECURITY;
ALTER TABLE exercise_library_meta FORCE ROW LEVEL SECURITY;

-- ============================================
-- Restrictive policies for subscriptions table
-- Subscriptions should only be managed server-side via triggers/functions
-- ============================================

-- Drop any existing permissive policies if they exist (safe no-op if not present)
DROP POLICY IF EXISTS "subscriptions_no_client_insert" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_no_client_update" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_no_client_delete" ON subscriptions;

-- Create restrictive policies to prevent client-side manipulation
CREATE POLICY "subscriptions_no_client_insert" ON subscriptions
  FOR INSERT WITH CHECK (FALSE);

CREATE POLICY "subscriptions_no_client_update" ON subscriptions
  FOR UPDATE USING (FALSE) WITH CHECK (FALSE);

CREATE POLICY "subscriptions_no_client_delete" ON subscriptions
  FOR DELETE USING (FALSE);

-- Add comment explaining the security model
COMMENT ON TABLE subscriptions IS 'User subscription data. Managed server-side only via handle_new_user trigger and admin functions. Client cannot INSERT/UPDATE/DELETE.';
