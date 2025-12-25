-- Fix security advisor warnings: set stable search_path on functions.
ALTER FUNCTION public.update_updated_at_column()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.calculate_session_duration()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.refresh_volume_stats()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.prevent_audit_tampering()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.is_valid_uuid(TEXT)
  SET search_path = public, pg_temp;

ALTER FUNCTION public.get_user_preferences_for_ai(UUID)
  SET search_path = public, pg_temp;
