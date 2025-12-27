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
