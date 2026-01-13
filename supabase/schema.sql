-- =====================================================
-- FORTIS STRENGTH TRAINING APP - DATABASE SCHEMA
-- =====================================================
-- Description: Comprehensive database schema for Fortis
-- Features: Offline-first, workout tracking, analytics
-- Auth: Supabase Auth with Google/Apple OAuth
-- Billing: Stripe integration ready
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USER MANAGEMENT & PROFILES
-- =====================================================

-- User profiles table (extends Supabase Auth users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- User preferences
  preferred_units TEXT DEFAULT 'imperial' CHECK (preferred_units IN ('imperial', 'metric')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),

  -- Onboarding status
  onboarding_completed BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- BILLING & SUBSCRIPTIONS (STRIPE)
-- =====================================================

CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Stripe details
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Subscription status
  status TEXT DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'canceled', 'past_due', 'unpaid', 'incomplete')),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),

  -- Dates
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- EXERCISE LIBRARY
-- =====================================================

CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Core exercise data
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  canonical_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  based_on_exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  canonical_key TEXT,
  aliases TEXT[] NOT NULL DEFAULT '{}',

  -- Exercise classification
  force TEXT CHECK (force IN ('push', 'pull', 'static')),
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'expert')),
  mechanic TEXT CHECK (mechanic IN ('compound', 'isolation')),
  equipment TEXT CHECK (equipment IN ('barbell', 'dumbbell', 'kettlebells', 'machine', 'cable', 'body only', 'bands', 'medicine ball', 'exercise ball', 'e-z curl bar', 'foam roll', 'other')),

  -- Muscle groups (stored as arrays)
  primary_muscles TEXT[] NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}',

  -- Instructions and media
  instructions TEXT[] NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('strength', 'powerlifting', 'olympic weightlifting', 'strongman', 'stretching', 'cardio', 'plyometrics')),
  images TEXT[] DEFAULT '{}',
  video_url TEXT,

  -- Metadata
  is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
  is_curated BOOLEAN DEFAULT FALSE NOT NULL,
  source TEXT,
  normalized_name TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE exercises
  ADD CONSTRAINT IF NOT EXISTS exercises_canonical_id_not_self
  CHECK (canonical_id IS NULL OR canonical_id <> id);

-- Indexes for performance
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_level ON exercises(level);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_exercises_primary_muscles ON exercises USING GIN(primary_muscles);
CREATE INDEX idx_exercises_aliases_gin ON exercises USING GIN(aliases);
CREATE INDEX idx_exercises_curated_hidden_canonical ON exercises(is_curated, is_hidden, canonical_id);

-- Public exercises remain globally unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_name_public
  ON exercises(name)
  WHERE is_custom = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_slug_public
  ON exercises(slug)
  WHERE is_custom = FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_canonical_key_unique
  ON exercises(canonical_key)
  WHERE is_custom = FALSE AND canonical_id IS NULL AND canonical_key IS NOT NULL;

-- Custom exercises are unique per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_name_custom
  ON exercises(created_by, name)
  WHERE is_custom = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_slug_custom
  ON exercises(created_by, slug)
  WHERE is_custom = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_normalized_name_custom
  ON exercises(created_by, normalized_name)
  WHERE is_custom = TRUE AND normalized_name IS NOT NULL;

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Public exercises or own custom exercises
CREATE POLICY "Exercises are viewable if public or owned"
  ON exercises FOR SELECT
  USING (is_custom = FALSE OR created_by = auth.uid());

-- Only authenticated users can create custom exercises
CREATE POLICY "Users can create custom exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

CREATE POLICY "Users can update own custom exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = created_by AND is_custom = TRUE)
  WITH CHECK (auth.uid() = created_by AND is_custom = TRUE);

CREATE POLICY "Users can delete own custom exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = created_by AND is_custom = TRUE);

-- =====================================================
-- WORKOUT PROGRAMS (TEMPLATES)
-- =====================================================

CREATE TABLE workout_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Program details
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks INTEGER,

  -- Program type
  goal TEXT CHECK (goal IN ('strength', 'hypertrophy', 'powerlifting', 'general_fitness')),
  is_default BOOLEAN DEFAULT FALSE,

  -- Ownership
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT FALSE,
  ai_source_chat_id UUID,
  ai_payload_version TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;

-- Public programs and own programs are viewable
CREATE POLICY "Programs are viewable by creator or if public"
  ON workout_programs FOR SELECT
  USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create own programs"
  ON workout_programs FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- =====================================================
-- PROGRAM WORKOUTS (Days within a program)
-- =====================================================

CREATE TABLE program_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE NOT NULL,

  -- Workout details
  name TEXT NOT NULL, -- e.g., "Day 1: Upper Body"
  description TEXT,
  day_number INTEGER NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(program_id, day_number)
);

ALTER TABLE program_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Program workouts viewable with program"
  ON program_workouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE id = program_id
      AND (is_public = true OR created_by = auth.uid())
    )
  );

-- =====================================================
-- PROGRAM EXERCISES (Exercises within program workouts)
-- =====================================================

CREATE TABLE program_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_workout_id UUID REFERENCES program_workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID NOT NULL,
  exercise_name_snapshot TEXT,

  -- Exercise prescription
  order_index INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  reps TEXT, -- e.g., "8-12" or "5"
  rest_seconds INTEGER,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(program_workout_id, order_index)
);

ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Program exercises viewable with workout"
  ON program_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM program_workouts pw
      JOIN workout_programs wp ON pw.program_id = wp.id
      WHERE pw.id = program_workout_id
      AND (wp.is_public = true OR wp.created_by = auth.uid())
    )
  );

-- =====================================================
-- CHAT WORKOUT DRAFTS (Pending AI templates)
-- =====================================================

CREATE TABLE chat_workout_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  chat_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'awaiting_resolution', 'ready_to_save', 'saved', 'canceled')),
  draft_payload JSONB NOT NULL,
  unresolved JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE chat_workout_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat workout drafts viewable by owner"
  ON chat_workout_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat workout drafts"
  ON chat_workout_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update chat workout drafts"
  ON chat_workout_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete chat workout drafts"
  ON chat_workout_drafts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_chat_workout_drafts_user_id ON chat_workout_drafts(user_id);
CREATE INDEX idx_chat_workout_drafts_chat_id ON chat_workout_drafts(chat_id);

CREATE TRIGGER update_chat_workout_drafts_updated_at
  BEFORE UPDATE ON chat_workout_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- WORKOUT SESSIONS (User's actual workouts)
-- =====================================================

CREATE TABLE workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Session details
  name TEXT,
  notes TEXT,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER, -- Auto-calculated

  -- Program tracking (optional)
  program_id UUID REFERENCES workout_programs(id) ON DELETE SET NULL,
  program_workout_id UUID REFERENCES program_workouts(id) ON DELETE SET NULL,

  -- Offline sync management
  is_synced BOOLEAN DEFAULT FALSE,
  local_id TEXT, -- Client-generated ID for offline sessions

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, local_id)
);

-- Indexes for performance
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_started_at ON workout_sessions(started_at DESC);
CREATE INDEX idx_workout_sessions_is_synced ON workout_sessions(is_synced) WHERE is_synced = FALSE;

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- WORKOUT SETS (Individual sets within a session)
-- =====================================================

CREATE TABLE workout_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID NOT NULL,
  exercise_name_snapshot TEXT,
  primary_muscles_snapshot TEXT[],
  secondary_muscles_snapshot TEXT[],

  -- Set details
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight DECIMAL(10, 2), -- Supports decimals like 135.5 lbs
  weight_unit TEXT,
  rpe DECIMAL(3, 1) CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion (1-10)
  rest_seconds INTEGER,

  -- Additional tracking
  notes TEXT,
  is_warmup BOOLEAN DEFAULT FALSE,
  is_dropset BOOLEAN DEFAULT FALSE,
  is_failure BOOLEAN DEFAULT FALSE,

  -- Order within session
  order_index INTEGER NOT NULL,

  -- Offline sync
  local_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(session_id, order_index)
);

-- Indexes for performance
CREATE INDEX idx_workout_sets_session_id ON workout_sets(session_id);
CREATE INDEX idx_workout_sets_exercise_id ON workout_sets(exercise_id);
CREATE INDEX idx_workout_sets_created_at ON workout_sets(created_at DESC);

ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout sets"
  ON workout_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE id = session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own workout sets"
  ON workout_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE id = session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout sets"
  ON workout_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE id = session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workout sets"
  ON workout_sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE id = session_id
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_programs_updated_at
  BEFORE UPDATE ON workout_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sets_updated_at
  BEFORE UPDATE ON workout_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATA INTEGRITY CONSTRAINTS
-- =====================================================

ALTER TABLE workout_sessions
  ADD CONSTRAINT workout_sessions_duration_non_negative
  CHECK (duration_seconds IS NULL OR duration_seconds >= 0);

ALTER TABLE workout_sets
  ADD CONSTRAINT workout_sets_set_number_positive
  CHECK (set_number > 0);

ALTER TABLE workout_sets
  ADD CONSTRAINT workout_sets_reps_non_negative
  CHECK (reps IS NULL OR reps >= 0);

ALTER TABLE workout_sets
  ADD CONSTRAINT workout_sets_weight_non_negative
  CHECK (weight IS NULL OR weight >= 0);

ALTER TABLE workout_sets
  ADD CONSTRAINT workout_sets_weight_unit_valid
  CHECK (weight_unit IN ('lbs', 'kg') OR weight_unit IS NULL);

ALTER TABLE workout_sets
  ADD CONSTRAINT workout_sets_rest_seconds_non_negative
  CHECK (rest_seconds IS NULL OR rest_seconds >= 0);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create initial free subscription
  INSERT INTO public.subscriptions (user_id, status, tier)
  VALUES (NEW.id, 'trialing', 'free');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate workout session duration
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    IF NEW.duration_seconds IS NOT NULL THEN
      RETURN NEW;
    END IF;

    IF NEW.completed_at = NEW.started_at THEN
      NEW.duration_seconds = NULL;
    ELSE
      NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_workout_duration
  BEFORE INSERT OR UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION calculate_session_duration();

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- View: User workout statistics
CREATE OR REPLACE VIEW user_workout_stats AS
SELECT
  ws.user_id,
  COUNT(DISTINCT ws.id) as total_workouts,
  COUNT(DISTINCT DATE(ws.started_at)) as total_workout_days,
  SUM(ws.duration_seconds) as total_time_seconds,
  AVG(ws.duration_seconds) as avg_workout_duration,
  MAX(ws.started_at) as last_workout_date,
  COUNT(DISTINCT wst.exercise_id) as unique_exercises_performed,
  SUM(wst.reps * wst.weight) as total_volume
FROM workout_sessions ws
LEFT JOIN workout_sets wst ON ws.id = wst.session_id
WHERE ws.completed_at IS NOT NULL
GROUP BY ws.user_id;

-- View: Exercise personal records (1RM estimates)
CREATE OR REPLACE VIEW exercise_personal_records AS
SELECT
  wst.exercise_id,
  ws.user_id,
  COALESCE(MAX(e.name), MAX(wst.exercise_name_snapshot), 'Unknown Exercise') as exercise_name,
  MAX(wst.weight) as max_weight,
  MAX(wst.weight * (1 + wst.reps::DECIMAL / 30)) as estimated_1rm,
  MAX(wst.reps) as max_reps,
  MAX(ws.started_at) as achieved_at
FROM workout_sets wst
JOIN workout_sessions ws ON wst.session_id = ws.id
LEFT JOIN exercises e ON wst.exercise_id = e.id
WHERE wst.is_warmup = FALSE
GROUP BY wst.exercise_id, ws.user_id;

-- View: Weekly workout volume
CREATE OR REPLACE VIEW weekly_workout_volume AS
SELECT
  ws.user_id,
  DATE_TRUNC('week', ws.started_at) as week_start,
  COUNT(DISTINCT ws.id) as workouts_count,
  SUM(wst.reps * wst.weight) as total_volume,
  SUM(ws.duration_seconds) as total_time_seconds
FROM workout_sessions ws
LEFT JOIN workout_sets wst ON ws.id = wst.session_id
WHERE ws.completed_at IS NOT NULL
GROUP BY ws.user_id, DATE_TRUNC('week', ws.started_at);

-- View: Muscle group training frequency
CREATE OR REPLACE VIEW muscle_group_frequency AS
SELECT
  ws.user_id,
  unnest(COALESCE(wst.primary_muscles_snapshot, e.primary_muscles, '{}'::text[])) as muscle_group,
  COUNT(*) as times_trained,
  SUM(wst.reps * wst.weight) as total_volume,
  MAX(ws.started_at) as last_trained
FROM workout_sets wst
JOIN workout_sessions ws ON wst.session_id = ws.id
LEFT JOIN exercises e ON wst.exercise_id = e.id
WHERE ws.completed_at IS NOT NULL
GROUP BY ws.user_id, muscle_group;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase Auth users';
COMMENT ON TABLE subscriptions IS 'Stripe subscription management';
COMMENT ON TABLE exercises IS 'Exercise library with 50+ default exercises';
COMMENT ON TABLE workout_programs IS 'Pre-built and custom workout programs';
COMMENT ON TABLE program_workouts IS 'Individual workouts within a program';
COMMENT ON TABLE program_exercises IS 'Exercise prescriptions within program workouts';
COMMENT ON TABLE workout_sessions IS 'User workout sessions (offline-first)';
COMMENT ON TABLE workout_sets IS 'Individual sets tracked during workouts';

COMMENT ON COLUMN workout_sessions.local_id IS 'Client-generated UUID for offline sync';
COMMENT ON COLUMN workout_sessions.is_synced IS 'Tracks if offline data has been synced';
COMMENT ON COLUMN workout_sets.rpe IS 'Rate of Perceived Exertion (1-10 scale)';
COMMENT ON COLUMN workout_sets.weight IS 'Weight in user preferred unit (lbs or kg)';
COMMENT ON COLUMN workout_sets.weight_unit IS 'Unit recorded for weight (lbs or kg)';

-- =====================================================
-- EXERCISE LIBRARY META
-- =====================================================

CREATE TABLE exercise_library_meta (
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
