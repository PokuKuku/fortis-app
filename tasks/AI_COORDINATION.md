# AI Feature Coordination

This file serves as a shared reference for Claude Code and Codex working on the Fortis AI feature.

**Last Updated:** 2025-12-28

---

## Goal

Build two AI capabilities for the Fortis mobile app:

1. **Create Workout Templates** - User describes a workout, AI creates it and saves to their templates
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
| Only 2 intents | `CREATE_PROGRAM` and `CREATE_TEMPLATE` exist; no read-only query intent |
| No streaming | Responses arrive complete, no token-by-token display |
| `intentGuidance` empty | System prompt doesn't vary by intent type |
| Analytics context | `fetchAnalytics()` exists but may have error handling gaps |

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
| Add ANALYZE_HISTORY read intent to edge function | ⬜ Pending | `supabase/functions/ai/index.ts` |
| Update buildSystemPrompt() for read vs write intents | ⬜ Pending | `supabase/functions/ai/index.ts` |
| Ensure parseModelResponse supports read responses | ⬜ Pending | `supabase/functions/ai/index.ts` |
| Fix fetchAnalytics() error handling | ⬜ Pending | `supabase/functions/ai/index.ts` |
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
```

---

## Questions to Resolve

1. Final intent name for analysis (`ANALYZE_HISTORY` vs `ASK_TRAINING`)?
2. Should analysis live only in AI chat, or also be surfaced in History?
3. Should analysis summaries be saved (e.g., `training_summaries`) or remain chat-only?
4. Any rate limit changes needed for the new intent?
