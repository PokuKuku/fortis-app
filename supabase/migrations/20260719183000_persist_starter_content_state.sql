-- Persist one-time starter content across reinstalls and devices.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS starter_content_initialized BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_default_program_ids TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS new_user_checklist_state JSONB;

COMMENT ON COLUMN public.profiles.starter_content_initialized IS
  'Whether the account has already received its one-time bundled starter workouts.';
COMMENT ON COLUMN public.profiles.deleted_default_program_ids IS
  'Bundled starter workout IDs the user deleted; these tombstones prevent resurrection after reinstall.';
COMMENT ON COLUMN public.profiles.new_user_checklist_state IS
  'Account-backed Fortify Challenge task state.';

-- The challenge and sample workouts are intended for new accounts. Existing
-- accounts may already have completed or deleted them on a device whose local
-- storage no longer exists, so retire both pieces of starter content once.
UPDATE public.profiles
SET
  starter_content_initialized = TRUE,
  deleted_default_program_ids = ARRAY[
    'default-template-upper',
    'default-template-lower',
    'default-program-upper-lower'
  ]::TEXT[],
  new_user_checklist_state = COALESCE(
    new_user_checklist_state,
    jsonb_build_object(
      'finish_in_app_tour', 'complete',
      'pick_app_theme', 'complete',
      'ask_ai_for_workout', 'skipped',
      'make_workout_template_from_text', 'skipped',
      'ask_fortify_insight', 'skipped',
      'log_twenty_minute_workout', 'skipped'
    )
  )
WHERE created_at < TIMESTAMPTZ '2026-07-19 18:05:00+00';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_new_user_checklist_state_object;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_new_user_checklist_state_object
  CHECK (
    new_user_checklist_state IS NULL
    OR jsonb_typeof(new_user_checklist_state) = 'object'
  );
