-- =====================================================
-- MIGRATION 016: Safe pruning for public exercises
-- =====================================================

CREATE OR REPLACE FUNCTION public.prune_public_exercises(p_slugs TEXT[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  WITH deleted AS (
    DELETE FROM exercises e
    WHERE e.is_custom = FALSE
      AND NOT (e.slug = ANY(p_slugs))
      AND NOT EXISTS (
        SELECT 1 FROM workout_sets ws
        WHERE ws.exercise_id = e.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM program_exercises pe
        WHERE pe.exercise_id = e.id
      )
    RETURNING 1
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;
