ALTER TABLE profiles
  ADD COLUMN gender TEXT,
  ADD COLUMN birth_date DATE,
  ADD COLUMN height_cm INTEGER,
  ADD COLUMN weight_kg NUMERIC,
  ADD COLUMN lifting_experience TEXT,
  ADD COLUMN workouts_per_week INTEGER,
  ADD COLUMN tried_other_apps TEXT,
  ADD COLUMN fitness_goal TEXT,
  ADD COLUMN biggest_challenge TEXT,
  ADD COLUMN workout_consistency TEXT;
