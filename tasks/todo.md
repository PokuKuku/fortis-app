# Custom Exercises Implementation Analysis

## Todo
- [x] Investigate current custom exercise implementation
- [x] Check exercise types and data models
- [x] Review exerciseService.ts for custom exercise handling
- [x] Verify database schema and RLS policies
- [x] Check CustomExerciseModal and UI layer
- [x] Identify gaps and prepare recommendations

## Findings

### ✅ What's Working

**Database Layer (Properly Configured):**
- `exercises` table has `is_custom` and `created_by` columns
- RLS policies correctly scope custom exercises to their owners:
  - SELECT: `is_custom = FALSE OR created_by = auth.uid()`
  - INSERT: `auth.uid() = created_by AND is_custom = true`
  - UPDATE/DELETE: `auth.uid() = created_by AND is_custom = TRUE`
- Per-user unique indexes on `(created_by, name)` and `(created_by, slug)`

**Partial Sync (workoutHistoryService.ts):**
- `syncCustomExercisesToSupabase()` exists and syncs custom exercises to DB
- Called when workouts are saved (lines 380 and 917)
- Uses `onConflict: 'id'` with the local exercise ID

### ❌ Gaps Identified

**1. saveCustomExercise() doesn't sync to database** (`exerciseService.ts:620-642`)
- Only saves to AsyncStorage via `setScopedItem()`
- `upsertCustomExerciseToSupabase()` exists (line 177) but is NEVER called

**2. getCustomExercises() doesn't load from database** (`exerciseService.ts:601-616`)
- Only loads from AsyncStorage via `getScopedItem()`
- `fetchCustomExercisesFromSupabase()` exists (line 148) but is NEVER called

**3. No proactive sync on create/edit**
- Custom exercises only sync to DB when used in a workout that gets synced
- Creating a custom exercise and NOT using it = never synced

**4. Cross-device sync broken**
- Device A creates custom exercise → saved to local AsyncStorage
- Device A uses it in workout → syncs to DB
- Device B logs in → doesn't see the custom exercise (only loads from local storage)

### Code References

| File | Line | Issue |
|------|------|-------|
| `exerciseService.ts` | 620-642 | `saveCustomExercise()` - missing DB upsert |
| `exerciseService.ts` | 601-616 | `getCustomExercises()` - missing DB fetch |
| `exerciseService.ts` | 148-163 | `fetchCustomExercisesFromSupabase()` - UNUSED |
| `exerciseService.ts` | 177-209 | `upsertCustomExerciseToSupabase()` - UNUSED |
| `CustomExerciseModal.tsx` | 166-167 | Uses timestamp ID: `custom-${Date.now()}` |

## Proposed Fix

### Option A: Immediate Sync (Recommended)
1. Modify `saveCustomExercise()` to call `upsertCustomExerciseToSupabase()` after local save
2. Modify `getCustomExercises()` to also fetch from Supabase and merge results
3. Local data takes priority (offline-first), Supabase syncs in background

### Option B: Background Sync
1. Keep current local-first behavior
2. Add sync trigger on app startup/online event
3. Merge local and remote custom exercises

### Implementation Notes
- ID handling: The local ID (`custom-${Date.now()}`) works with `workoutHistoryService` using `onConflict: 'id'`
- Should consider switching to UUID for consistency
- Need to handle merge conflicts (same exercise modified on multiple devices)
