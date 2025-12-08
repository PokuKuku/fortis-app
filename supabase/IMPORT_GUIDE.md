# Fortis Import Guide

Complete guide for importing workout history from other fitness apps into Fortis.

## Supported Apps

- ✅ **Strong** - CSV export
- ✅ **Hevy** - CSV export
- ✅ **Fitbod** - CSV export
- ✅ **Generic CSV** - Custom format
- 🔄 **Apple Health** - Coming soon
- 🔄 **Google Fit** - Coming soon

## Schema Changes for Import Support

The following fields have been added to support importing:

### workout_sessions table
- `workout_focus` - Category of workout (push/pull/legs/etc.)
- `import_source` - Source app name (e.g., 'strong', 'hevy')
- `import_id` - Original workout ID from source app
- `imported_at` - Timestamp of import

### workout_sets table
- `distance` - Distance for cardio exercises
- `distance_unit` - Unit of measurement (miles/km/meters)
- `completed` - Whether set was actually completed
- `volume` - Auto-calculated (weight × reps)
- `set_type` - Expanded set types (warmup/working/failure/etc.)
- `exercise_variant` - Equipment variant (barbell/dumbbell/machine)

## Import Process Overview

```
1. User uploads CSV file
   ↓
2. Parse and validate CSV format
   ↓
3. Match exercises to Fortis exercise library
   ↓
4. Transform data to Fortis schema
   ↓
5. Create workout sessions and sets
   ↓
6. Mark as imported with source tracking
   ↓
7. Verify import success
```

---

## Strong App Import

### Strong CSV Format

```csv
Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE
2025-11-07 12:36:25,"New Template",36m,"Romanian Deadlift (Barbell)",1,135.0,8.0,0,0.0,"","",
2025-11-07 12:36:25,"New Template",36m,"Romanian Deadlift (Barbell)",Rest Timer,0,0.0,0,120.0,,,
```

### Field Mapping

| Strong Field | Fortis Field | Transformation |
|-------------|-------------|----------------|
| Date | workout_sessions.started_at | Parse timestamp |
| Workout Name | workout_sessions.name | Direct |
| Duration | workout_sessions.duration_seconds | Parse duration (e.g., "36m" → 2160) |
| Exercise Name | Find matching exercise_id | Extract exercise name and equipment |
| Set Order | workout_sets.set_number | Map: 1,2,3 → numbers, W → warmup, F → failure |
| Weight | workout_sets.weight | Direct (convert to user's unit) |
| Reps | workout_sets.reps | Direct |
| Distance | workout_sets.distance | Direct (if > 0) |
| Seconds | workout_sets.rest_seconds | Use "Rest Timer" rows |
| Notes | workout_sets.notes | Direct |
| Workout Notes | workout_sessions.notes | Direct |
| RPE | workout_sets.rpe | Direct (if present) |

### Transformation Logic

```typescript
interface StrongRow {
  Date: string
  'Workout Name': string
  Duration: string
  'Exercise Name': string
  'Set Order': string | number
  Weight: number
  Reps: number
  Distance: number
  Seconds: number
  Notes: string
  'Workout Notes': string
  RPE: number | null
}

function parseStrongCSV(rows: StrongRow[]): ImportData {
  const sessions = new Map<string, WorkoutSession>()

  for (const row of rows) {
    // Skip rest timer rows (we'll handle rest separately)
    if (row['Set Order'] === 'Rest Timer') {
      continue
    }

    // Create session key (date + workout name)
    const sessionKey = `${row.Date}_${row['Workout Name']}`

    // Get or create session
    if (!sessions.has(sessionKey)) {
      sessions.set(sessionKey, {
        name: row['Workout Name'],
        started_at: new Date(row.Date),
        duration_seconds: parseDuration(row.Duration),
        notes: row['Workout Notes'],
        import_source: 'strong',
        import_id: sessionKey,
        sets: []
      })
    }

    const session = sessions.get(sessionKey)!

    // Parse exercise name and equipment
    const { exerciseName, equipment } = parseExerciseName(row['Exercise Name'])

    // Find matching exercise in Fortis library
    const exerciseId = await findExerciseId(exerciseName, equipment)

    // Determine set type
    const setType = determineSetType(row['Set Order'])

    // Create set
    session.sets.push({
      exercise_id: exerciseId,
      exercise_variant: equipment,
      set_number: parseSetNumber(row['Set Order']),
      set_type: setType,
      weight: row.Weight,
      reps: row.Reps,
      distance: row.Distance > 0 ? row.Distance : null,
      rpe: row.RPE || null,
      notes: row.Notes,
      completed: true,
      order_index: session.sets.length
    })
  }

  return Array.from(sessions.values())
}

// Helper: Parse duration string like "36m" or "1h 23m"
function parseDuration(duration: string): number {
  const hourMatch = duration.match(/(\d+)h/)
  const minMatch = duration.match(/(\d+)m/)
  const secMatch = duration.match(/(\d+)s/)

  const hours = hourMatch ? parseInt(hourMatch[1]) : 0
  const minutes = minMatch ? parseInt(minMatch[1]) : 0
  const seconds = secMatch ? parseInt(secMatch[1]) : 0

  return hours * 3600 + minutes * 60 + seconds
}

// Helper: Extract exercise name and equipment
function parseExerciseName(fullName: string): { exerciseName: string, equipment: string | null } {
  // Strong format: "Exercise Name (Equipment)"
  const match = fullName.match(/^(.+?)\s*\((.+?)\)$/)

  if (match) {
    return {
      exerciseName: match[1].trim(),
      equipment: match[2].trim().toLowerCase()
    }
  }

  return {
    exerciseName: fullName.trim(),
    equipment: null
  }
}

// Helper: Determine set type from set order
function determineSetType(setOrder: string | number): string {
  if (setOrder === 'W') return 'warmup'
  if (setOrder === 'F') return 'failure'
  return 'normal'
}

// Helper: Parse set number
function parseSetNumber(setOrder: string | number): number {
  if (typeof setOrder === 'number') return setOrder
  if (setOrder === 'W' || setOrder === 'F') return 1
  return parseInt(setOrder) || 1
}

// Helper: Find exercise in Fortis database
async function findExerciseId(exerciseName: string, equipment: string | null): Promise<string> {
  // Try exact match first
  let { data } = await supabase
    .from('exercises')
    .select('id')
    .ilike('name', exerciseName)
    .maybeSingle()

  if (data) return data.id

  // Try fuzzy match
  const { data: fuzzyMatches } = await supabase
    .from('exercises')
    .select('id, name')
    .textSearch('name', exerciseName.split(' ').join(' & '))
    .limit(5)

  if (fuzzyMatches && fuzzyMatches.length > 0) {
    // Return best match or prompt user to select
    return fuzzyMatches[0].id
  }

  // Create custom exercise if no match found
  const { data: newExercise } = await supabase
    .from('exercises')
    .insert({
      name: exerciseName,
      slug: exerciseName.toLowerCase().replace(/\s+/g, '-'),
      equipment: equipment,
      level: 'intermediate',
      primary_muscles: ['unknown'],
      secondary_muscles: [],
      instructions: ['Imported from Strong app'],
      category: 'strength',
      is_custom: true,
      created_by: userId
    })
    .select('id')
    .single()

  return newExercise.id
}
```

---

## Hevy / Generic CSV Import

### Generic Format

```csv
workoutId,workoutName,workoutFocus,date,startTime,exercise,setNumber,weight,reps,rpe,volume,completed
session-123,Upper Day,Upper Body,2025-11-09,2025-11-09T19:23:50Z,Bench Press,1,135,8,7,1080,true
```

### Field Mapping

| Generic Field | Fortis Field | Transformation |
|--------------|-------------|----------------|
| workoutId | workout_sessions.import_id | Direct |
| workoutName | workout_sessions.name | Direct |
| workoutFocus | workout_sessions.workout_focus | Map to enum |
| date | workout_sessions.started_at | Parse date |
| startTime | workout_sessions.started_at | Parse timestamp |
| exercise | Find matching exercise_id | Fuzzy match |
| setNumber | workout_sets.set_number | Direct |
| weight | workout_sets.weight | Direct |
| reps | workout_sets.reps | Direct |
| rpe | workout_sets.rpe | Direct |
| volume | workout_sets.volume | Auto-calculated |
| completed | workout_sets.completed | Direct |

### Transformation Logic

```typescript
interface GenericRow {
  workoutId: string
  workoutName: string
  workoutFocus: string
  date: string
  startTime: string
  exercise: string
  setNumber: number
  weight: number
  reps: number
  rpe: number
  volume: number
  completed: boolean
}

function parseGenericCSV(rows: GenericRow[]): ImportData {
  const sessions = new Map<string, WorkoutSession>()

  for (const row of rows) {
    const sessionKey = row.workoutId

    if (!sessions.has(sessionKey)) {
      sessions.set(sessionKey, {
        name: row.workoutName,
        workout_focus: mapWorkoutFocus(row.workoutFocus),
        started_at: new Date(row.startTime),
        import_source: 'hevy', // or detect from format
        import_id: row.workoutId,
        sets: []
      })
    }

    const session = sessions.get(sessionKey)!
    const exerciseId = await findExerciseId(row.exercise, null)

    session.sets.push({
      exercise_id: exerciseId,
      set_number: row.setNumber,
      set_type: 'normal',
      weight: row.weight,
      reps: row.reps,
      rpe: row.rpe,
      completed: row.completed,
      order_index: session.sets.length
    })
  }

  return Array.from(sessions.values())
}

function mapWorkoutFocus(focus: string): string {
  const mapping: Record<string, string> = {
    'Full Body': 'full_body',
    'Upper Body': 'upper_body',
    'Lower Body': 'lower_body',
    'Push': 'push',
    'Pull': 'pull',
    'Legs': 'legs',
    'Chest': 'chest',
    'Back': 'back',
    'Shoulders': 'shoulders',
    'Arms': 'arms',
    'Core': 'core',
    'Cardio': 'cardio'
  }

  return mapping[focus] || 'other'
}
```

---

## Database Import Function

```sql
-- Function to import workout session from external app
CREATE OR REPLACE FUNCTION import_workout_session(
  p_user_id UUID,
  p_import_source TEXT,
  p_import_id TEXT,
  p_session_data JSONB,
  p_sets_data JSONB[]
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_set JSONB;
BEGIN
  -- Check if already imported
  SELECT id INTO v_session_id
  FROM workout_sessions
  WHERE user_id = p_user_id
    AND import_source = p_import_source
    AND import_id = p_import_id;

  IF v_session_id IS NOT NULL THEN
    RAISE EXCEPTION 'Workout already imported: %', p_import_id;
  END IF;

  -- Insert session
  INSERT INTO workout_sessions (
    user_id,
    name,
    workout_focus,
    started_at,
    completed_at,
    duration_seconds,
    notes,
    import_source,
    import_id,
    imported_at,
    is_synced
  )
  VALUES (
    p_user_id,
    p_session_data->>'name',
    p_session_data->>'workout_focus',
    (p_session_data->>'started_at')::TIMESTAMPTZ,
    (p_session_data->>'completed_at')::TIMESTAMPTZ,
    (p_session_data->>'duration_seconds')::INTEGER,
    p_session_data->>'notes',
    p_import_source,
    p_import_id,
    NOW(),
    TRUE
  )
  RETURNING id INTO v_session_id;

  -- Insert sets
  FOREACH v_set IN ARRAY p_sets_data
  LOOP
    INSERT INTO workout_sets (
      session_id,
      exercise_id,
      exercise_variant,
      set_number,
      set_type,
      weight,
      reps,
      distance,
      distance_unit,
      rpe,
      rest_seconds,
      notes,
      completed,
      order_index
    )
    VALUES (
      v_session_id,
      (v_set->>'exercise_id')::UUID,
      v_set->>'exercise_variant',
      (v_set->>'set_number')::INTEGER,
      v_set->>'set_type',
      (v_set->>'weight')::DECIMAL,
      (v_set->>'reps')::INTEGER,
      (v_set->>'distance')::DECIMAL,
      v_set->>'distance_unit',
      (v_set->>'rpe')::DECIMAL,
      (v_set->>'rest_seconds')::INTEGER,
      v_set->>'notes',
      (v_set->>'completed')::BOOLEAN,
      (v_set->>'order_index')::INTEGER
    );
  END LOOP;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Import API Endpoint (Next.js Example)

```typescript
// app/api/import/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse form data
  const formData = await request.formData()
  const file = formData.get('file') as File
  const source = formData.get('source') as string // 'strong', 'hevy', etc.

  if (!file || !source) {
    return Response.json({ error: 'Missing file or source' }, { status: 400 })
  }

  // Read CSV content
  const text = await file.text()
  const rows = parseCSV(text)

  // Transform based on source
  let sessions: ImportData
  if (source === 'strong') {
    sessions = parseStrongCSV(rows)
  } else if (source === 'hevy') {
    sessions = parseGenericCSV(rows)
  } else {
    return Response.json({ error: 'Unsupported source' }, { status: 400 })
  }

  // Import sessions
  const results = []
  for (const session of sessions) {
    try {
      const { data, error } = await supabase.rpc('import_workout_session', {
        p_user_id: user.id,
        p_import_source: source,
        p_import_id: session.import_id,
        p_session_data: session,
        p_sets_data: session.sets
      })

      if (error) {
        // Skip if already imported
        if (error.message.includes('already imported')) {
          results.push({ id: session.import_id, status: 'skipped' })
        } else {
          results.push({ id: session.import_id, status: 'error', error: error.message })
        }
      } else {
        results.push({ id: data, status: 'success' })
      }
    } catch (err) {
      results.push({ id: session.import_id, status: 'error', error: String(err) })
    }
  }

  // Refresh materialized view
  await supabase.rpc('refresh_volume_stats')

  return Response.json({
    total: sessions.length,
    imported: results.filter(r => r.status === 'success').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    errors: results.filter(r => r.status === 'error').length,
    results
  })
}
```

---

## Exercise Matching Strategy

When importing, exercises need to be matched to the Fortis exercise library:

### 1. Exact Match
```sql
SELECT id FROM exercises
WHERE LOWER(name) = LOWER($1)
LIMIT 1;
```

### 2. Fuzzy Match (PostgreSQL Full-Text Search)
```sql
SELECT id, name, ts_rank(to_tsvector('english', name), query) as rank
FROM exercises, plainto_tsquery('english', $1) query
WHERE to_tsvector('english', name) @@ query
ORDER BY rank DESC
LIMIT 5;
```

### 3. Similarity Match (Using pg_trgm extension)
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

SELECT id, name, similarity(name, $1) as sim
FROM exercises
WHERE similarity(name, $1) > 0.3
ORDER BY sim DESC
LIMIT 5;
```

### 4. Create Custom Exercise
If no match found, create a new custom exercise:
```sql
INSERT INTO exercises (
  name, slug, level, primary_muscles, secondary_muscles,
  instructions, category, is_custom, created_by
)
VALUES (
  $1, -- name
  regexp_replace(lower($1), '[^a-z0-9]+', '-', 'g'), -- slug
  'intermediate',
  ARRAY['unknown'],
  ARRAY[]::TEXT[],
  ARRAY['Imported exercise - please add details'],
  'strength',
  TRUE,
  $2 -- user_id
)
RETURNING id;
```

---

## Import Validation Rules

Before importing, validate:

1. **Required Fields**
   - ✅ Date/timestamp
   - ✅ Exercise name
   - ✅ At least one of: weight, reps, distance

2. **Data Types**
   - ✅ Weight must be numeric and > 0
   - ✅ Reps must be integer and > 0
   - ✅ RPE must be between 1 and 10
   - ✅ Distance must be numeric and > 0

3. **Duplicates**
   - ✅ Check `(user_id, import_source, import_id)` uniqueness
   - ✅ Prevent re-importing same workouts

4. **Exercise Matching**
   - ⚠️ Warn if exercise requires manual mapping
   - ⚠️ Flag custom exercises for review

---

## Import UI Flow

### Step 1: Upload File
```tsx
<input
  type="file"
  accept=".csv"
  onChange={handleFileSelect}
/>
<select onChange={e => setSource(e.target.value)}>
  <option value="strong">Strong App</option>
  <option value="hevy">Hevy App</option>
  <option value="fitbod">Fitbod</option>
  <option value="generic">Generic CSV</option>
</select>
```

### Step 2: Preview Import
```tsx
<ImportPreview
  sessions={parsedSessions}
  unmatchedExercises={unmatchedExercises}
  onMapExercise={(original, fortisId) => mapExercise(original, fortisId)}
/>
```

### Step 3: Confirm and Import
```tsx
<ImportSummary
  totalSessions={sessions.length}
  totalSets={sets.length}
  dateRange={`${minDate} to ${maxDate}`}
  onConfirm={handleImport}
/>
```

### Step 4: Import Progress
```tsx
<ImportProgress
  total={sessions.length}
  imported={importedCount}
  errors={errorCount}
/>
```

---

## Testing Import

```typescript
// Test Strong import
const strongCSV = `Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE
2025-11-07 12:36:25,"Leg Day",36m,"Romanian Deadlift (Barbell)",1,135.0,8.0,0,0.0,"","Good workout",7
2025-11-07 12:36:25,"Leg Day",36m,"Romanian Deadlift (Barbell)",2,135.0,8.0,0,0.0,"","",7`

const result = await importFromStrong(user.id, strongCSV)
expect(result.imported).toBe(1)
expect(result.errors).toBe(0)
```

---

## Performance Considerations

- Import in batches of 100 sessions
- Use database transactions
- Show progress bar for large imports
- Queue imports for very large files (background job)
- Refresh materialized views after import

---

## Export Format (Fortis → Other Apps)

Users can export their Fortis data in compatible formats:

### Fortis CSV Export
```csv
Date,Workout Name,Focus,Exercise,Set Type,Set Number,Weight,Reps,RPE,Distance,Distance Unit,Volume,Notes,Duration
2025-11-10 15:22:50,Upper 1,Upper Body,Incline Bench Press (Dumbbell),warmup,1,45,10,6,,,450,,48m
```

This format can be imported back into Fortis or adapted for other apps.

---

**Last Updated**: 2025-12-04
**Version**: 1.0.0
