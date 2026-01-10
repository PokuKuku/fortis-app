# AI Workout Proposal Roadmap

Goal: Proposal -> preview -> user confirms -> real workout template appears in Programs and is startable.

## Progress Summary (as of now)
- Chat can receive a strict WORKOUT_PROPOSAL_V1 payload and render a proposal card.
- Review screen exists to resolve exercises (canonical/alias/fuzzy), create custom exercises, edit details, and confirm creation.
- Creation reuses the existing template pipeline (`workout_programs` + `program_workouts` + `program_exercises`).
- AI-generated templates are flagged and surfaced in Programs with a highlight.
- Analytics events added for proposal, review, resolve, create, edited-before-create, and start.

## Milestones

### 1) Proposal Contract + Parsing (Done)
- Added WORKOUT_PROPOSAL_V1 types and parsing/validation in edge function.
- AI store handles new response type and logs proposal analytics.

### 2) Chat UI Proposal Card (Done)
- Proposal card renders inside chat with Review/Edit/Create actions.
- TLDR suppression for proposal messages to avoid double UI.

### 3) Proposal Preview + Exercise Resolution (Done)
- Review screen lists exercises, set prescriptions, and notes.
- Resolution flow supports canonical/alias/fuzzy matches and manual selection.
- Custom exercise creation modal included (primary muscle required).
- Optional editing for title/summary/sets/notes.

### 4) Template Creation (Done)
- Reused `createWorkoutTemplate` with AI flags and description support.
- Notes and set summaries are persisted to template exercises.
- Navigation highlights the newly created workout card in Programs.

### 5) Analytics (Done)
- Added events: proposed, review opened, exercise resolved, created, edited-before-create, started.

### 6) Tests (Done)
- Unit tests for resolution + template mapping added.

## Remaining Work / Next Iteration
- Verify UI polish on the preview screen (spacing and overflow on smaller devices).
- Confirm that offline template creation + later sync includes notes and AI flag.
- Add any additional copy/labels if you want stronger “confirm-first” trust cues.
- Run tests and add any missing coverage based on feedback.

## Files Touched (for reference)
- `supabase/functions/ai/index.ts`
- `fortis-mobile-app/src/types/ai.ts`
- `fortis-mobile-app/src/store/aiStore.ts`
- `fortis-mobile-app/src/components/ai/WorkoutProposalCard.tsx`
- `fortis-mobile-app/src/components/ai/ChatMessage.tsx`
- `fortis-mobile-app/app/ai/chat.tsx`
- `fortis-mobile-app/app/ai/workout-proposal.tsx`
- `fortis-mobile-app/src/utils/workoutProposal.ts`
- `fortis-mobile-app/src/store/programsStore.ts`
- `fortis-mobile-app/src/store/workoutStore.ts`
- `fortis-mobile-app/src/services/analyticsService.ts`
- `fortis-mobile-app/app/(tabs)/index.tsx`
- `fortis-mobile-app/src/utils/__tests__/workoutProposal.test.ts`
