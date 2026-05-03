import { useProgramsStore } from '@/src/store/programsStore';
import { Program } from '@/src/types/workout';
import { syncLocalProgram } from '@/src/services/programSyncService';

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
  },
  isSupabaseConfigured: jest.fn(() => true),
}));

const buildLocalTemplate = (): Program => {
  const now = new Date().toISOString();
  return {
    id: 'local-template-2',
    name: 'Push Day',
    description: undefined,
    difficulty: 'intermediate',
    goal: undefined,
    durationWeeks: undefined,
    isPublic: false,
    isDefault: false,
    isAiCreated: false,
    isTemplate: true,
    lastPerformedAt: null,
    createdBy: 'local',
    createdAt: now,
    updatedAt: now,
    workouts: [
      {
        id: 'local-template-2-workout',
        name: 'Push Day',
        dayNumber: 1,
        exercises: [
          {
            id: 'local-template-2-ex-0',
            exerciseId: 'ex-press',
            exerciseName: 'Overhead Press',
            sets: 3,
            reps: '6',
            restSeconds: 120,
            notes: '',
            orderIndex: 0,
          },
        ],
      },
    ],
  };
};

describe('programsStore updateWorkoutTemplate', () => {
  afterEach(() => {
    useProgramsStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('updates local template details in store', async () => {
    const template = buildLocalTemplate();
    useProgramsStore.setState({ programs: [template] });

    const result = await useProgramsStore.getState().updateWorkoutTemplate(
      template.id,
      'Push Day A',
      [
        {
          exerciseId: 'ex-dips',
          exerciseName: 'Weighted Dips',
          sets: 2,
          reps: '8',
          restSeconds: 90,
          setDetails: [{ weight: 35, reps: 8 }],
        },
      ]
    );

    const updated = useProgramsStore.getState().programs.find(p => p.id === template.id);

    expect(result).toBe(template.id);
    expect(updated?.name).toBe('Push Day A');
    expect(updated?.workouts[0].name).toBe('Push Day A');
    expect(updated?.workouts[0].exercises).toHaveLength(1);
    expect(updated?.workouts[0].exercises[0].exerciseName).toBe('Weighted Dips');
    expect(updated?.workouts[0].exercises[0].setDetails).toEqual([{ weight: 35, reps: 8 }]);
  });

  it('syncs server-backed templates when updated with custom exercises', async () => {
    const now = new Date().toISOString();
    const template: Program = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Push Day',
      description: undefined,
      difficulty: 'intermediate',
      goal: undefined,
      durationWeeks: undefined,
      isPublic: false,
      isDefault: false,
      isAiCreated: false,
      isTemplate: true,
      lastPerformedAt: null,
      createdBy: 'user-1',
      createdAt: now,
      updatedAt: now,
      workouts: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Push Day',
          dayNumber: 1,
          exercises: [],
        },
      ],
    };

    useProgramsStore.setState({ programs: [template] });

    const result = await useProgramsStore.getState().updateWorkoutTemplate(
      template.id,
      'Push Day',
      [
        {
          exerciseId: 'custom-landmine-press',
          exerciseName: 'Landmine Press',
          sets: 3,
          reps: '8-10',
          restSeconds: 90,
        },
      ]
    );

    expect(result).toBe(template.id);
    expect(useProgramsStore.getState().programs[0].workouts[0].exercises[0].exerciseId).toBe(
      'custom-landmine-press'
    );
    expect(syncLocalProgram).toHaveBeenCalledTimes(1);
    expect(syncLocalProgram).toHaveBeenCalledWith(
      expect.objectContaining({
        id: template.id,
        workouts: [
          expect.objectContaining({
            exercises: [
              expect.objectContaining({
                exerciseId: 'custom-landmine-press',
                exerciseName: 'Landmine Press',
              }),
            ],
          }),
        ],
      })
    );
  });
});
