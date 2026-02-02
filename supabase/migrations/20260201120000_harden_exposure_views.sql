-- Harden exposure views to respect RLS in all contexts.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'exercise_exposures'
  ) THEN
    ALTER VIEW exercise_exposures SET (security_invoker = on);
    COMMENT ON VIEW exercise_exposures IS 'Exercise exposure view - RLS enforced via security_invoker.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'exercise_weekly_agg'
  ) THEN
    ALTER VIEW exercise_weekly_agg SET (security_invoker = on);
    COMMENT ON VIEW exercise_weekly_agg IS 'Exercise weekly aggregation view - RLS enforced via security_invoker.';
  END IF;
END $$;
