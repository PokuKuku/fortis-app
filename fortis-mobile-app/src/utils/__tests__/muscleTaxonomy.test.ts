import { attributeSessionToMuscles, bucketIntensity } from '@/src/utils/muscleTaxonomy';
import type { Exercise } from '@/src/types/exercise';
import type { WorkoutSession } from '@/src/types/workout';

describe('muscleTaxonomy attribution', () => {
  it('attributes volume to muscles and buckets intensity levels', () => {
    const benchPress: Exercise = {
      id: 'ex-bench',
      name: 'Bench Press',
      primaryMuscles: ['chest'],
      secondaryMuscles: ['triceps'],
      equipment: 'barbell',
      category: 'strength',
      instructions: [],
      images: [],
    };

    const pullUp: Exercise = {
      id: 'ex-pullup',
      name: 'Pull-Up',
      primaryMuscles: ['lats'],
      secondaryMuscles: [],
      equipment: 'bodyweight',
      category: 'strength',
      instructions: [],
      images: [],
    };

    const session: WorkoutSession = {
      localId: 'session-1',
      name: 'Sample Session',
      notes: '',
      startedAt: new Date('2025-01-01T10:00:00Z'),
      completedAt: new Date('2025-01-01T11:00:00Z'),
      exercises: [
        {
          localId: 'we-1',
          exerciseId: benchPress.id,
          exerciseName: benchPress.name,
          notes: '',
          orderIndex: 0,
          sets: [
            {
              localId: 'set-1',
              setNumber: 1,
              setType: 'normal',
              weight: 100,
              weightUnit: 'lbs',
              reps: 8,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: true,
              orderIndex: 0,
            },
            {
              localId: 'set-2',
              setNumber: 2,
              setType: 'normal',
              weight: 100,
              weightUnit: 'lbs',
              reps: 8,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: true,
              orderIndex: 1,
            },
          ],
        },
        {
          localId: 'we-2',
          exerciseId: pullUp.id,
          exerciseName: pullUp.name,
          notes: '',
          orderIndex: 1,
          sets: [
            {
              localId: 'set-3',
              setNumber: 1,
              setType: 'normal',
              weight: null,
              weightUnit: null,
              reps: 6,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: true,
              orderIndex: 0,
            },
          ],
        },
      ],
      isSynced: false,
    };

    const exercisesById = new Map<string, Exercise>([
      [benchPress.id, benchPress],
      [pullUp.id, pullUp],
    ]);

    const scores = attributeSessionToMuscles(session, exercisesById, {
      bodyweightKg: 80,
      weightUnitByExercise: { [benchPress.id]: 'lbs' },
    });

    const levels = bucketIntensity(scores);

    // Regression output for quick inspection when needed.
    // eslint-disable-next-line no-console
    console.log('[muscleTaxonomy] sample scores', scores);
    // eslint-disable-next-line no-console
    console.log('[muscleTaxonomy] sample levels', levels);

    expect(scores.chest).toBeGreaterThan(scores.lats ?? 0);
    expect(scores.lats ?? 0).toBeGreaterThan(scores.triceps ?? 0);
    expect(levels.chest).toBe(5);
    expect(levels.lats).toBe(4);
    expect(levels.triceps).toBe(3);
  });
});
