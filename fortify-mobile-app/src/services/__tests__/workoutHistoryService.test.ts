const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const mockNetInfoFetch = jest.fn();
const mockGetAllExercises = jest.fn();
const mockGetCustomExercises = jest.fn();
const mockRefreshTrainingInsights = jest.fn();

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
  isSupabaseConfigured: jest.fn(() => true),
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: (...args: unknown[]) => mockNetInfoFetch(...args),
  },
}));

jest.mock('@/src/services/exerciseService', () => ({
  getAllExercises: (...args: unknown[]) => mockGetAllExercises(...args),
  getCustomExercises: (...args: unknown[]) => mockGetCustomExercises(...args),
  isCustomExercise: (id: string) => id.startsWith('custom-'),
}));

jest.mock('@/src/services/insightsService', () => ({
  refreshTrainingInsights: (...args: unknown[]) => mockRefreshTrainingInsights(...args),
}));

import { fetchWorkoutHistory, syncWorkoutSession } from '@/src/services/workoutHistoryService';
import type { WorkoutSession } from '@/src/types/workout';

describe('workoutHistoryService custom exercise sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockNetInfoFetch.mockResolvedValue({ isConnected: true });
    mockRefreshTrainingInsights.mockResolvedValue(undefined);
  });

  it('syncs custom workout sets using the server UUID behind the local custom id', async () => {
    const customExercise = {
      id: 'custom-123',
      slug: 'custom-123',
      name: 'Shaymaxx Row',
      primaryMuscles: ['back'],
      secondaryMuscles: ['biceps'],
      equipment: 'cable',
      category: 'strength',
      instructions: [],
      images: [],
      isCustom: true,
    };

    mockGetCustomExercises.mockResolvedValue([customExercise]);
    mockGetAllExercises.mockResolvedValue([customExercise]);

    const capturedSets: Array<Record<string, unknown>> = [];

    const workoutSessionsTable = {
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: { id: 'db-session-1' }, error: null }),
        })),
      })),
    };

    const exercisesTable = {
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: { id: '11111111-1111-1111-1111-111111111111' }, error: null }),
        })),
      })),
    };

    const workoutSetsTable = {
      insert: jest.fn(async (rows: Array<Record<string, unknown>>) => {
        capturedSets.push(...rows);
        return { error: null };
      }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'workout_sessions') return workoutSessionsTable;
      if (table === 'exercises') return exercisesTable;
      if (table === 'workout_sets') return workoutSetsTable;
      throw new Error(`Unexpected table: ${table}`);
    });

    const session: WorkoutSession = {
      localId: 'session-local-1',
      name: 'Pull Day',
      notes: '',
      startedAt: new Date('2026-04-08T10:00:00.000Z'),
      completedAt: new Date('2026-04-08T10:30:00.000Z'),
      exercises: [
        {
          localId: 'exercise-local-1',
          exerciseId: 'custom-123',
          exerciseName: 'Shaymaxx Row',
          notes: '',
          orderIndex: 0,
          sets: [
            {
              localId: 'set-local-1',
              setNumber: 1,
              setType: 'normal',
              weight: 90,
              weightUnit: 'lbs',
              reps: 12,
              rpe: 8,
              restSeconds: 90,
              notes: '',
              isCompleted: true,
              orderIndex: 0,
            },
          ],
        },
      ],
      isSynced: false,
    };

    const result = await syncWorkoutSession(session);

    expect(result.success).toBe(true);
    expect(exercisesTable.upsert).toHaveBeenCalled();
    expect(workoutSetsTable.insert).toHaveBeenCalledTimes(1);
    expect(capturedSets).toHaveLength(1);
    expect(capturedSets[0].exercise_id).toBe('11111111-1111-1111-1111-111111111111');
    expect(capturedSets[0].exercise_name_snapshot).toBe('Shaymaxx Row');
  });

  it('maps synced custom exercise UUIDs back to the local custom id when reading history', async () => {
    mockGetAllExercises.mockResolvedValue([
      {
        id: 'custom-123',
        slug: 'custom-123',
        remoteId: '11111111-1111-1111-1111-111111111111',
        name: 'Shaymaxx Row',
        primaryMuscles: ['back'],
        secondaryMuscles: ['biceps'],
        equipment: 'cable',
        category: 'strength',
        instructions: [],
        images: [],
        isCustom: true,
        source: 'custom',
      },
    ]);

    const workoutSessionsQuery: any = {};
    workoutSessionsQuery.select = jest.fn(() => workoutSessionsQuery);
    workoutSessionsQuery.eq = jest.fn(() => workoutSessionsQuery);
    workoutSessionsQuery.gte = jest.fn(() => workoutSessionsQuery);
    workoutSessionsQuery.lte = jest.fn(() => workoutSessionsQuery);
    workoutSessionsQuery.limit = jest.fn(() => workoutSessionsQuery);
    workoutSessionsQuery.order = jest.fn(() => workoutSessionsQuery);
    workoutSessionsQuery.abortSignal = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'db-session-1',
          local_id: 'session-local-1',
          name: 'Pull Day',
          notes: '',
          started_at: '2026-04-08T10:00:00.000Z',
          completed_at: '2026-04-08T10:30:00.000Z',
          duration_seconds: 1800,
          program_id: null,
          program_workout_id: null,
          workout_sets: [
            {
              id: 'set-db-1',
              local_id: 'set-local-1',
              exercise_id: '11111111-1111-1111-1111-111111111111',
              exercise_name_snapshot: 'Shaymaxx Row',
              set_number: 1,
              reps: 12,
              weight: 90,
              weight_unit: 'lbs',
              rpe: 8,
              rest_seconds: 90,
              notes: '',
              is_warmup: false,
              is_dropset: false,
              is_failure: false,
              order_index: 0,
            },
          ],
        },
      ],
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'workout_sessions') return workoutSessionsQuery;
      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await fetchWorkoutHistory(50);

    expect(result.error).toBeUndefined();
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0].exercises).toHaveLength(1);
    expect(result.sessions[0].exercises[0].exerciseId).toBe('custom-123');
    expect(result.sessions[0].exercises[0].exerciseName).toBe('Shaymaxx Row');
  });
});
