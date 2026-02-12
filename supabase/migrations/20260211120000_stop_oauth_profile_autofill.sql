-- Stop auto-populating profile name/photo from OAuth metadata.
-- New users should start with blank profile name and avatar.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NULL,
    NULL
  );

  -- Create initial free subscription
  INSERT INTO public.subscriptions (user_id, status, tier)
  VALUES (NEW.id, 'trialing', 'free');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Preserve security hardening settings applied in earlier migrations.
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET row_security = off;
