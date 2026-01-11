# AI Workout Proposal Roadmap

Goal: Chat-only workout template creation that feels like ChatGPT. The AI should be fast, conversational, and accurate, with natural confirmations and no rigid commands. It should draft immediately based on user input and only ask clarifying questions when required to produce a valid draft. Insight-card “Ask Fortis” remains a separate, data-backed flow.

## Multi-Phase Plan

### Phase 0: Product Behavior Alignment
- [x] Confirm normal chat feels conversational and only drafts on explicit creation or pasted workout text.
- [x] Confirm capability questions are answered conversationally (no draft yet).
- [x] Confirm insights are only triggered via insight-card “Ask Fortis.”
- [x] Confirm AI drafts immediately using defaults; no long question lists.
- [x] Confirm edits take priority and are regenerated from user message.

### Phase 1: Response Routing (Core Behavior)
- [x] Audit ai/index.ts routing paths and remove or gate legacy flows.
- [x] Add routing rules for three explicit modes:
  - [x] Normal chat -> answer JSON only.
  - [x] Draft creation -> workout_draft JSON only.
  - [x] Intent classification -> intent_classification JSON only.
- [x] Add capability-question handling (respond “Yes, want me to build one now?”).
- [x] Only emit workout_draft when user explicitly asks to create or pastes workout content.

### Phase 2: Prompt Redesign (Short, Fast, Deterministic)
- [x] Short base prompt for normal chat (concise, data-backed when needed).
- [x] Separate strict prompt for workout_draft JSON only.
- [x] Separate strict prompt for intent_classification JSON only.
- [x] Remove draft/TLDR leakage in non-draft contexts.

### Phase 3: Lean Context Assembly
- [x] Normal chat: minimal context by default (prefs + only relevant data).
- [x] Insight-card flow: insight context only, ignore other sections.
- [x] Draft creation: no history/analytics unless user explicitly asks.
- [x] Clarifying questions only when draft validity is blocked.

### Phase 4: Parsing and Validation
- [x] Enforce JSON-only output for workout_draft and intent_classification.
- [x] Allow plain text only for normal chat answers.
- [x] Simplify parser fallbacks to avoid silent draft->answer downgrades.

### Phase 5: UX and QA
- [ ] QA: capability question -> conversational answer -> prompt to build.
- [ ] QA: explicit create -> draft -> confirmation -> save.
- [ ] QA: pasted workout text -> draft without extra questions.
- [ ] QA: ambiguity -> numbered options -> natural selection (“option two”).
- [ ] QA: edits regenerate draft; confirmations save.

## Implementation Status (current)
- [x] Draft workflow + pending draft state implemented (chat-only flow).
- [x] LLM intent classification for natural replies implemented.
- [x] Routing/prompt cleanup (this roadmap) implemented.
- [ ] QA flows pending for new routing/prompt behavior.
