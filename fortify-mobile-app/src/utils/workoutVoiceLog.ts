import type {
  SetType,
  WeightUnit,
  WorkoutExercise,
  WorkoutSet,
} from '@/src/types/workout';
import type {
  WorkoutVoiceInterpretation,
  WorkoutVoiceMissingField,
} from '@/src/types/workoutVoice';

type PlannedVoiceTargetSet = {
  sourceSetIndex: number | null;
  sourceSet: WorkoutSet | null;
  weight: number | null;
  reps: number | null;
  weightUnit: WeightUnit | null;
  setType: SetType;
};

type UniformResolvedValue<T> = {
  isUniform: boolean;
  value: T | null;
};

export interface WorkoutVoiceLogPlan {
  targetSetCount: number | null;
  targetSets: PlannedVoiceTargetSet[];
  canApply: boolean;
  unresolvedFields: WorkoutVoiceMissingField[];
  inferredFields: {
    sets: boolean;
    weightFromExisting: boolean;
    repsFromExisting: boolean;
  };
  uniformWeight: UniformResolvedValue<number>;
  uniformReps: UniformResolvedValue<number>;
  uniformWeightUnit: UniformResolvedValue<WeightUnit>;
}

const toPositiveInt = (value: number | null | undefined): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded > 0 ? rounded : null;
};

function getTargetSources(
  exercise: WorkoutExercise,
  count: number,
): Array<{ sourceSetIndex: number | null; sourceSet: WorkoutSet | null }> {
  const incompleteIndices = exercise.sets.reduce<number[]>((indices, set, index) => {
    if (!set.isCompleted) {
      indices.push(index);
    }
    return indices;
  }, []);

  return Array.from({ length: count }, (_, offset) => {
    const sourceSetIndex = incompleteIndices[offset];
    return {
      sourceSetIndex: sourceSetIndex ?? null,
      sourceSet: sourceSetIndex !== undefined ? exercise.sets[sourceSetIndex] ?? null : null,
    };
  });
}

function getUniformResolvedValue<T>(
  values: Array<T | null>,
): UniformResolvedValue<T> {
  const firstNonNull = values.find((value) => value !== null) ?? null;
  if (firstNonNull === null) {
    return {
      isUniform: false,
      value: null,
    };
  }

  const isUniform = values.every((value) => value === null || value === firstNonNull);
  return {
    isUniform,
    value: isUniform ? firstNonNull : null,
  };
}

function buildTargetPlan(
  exercise: WorkoutExercise,
  interpretation: WorkoutVoiceInterpretation,
  fallbackWeightUnit: WeightUnit,
  targetSetCount: number,
): WorkoutVoiceLogPlan {
  const targetSources = getTargetSources(exercise, targetSetCount);
  const targetSets: PlannedVoiceTargetSet[] = [];
  let previousResolvedWeight: number | null = null;
  let previousResolvedReps: number | null = null;
  let previousResolvedWeightUnit: WeightUnit | null = null;
  let inferredWeightFromExisting = false;
  let inferredRepsFromExisting = false;

  targetSources.forEach(({ sourceSetIndex, sourceSet }) => {
    const resolvedWeight = interpretation.weight ?? sourceSet?.weight ?? previousResolvedWeight ?? null;
    const resolvedReps = interpretation.reps ?? sourceSet?.reps ?? previousResolvedReps ?? null;
    const resolvedWeightUnit = resolvedWeight !== null
      ? (
          interpretation.weight !== null
            ? (interpretation.weightUnit ?? fallbackWeightUnit)
            : (sourceSet?.weightUnit ?? previousResolvedWeightUnit ?? fallbackWeightUnit)
        )
      : null;

    if (interpretation.weight === null && sourceSet?.weight == null && previousResolvedWeight !== null) {
      inferredWeightFromExisting = true;
    } else if (interpretation.weight === null && sourceSet?.weight != null) {
      inferredWeightFromExisting = true;
    }

    if (interpretation.reps === null && sourceSet?.reps == null && previousResolvedReps !== null) {
      inferredRepsFromExisting = true;
    } else if (interpretation.reps === null && sourceSet?.reps != null) {
      inferredRepsFromExisting = true;
    }

    targetSets.push({
      sourceSetIndex,
      sourceSet,
      weight: resolvedWeight,
      reps: resolvedReps,
      weightUnit: resolvedWeightUnit,
      setType: interpretation.setType,
    });

    if (resolvedWeight !== null) {
      previousResolvedWeight = resolvedWeight;
      previousResolvedWeightUnit = resolvedWeightUnit;
    }
    if (resolvedReps !== null) {
      previousResolvedReps = resolvedReps;
    }
  });

  const unresolvedFields: WorkoutVoiceMissingField[] = [];
  if (targetSets.some((targetSet) => targetSet.weight === null)) {
    unresolvedFields.push('weight');
  }
  if (targetSets.some((targetSet) => targetSet.reps === null)) {
    unresolvedFields.push('reps');
  }

  return {
    targetSetCount,
    targetSets,
    canApply: unresolvedFields.length === 0,
    unresolvedFields,
    inferredFields: {
      sets: false,
      weightFromExisting: inferredWeightFromExisting,
      repsFromExisting: inferredRepsFromExisting,
    },
    uniformWeight: getUniformResolvedValue(targetSets.map((targetSet) => targetSet.weight)),
    uniformReps: getUniformResolvedValue(targetSets.map((targetSet) => targetSet.reps)),
    uniformWeightUnit: getUniformResolvedValue(targetSets.map((targetSet) => targetSet.weightUnit)),
  };
}

export function createWorkoutVoiceLogPlan(
  exercise: WorkoutExercise,
  interpretation: WorkoutVoiceInterpretation,
  fallbackWeightUnit: WeightUnit,
): WorkoutVoiceLogPlan {
  const explicitTargetSetCount = toPositiveInt(interpretation.sets);
  if (explicitTargetSetCount !== null) {
    return buildTargetPlan(exercise, interpretation, fallbackWeightUnit, explicitTargetSetCount);
  }

  const singleSetPlan = buildTargetPlan(exercise, interpretation, fallbackWeightUnit, 1);
  if (singleSetPlan.canApply) {
    return {
      ...singleSetPlan,
      inferredFields: {
        ...singleSetPlan.inferredFields,
        sets: true,
      },
    };
  }

  return {
    ...singleSetPlan,
    targetSetCount: null,
    canApply: false,
    unresolvedFields: Array.from(new Set<WorkoutVoiceMissingField>([
      'sets',
      ...singleSetPlan.unresolvedFields,
    ])),
  };
}
