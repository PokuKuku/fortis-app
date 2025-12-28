-- Add accent_color column to profiles table for customizable UI theming
-- Users can select from a preset palette of colors

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'green'
CHECK (accent_color IN ('green', 'blue', 'purple', 'teal', 'orange', 'pink', 'amber', 'rose'));

COMMENT ON COLUMN profiles.accent_color IS 'User preferred accent color for UI theming. Defaults to green.';
