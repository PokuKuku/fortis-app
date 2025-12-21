-- =====================================================
-- ADD MISSING UPDATE AND DELETE POLICIES FOR WORKOUT_PROGRAMS
-- =====================================================
-- Fix: Templates were reappearing after deletion because
-- RLS was blocking delete operations (no DELETE policy existed)
-- =====================================================

-- Add UPDATE policy for workout_programs
-- Allows users to update their own programs
CREATE POLICY "Users can update own programs"
  ON workout_programs FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Add DELETE policy for workout_programs
-- Allows users to delete their own programs
CREATE POLICY "Users can delete own programs"
  ON workout_programs FOR DELETE
  USING (auth.uid() = created_by);
