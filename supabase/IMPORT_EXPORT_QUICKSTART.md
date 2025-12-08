# Import/Export Quick Reference

Fast reference guide for importing and exporting workout data in Fortis.

## Quick Import (Strong App)

### 1. Export from Strong
1. Open Strong app
2. Go to Settings → Export Data
3. Choose "CSV" format
4. Save `strong_workouts.csv`

### 2. Import to Fortis
```typescript
// In your Fortis mobile app or web app
const handleImport = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('source', 'strong')

  const response = await fetch('/api/import', {
    method: 'POST',
    body: formData
  })

  const result = await response.json()
  console.log(`Imported ${result.imported} workouts`)
}
```

## Quick Import (Hevy App)

### 1. Export from Hevy
1. Open Hevy app
2. Go to Profile → Settings → Export Data
3. Choose CSV format
4. Save the file

### 2. Import to Fortis
```typescript
const handleImport = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('source', 'hevy')

  const response = await fetch('/api/import', {
    method: 'POST',
    body: formData
  })
}
```

## Quick Export (Fortis)

### Export All Workouts
```typescript
const exportWorkouts = async () => {
  const { data } = await supabase
    .from('workout_export_view')
    .select('*')
    .csv()

  // Download as CSV
  const blob = new Blob([data], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fortis-export-${new Date().toISOString()}.csv`
  a.click()
}
```

### Export Specific Date Range
```typescript
const exportDateRange = async (startDate: Date, endDate: Date) => {
  const { data } = await supabase
    .from('workout_export_view')
    .select('*')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .csv()

  // Download...
}
```

## Data Format Examples

### Strong CSV Row
```csv
Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE
2025-11-07 12:36:25,"Leg Day",36m,"Romanian Deadlift (Barbell)",1,135.0,8.0,0,0.0,"","",7
```

### Fortis Export Row
```csv
Date,Workout Name,Focus,Exercise,Set Type,Set Number,Weight,Reps,RPE,Distance,Distance Unit,Volume,Notes
2025-11-10 15:22:50,Upper 1,upper_body,Incline Bench Press,normal,1,65,6,7,,,390,
```

## Import Checklist

Before importing:
- [ ] Export data from source app
- [ ] Verify CSV format is correct
- [ ] Back up existing Fortis data (optional)
- [ ] Check for duplicate imports
- [ ] Review unmapped exercises

## Common Issues

### Issue: Duplicate Workouts
**Solution**: The import will skip workouts that were already imported from the same source

### Issue: Exercise Not Found
**Solution**: The import will create a custom exercise. Review and update details later.

### Issue: Different Weight Units
**Solution**: Convert weights before import or specify unit preference in user profile

### Issue: Large Import Taking Too Long
**Solution**: Split CSV into smaller files (e.g., 100 workouts per file)

## Field Mapping Reference

| Strong | Hevy | Fortis |
|--------|------|--------|
| Date | startTime | started_at |
| Workout Name | workoutName | name |
| - | workoutFocus | workout_focus |
| Exercise Name | exercise | exercise_id (lookup) |
| Set Order | setNumber | set_number |
| W/F/number | - | set_type |
| Weight | weight | weight |
| Reps | reps | reps |
| RPE | rpe | rpe |
| Seconds | - | rest_seconds |
| Distance | - | distance |
| Notes | - | notes |

## Database Functions

### Import Single Workout
```sql
SELECT import_workout_session(
  p_user_id := 'user-uuid',
  p_import_source := 'strong',
  p_import_id := 'unique-workout-id',
  p_session_data := '{"name": "Leg Day", ...}'::jsonb,
  p_sets_data := '[{"exercise_id": "...", ...}]'::jsonb[]
);
```

### Check Import Status
```sql
SELECT
  import_source,
  COUNT(*) as workout_count,
  MIN(started_at) as first_workout,
  MAX(started_at) as last_workout
FROM workout_sessions
WHERE user_id = 'user-uuid'
  AND import_source IS NOT NULL
GROUP BY import_source;
```

### Find Unmatched Exercises
```sql
SELECT DISTINCT exercise_variant
FROM workout_sets
WHERE exercise_id IN (
  SELECT id FROM exercises WHERE is_custom = TRUE
)
ORDER BY exercise_variant;
```

## API Routes (Next.js Example)

### Import Endpoint
```typescript
// app/api/import/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const source = formData.get('source') as string

  // Parse and import...
  return Response.json({ imported, skipped, errors })
}
```

### Export Endpoint
```typescript
// app/api/export/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'

  const { data } = await supabase
    .from('workout_export_view')
    .select('*')
    .csv()

  return new Response(data, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=fortis-export.csv'
    }
  })
}
```

## Mobile App (React Native Example)

### Import Component
```tsx
import * as DocumentPicker from 'expo-document-picker'

const ImportButton = () => {
  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/csv'
    })

    if (result.type === 'success') {
      const formData = new FormData()
      formData.append('file', {
        uri: result.uri,
        type: 'text/csv',
        name: result.name
      })
      formData.append('source', 'strong')

      await fetch(`${API_URL}/import`, {
        method: 'POST',
        body: formData
      })
    }
  }

  return (
    <Button onPress={handleImport} title="Import from Strong" />
  )
}
```

### Export Component
```tsx
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'

const ExportButton = () => {
  const handleExport = async () => {
    const { data } = await supabase
      .from('workout_export_view')
      .select('*')
      .csv()

    const fileUri = `${FileSystem.documentDirectory}fortis-export.csv`
    await FileSystem.writeAsStringAsync(fileUri, data)
    await Sharing.shareAsync(fileUri)
  }

  return (
    <Button onPress={handleExport} title="Export Workouts" />
  )
}
```

## Performance Tips

1. **Batch Imports**: Process 50-100 workouts at a time
2. **Background Jobs**: For large imports (>500 workouts), use a queue
3. **Progress Tracking**: Show import progress to users
4. **Validation**: Validate CSV before processing
5. **Error Handling**: Gracefully handle partial import failures

## Testing

### Test Strong Import
```typescript
const mockStrongCSV = `Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE
2025-11-07 12:36:25,"Test Workout",30m,"Bench Press (Barbell)",1,135.0,8.0,0,0.0,"","",7`

const result = await importFromStrong(userId, mockStrongCSV)
expect(result.imported).toBe(1)
```

### Test Export
```typescript
const result = await exportWorkouts(userId)
expect(result).toContain('Date,Workout Name')
expect(result.split('\n').length).toBeGreaterThan(1)
```

---

**Quick Links**:
- [Full Import Guide](./IMPORT_GUIDE.md) - Detailed transformation logic
- [Database Schema](./DATABASE_SCHEMA.md) - Table structure
- [Setup Guide](./README.md) - Initial setup instructions
