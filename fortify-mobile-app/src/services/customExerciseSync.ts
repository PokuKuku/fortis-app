import { Exercise } from '@/src/types/exercise';
import { getCustomExercises, isCustomExercise, saveCustomExercise } from '@/src/services/exerciseService';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && UUID_REGEX.test(value));
}

function findCustomExercise(customExercises: Exercise[], localId: string): Exercise | undefined {
  return customExercises.find((exercise) => exercise.id === localId || exercise.slug === localId);
}

export async function resolveCustomExerciseRemoteIds(
  exerciseIds: string[]
): Promise<Map<string, string>> {
  const customIds = Array.from(new Set(exerciseIds.filter(isCustomExercise)));
  const remoteIdMap = new Map<string, string>();

  if (customIds.length === 0) {
    return remoteIdMap;
  }

  let customExercises = await getCustomExercises();

  for (const localId of customIds) {
    const exercise = findCustomExercise(customExercises, localId);
    if (!exercise) {
      throw new Error(`Custom exercise not found: ${localId}`);
    }

    if (isUuid(exercise.remoteId)) {
      remoteIdMap.set(localId, exercise.remoteId);
      continue;
    }

    await saveCustomExercise(exercise);
    customExercises = await getCustomExercises();

    const syncedExercise = findCustomExercise(customExercises, localId);
    if (!isUuid(syncedExercise?.remoteId)) {
      throw new Error(`Unable to sync custom exercise: ${exercise.name || localId}`);
    }

    remoteIdMap.set(localId, syncedExercise.remoteId);
  }

  return remoteIdMap;
}
