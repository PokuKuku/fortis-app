-- Set stable search_path for get_user_preferences_for_ai (Security Advisor warning)
ALTER FUNCTION public.get_user_preferences_for_ai(UUID)
  SET search_path = public, pg_temp;
