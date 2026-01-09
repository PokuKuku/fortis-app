-- Add canonical/curation fields for exercise library management.

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS canonical_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS based_on_exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS canonical_key TEXT,
  ADD COLUMN IF NOT EXISTS aliases TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_curated BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS normalized_name TEXT;

ALTER TABLE exercises
  ADD CONSTRAINT IF NOT EXISTS exercises_canonical_id_not_self
  CHECK (canonical_id IS NULL OR canonical_id <> id);

CREATE INDEX IF NOT EXISTS idx_exercises_aliases_gin
  ON exercises USING GIN (aliases);

CREATE INDEX IF NOT EXISTS idx_exercises_curated_hidden_canonical
  ON exercises (is_curated, is_hidden, canonical_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_canonical_key_unique
  ON exercises (canonical_key)
  WHERE is_custom = FALSE AND canonical_id IS NULL AND canonical_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_normalized_name_custom
  ON exercises (created_by, normalized_name)
  WHERE is_custom = TRUE AND normalized_name IS NOT NULL;
