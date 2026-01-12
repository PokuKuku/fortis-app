import { useMemo } from 'react';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import { WorkoutSet } from '@/src/types/workout';

export interface ExerciseHistoryEntry {
  sessionId: string;
  sessionName: string;
  date: Date;
  sets: WorkoutSet[];
  totalVolume: number;
  maxWeight: number;
  totalReps: number;
  completedSets: number;
}

export function useExerciseHistory(exerciseId: string | undefined) {
  const { sessions, isLoading } = useWorkoutHistorySource();

  const history = useMemo(() => {
    if (!exerciseId) return [];

    const entries: ExerciseHistoryEntry[] = [];

    for (const session of sessions) {
      // Find the exercise in this session
      const exerciseData = session.exercises.find(
        (ex) => ex.exerciseId === exerciseId
      );

      if (!exerciseData) continue;

      // Only count completed sets
      const completedSets = exerciseData.sets.filter((s) => s.isCompleted);
      if (completedSets.length === 0) continue;

      // Calculate stats
      let totalVolume = 0;
      let maxWeight = 0;
      let totalReps = 0;

      for (const set of completedSets) {
        const weight = set.weight || 0;
        const reps = set.reps || 0;

        totalVolume += weight * reps;
        totalReps += reps;
        if (weight > maxWeight) {
          maxWeight = weight;
        }
      }

      entries.push({
        sessionId: session.localId,
        sessionName: session.name,
        date: new Date(session.completedAt || session.startedAt),
        sets: completedSets,
        totalVolume,
        maxWeight,
        totalReps,
        completedSets: completedSets.length,
      });
    }

    // Sort by date descending (newest first)
    entries.sort((a, b) => b.date.getTime() - a.date.getTime());

    return entries;
  }, [exerciseId, sessions]);

  return {
    history,
    loading: isLoading,
  };
}
