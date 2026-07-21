-- Replace a program workout's exercise tree in one database transaction.
-- Any validation or insert failure rolls the delete back automatically.

CREATE OR REPLACE FUNCTION public.replace_program_workout_exercises(
  p_program_workout_id UUID,
  p_name TEXT,
  p_exercises JSONB
)
RETURNS SETOF public.program_exercises
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_updated_rows INTEGER;
BEGIN
  IF jsonb_typeof(p_exercises) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'p_exercises must be a JSON array';
  END IF;

  IF jsonb_array_length(p_exercises) = 0 THEN
    RAISE EXCEPTION 'A program workout must contain at least one exercise';
  END IF;

  UPDATE public.program_workouts
  SET name = COALESCE(NULLIF(BTRIM(p_name), ''), name)
  WHERE id = p_program_workout_id;

  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
  IF v_updated_rows = 0 THEN
    RAISE EXCEPTION 'Program workout not found or not editable';
  END IF;

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

REVOKE ALL ON FUNCTION public.replace_program_workout_exercises(UUID, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_program_workout_exercises(UUID, TEXT, JSONB) TO authenticated;

COMMENT ON FUNCTION public.replace_program_workout_exercises(UUID, TEXT, JSONB) IS
  'Atomically replaces a user-owned program workout exercise tree; failures roll back the entire replacement.';
