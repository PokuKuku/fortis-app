-- Fix security advisor warnings: set stable search_path on functions.
ALTER FUNCTION IF EXISTS public.update_updated_at_column()
  SET search_path = public, pg_temp;

ALTER FUNCTION IF EXISTS public.calculate_session_duration()
  SET search_path = public, pg_temp;

ALTER FUNCTION IF EXISTS public.refresh_volume_stats()
  SET search_path = public, pg_temp;

ALTER FUNCTION IF EXISTS public.prevent_audit_tampering()
  SET search_path = public, pg_temp;

ALTER FUNCTION IF EXISTS public.is_valid_uuid(TEXT)
  SET search_path = public, pg_temp;
