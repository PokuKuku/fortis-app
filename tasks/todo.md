# Remove Read-Only AI Intents for V1

## Todo
- [x] Update type definitions (ai.ts)
- [x] Update backend edge function
- [x] Update service layer (aiService.ts)
- [x] Update state management (aiStore.ts)
- [x] Update chat UI (chat.tsx)
- [x] Update empty state UI (ChatEmptyState.tsx)
- [x] Update suggestion generators
- [x] Update tests

## Review

### Summary
Simplified AI feature for V1 by removing read-only intents (QUERY_STATS, QUERY_HISTORY, ANALYZE_PLATEAU), keeping only CREATE_PROGRAM and CREATE_TEMPLATE. Image upload auto-detection preserved.

### Files Modified

1. **`fortis-mobile-app/src/types/ai.ts`** - Removed 3 read intents from AIIntent type and INTENT_CONFIG

2. **`supabase/functions/ai/index.ts`** - Removed read intents from backend type and config, removed ANALYZE_PLATEAU guidance, removed dead read-type response format code

3. **`fortis-mobile-app/src/services/aiService.ts`** - Removed queryStats, queryHistory, analyzePlateau helper functions, updated getIntentLabel

4. **`fortis-mobile-app/src/store/aiStore.ts`** - Removed askAboutStats and askAboutPlateau from interface and implementation

5. **`fortis-mobile-app/app/ai/chat.tsx`** - Removed plateau intent inference, changed default intent from QUERY_STATS to CREATE_TEMPLATE

6. **`fortis-mobile-app/src/components/ai/ChatEmptyState.tsx`** - Updated quick actions grid to only show write intents, added "Scan a Workout" and "Hypertrophy Split" cards, updated subtitle

7. **`fortis-mobile-app/src/utils/suggestionGenerators.ts`** - Removed case blocks for read intents, updated default suggestions

8. **`fortis-mobile-app/src/utils/__tests__/aiIntents.test.ts`** - Updated to only test write intents

### Result
- AI feature now focused on two high-impact use cases: creating programs and templates
- Image upload still works with auto-detect behavior
- All tests pass

---

# CLAUDE.md Improvements

## Todo
- [x] Consolidate duplicate theming checklists
- [x] Replace stale migration list with directory pointer
- [x] Add quick-reference table for common patterns
- [x] Add E2E testing guidance for Maestro tests

## Review

### Summary
Improved CLAUDE.md by removing redundant content, adding quick-lookup reference, and enhancing testing documentation.

### Changes Made

1. **Consolidated theming checklists** - Removed duplicate "Pre-Implementation Theming Checklist" section (was at lines 454-461), keeping only the main checklist in the Design System section.

2. **Replaced migration list** - Changed the static list of 9 migration files to a dynamic pointer:
   - Added naming convention note
   - Added command to list migrations
   - Noted idempotency

3. **Added Quick Reference table** - New section after Development Commands with 14 common patterns:
   - UI components (GlassButton, GlassCard, BaseModal)
   - Theming, navigation, state, icons, APIs
   - Animations, haptics, typography, events

4. **Added E2E testing guidance** - Extended Maestro section with:
   - Where to place test files
   - How to use `maestro studio`
   - Common commands list
   - testID prop pattern for reliable selectors

### Net Result
- Reduced ~15 lines (duplicate checklist + stale migrations)
- Added ~25 lines (quick reference + testing guidance)
- More maintainable and actionable documentation

---

# Google OAuth Debug - localhost Redirect Issue

## Problem
Safari shows "can't open the page because it couldn't connect to the server" when trying to sign in with Google. The title bar shows "localhost" which indicates the redirect URL is pointing to localhost instead of using the custom URL scheme.

## Root Cause
In `src/contexts/AuthContext.tsx:226-229`, `makeRedirectUri` generates different URLs based on environment:
- **Expo Go**: Returns `exp://localhost:8081/--/auth/callback` (localhost URL)
- **Development Build**: Returns `fortis://auth/callback`

Since Safari shows "localhost", the app is running in **Expo Go**, not a development build.

## Todo
- [ ] Confirm whether user is running in Expo Go or development build
- [ ] Implement fix based on environment

---

# Testing Setup Plan

## Overview

Set up Jest + React Native Testing Library for the Expo/React Native app.

---

## Todo Items

- [x] Install testing dependencies (jest-expo, @testing-library/react-native, etc.)
- [x] Create Jest configuration (jest.config.js)
- [x] Create setup file for test environment (jest.setup.js)
- [x] Add npm test scripts to package.json
- [x] Create example test to verify setup works
- [x] Update CLAUDE.md with testing commands

---

## Review

### Summary of Changes

**Files Created:**
- `fortis-mobile-app/jest.config.js` - Jest configuration using jest-expo/ios preset
- `fortis-mobile-app/jest.setup.pre.js` - Pre-setup file to mock Expo winter runtime
- `fortis-mobile-app/jest.setup.js` - Main setup file with common mocks (AsyncStorage, expo-haptics, expo-router, react-native-reanimated, react-native-gesture-handler)
- `fortis-mobile-app/components/__tests__/GlassButton.test.tsx` - Example test for GlassButton component

**Files Modified:**
- `fortis-mobile-app/package.json` - Added test scripts (test, test:watch, test:coverage)
- `CLAUDE.md` - Added testing commands section

**Dependencies Installed:**
- jest-expo
- @testing-library/react-native
- @testing-library/jest-native (deprecated but installed for compatibility)
- jest
- @types/jest
- react-test-renderer

### Key Technical Notes

1. **Expo SDK 54 Compatibility:** Required a workaround for the Expo winter runtime by mocking `global.__ExpoImportMetaRegistry` in `jest.setup.pre.js`

2. **Path Alias:** The `@/` path alias is configured in Jest to match the TypeScript config

3. **Test Location:** Tests should be placed in `__tests__` directories adjacent to the code they test, or use `.test.tsx` suffix

### Commands

```bash
npm test               # Run all tests
npm test:watch         # Run tests in watch mode
npm test:coverage      # Run tests with coverage report
npm test -- GlassButton  # Run specific test file
```

---

# Unified Workout Entry UI Implementation

## Tasks

- [x] Add editor session state and actions to workoutStore.ts
- [x] Add useEditor prop to ExerciseCard.tsx
- [x] Add useEditor prop to SetRow.tsx
- [x] Refactor create.tsx to use ExerciseCard/SetRow
- [x] Add date/time picker for log mode
- [x] Implement saveEditorAsTemplate and saveEditorAsWorkout
- [x] Add Log Past Workout option to home kebab menu
- [x] Test both template and log workout flows

## Review

### Summary

Implemented a unified workout entry UI that replaces the simple SET/LBS/REPS input cards with the active workout-style `ExerciseCard` + `SetRow` components (with checkmarks). The same UI now supports both:
1. **Template creation** - Creating reusable workout templates
2. **Past workout logging** - Logging completed workouts with a backdated date

### Files Modified

1. **`src/store/workoutStore.ts`**
   - Added `editorSession`, `editorMode`, `editorDate` state
   - Added 15 editor-specific actions (initEditorSession, addEditorExercises, updateEditorSet, completeEditorSet, saveEditorAsTemplate, saveEditorAsWorkout, etc.)

2. **`src/components/workout/ExerciseCard.tsx`**
   - Added `useEditor` prop to switch between `activeSession` and `editorSession`
   - Conditional store action selection based on mode

3. **`src/components/workout/SetRow.tsx`**
   - Added `useEditor` prop to switch between `activeSession` and `editorSession`
   - Conditional store action selection for all set operations

4. **`src/components/workout/NumberPadModal.tsx`**
   - Added `useEditor` prop to read from correct session

5. **`app/workout/create.tsx`**
   - Complete refactor to use ExerciseCard/SetRow instead of custom cards
   - Added route param support for `mode=template|log`
   - Added DateSelector for backdating in log mode
   - Updated save logic to dispatch to appropriate save function

6. **`app/(tabs)/index.tsx`**
   - Added "Log Past Workout" option to workouts kebab menu
   - Added `handleLogPastWorkoutPress` handler that navigates to `/workout/create?mode=log`
   - Added `ClockIcon` and `Colors` imports

### How to Use

1. **Create Template**: Tap kebab menu on Workouts section → "Add Workout"
2. **Log Past Workout**: Tap kebab menu on Workouts section → "Log Past Workout"

### Notes

- The date picker only supports date selection (not time) using the existing DateSelector component
- In log mode, sets can be checked off for visual feedback but all sets are saved regardless of completion state
- Templates only save the exercise/set structure, not the actual weight/rep values entered

---

# Save Templates & Start Workout from Template

## Tasks

- [x] Update types - Add setDetails to ProgramExercise type
- [x] Update programsStore - Modify createWorkoutTemplate to accept set details
- [x] Update workoutStore - Modify saveEditorAsTemplate to pass set data
- [x] Add startWorkoutFromTemplate function in workoutStore
- [x] Update index page - Add press handler for template cards

## Review

### Summary

Implemented the ability to save workout templates with full set data (weight/reps) and start new workout sessions from saved templates with pre-filled exercises and sets.

### Files Modified

1. **`src/types/workout.ts`**
   - Added `TemplateSetDetail` interface for storing weight/reps per set
   - Extended `ProgramExercise` with optional `setDetails?: TemplateSetDetail[]`

2. **`src/store/programsStore.ts`**
   - Updated `createWorkoutTemplate` signature to accept `setDetails` in exercise array
   - Modified local program creation to store `setDetails` in exercises

3. **`src/store/workoutStore.ts`**
   - Updated `saveEditorAsTemplate` to pass full set details (weight, reps for each set)
   - Added `startWorkoutFromTemplate(templateId)` function that:
     - Loads template from programsStore
     - Creates active session with pre-filled exercises and sets
     - Uses stored setDetails to populate weight/reps values
     - Updates template's `lastPerformedAt` timestamp

4. **`app/(tabs)/index.tsx`**
   - Modified templates display to show programs where `isTemplate: true`
   - Changed `handleWorkoutCardPress` to call `startWorkoutFromTemplate` and navigate to active workout

### Data Flow

```
Create Template:
editorSession.exercises → saveEditorAsTemplate() → createWorkoutTemplate(with setDetails) → AsyncStorage/Supabase

Start from Template:
templateId → startWorkoutFromTemplate() → load template → create activeSession with pre-filled sets → navigate to /workout/active
```

### How to Use

1. **Create Template**: Tap kebab menu on Workouts section → "Add Workout" → Add exercises, fill in weight/reps → Save
2. **Start from Template**: Tap any saved template card in Workouts section → Workout starts with pre-filled data

---

# Beta Rate Limits

## Todo
- [x] Create migration 020_beta_rate_limits.sql with schema changes
- [x] Update PostgreSQL check_ai_rate_limit function for week/month
- [x] Update TypeScript types in src/types/ai.ts
- [x] Update aiService.ts getRateLimitStatus
- [x] Update ChatHeaderLogo.tsx to show most restrictive limit

## Review

### Summary

Implemented tighter rate limits for beta to stay within $50/month budget for 200+ users while maintaining "unlimited feel" for most users. Added weekly and monthly rate limit windows.

### Beta Limits

| Window | Previous | Beta | Rationale |
|--------|----------|------|-----------|
| Per minute | 10 | **3** | Prevent rapid-fire abuse |
| Per hour | 100 | **5** | Generous for a session |
| Per day | 500 | **10** | Allows solid daily use |
| Per week | - | **25** | NEW: Catches binge users |
| Per month | - | **50** | NEW: Hard budget cap |

### Cost Analysis

- **Per-request cost** (Claude Sonnet 4): ~$0.03
- **Budget capacity**: $50 / $0.03 = ~1,667 requests/month
- **Projected usage** (Pareto distribution): ~1,230 requests/month = **$37/month**

### Files Modified

1. **`supabase/migrations/020_beta_rate_limits.sql`** (NEW)
   - Added `actions_this_week`, `actions_this_month` columns
   - Added `week_window_start`, `month_window_start` timestamps
   - Added `max_per_week`, `max_per_month` limit columns
   - Updated default limits for beta (3/5/10/25/50)
   - Replaced `check_ai_rate_limit()` function with week/month support

2. **`fortis-mobile-app/src/types/ai.ts`**
   - Added to `AIRateLimitStatus`: `actionsThisWeek`, `actionsThisMonth`, `maxPerWeek`, `maxPerMonth`

3. **`fortis-mobile-app/src/services/aiService.ts`**
   - Updated `getRateLimitStatus()` to return week/month fields with fallback defaults

4. **`fortis-mobile-app/src/components/ai/ChatHeaderLogo.tsx`**
   - Badge now shows `Math.min()` of all remaining limits (most restrictive)
   - Updated accessibility label

### UX Behavior

- **80% of users** (casual, 2-3 requests/month): Never hit any limit
- **15% of users** (regular, 10-15 requests/month): May occasionally see low remaining count
- **5% of users** (power users): May hit daily/weekly limits, clear messaging provided

### Deployment

```bash
# Push migration to remote
cd supabase
supabase db push --dns-resolver https
```
