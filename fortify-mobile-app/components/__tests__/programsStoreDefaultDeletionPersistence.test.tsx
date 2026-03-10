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
  getScopedItem: jest.fn(),
  setScopedItem: jest.fn(),
}));

describe('programsStore default deletion persistence', () => {
  const getScopedItemMock = getScopedItem as jest.MockedFunction<typeof getScopedItem>;
  const setScopedItemMock = setScopedItem as jest.MockedFunction<typeof setScopedItem>;
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map<string, string>();
    getScopedItemMock.mockImplementation(async (key: string) => storage.get(key) ?? null);
    setScopedItemMock.mockImplementation(async (key: string, value: string) => {
      storage.set(key, value);
    });
    useProgramsStore.getState().resetStore();
  });

  afterEach(() => {
    useProgramsStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('keeps deleted default workouts hidden across local reloads', async () => {
    await useProgramsStore.getState().loadLocalPrograms();

    expect(useProgramsStore.getState().programs.some((program) => program.id === 'default-template-upper')).toBe(true);

    const deleted = await useProgramsStore.getState().deleteProgram('default-template-upper');
    expect(deleted).toBe(true);
    expect(useProgramsStore.getState().programs.some((program) => program.id === 'default-template-upper')).toBe(false);

    const deletedIds = JSON.parse(storage.get(DELETED_DEFAULT_PROGRAM_IDS_KEY) ?? '[]') as string[];
    expect(deletedIds).toContain('default-template-upper');

    useProgramsStore.getState().resetStore();
    await useProgramsStore.getState().loadLocalPrograms();

    expect(useProgramsStore.getState().programs.some((program) => program.id === 'default-template-upper')).toBe(false);
    expect(useProgramsStore.getState().programs.some((program) => program.id === 'default-template-lower')).toBe(true);
  });
});
