-- Expand accent_color palette to match app theme options and legacy aliases

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_accent_color_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_accent_color_check
CHECK (
  accent_color IN (
    'green',
    'midnight',
    'purple',
    'teal',
    'orange',
    'pink',
    'amber',
    'copper',
    'indigo',
    'red',
    'slate',
    'cyan',
    -- Legacy/alias values kept for backward compatibility
    'blue',
    'rose',
    'lime'
  )
);
