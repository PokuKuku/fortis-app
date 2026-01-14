CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_created_by_slug_unique
  ON exercises(created_by, slug);
