# Fortis Backend Reference

This file documents the backend architecture, data model, security posture, and operational practices for Fortis. Use it as a quick reference when adding features or modifying the data layer.

## Architecture Overview

Fortis uses Supabase as the backend:
- Postgres database with Row Level Security (RLS) for all user data.
- Supabase Auth for email/password and OAuth (Google/Apple).
- Supabase Edge Functions for AI orchestration (OpenAI).

Key goals:
- Strong user data isolation via RLS.
- AI requests are read-only (no AI writes to user data).
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
- `training_summaries` (shareable summaries with expiring tokens)

## RLS and Security Design

RLS is enabled on all user tables; most use FORCE RLS. Key patterns:
- Ownership checks use `auth.uid()` in both `USING` and `WITH CHECK`.
- Custom exercises are private: `exercises` SELECT is public-only for non-custom, or owner-only for custom.
- Program children (`program_workouts`, `program_exercises`) write policies enforce ownership of parent `workout_programs`.

Security-definer functions:
- `handle_new_user`
- `check_ai_rate_limit`
- `view_shared_summary`
- `get_user_preferences_for_ai`
- `get_user_notes_for_ai`
- `get_exercise_notes_for_ai`

These functions have `search_path` pinned and `row_security = off` where intentional.

## AI Flow

Edge function: `supabase/functions/ai/index.ts`

Flow:
1) Client invokes `/functions/v1/ai` with user JWT.
2) Edge function assembles context and calls OpenAI.
3) Response returns `answer` or `clarification` only (no DB writes).

## Important Migrations

Security and hardening:
- `005_security_hardening.sql` (custom exercise privacy, program child write policies, SECURITY DEFINER search_path updates)
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
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)
- `OPENAI_FALLBACK_MODEL` (optional)
- `OPENAI_USE_RESPONSES` (optional)

Note:
- `SUPABASE_SERVICE_ROLE_KEY` exists but the CLI refuses secrets starting with `SUPABASE_`. The AI edge function checks `SERVICE_ROLE_KEY` first and falls back to `SUPABASE_SERVICE_ROLE_KEY` for compatibility.

## Operational Checklist (Production)

Must verify in Supabase dashboard:
- Backups + PITR enabled and tested.
- Alerts/monitoring configured (CPU, storage, error rate, edge function failures).
- Storage bucket policies (if storage is used).
- Rotate any exposed keys and update `SERVICE_ROLE_KEY` and `OPENAI_API_KEY`.

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
supabase secrets set SERVICE_ROLE_KEY=... OPENAI_API_KEY=...
```

## Notes for Future Changes

When adding backend features:
- Add RLS policies for every CRUD operation.
- Use `WITH CHECK` for any UPDATE/INSERT to prevent ownership reassignment.
- If data is shareable, add explicit allowlists and secure access functions.
- If new functions are SECURITY DEFINER, pin search_path and consider `row_security = off` only when needed.

When adding new user-owned entities:
- Add ownership columns (`user_id` or `created_by`).
- Add indexes on user_id + created_at for common access patterns.
- Add validation constraints on large text columns.
