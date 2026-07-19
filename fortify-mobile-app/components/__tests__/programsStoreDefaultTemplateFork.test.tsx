import { useProgramsStore } from '@/src/store/programsStore';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { DELETED_DEFAULT_PROGRAM_IDS_KEY } from '@/src/constants/storageKeys';

jest.mock('@/src/services/programSyncService', () => ({
  syncLocalProgram: jest.fn().mockResolvedValue({ success: false }),
  processPendingProgramQueue: jest.fn().mockResolvedValue({
    processed: 0,
    failed: 0,
    idMappings: new Map(),
  }),
  removeFromPendingQueue: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/src/utils/scopedStorage', () => ({
  getActiveScopedStorageUser: jest.fn(() => 'user-1'),
  getScopedItem: jest.fn(),
  setScopedItem: jest.fn(),
}));

describe('programsStore seeded default template edits', () => {
  const getScopedItemMock = getScopedItem as jest.MockedFunction<typeof getScopedItem>;
  const setScopedItemMock = setScopedItem as jest.MockedFunction<typeof setScopedItem>;
  let storage: Map<string, string>;

  beforeEach(async () => {
    storage = new Map<string, string>();
    getScopedItemMock.mockImplementation(async (key: string) => storage.get(key) ?? null);
    setScopedItemMock.mockImplementation(async (key: string, value: string) => {
      storage.set(key, value);
    });
    useProgramsStore.getState().resetStore();
    await useProgramsStore.getState().loadLocalPrograms();
  });

  afterEach(() => {
    useProgramsStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('forks a default template into a personal copy and hides the default', async () => {
    const result = await useProgramsStore.getState().updateWorkoutTemplate(
      'default-template-upper',
      'Upper',
      [
        {
          exerciseId: '10a23ae7-3c11-4f71-b2ef-fb8d1d06fabc',
          exerciseName: 'Barbell Bench Press',
          sets: 4,
          reps: '6-8',
          restSeconds: 180,
        },
      ]
    );

    expect(result).toMatch(/^local-/);

    const programs = useProgramsStore.getState().programs;
    expect(programs.some((program) => program.id === 'default-template-upper')).toBe(false);

    const copiedTemplate = programs.find((program) => program.id === result);
    expect(copiedTemplate).toBeDefined();
    expect(copiedTemplate?.isTemplate).toBe(true);
    expect(copiedTemplate?.isDefault).toBe(false);
    expect(copiedTemplate?.workouts[0].exercises).toHaveLength(1);
    expect(copiedTemplate?.workouts[0].exercises[0].sets).toBe(4);

    const deletedIds = JSON.parse(storage.get(DELETED_DEFAULT_PROGRAM_IDS_KEY) ?? '[]') as string[];
    expect(deletedIds).toContain('default-template-upper');
  });
});
