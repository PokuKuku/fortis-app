import { supabase } from '@/src/lib/supabase';
import { useProgramsStore } from '@/src/store/programsStore';
import type { Program } from '@/src/types/workout';

jest.mock('@/src/services/programSyncService', () => ({
  syncLocalProgram: jest.fn().mockResolvedValue({ success: false }),
  processPendingProgramQueue: jest.fn().mockResolvedValue({
    processed: 0,
    failed: 0,
    idMappings: new Map(),
  }),
  removeFromPendingQueue: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  },
  isSupabaseConfigured: jest.fn(() => true),
}));

const programId = '11111111-1111-4111-8111-111111111111';
const workoutId = '22222222-2222-4222-8222-222222222222';
const exerciseId = '33333333-3333-4333-8333-333333333333';

const buildProgram = (): Program => {
  const now = new Date().toISOString();
  return {
    id: programId,
    name: 'PPL',
    difficulty: 'intermediate',
    isPublic: false,
    isDefault: false,
    isAiCreated: false,
    isTemplate: false,
    lastPerformedAt: null,
    createdBy: 'user-1',
    createdAt: now,
    updatedAt: now,
    workouts: [
      {
        id: workoutId,
        name: 'Pull',
        dayNumber: 2,
        exercises: [
          {
            id: 'existing-exercise',
            exerciseId,
            exerciseName: 'Cable Row',
            sets: 3,
            reps: '6-8',
            restSeconds: 120,
            notes: '',
            orderIndex: 0,
          },
        ],
      },
    ],
  };
};

describe('programsStore updateProgramWorkout', () => {
  const rpcMock = supabase.rpc as jest.Mock;
  const fromMock = supabase.from as jest.Mock;

  afterEach(() => {
    useProgramsStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('replaces exercises through the atomic database function', async () => {
    const program = buildProgram();
    useProgramsStore.setState({ programs: [program] });
    rpcMock.mockResolvedValue({
      data: [
        {
          id: 'saved-exercise',
          program_workout_id: workoutId,
          exercise_id: exerciseId,
          exercise_name_snapshot: 'Cable Row',
          sets: 4,
          reps: '5-8',
          rest_seconds: 90,
          notes: '',
          set_details: [{ weight: 75, reps: 5 }],
          order_index: 0,
        },
      ],
      error: null,
    });

    const result = await useProgramsStore.getState().updateProgramWorkout(
      programId,
      workoutId,
      'Pull A',
      [
        {
          exerciseId,
          exerciseName: 'Cable Row',
          sets: 4,
          reps: '5-8',
          restSeconds: 90,
          notes: '',
          setDetails: [{ weight: 75, reps: 5 }],
        },
      ]
    );

    expect(result).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith(
      'replace_program_workout_exercises',
      expect.objectContaining({
        p_program_workout_id: workoutId,
        p_name: 'Pull A',
        p_exercises: [
          expect.objectContaining({
            exercise_id: exerciseId,
            sets: 4,
            set_details: [{ weight: 75, reps: 5 }],
          }),
        ],
      })
    );
    expect(fromMock).not.toHaveBeenCalled();
    expect(useProgramsStore.getState().programs[0].workouts[0].exercises[0]).toEqual(
      expect.objectContaining({ id: 'saved-exercise', sets: 4 })
    );
  });

  it('keeps the previous workout when the atomic replacement fails', async () => {
    const program = buildProgram();
    useProgramsStore.setState({ programs: [program] });
    rpcMock.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

    const result = await useProgramsStore.getState().updateProgramWorkout(
      programId,
      workoutId,
      'Pull A',
      [
        {
          exerciseId,
          exerciseName: 'Cable Row',
          sets: 4,
          reps: '5-8',
          restSeconds: 90,
          notes: '',
        },
      ]
    );

    expect(result).toBe(false);
    expect(useProgramsStore.getState().programs[0]).toEqual(program);
    expect(useProgramsStore.getState().error).toBe('Insert failed');
  });

  it('rejects empty program workouts before calling the database', async () => {
    const program = buildProgram();
    useProgramsStore.setState({ programs: [program] });

    const result = await useProgramsStore.getState().updateProgramWorkout(
      programId,
      workoutId,
      'Pull',
      []
    );

    expect(result).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
    expect(useProgramsStore.getState().programs[0]).toEqual(program);
    expect(useProgramsStore.getState().error).toBe(
      'A program workout must contain at least one exercise'
    );
  });
});
