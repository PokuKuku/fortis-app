-- In-app tour fields (one-time walkthrough state)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_seen_in_app_tour BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS in_app_tour_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS in_app_tour_version INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN profiles.has_seen_in_app_tour IS 'Whether the one-time in-app tour has been shown to the user';
COMMENT ON COLUMN profiles.in_app_tour_completed_at IS 'Timestamp when the in-app tour was completed or skipped';
COMMENT ON COLUMN profiles.in_app_tour_version IS 'In-app tour content/version shown to the user';

