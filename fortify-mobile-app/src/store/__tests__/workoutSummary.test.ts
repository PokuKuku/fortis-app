import { getWorkoutSummary } from '@/src/store/workoutStore';
import type { WorkoutExercise, WorkoutSession, WorkoutSet } from '@/src/types/workout';

const buildSet = (overrides: Partial<WorkoutSet> = {}): WorkoutSet => ({
  localId: overrides.localId ?? 'set-id',
  setNumber: overrides.setNumber ?? 1,
  setType: overrides.setType ?? 'normal',
  weight: overrides.weight ?? null,
  weightUnit: overrides.weightUnit ?? 'lbs',
  reps: overrides.reps ?? null,
  rpe: overrides.rpe ?? null,
  restSeconds: overrides.restSeconds ?? null,
  notes: overrides.notes ?? '',
  isCompleted: overrides.isCompleted ?? false,
  orderIndex: overrides.orderIndex ?? 0,
});

const buildExercise = (
  index: number,
  sets: WorkoutSet[],
): WorkoutExercise => ({
  localId: `exercise-${index}`,
  exerciseId: `exercise-id-${index}`,
  exerciseName: `Exercise ${index}`,
  sets,
  notes: '',
  orderIndex: index,
});

const buildSession = (exercises: WorkoutExercise[]): WorkoutSession => ({
  localId: 'session-id',
  name: 'Upper (sample)',
  notes: '',
  startedAt: new Date('2026-07-02T16:15:00.000Z'),
  completedAt: new Date('2026-07-02T16:15:11.000Z'),
  exercises,
  isSynced: false,
});

describe('getWorkoutSummary', () => {
  it('counts only exercises with completed sets', () => {
    const session = buildSession([
      buildExercise(1, [buildSet({ isCompleted: true, weight: 99, reps: 9 })]),
      ...Array.from({ length: 6 }, (_, index) => (
        buildExercise(index + 2, [buildSet({ localId: `incomplete-set-${index}` })])
      )),
    ]);

    expect(getWorkoutSummary(session)).toMatchObject({
      totalExercises: 1,
      totalSets: 1,
      totalReps: 9,
      totalVolume: 891,
      durationSeconds: 11,
    });
  });
});

