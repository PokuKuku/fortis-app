-- Migration 050: Remove unused AI mutation/draft tables
-- Drops legacy AI write pipeline tables and helper functions.

DROP TRIGGER IF EXISTS enforce_audit_immutability ON ai_mutations;
DROP FUNCTION IF EXISTS prevent_audit_tampering();
DROP FUNCTION IF EXISTS log_ai_mutation(TEXT, TEXT, UUID, JSONB, JSONB, UUID, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS expire_pending_actions();

DROP TABLE IF EXISTS ai_mutations CASCADE;
DROP TABLE IF EXISTS ai_pending_actions CASCADE;
DROP TABLE IF EXISTS chat_workout_drafts CASCADE;
