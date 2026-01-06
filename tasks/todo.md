# Fix "Save as Template" Button - Complete Solution (Both Bugs Fixed)

## Todo
- [x] Bug #1: Fix `hasTemplateModifications()` Map-based approach
- [x] Bug #2: Remove blocking condition in active.tsx
- [x] Test: Add exercise to template, verify button appears
- [x] Test: Change set counts, verify button appears
- [x] Test: Remove exercise, verify button appears
- [x] Test: No changes, verify button does NOT appear

## Summary

Fixed TWO bugs that were preventing the "Save as Template" button from appearing when users modified workouts started from templates:

### Bug #1: `hasTemplateModifications()` function (workoutStore.ts) ✅ FIXED
**Location:** `fortis-mobile-app/src/store/workoutStore.ts` (lines 2454-2521)

**The Problem:** Index-based set count comparison failed when exercise count changed:
```typescript
// Old buggy code (line 2478)
if (session.originalSetCounts.length === session.exercises.length) {
  // Check set counts...
}
// If exercise was added/removed, array lengths don't match → entire check SKIPPED!
```

**The Fix:** Map-based approach using exercise IDs:
```typescript
// Build Map: exerciseId → original set count
const originalSetCountMap = new Map<string, number>();
for (let i = 0; i < originalIds.length; i++) {
  originalSetCountMap.set(originalIds[i], session.originalSetCounts[i]);
}

// Check set counts by ID (works even if exercises added/removed)
const hasSetCountChanges = session.exercises.some(exercise => {
  const originalSetCount = originalSetCountMap.get(exercise.exerciseId);
  return originalSetCount !== undefined && exercise.sets.length !== originalSetCount;
});
```

### Bug #2: Blocking condition in active.tsx ✅ FIXED
**Location:** `fortis-mobile-app/app/workout/active.tsx` (lines 568-577)

**The Problem:** Additional condition blocked template/program workouts:
```typescript
// Old buggy code
onSaveAsTemplate={
  hasTemplateModifications(activeSession) && !activeSession?.programWorkoutId
    ? handleSaveAsTemplate
    : undefined
}
// The !programWorkoutId check meant button ONLY appeared for blank workouts
```

**The Fix:** Remove blocking condition, trust `hasTemplateModifications()`:
```typescript
// Fixed code
onSaveAsTemplate={
  hasTemplateModifications(activeSession)
    ? handleSaveAsTemplate
    : undefined
}
// Now works for blank workouts, template workouts, AND program workouts
```

## Files Modified

1. **`fortis-mobile-app/src/store/workoutStore.ts`** (lines 2454-2521)
   - Replaced index-based set count comparison with Map-based approach
   - Now detects: exercise additions, removals, replacements, reordering, set count changes

2. **`fortis-mobile-app/app/workout/active.tsx`** (lines 568-577)
   - Removed `&& !activeSession?.programWorkoutId` from line 569
   - Removed `&& !activeSession?.programWorkoutId` from line 574
   - Button now appears whenever modifications are detected (regardless of workout source)

## Testing Instructions

Test these scenarios to verify the complete fix:

1. **✅ Add exercise to "KB Pull" template:**
   - Start from "KB Pull" template
   - Add a new exercise (any exercise)
   - Finish workout
   - **Expected:** "Save as Template" button appears

2. **✅ Change set counts:**
   - Start from "KB Pull" template
   - Add 2 sets to any existing exercise
   - Finish workout
   - **Expected:** "Save as Template" button appears

3. **✅ Remove exercise:**
   - Start from "KB Pull" template
   - Remove one exercise
   - Finish workout
   - **Expected:** "Save as Template" button appears

4. **✅ No changes (baseline behavior):**
   - Start from "KB Pull" template
   - Complete workout without ANY modifications
   - Finish workout
   - **Expected:** "Save as Template" button does NOT appear

5. **✅ Combined changes:**
   - Start from "KB Pull" template
   - Add an exercise
   - Change set counts on another exercise
   - Remove a third exercise
   - Finish workout
   - **Expected:** "Save as Template" button appears

6. **✅ Blank workout (unchanged behavior):**
   - Start blank workout
   - Add exercises
   - Finish workout
   - **Expected:** "Save as Template" button appears (always shows for blank workouts)

## Why This Fix Works

1. **Map-based detection is resilient:** Works regardless of exercise count changes
2. **ID-based tracking:** Survives exercise reordering
3. **Single source of truth:** `hasTemplateModifications()` handles ALL the logic
4. **No redundant conditions:** Removed the blocking `programWorkoutId` check
5. **Handles all workout types:** Blank, template, and program workouts

---

# Fix Mini Player Visibility on Exercise Detail Screen (V2)

## Todo
- [x] Update WorkoutMiniBar.tsx route detection logic
- [x] Remove unused `isFromWorkoutModal` variable
- [x] Remove unused `useGlobalSearchParams` import
- [ ] Test implementation

## Implementation Notes
- Adding `isOnExerciseDetailScreen` check using `pathname.startsWith('/exercise/')`
- This follows the same pattern as existing checks for `/workout/active` and `/ai/chat`
- More reliable than query param-based detection

## Review

### Summary
Fixed the mini player visibility issue by adding pathname-based detection for exercise detail routes. The mini player now correctly hides when viewing exercise details during an active workout session.

### File Modified
**`fortis-mobile-app/src/components/workout/WorkoutMiniBar.tsx`**

### Changes Made

1. **Line 3** - Removed unused `useGlobalSearchParams` import (no longer needed)

2. **Line 33** - Removed unused `source` variable extraction (cleaned up)

3. **Lines 67-68** - Updated fullscreen route detection:
   - **Added:** `const isOnExerciseDetailScreen = pathname.startsWith('/exercise/');`
   - **Removed:** `const isFromWorkoutModal = source === 'workout-modal';` (unreliable query param check)
   - **Updated:** `isOnFullscreenRoute` now includes `isOnExerciseDetailScreen` instead of `isFromWorkoutModal`

### Why This Works

- **Pathname-based detection is reliable:** The `pathname` from `usePathname()` updates immediately on route changes
- **Consistent with existing patterns:** Follows the same approach as `/workout/active` and `/ai/chat` checks
- **Simpler logic:** Single boolean check instead of query parameter dependency
- **Covers all cases:** Mini player hides on ANY exercise detail view, not just from workout context

### Testing Checklist

Test the following scenarios:

1. **From Active Workout → Exercise Detail:**
   - Start a workout → tap exercise name to view details
   - ✅ Mini player should fade out and disappear
   - Navigate back
   - ✅ Mini player should fade back in

2. **From Exercises Tab → Exercise Detail (with active workout):**
   - Have active workout → navigate to Exercises tab
   - ✅ Mini player should be visible
   - Tap exercise to view details
   - ✅ Mini player should disappear

3. **No Active Workout:**
   - Navigate to any exercise detail without active workout
   - ✅ Mini player should not appear (existing behavior)

---

# Add Time Columns to CSV Export

## Overview
Add Start Time, End Time, and Duration columns to the workout CSV export.

## Todo
- [x] Update CSV header with new columns
- [x] Add time values to row generation
- [x] Test export functionality

## Review

### Summary
Added three new columns to the CSV export: **Start Time**, **End Time**, and **Duration (min)**.

### File Modified
**`fortis-mobile-app/src/utils/exportWorkouts.ts`**

### Changes Made
1. Added three new columns to the CSV header after "Date": `Start Time`, `End Time`, `Duration (min)`

2. Updated row generation to calculate and include:
   - **Start Time**: Formatted as `HH:mm` (24-hour, e.g., "09:30")
   - **End Time**: Formatted as `HH:mm` if `completedAt` exists, empty otherwise
   - **Duration (min)**: Rounded minutes, calculated from `durationSeconds` or timestamp difference

### CSV Format Change

**Before:**
```csv
Date,Workout Name,Exercise Name,...
2025-01-02,Push Day,Bench Press,...
```

**After:**
```csv
Date,Start Time,End Time,Duration (min),Workout Name,Exercise Name,...
2025-01-02,09:30,10:15,45,Push Day,Bench Press,...
```

### Edge Cases Handled
- If `completedAt` is null: End Time is empty, Duration uses `durationSeconds` if available
- If `durationSeconds` exists: Prefer it over timestamp calculation (more accurate)
- If neither exists: Both End Time and Duration are empty

---

# PostHog Analytics Event Tracking

## Overview
Add analytics tracking for key user events using the already-installed PostHog SDK.

## Todo
- [x] Create analyticsService.ts with typed event functions
- [x] Track workout events (started, completed, sets logged, session duration)
- [x] Track AI events (chat opened, message sent, content categories)
- [x] Track template/program created events
- [x] Track theme changed events

## Events Tracked
| Event | Location | Properties |
|-------|----------|------------|
| workout_started | workoutStore | source (blank/template/program), exerciseCount, templateId?, programId? |
| workout_completed | workoutStore | durationSeconds, durationMinutes, setsCompleted, exerciseCount, source |
| set_logged | workoutStore | exerciseName, hasWeight, hasReps, setNumber |
| ai_chat_opened | chat.tsx | - |
| ai_message_sent | aiStore | intent, hasImage |
| template_created | programsStore | exerciseCount |
| program_created | programsStore | workoutCount, weekCount |
| theme_changed | ThemeContext | mode, accentColor |

Note: "Return within 7 days" is a retention cohort calculated in PostHog dashboard, not a client-side event.

## Review

### Summary
Implemented PostHog analytics tracking for 8 key user events across the Fortis mobile app. The architecture uses a centralized analytics service that can be used from both React components (via hook) and Zustand stores (via direct import).

### Files Created
1. **`fortis-mobile-app/src/services/analyticsService.ts`** (NEW)
   - Typed event tracking functions for all 8 events
   - `useAnalytics()` hook for component usage
   - `analytics` object for store/service usage
   - PostHog instance singleton pattern via `setPostHogInstance()`

### Files Modified
1. **`fortis-mobile-app/src/components/analytics/PostHogAuthSync.tsx`**
   - Added `setPostHogInstance()` call to make PostHog available to the analytics service

2. **`fortis-mobile-app/src/store/workoutStore.ts`**
   - Added tracking for `workout_started` (3 sources: blank, template, program)
   - Added tracking for `workout_completed` with duration, sets completed, exercise count
   - Added tracking for `set_logged` when sets are completed (not uncompleted)

3. **`fortis-mobile-app/src/store/aiStore.ts`**
   - Added tracking for `ai_message_sent` with intent and image attachment status

4. **`fortis-mobile-app/app/ai/chat.tsx`**
   - Added tracking for `ai_chat_opened` on screen mount

5. **`fortis-mobile-app/src/store/programsStore.ts`**
   - Added tracking for `template_created` with exercise count
   - Added tracking for `program_created` with workout count and week count

6. **`fortis-mobile-app/src/contexts/ThemeContext.tsx`**
   - Added tracking for `theme_changed` (both mode and accent color changes)

### Architecture Notes
- Analytics calls are no-op when PostHog is not configured (safe for dev/testing)
- All event tracking is fire-and-forget (non-blocking)
- Property names use `snake_case` per PostHog convention
- Session duration is tracked in both seconds and minutes for flexibility

---

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

# Hide Mini Bar from Workout Modal Exercise Details

## Goal
Hide WorkoutMiniBar when viewing exercise details from AddExerciseModal during active workout.

## Todo
- [x] Update active.tsx to pass `?source=workout-modal` param (both handlers)
- [x] Update WorkoutMiniBar.tsx to check source param and hide
- [x] Fix: Use `useGlobalSearchParams` instead of `useLocalSearchParams`

## Review

### Summary
Implemented conditional hiding of the WorkoutMiniBar when viewing exercise details from ANY context within an active workout session.

### Key Learning
`useLocalSearchParams` only reads params from the route where the component is mounted. Since `WorkoutMiniBar` is in the root layout (`_layout.tsx`), it couldn't see params from child routes like `/exercise/[id]`. Fixed by using `useGlobalSearchParams` which reads from the globally selected route.

### Files Modified

1. **`fortis-mobile-app/app/workout/active.tsx`**
   - `handleViewExerciseDetails` (line 277) - Added `?source=workout-modal` param (kebab menu)
   - `handleModalExerciseDetails` (line 285) - Added `?source=workout-modal` param (AddExerciseModal)

2. **`fortis-mobile-app/src/components/workout/WorkoutMiniBar.tsx`**
   - Changed `useLocalSearchParams` → `useGlobalSearchParams` (reads from any visible route)
   - Added `isFromWorkoutModal` check: `source === 'workout-modal'`
   - Extended `isOnFullscreenRoute` to include `isFromWorkoutModal`

### Behavior

| Navigation Path | Mini Bar Visible? |
|----------------|-------------------|
| Active workout → Kebab menu → View Details | ❌ Hidden |
| Active workout → AddExerciseModal → Exercise detail | ❌ Hidden |
| Exercises tab → Exercise detail (workout active) | ✅ Visible |
| History → Past workout → Exercise detail | ✅ Visible |

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

---

# Fix Duplicate Workout/Program Naming

## Overview

When users create a workout or program with a name that already exists, it now automatically appends a number suffix to avoid duplicates.

## Todo
- [x] Create nameUtils.ts utility function
- [x] Create nameUtils.test.ts unit tests (19 passing)
- [x] Integrate into createWorkoutTemplate()
- [x] Integrate into createProgram()
- [x] Run tests to verify

## Review

### Summary

Added automatic duplicate name detection for workout templates and programs. When a user creates "KB Pull" and another "KB Pull" already exists, the new one becomes "KB Pull 2".

### Files Created

1. **`fortis-mobile-app/src/utils/nameUtils.ts`** (NEW)
   - `generateUniqueName(baseName, existingNames)` function
   - Case-insensitive comparison
   - Handles special characters, whitespace, and numeric suffixes

2. **`fortis-mobile-app/src/utils/__tests__/nameUtils.test.ts`** (NEW)
   - 19 unit tests covering all edge cases

### Files Modified

1. **`fortis-mobile-app/src/store/programsStore.ts`**
   - Added import for `generateUniqueName`
   - Updated `createWorkoutTemplate()` to generate unique names for templates
   - Updated `createProgram()` to generate unique names for programs

### Behavior

| Scenario | Input | Existing | Output |
|----------|-------|----------|--------|
| No duplicate | "KB Pull" | [] | "KB Pull" |
| One duplicate | "KB Pull" | ["KB Pull"] | "KB Pull 2" |
| Multiple duplicates | "KB Pull" | ["KB Pull", "KB Pull 2"] | "KB Pull 3" |
| Case-insensitive | "KB Pull" | ["kb pull"] | "KB Pull 2" |
| Gaps in numbering | "KB Pull" | ["KB Pull", "KB Pull 5"] | "KB Pull 6" |

### Notes

- Templates and programs are checked separately (templates only checked against templates, programs against programs)
- The original name is preserved if it's unique
- Special characters like parentheses and colons work correctly
