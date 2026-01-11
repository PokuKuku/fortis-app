# AI Workout Proposal Roadmap

Goal: Chat-only workout template creation. AI can propose or parse a workout, resolve exercises via chat prompts, and create a real workout template only after explicit user confirmation. No extra screens, no popups, no buttons beyond the chat composer.

## Multi-Phase Plan

### Phase 0: Decisions and Ground Rules
- [x] Confirm edit semantics: regenerate from the user's message vs targeted field edits.
- [x] Confirm save semantics: positive confirmation creates immediately vs always require a final confirmation line.
- [x] Define the natural language intent parsing rules (confirm, cancel, edit) and priority when a reply contains both.

### Phase 1: Contract and Prompting
- [x] Define strict payload WORKOUT_DRAFT_V1 in shared types and edge function parsing.
- [x] Update AI system prompt to emit WORKOUT_DRAFT_V1 when the user asks to create a template.
- [x] Require the AI to end workout-like responses with a natural-language save prompt line
  ("Reply yes to save, or tell me changes or cancel.").

### Phase 2: Pending Draft Storage (Hidden State)
- [x] Add hidden draft storage per chat thread (recommended: chat_workout_drafts table).
- [x] Fields: id, user_id, chat_id, status, draft_payload (json), unresolved (json), timestamps.
- [x] Status flow: pending -> awaiting_resolution -> ready_to_save -> saved | canceled.

### Phase 3: Chat-Only Intent Handling
- [x] Parse natural language confirmations when a pending draft exists.
- [x] Confirm save via phrases like: "yes", "looks good", "go ahead", "save it".
- [x] Cancel via phrases like: "no", "never mind", "cancel".
- [x] Treat change requests as edits (e.g., "swap bench for incline", "make it 3x10").
- [x] If no draft exists, replies are handled as normal chat input.
- [x] For edits: regenerate or apply minimal changes based on chosen grammar.

### Phase 4: Exercise Resolution via Chat
- [x] Implement resolveExerciseQuery(query, userId) -> candidates[].
- [x] Auto-resolve only on strong matches (exact canonical_key, exact normalized_name, alias hit with high confidence and a clear score gap).
- [x] If ambiguous, AI asks in chat with numbered choices (max 5). User replies 1-5.
- [x] Mark draft as awaiting_resolution until all queries are resolved.

### Phase 5: Template Creation (Server-Validated)
- [x] On confirmation (ready_to_save only): validate limits (<= 12 exercises, sets reasonable).
- [x] Create template using existing pipeline (workout_programs + program_workouts + program_exercises).
- [x] Persist audit fields: created_by_ai, source_chat_id, payload_version.
- [x] AI replies: "Saved as X. You will find it in Programs -> Workouts."

### Phase 6: Analytics and QA
- [x] Events: ai_workout_draft_created, ai_workout_resolution_requested, ai_workout_resolution_completed,
  ai_workout_saved, ai_workout_canceled, ai_workout_started.
- [ ] QA flows: paste workout text -> draft -> resolve -> save; ambiguous selection; cancel; edit then save.

## Open Questions (to finalize before implementation)
Resolved:
- Edits take priority over saving when a reply includes both.
- EDIT semantics: regenerate from user message (simpler and more achievable).
- Always ask for a natural-language confirmation line before saving.

Still open:
- None.

## Notes
- This plan intentionally removes all non-chat UI. The only visible interface is the chat thread.
- Internal draft state is required so short replies like "2" can be interpreted as resolution choices.

## Implementation Status (current)
- [x] Phase 1: Contract and prompting in edge function implemented.
- [x] Phase 2: Pending draft storage implemented (local + Supabase sync).
- [x] Phase 3: Chat-only intent handling implemented (confirm/cancel/edit/resolve).
- [x] Phase 4: Chat resolution prompts implemented with numbered choices.
- [x] Phase 5: Template creation via existing pipeline with AI audit fields implemented.
- [x] Phase 6: Analytics events and unit tests added.
