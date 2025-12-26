-- =====================================================
-- MIGRATION 015: AI Goals Actions
-- =====================================================
-- Adds:
--   1. update_goals action type for AI pending actions + mutations
--   2. user_goal entity type for AI pending actions + mutations
-- =====================================================

ALTER TABLE ai_pending_actions
  DROP CONSTRAINT IF EXISTS ai_pending_actions_action_type_check;

ALTER TABLE ai_pending_actions
  ADD CONSTRAINT ai_pending_actions_action_type_check
  CHECK (action_type IN (
    'create_template',
    'modify_template',
    'create_program',
    'modify_program',
    'log_workout',
    'log_set',
    'update_goals'
  ));

ALTER TABLE ai_pending_actions
  DROP CONSTRAINT IF EXISTS ai_pending_actions_entity_type_check;

ALTER TABLE ai_pending_actions
  ADD CONSTRAINT ai_pending_actions_entity_type_check
  CHECK (entity_type IN (
    'workout_program',
    'program_workout',
    'program_exercise',
    'workout_session',
    'workout_set',
    'user_goal'
  ));

ALTER TABLE ai_mutations
  DROP CONSTRAINT IF EXISTS ai_mutations_action_type_check;

ALTER TABLE ai_mutations
  ADD CONSTRAINT ai_mutations_action_type_check
  CHECK (action_type IN (
    'create_template',
    'modify_template',
    'create_program',
    'modify_program',
    'log_workout',
    'log_set',
    'delete_workout',
    'delete_set',
    'update_goals'
  ));

ALTER TABLE ai_mutations
  DROP CONSTRAINT IF EXISTS ai_mutations_entity_type_check;

ALTER TABLE ai_mutations
  ADD CONSTRAINT ai_mutations_entity_type_check
  CHECK (entity_type IN (
    'workout_program',
    'program_workout',
    'program_exercise',
    'workout_session',
    'workout_set',
    'user_goal'
  ));
