# AI Feature Coordination

This file serves as a shared reference for Claude Code and Codex working on the Fortis AI feature.

**Last Updated:** 2025-12-28

---

## Goal

Build two AI capabilities for the Fortis mobile app:

1. **Create Workout Templates** - User provides a workout (text or image), AI translates it to database format
2. **Analyze Lifting History** - Full analytics: PRs, volume trends, frequency, weak points, progress over time

---

## Current State of AI Feature

### What's Already Built

| Component | Status | Location |
|-----------|--------|----------|
| Chat UI (fullscreen) | ✅ Complete | `app/ai/chat.tsx` |
| Chat input (text, voice, images) | ✅ Complete | `src/components/ai/ChatInput.tsx` |
| Message rendering (markdown) | ✅ Complete | `src/components/ai/ChatMessage.tsx` |
| Mutation preview modal | ✅ Complete | `src/components/ai/AIMutationPreviewModal.tsx` |
| Program draft editor | ✅ Complete | `src/components/ai/AIMutationProgramDraftEditor.tsx` |
| AI Store (Zustand) | ✅ Complete | `src/store/aiStore.ts` |
| AI Service | ✅ Complete | `src/services/aiService.ts` |
| Supabase Edge Function | ✅ Complete | `supabase/functions/ai/index.ts` |
| Rate limiting | ✅ Complete | DB + UI indicator |

### What's Incomplete/Needs Work

| Issue | Details |
|-------|---------|
| No streaming | Responses arrive complete, no token-by-token display |
| Analytics QA | Validate ANALYZE_HISTORY responses against real data |

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Chat UI       │────▶│   AI Store      │────▶│   AI Service    │
│   (chat.tsx)    │     │   (Zustand)     │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │ Supabase Edge   │
                                               │ Function (ai)   │
                                               └────────┬────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │ Claude 3.5      │
                                               │ Sonnet          │
                                               └─────────────────┘
```

**Data Flow:**
1. User types message in ChatInput
2. aiStore.sendMessage() called with intent + message
3. aiService.sendAIMessage() invokes Supabase edge function
4. Edge function assembles context (history, exercises, analytics)
5. Claude generates response (answer or mutation_plan)
6. Response displayed in chat; mutations shown in preview modal
7. User confirms → mutations applied to database

---

## Key Files Reference

### Frontend (fortis-mobile-app/)

| File | Purpose |
|------|---------|
| `app/ai/chat.tsx` | Main chat screen route |
| `src/store/aiStore.ts` | Conversation state, mutation handling |
| `src/services/aiService.ts` | API calls to edge function |
| `src/types/ai.ts` | TypeScript types for AI feature |
| `src/components/ai/` | All UI components |

### Backend (supabase/)

| File | Purpose |
|------|---------|
| `functions/ai/index.ts` | Edge function - context assembly, Claude calls |
| `migrations/` | Database schema for ai_pending_actions, ai_mutations, etc. |

### Types & Intents

```typescript
// Current intents (src/types/ai.ts)
type AIIntent = 'CREATE_PROGRAM' | 'CREATE_TEMPLATE' | 'ANALYZE_HISTORY'

// Response types
type AIResponseType = 'answer' | 'mutation_plan' | 'error' | 'clarification'
```

---

## Task Division (ASSIGNED)

### Claude Code Tasks (Frontend)

| Task | Status | Files |
|------|--------|-------|
| Update AI types with new intents | ✅ Complete | `src/types/ai.ts` |
| Add read intent config + labels | ✅ Complete | `src/types/ai.ts`, `src/services/aiService.ts` |
| Update intent inference and UI prompts | ✅ Complete | `app/ai/chat.tsx` |
| Add analysis quick actions + suggestions | ✅ Complete | `src/components/ai/ChatEmptyState.tsx` |
| Clean up dead/unused code | ✅ Complete | Various files |
| Test frontend flows | ⬜ Pending (awaiting backend) | Manual testing |

### Codex Tasks (Backend)

| Task | Status | Files |
|------|--------|-------|
| Add ANALYZE_HISTORY read intent to edge function | ✅ Complete | `supabase/functions/ai/index.ts` |
| Update buildSystemPrompt() for read vs write intents | ✅ Complete | `supabase/functions/ai/index.ts` |
| Ensure parseModelResponse supports read responses | ✅ Complete | `supabase/functions/ai/index.ts` |
| Fix fetchAnalytics() error handling | ✅ Complete | `supabase/functions/ai/index.ts` |
| Test edge function | ⬜ Pending | Manual testing |

---

## Implementation Notes

### Adding a New Intent

1. **Types**: Add to `AIIntent` union in `src/types/ai.ts`
2. **Intent Config**: Add to `INTENT_CONFIG` in `src/types/ai.ts`
3. **Service**: Update `ACTION_TYPE_BY_INTENT` in `src/services/aiService.ts`
4. **Edge Function**: Add intent handling in `supabase/functions/ai/index.ts`
5. **UI**: Update intent inference in `app/ai/chat.tsx`

### Adding Read-Only Queries (ANALYZE intent)

For queries that don't create mutations:
- Response type should be `answer` not `mutation_plan`
- No need for mutation preview modal
- Context assembly should include rich analytics data
- No DB migration required for read-only intents

### CREATE_TEMPLATE Translator Approach (v2)

**Background:** The original "generator" approach had the AI asking clarification questions ("What equipment?", "What goal?") before creating a workout. This created a poor UX with multiple back-and-forth messages.

**New Approach:** CREATE_TEMPLATE now operates as a **translator**:

```
User Input                          →  AI Output
─────────────────────────────────────────────────────────
"Squats 3x10, Lunges 3x12"          →  Template with 2 exercises
[Photo of workout plan]              →  Template extracted from image
"Create a push day"                  →  Opinionated template (4-6 exercises)
"asdfghjkl" (gibberish)              →  Clarification (only case)
```

**Key Principles:**
1. **Never ask clarification questions** - just create the template
2. **Use sensible defaults**: 3 sets, "8-12" reps, 60s rest, "intermediate" difficulty
3. **Fuzzy-match exercises** to the available exercise database
4. **Be opinionated** for vague requests - pick common exercises that fit the theme
5. **Only clarify** if literally NO exercises can be identified

**Intent Inference:**
- Workout list patterns (`3x10`, `4 sets`, `10 reps`) auto-trigger CREATE_TEMPLATE
- Images with CREATE_TEMPLATE intent use translator mode
- User can still explicitly say "create a workout" for vague requests

**Files Changed:**
- `supabase/functions/ai/index.ts` - System prompt with translator instructions
- `app/ai/chat.tsx` - Intent inference for workout patterns
- `src/components/ai/ChatEmptyState.tsx` - Updated quick action prompts

---

## Status Updates

Use this section to track progress:

```
[2025-12-28] Session started - exploring current AI implementation
[2025-12-28] Scope confirmed: create templates and analyze history
[2025-12-28] Claude Code: Frontend implementation complete
  - Added ANALYZE_HISTORY intent with 'read' type support
  - Added intent inference for analysis keywords and question patterns
  - Added quick action cards for "Analyze Progress" and "My PRs"
  - Added analyzeHistory() helper function
  - Cleaned up dead code (deprecated functions, unused styles)
  - Ready for backend integration testing
[2025-12-28] Codex: Backend implementation complete
  - Added ANALYZE_HISTORY read intent + prompt format for answers
  - Hardened analytics fetching with safe fallbacks
[2025-12-28] Claude Code: CREATE_TEMPLATE translator refactor
  - Changed from "generator" (asks questions) to "translator" (immediate creation)
  - Updated system prompt with TRANSLATOR MODE instructions
  - AI now uses sensible defaults and never asks clarification questions
  - Intent inference now detects workout-list patterns (3x10, 4 sets, etc.)
  - Updated quick action prompts to show translator-style examples
  - Clarification only triggered when NO exercises can be matched
[2025-12-29] Codex: Improve exercise phrase extraction for CREATE_TEMPLATE matching
  - Treat set/rep patterns as separators to avoid cross-exercise phrase mixing
  - Normalize common abbreviations (db/bb/kb) before matching
  - Generate phrases per segment to improve exercise DB hits
[2025-12-29] Codex: Resolve exercise IDs on draft init to clear invalid warnings
  - Auto-resolve non-UUID exercise IDs as soon as the draft loads
  - Merge resolved IDs without overwriting user edits
```

---

## Questions to Resolve

1. Intent name finalized as `ANALYZE_HISTORY`
2. Should analysis live only in AI chat, or also be surfaced in History? (Decision: chat-only for v1)
3. Should analysis summaries be saved (e.g., `training_summaries`) or remain chat-only?
4. Any rate limit changes needed for the new intent?
