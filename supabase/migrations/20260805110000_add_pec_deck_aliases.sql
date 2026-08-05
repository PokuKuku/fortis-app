-- Make the visible ExerciseDB movement discoverable by its common gym names.
UPDATE exercises
SET aliases = ARRAY(
  SELECT DISTINCT alias
  FROM unnest(
    COALESCE(aliases, '{}'::TEXT[])
    || ARRAY[
      'pec deck',
      'pec deck fly',
      'machine fly',
      'chest fly machine'
    ]::TEXT[]
  ) AS alias
)
WHERE LOWER(name) = 'lever seated fly';
