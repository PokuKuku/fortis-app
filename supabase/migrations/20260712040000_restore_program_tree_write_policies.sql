-- Restore authenticated write access to user-owned program trees.
--
-- The base schema originally created SELECT policies for program_workouts and
-- program_exercises, while migration 005 added their write policies. Recreate
-- those policies under a new migration version so environments that missed or
-- drifted from migration 005 can safely converge without allowing cross-user
-- writes.

ALTER TABLE public.program_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Program workouts insert own" ON public.program_workouts;
CREATE POLICY "Program workouts insert own"
  ON public.program_workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.workout_programs wp
      WHERE wp.id = program_workouts.program_id
        AND wp.created_by = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Program workouts update own" ON public.program_workouts;
CREATE POLICY "Program workouts update own"
  ON public.program_workouts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.workout_programs wp
      WHERE wp.id = program_workouts.program_id
        AND wp.created_by = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.workout_programs wp
      WHERE wp.id = program_workouts.program_id
        AND wp.created_by = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Program workouts delete own" ON public.program_workouts;
CREATE POLICY "Program workouts delete own"
  ON public.program_workouts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.workout_programs wp
      WHERE wp.id = program_workouts.program_id
        AND wp.created_by = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Program exercises insert own" ON public.program_exercises;
CREATE POLICY "Program exercises insert own"
  ON public.program_exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.program_workouts pw
      JOIN public.workout_programs wp ON wp.id = pw.program_id
      WHERE pw.id = program_exercises.program_workout_id
        AND wp.created_by = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Program exercises update own" ON public.program_exercises;
CREATE POLICY "Program exercises update own"
  ON public.program_exercises
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.program_workouts pw
      JOIN public.workout_programs wp ON wp.id = pw.program_id
      WHERE pw.id = program_exercises.program_workout_id
        AND wp.created_by = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.program_workouts pw
      JOIN public.workout_programs wp ON wp.id = pw.program_id
      WHERE pw.id = program_exercises.program_workout_id
        AND wp.created_by = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Program exercises delete own" ON public.program_exercises;
CREATE POLICY "Program exercises delete own"
  ON public.program_exercises
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.program_workouts pw
      JOIN public.workout_programs wp ON wp.id = pw.program_id
      WHERE pw.id = program_exercises.program_workout_id
        AND wp.created_by = (SELECT auth.uid())
    )
  );
