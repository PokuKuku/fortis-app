# Fortis Backend Reference

This file documents the backend architecture, data model, security posture, and operational practices for Fortis. Use it as a quick reference when adding features or modifying the data layer.

## Architecture Overview

Fortis uses Supabase as the backend:
- Postgres database with Row Level Security (RLS) for all user data.
- Supabase Auth for email/password and OAuth (Google/Apple).
- Supabase Edge Functions for AI orchestration (Claude).

Key goals:
- Strong user data isolation via RLS.
- AI changes gated behind a pending-action confirmation flow.
- Auditability and reversibility of AI changes.
- Offline-first support with client-side queues that sync to the backend.

## Core Tables

From `supabase/migrations/000_initial_schema.sql` and `supabase/migrations/002_core_features_and_ai_security.sql`.

User data:
- `profiles` (1:1 with auth.users)
- `subscriptions`
- `workout_programs`
- `program_workouts`
- `program_exercises`
- `workout_sessions`
- `workout_sets`
- `user_program_progress`
- `exercise_sticky_notes`
- `session_exercise_notes`

AI and analytics:
- `ai_rate_limits`
- `ai_pending_actions` (required confirmation)
- `ai_mutations` (immutable audit log)
- `training_summaries` (shareable summaries with expiring tokens)

## RLS and Security Design

RLS is enabled on all user tables; most use FORCE RLS. Key patterns:
- Ownership checks use `auth.uid()` in both `USING` and `WITH CHECK`.
- Custom exercises are private: `exercises` SELECT is public-only for non-custom, or owner-only for custom.
- Program children (`program_workouts`, `program_exercises`) write policies enforce ownership of parent `workout_programs`.
- AI pending actions and mutation logs block direct client inserts.

Security-definer functions:
- `handle_new_user`
- `check_ai_rate_limit`
- `expire_pending_actions`
- `view_shared_summary`
- `get_user_preferences_for_ai`
- `get_user_notes_for_ai`
- `get_exercise_notes_for_ai`
- `log_ai_mutation`

These functions have `search_path` pinned and `row_security = off` where intentional.

## AI Flow

Edge function: `supabase/functions/ai/index.ts`

Flow:
1) Client invokes `/functions/v1/ai` with user JWT.
2) Edge function assembles context and calls Claude.
3) If response is a mutation plan:
   - Pending actions are persisted to `ai_pending_actions` using service role.
4) Client confirms plan and applies mutations via the app.
5) Each applied mutation is logged via `log_ai_mutation` RPC.

Allowlists exist in both the edge function and client:
- entity types (`workout_program`, `program_workout`, `program_exercise`, `workout_session`, `workout_set`)
- action types based on intent

If you add new AI mutation types:
- Update allowlists in `supabase/functions/ai/index.ts`
- Update `ACTION_TYPE_BY_INTENT` and `LOGGABLE_ENTITY_TYPES` in `fortis-mobile-app/src/services/aiService.ts`
- Update database CHECK constraints on `ai_pending_actions` and `ai_mutations` if needed.

## Important Migrations

Security and hardening:
- `005_security_hardening.sql` (custom exercise privacy, program child write policies, SECURITY DEFINER search_path, AI logging)
- `006_additional_security_hardening.sql` (WITH CHECK added, per-user custom exercise uniqueness)
- `007_fix_share_token_rng.sql` (generate_share_token search_path)
- `008_ops_security_hardening.sql` (definer RLS bypass, program default restrictions)

If you introduce new tables, always add:
- RLS enable + FORCE (for user data)
- SELECT/INSERT/UPDATE/DELETE policies with `USING` and `WITH CHECK`
- minimal necessary indexes

## Secrets and Environment Variables

Supabase secrets (Edge Functions):
- `SERVICE_ROLE_KEY` (preferred)
- `ANTHROPIC_API_KEY`

Note:
- `SUPABASE_SERVICE_ROLE_KEY` exists but the CLI refuses secrets starting with `SUPABASE_`. The AI edge function checks `SERVICE_ROLE_KEY` first and falls back to `SUPABASE_SERVICE_ROLE_KEY` for compatibility.

## Operational Checklist (Production)

Must verify in Supabase dashboard:
- Backups + PITR enabled and tested.
- Alerts/monitoring configured (CPU, storage, error rate, edge function failures).
- Storage bucket policies (if storage is used).
- Rotate any exposed keys and update `SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY`.

## Common Commands

Remote migrations:
```
supabase db push --dns-resolver https
```

Remote schema lint:
```
supabase db lint --linked --dns-resolver https
```

Deploy AI function:
```
supabase functions deploy ai
```

Set secrets:
```
supabase secrets set SERVICE_ROLE_KEY=... ANTHROPIC_API_KEY=...
```

## Notes for Future Changes

When adding backend features:
- Add RLS policies for every CRUD operation.
- Use `WITH CHECK` for any UPDATE/INSERT to prevent ownership reassignment.
- If data is shareable, add explicit allowlists and secure access functions.
- If AI can mutate new entities, update allowlists and audit logging.
- If new functions are SECURITY DEFINER, pin search_path and consider `row_security = off` only when needed.

When adding new user-owned entities:
- Add ownership columns (`user_id` or `created_by`).
- Add indexes on user_id + created_at for common access patterns.
- Add validation constraints on large text columns.
