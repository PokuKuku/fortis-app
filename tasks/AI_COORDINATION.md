# AI Feature Coordination

This file documents the current AI assistant architecture for the Fortis mobile app.

## Goal

Provide a read-only analytics assistant (`FORTIS_ANALYST`) that answers training questions and summarizes history. The AI never writes to user data.

## Current State

- Chat UI, input, message rendering, store, and service are active.
- Supabase Edge Function handles context assembly and calls OpenAI.
- Responses are `answer` or `clarification` only (no drafts, no mutation previews).

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
                                               │   OpenAI API    │
                                               └─────────────────┘
```

**Data Flow:**
1. User types message in ChatInput
2. `aiStore.sendMessage()` called with intent + message
3. `aiService.sendAIMessage()` invokes Supabase edge function
4. Edge function assembles context (history, exercises, analytics)
5. OpenAI generates response (`answer` or `clarification`)
6. Response displayed in chat

## Key Files Reference

### Frontend (fortis-mobile-app/)

| File | Purpose |
|------|---------|
| `app/ai/chat.tsx` | Main chat screen route |
| `src/store/aiStore.ts` | Conversation state |
| `src/services/aiService.ts` | API calls to edge function |
| `src/types/ai.ts` | TypeScript types for AI feature |
| `src/components/ai/` | AI UI components |

### Backend (supabase/)

| File | Purpose |
|------|---------|
| `functions/ai/index.ts` | Edge function - context assembly, OpenAI calls |
| `migrations/` | Schema for AI rate limits and analytics support |

## Types & Intents

```typescript
// Current intents (src/types/ai.ts)
type AIIntent = 'FORTIS_ANALYST'

// Response types
type AIResponseType = 'answer' | 'error' | 'clarification'
```

## Adding a New Intent

1. **Types**: Add to `AIIntent` union in `src/types/ai.ts`
2. **Intent Config**: Update intent config in `src/types/ai.ts`
3. **Edge Function**: Add intent handling in `supabase/functions/ai/index.ts`
4. **UI**: Update intent inference in `app/ai/chat.tsx`

## Environment

Supabase secrets (Edge Functions):
- `SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)
- `OPENAI_FALLBACK_MODEL` (optional)
- `OPENAI_USE_RESPONSES` (optional)
