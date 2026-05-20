-- New profiles should default to light mode instead of following the device system theme.
ALTER TABLE profiles
ALTER COLUMN theme_mode SET DEFAULT 'light';

COMMENT ON COLUMN profiles.theme_mode IS 'User preferred theme mode for UI theming. Defaults to light.';
