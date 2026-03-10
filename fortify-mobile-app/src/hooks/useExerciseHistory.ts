import { useMemo } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useExerciseLookup } from '@/src/hooks/useExerciseLookup';
import { useLatestBodyweight } from '@/src/hooks/useLatestBodyweight';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import { WorkoutSet } from '@/src/types/workout';
import { getSetVolume, type VolumeContext } from '@/src/utils/workoutVolume';

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
  const { sessions, isLoading } = useWorkoutHistorySource({ enabled: Boolean(exerciseId) });
  const { profile } = useAuth();
  const { exercisesById } = useExerciseLookup();
  const { bodyweightKg } = useLatestBodyweight();
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const preferredUnits = profile?.preferred_units ?? 'imperial';

  const history = useMemo(() => {
    if (!exerciseId) return [];

    const entries: ExerciseHistoryEntry[] = [];
    const volumeContext: VolumeContext = {
      preferredUnits,
      weightUnits,
      exercisesById,
      bodyweightKg,
      profileWeightKg: profile?.weight_kg ?? null,
    };

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
      const exerciseMeta = exercisesById?.get(exerciseId);
      const fallbackUnit = weightUnits?.[exerciseId];

      for (const set of completedSets) {
        const weight = set.weight || 0;
        const reps = set.reps || 0;

        totalVolume += getSetVolume(set, volumeContext, {
          exerciseMeta,
          fallbackUnit,
          exerciseName: exerciseData.exerciseName,
        });
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
  }, [
    exerciseId,
    sessions,
    preferredUnits,
    weightUnits,
    exercisesById,
    bodyweightKg,
    profile?.weight_kg,
  ]);

  return {
    history,
    loading: isLoading,
  };
}
