-- Add theme_mode column for cloud sync of user theme preferences
-- Supports 'system' (follow device), 'light', or 'dark'
-- Note: accent_color already exists from migration 021

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'system'
CHECK (theme_mode IN ('system', 'light', 'dark'));

-- Add index for potential future queries by theme
CREATE INDEX IF NOT EXISTS idx_profiles_theme_mode ON profiles(theme_mode);
