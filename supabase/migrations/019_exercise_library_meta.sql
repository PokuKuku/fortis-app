-- =====================================================
-- MIGRATION 015: Exercise library metadata
-- =====================================================

CREATE TABLE IF NOT EXISTS exercise_library_meta (
  id INTEGER PRIMARY KEY,
  version BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO exercise_library_meta (id, version)
VALUES (1, 1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE exercise_library_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercise_library_meta_read"
  ON exercise_library_meta FOR SELECT
  USING (true);
