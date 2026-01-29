-- Ensure authenticated users can insert their own profile row
-- (RLS may block profile creation if policy is missing or altered)

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
