-- Prevent old or interrupted clients from deleting a workout's complete
-- exercise tree. Replacements and individual removals must go through the
-- validated functions below.

CREATE OR REPLACE FUNCTION public.replace_program_workout_exercises(
  p_program_workout_id UUID,
  p_name TEXT,
  p_exercises JSONB
)
RETURNS SETOF public.program_exercises
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.program_workouts pw
    JOIN public.workout_programs wp ON wp.id = pw.program_id
    WHERE pw.id = p_program_workout_id
      AND wp.created_by = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Program workout not found or not editable';
  END IF;

  IF jsonb_typeof(p_exercises) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'p_exercises must be a JSON array';
  END IF;

  IF jsonb_array_length(p_exercises) = 0 THEN
    RAISE EXCEPTION 'A program workout must contain at least one exercise';
  END IF;

  UPDATE public.program_workouts
  SET name = COALESCE(NULLIF(BTRIM(p_name), ''), name)
  WHERE id = p_program_workout_id;

  DELETE FROM public.program_exercises
  WHERE program_workout_id = p_program_workout_id;

  INSERT INTO public.program_exercises (
    program_workout_id,
    exercise_id,
    exercise_name_snapshot,
    sets,
    reps,
    rest_seconds,
    notes,
    set_details,
    order_index
  )
  SELECT
    p_program_workout_id,
    (exercise.value->>'exercise_id')::UUID,
    exercise.value->>'exercise_name_snapshot',
    GREATEST(1, (exercise.value->>'sets')::INTEGER),
    COALESCE(NULLIF(exercise.value->>'reps', ''), '8-12'),
    COALESCE((exercise.value->>'rest_seconds')::INTEGER, 120),
    COALESCE(exercise.value->>'notes', ''),
    exercise.value->'set_details',
    exercise.ordinality - 1
  FROM jsonb_array_elements(p_exercises) WITH ORDINALITY AS exercise(value, ordinality);

  RETURN QUERY
  SELECT pe.*
  FROM public.program_exercises pe
  WHERE pe.program_workout_id = p_program_workout_id
  ORDER BY pe.order_index;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_program_workout_exercise(
  p_program_workout_id UUID,
  p_program_exercise_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_exercise_count INTEGER;
BEGIN
  PERFORM 1
  FROM public.program_workouts pw
  JOIN public.workout_programs wp ON wp.id = pw.program_id
  WHERE pw.id = p_program_workout_id
    AND wp.created_by = (SELECT auth.uid())
  FOR UPDATE OF pw;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Program workout not found or not editable';
  END IF;

  SELECT COUNT(*)
  INTO v_exercise_count
  FROM public.program_exercises
  WHERE program_workout_id = p_program_workout_id;

  IF v_exercise_count <= 1 THEN
    RAISE EXCEPTION 'A program workout must contain at least one exercise';
  END IF;

  DELETE FROM public.program_exercises
  WHERE id = p_program_exercise_id
    AND program_workout_id = p_program_workout_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Program exercise not found';
  END IF;

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_program_workout_has_exercises()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  PERFORM 1
  FROM public.program_workouts
  WHERE id = OLD.program_workout_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.program_exercises
    WHERE program_workout_id = OLD.program_workout_id
  ) THEN
    RAISE EXCEPTION 'A program workout must contain at least one exercise';
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS program_workout_must_retain_exercise ON public.program_exercises;
CREATE CONSTRAINT TRIGGER program_workout_must_retain_exercise
AFTER DELETE ON public.program_exercises
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.enforce_program_workout_has_exercises();

DROP POLICY IF EXISTS "Program exercises update own" ON public.program_exercises;
DROP POLICY IF EXISTS "Program exercises delete own" ON public.program_exercises;

REVOKE ALL ON FUNCTION public.replace_program_workout_exercises(UUID, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.remove_program_workout_exercise(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_program_workout_exercises(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_program_workout_exercise(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION public.enforce_program_workout_has_exercises() IS
  'Deferred invariant preventing an existing program workout from committing with zero exercises.';
