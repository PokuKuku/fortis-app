# AI Workout Proposal Roadmap

Goal: Chat-only workout template creation. AI can propose or parse a workout, resolve exercises via chat prompts, and create a real workout template only after explicit user confirmation. No extra screens, no popups, no buttons beyond the chat composer.

## Multi-Phase Plan

### Phase 0: Decisions and Ground Rules
- Confirm edit semantics: regenerate from the user's message vs targeted field edits.
- Confirm save semantics: positive confirmation creates immediately vs always require a final confirmation line.
- Define the natural language intent parsing rules (confirm, cancel, edit) and priority when a reply contains both.

### Phase 1: Contract and Prompting
- Define strict payload WORKOUT_DRAFT_V1 in shared types and edge function parsing.
- Update AI system prompt to emit WORKOUT_DRAFT_V1 when the user asks to create a template.
- Require the AI to end workout-like responses with a save prompt line ("Reply SAVE to add this as a template.").

### Phase 2: Pending Draft Storage (Hidden State)
- Add hidden draft storage per chat thread (recommended: chat_workout_drafts table).
- Fields: id, user_id, chat_id, status, draft_payload (json), unresolved (json), timestamps.
- Status flow: pending -> awaiting_resolution -> ready_to_save -> saved | canceled.

### Phase 3: Chat-Only Intent Handling
- Parse natural language confirmations when a pending draft exists.
- Confirm save via phrases like: "yes", "looks good", "go ahead", "save it".
- Cancel via phrases like: "no", "never mind", "cancel".
- Treat change requests as edits (e.g., "swap bench for incline", "make it 3x10").
- If no draft exists, replies are handled as normal chat input.
- For edits: regenerate or apply minimal changes based on chosen grammar.

### Phase 4: Exercise Resolution via Chat
- Implement resolveExerciseQuery(query, userId) -> candidates[].
- Auto-resolve only on strong matches (exact canonical_key, exact normalized_name, alias hit with high confidence and a clear score gap).
- If ambiguous, AI asks in chat with numbered choices (max 5). User replies 1-5.
- Mark draft as awaiting_resolution until all queries are resolved.

### Phase 5: Template Creation (Server-Validated)
- On SAVE (ready_to_save only): validate limits (<= 12 exercises, sets reasonable).
- Create template using existing pipeline (workout_programs + program_workouts + program_exercises).
- Persist audit fields: created_by_ai, source_chat_id, payload_version.
- AI replies: "Saved as X. You will find it in Programs -> Workouts."

### Phase 6: Analytics and QA
- Events: ai_workout_draft_created, ai_workout_resolution_requested, ai_workout_resolution_completed,
  ai_workout_saved, ai_workout_canceled, ai_workout_started.
- QA flows: paste workout text -> draft -> resolve -> save; ambiguous selection; cancel; edit then save.

## Open Questions (to finalize before implementation)
Resolved:
- Edits take priority over saving when a reply includes both.
- EDIT semantics: regenerate from user message (simpler and more achievable).

Still open:
- SAVE semantics: immediate creation or always require a final confirmation line?

## Notes
- This plan intentionally removes all non-chat UI. The only visible interface is the chat thread.
- Internal draft state is required so short replies like "2" can be interpreted as resolution choices.
