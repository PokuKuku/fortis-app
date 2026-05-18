-- Default new profile accent colors to Midnight.
-- Existing profile rows keep their current user-selected accent_color.

ALTER TABLE profiles
ALTER COLUMN accent_color SET DEFAULT 'midnight';

COMMENT ON COLUMN profiles.accent_color IS 'User preferred accent color for UI theming. Defaults to midnight.';
