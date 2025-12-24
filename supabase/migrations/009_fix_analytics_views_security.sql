-- Migration 009: Fix Analytics Views Security
-- This migration addresses HIGH severity security vulnerabilities where analytics
-- views bypass Row Level Security (RLS), allowing any authenticated user to
-- view all users' workout data.

-- ============================================================================
-- FIX 1: Add security_invoker to all analytics views
-- This ensures views respect RLS policies of the underlying tables
-- ============================================================================

-- User workout statistics view
ALTER VIEW user_workout_stats SET (security_invoker = on);

-- Exercise personal records view
ALTER VIEW exercise_personal_records SET (security_invoker = on);

-- Weekly workout volume view
ALTER VIEW weekly_workout_volume SET (security_invoker = on);

-- Muscle group training frequency view
ALTER VIEW muscle_group_frequency SET (security_invoker = on);

-- Workout export view (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'workout_export_view') THEN
    ALTER VIEW workout_export_view SET (security_invoker = on);
  END IF;
END $$;

-- ============================================================================
-- FIX 2: Drop the insecure materialized view
-- Materialized views cannot use security_invoker and expose all user data
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS mv_user_volume_stats;

-- ============================================================================
-- VERIFICATION: Add comment documenting security status
-- ============================================================================

COMMENT ON VIEW user_workout_stats IS 'User workout statistics - RLS enforced via security_invoker (migration 009)';
COMMENT ON VIEW exercise_personal_records IS 'Exercise PRs - RLS enforced via security_invoker (migration 009)';
COMMENT ON VIEW weekly_workout_volume IS 'Weekly volume stats - RLS enforced via security_invoker (migration 009)';
COMMENT ON VIEW muscle_group_frequency IS 'Muscle group frequency - RLS enforced via security_invoker (migration 009)';
