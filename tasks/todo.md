# Custom Exercises Implementation

## Todo
- [x] Investigate current custom exercise implementation
- [x] Check exercise types and data models
- [x] Review exerciseService.ts for custom exercise handling
- [x] Verify database schema and RLS policies
- [x] Check CustomExerciseModal and UI layer
- [x] Identify gaps and prepare recommendations
- [x] Modify saveCustomExercise() to sync to Supabase
- [x] Modify getCustomExercises() to fetch and merge from Supabase
- [x] Modify deleteCustomExercise() to sync deletion to Supabase
- [x] Verify TypeScript compiles correctly
- [x] Add delete UI to exercise detail page

## Changes Made

### Summary
Wired up the existing (but unused) Supabase sync functions to make custom exercises properly user-scoped and persisted to the database.

### Files Modified
- `fortis-mobile-app/src/services/exerciseService.ts`
- `fortis-mobile-app/app/exercise/[id].tsx`

### Implementation Details

**1. saveCustomExercise() (line 648-676)**
- Added call to `upsertCustomExerciseToSupabase()` after saving to local storage
- Fire-and-forget pattern: local save completes immediately, Supabase sync happens in background
- If Supabase sync fails, logs warning but doesn't block the user

**2. getCustomExercises() (line 601-646)**
- Now fetches from both local storage AND Supabase
- Merge strategy: local exercises take priority (offline-first)
- Remote-only exercises are added to local list (cross-device sync)
- Uses both ID and slug matching to handle ID mismatches
- Merged results are persisted to local storage

**3. deleteCustomExercise() (line 678-710)**
- Added Supabase delete in background after local delete
- Deletes by both ID and slug (handles ID mismatch between devices)
- Fire-and-forget pattern: local delete completes immediately

**4. Delete UI in exercise detail page (app/exercise/[id].tsx)**
- Added `showDeleteConfirm` state for confirmation modal
- Added `handleDeleteCustomExercise()` handler that:
  - Calls `deleteCustomExercise(exercise.id)` from exerciseService
  - Emits `customExerciseUpsert` event with `deleted: true` to notify other components
  - Provides haptic feedback (success/error)
  - Navigates back after deletion
- Added conditional delete button in header (trash icon, only for custom exercises)
- Added confirmation modal using `BaseModal` with Cancel/Delete actions

### Sync Flow

```
Create/Edit Exercise:
  User creates exercise
    → Save to AsyncStorage (sync, fast)
    → Upsert to Supabase (async, background)
    → RLS ensures created_by = current user

Load Exercises:
  App loads exercises
    → Check cache (instant if cached)
    → Load from AsyncStorage
    → Fetch from Supabase
    → Merge (local priority, add remote-only)
    → Persist merged list
    → User sees all their exercises from any device

Delete Exercise:
  User deletes exercise
    → Remove from AsyncStorage (sync, fast)
    → Delete from Supabase (async, background)
```

### Database Schema (Already Configured)
- `is_custom` column marks custom exercises
- `created_by` column stores user ID (FK to profiles)
- RLS policies restrict access to owner only
- Per-user unique indexes on (created_by, name) and (created_by, slug)

## Review

The implementation:
1. Maintains offline-first behavior (local operations are fast and work offline)
2. Syncs to Supabase in background (cross-device sync)
3. Uses existing, well-configured RLS policies for user scoping
4. Handles ID mismatches between devices via slug-based matching
5. No breaking changes to existing functionality
6. Users can now delete custom exercises from the exercise detail page
7. Delete button only appears for custom exercises (not standard library exercises)
8. Confirmation modal prevents accidental deletions
