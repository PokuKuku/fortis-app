-- =====================================================
-- MIGRATION 007: Fix share token RNG lookup
-- =====================================================
-- Ensures generate_share_token can find pgcrypto functions
-- when extensions live in the extensions schema.
-- =====================================================

CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  -- 32 bytes of cryptographic randomness, URL-safe base64
  RETURN replace(replace(encode(gen_random_bytes(32), 'base64'), '+', '-'), '/', '_');
END;
$$;
