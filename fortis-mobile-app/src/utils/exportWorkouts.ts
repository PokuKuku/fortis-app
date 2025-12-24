/**
 * CSV Export Utility
 *
 * Exports workout history to CSV format compatible with Strong/Hevy.
 */
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { WorkoutSession } from '@/src/types/workout';

/**
 * Escape CSV field value (handles commas, quotes, newlines)
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV content from workout sessions
 */
export function generateWorkoutCSV(
  sessions: WorkoutSession[],
  weightUnit: 'lbs' | 'kg' = 'lbs'
): string {
  // CSV Header
  const header = [
    'Date',
    'Workout Name',
    'Exercise Name',
    'Set Order',
    'Set Type',
    'Weight',
    'Weight Unit',
    'Reps',
    'RPE',
    'Rest (seconds)',
    'Notes',
  ].join(',');

  const rows: string[] = [header];

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(a.startedAt).getTime();
    const dateB = new Date(b.startedAt).getTime();
    return dateB - dateA;
  });

  for (const session of sortedSessions) {
    const workoutDate = format(new Date(session.startedAt), 'yyyy-MM-dd');
    const workoutName = session.name || 'Workout';

    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        const row = [
          escapeCSV(workoutDate),
          escapeCSV(workoutName),
          escapeCSV(exercise.exerciseName),
          escapeCSV(set.setNumber),
          escapeCSV(set.setType),
          escapeCSV(set.weight),
          escapeCSV(weightUnit),
          escapeCSV(set.reps),
          escapeCSV(set.rpe),
          escapeCSV(set.restSeconds),
          escapeCSV(set.notes),
        ].join(',');

        rows.push(row);
      }
    }
  }

  return rows.join('\n');
}

/**
 * Export workout history to CSV file and share
 */
export async function exportWorkoutsToCSV(
  sessions: WorkoutSession[],
  weightUnit: 'lbs' | 'kg' = 'lbs'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (sessions.length === 0) {
      return { success: false, error: 'No workouts to export' };
    }

    // Generate CSV content
    const csvContent = generateWorkoutCSV(sessions, weightUnit);

    // Generate filename with current date
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `fortis-workouts-${dateStr}.csv`;
    const filePath = `${FileSystem.documentDirectory}${filename}`;

    // Write file
    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return { success: false, error: 'Sharing is not available on this device' };
    }

    // Share the file
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Workout History',
      UTI: 'public.comma-separated-values-text',
    });

    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export workouts',
    };
  }
}
