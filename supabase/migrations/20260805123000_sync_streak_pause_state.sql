ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_pause_state JSONB;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_streak_pause_state_valid;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_streak_pause_state_valid
  CHECK (
    streak_pause_state IS NULL
    OR jsonb_typeof(streak_pause_state) = 'object'
  );

COMMENT ON COLUMN public.profiles.streak_pause_state IS
  'Account-synced workout streak pause state, protected local date ranges, and earned freeze-pass inventory.';
