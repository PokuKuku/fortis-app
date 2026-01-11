-- Migration 044: Add chat workout drafts and AI metadata

ALTER TABLE workout_programs
  ADD COLUMN IF NOT EXISTS ai_source_chat_id UUID,
  ADD COLUMN IF NOT EXISTS ai_payload_version TEXT;

COMMENT ON COLUMN workout_programs.ai_source_chat_id IS 'Chat thread ID that originated this template';
COMMENT ON COLUMN workout_programs.ai_payload_version IS 'AI payload version used to create the template';

CREATE TABLE IF NOT EXISTS chat_workout_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  chat_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'awaiting_resolution', 'ready_to_save', 'saved', 'canceled')),
  draft_payload JSONB NOT NULL,
  unresolved JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE chat_workout_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat workout drafts are viewable by owner"
  ON chat_workout_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat workout drafts"
  ON chat_workout_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update chat workout drafts"
  ON chat_workout_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete chat workout drafts"
  ON chat_workout_drafts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_workout_drafts_user_id
  ON chat_workout_drafts(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_workout_drafts_chat_id
  ON chat_workout_drafts(chat_id);

CREATE TRIGGER update_chat_workout_drafts_updated_at
  BEFORE UPDATE ON chat_workout_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
