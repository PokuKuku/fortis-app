-- Allow "blank" as a start button preset
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_default_start_type_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_default_start_type_check
  CHECK (default_start_type IS NULL OR default_start_type IN ('template', 'program', 'blank'));

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS valid_start_config;

ALTER TABLE profiles
  ADD CONSTRAINT valid_start_config CHECK (
    (default_start_type IS NULL) OR
    (default_start_type = 'blank' AND default_start_template_id IS NULL AND default_start_program_id IS NULL) OR
    (default_start_type = 'template' AND default_start_template_id IS NOT NULL) OR
    (default_start_type = 'program' AND default_start_program_id IS NOT NULL)
  );
