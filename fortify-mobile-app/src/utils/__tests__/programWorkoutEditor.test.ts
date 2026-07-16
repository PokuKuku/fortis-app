import { resolveProgramEditorSetTypes } from '@/src/utils/programWorkoutEditor';
import type { SetType, WorkoutSet } from '@/src/types/workout';

const buildHistorySet = (orderIndex: number, setType: SetType): WorkoutSet => ({
  localId: `set-${orderIndex}`,
  setNumber: orderIndex + 1,
  setType,
  weight: orderIndex < 2 ? 30 : 40,
  weightUnit: 'lbs',
  reps: 8,
  rpe: null,
  restSeconds: null,
  notes: '',
  isCompleted: true,
  orderIndex,
});

describe('resolveProgramEditorSetTypes', () => {
  it('inherits missing program set types from the workout’s actual history', () => {
    const setTypes = resolveProgramEditorSetTypes({
      setCount: 4,
      setDetails: [
        { weight: null, reps: null },
        { weight: null, reps: null },
        { weight: null, reps: null },
        { weight: null, reps: null },
      ],
      historySets: [
        buildHistorySet(2, 'normal'),
        buildHistorySet(0, 'warmup'),
        buildHistorySet(3, 'normal'),
        buildHistorySet(1, 'warmup'),
      ],
    });

    expect(setTypes).toEqual(['warmup', 'warmup', 'normal', 'normal']);
  });

  it('keeps an explicitly saved program set type ahead of history', () => {
    const setTypes = resolveProgramEditorSetTypes({
      setCount: 2,
      setDetails: [
        { weight: null, reps: null, setType: 'failure' },
        { weight: null, reps: null },
      ],
      historySets: [
        buildHistorySet(0, 'warmup'),
        buildHistorySet(1, 'dropset'),
      ],
    });

    expect(setTypes).toEqual(['failure', 'dropset']);
  });
});
