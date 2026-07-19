const mockProfile = {
  deleted_default_program_ids: [] as string[],
  starter_content_initialized: true,
};
const mockProfileUpdates: Array<Record<string, unknown>> = [];

jest.mock('@/src/lib/supabase', () => {
  return {
    isSupabaseConfigured: () => true,
    supabase: {
      auth: {
        getSession: jest.fn(async () => ({
          data: { session: { user: { id: 'user-1' } } },
        })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(async () => ({ data: { ...mockProfile }, error: null })),
          })),
        })),
        update: jest.fn((values: Record<string, unknown>) => {
          mockProfileUpdates.push(values);
          Object.assign(mockProfile, values);
          return {
            eq: jest.fn(async () => ({ error: null })),
          };
        }),
      })),
    },
  };
});

jest.mock('@/src/services/programSyncService', () => ({
  syncLocalProgram: jest.fn().mockResolvedValue({ success: false }),
  processPendingProgramQueue: jest.fn().mockResolvedValue({
    processed: 0,
    failed: 0,
    idMappings: new Map(),
  }),
  removeFromPendingQueue: jest.fn().mockResolvedValue(undefined),
  getPendingProgramSyncIds: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/src/utils/scopedStorage', () => ({
  getActiveScopedStorageUser: jest.fn(() => 'user-1'),
  getScopedItem: jest.fn(),
  setScopedItem: jest.fn(),
}));

import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { PROGRAMS_KEY } from '@/src/constants/storageKeys';
import { useProgramsStore } from '@/src/store/programsStore';

const mockGetScopedItem = getScopedItem as jest.MockedFunction<typeof getScopedItem>;
const mockSetScopedItem = setScopedItem as jest.MockedFunction<typeof setScopedItem>;

describe('programsStore reinstall persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProfile.deleted_default_program_ids = [];
    mockProfile.starter_content_initialized = true;
    mockProfileUpdates.length = 0;
    mockGetScopedItem.mockResolvedValue(null);
    mockSetScopedItem.mockResolvedValue(undefined);
    useProgramsStore.getState().resetStore();
  });

  afterEach(() => {
    useProgramsStore.getState().resetStore();
  });

  it('does not restore cloud-tombstoned starter workouts after reinstall', async () => {
    mockProfile.deleted_default_program_ids = [
      'default-template-upper',
      'default-template-lower',
    ];

    await useProgramsStore.getState().loadLocalPrograms();

    expect(useProgramsStore.getState().programs).toEqual([]);
  });

  it('syncs a starter-workout deletion to the account', async () => {
    await useProgramsStore.getState().loadLocalPrograms();
    expect(useProgramsStore.getState().programs).toHaveLength(2);

    await useProgramsStore.getState().deleteProgram('default-template-upper');

    expect(mockProfile.deleted_default_program_ids).toContain('default-template-upper');
    expect(mockProfileUpdates.at(-1)?.deleted_default_program_ids).toContain('default-template-upper');
  });

  it('hydrates synced workout cards from the account cache before a server refresh', async () => {
    const cachedTemplate = {
      id: '8b8f0d94-33aa-4ed9-b959-268cd56fd728',
      name: 'Cached Push Day',
      difficulty: 'intermediate',
      isPublic: false,
      isDefault: false,
      isAiCreated: false,
      isTemplate: true,
      lastPerformedAt: null,
      createdBy: 'user-1',
      createdAt: '2026-07-19T12:00:00.000Z',
      updatedAt: '2026-07-19T12:00:00.000Z',
      workouts: [{
        id: 'a4e8b494-2fab-4514-a748-ff437625e370',
        name: 'Cached Push Day',
        dayNumber: 1,
        exercises: [],
      }],
    };
    mockGetScopedItem.mockImplementation(async (key) => (
      key === PROGRAMS_KEY ? JSON.stringify([cachedTemplate]) : null
    ));

    await useProgramsStore.getState().loadLocalPrograms();

    expect(useProgramsStore.getState().programs).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: cachedTemplate.id })])
    );
  });

  it('adds creations to and removes deletions from the full programs cache', async () => {
    const createdId = await useProgramsStore.getState().createWorkoutTemplate(
      'Cached Workout',
      []
    );
    expect(createdId).toBeTruthy();

    const createdCacheWrite = mockSetScopedItem.mock.calls
      .filter(([key]) => key === PROGRAMS_KEY)
      .at(-1)?.[1];
    expect(JSON.parse(createdCacheWrite ?? '[]')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: createdId })])
    );

    await useProgramsStore.getState().deleteProgram(createdId!);

    const deletedCacheWrite = mockSetScopedItem.mock.calls
      .filter(([key]) => key === PROGRAMS_KEY)
      .at(-1)?.[1];
    expect(JSON.parse(deletedCacheWrite ?? '[]')).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: createdId })])
    );
  });

  it('atomically replaces a temporary id in the full programs cache', async () => {
    const localId = await useProgramsStore.getState().createWorkoutTemplate(
      'Template awaiting sync',
      []
    );
    expect(localId).toBeTruthy();

    const serverId = '75ab509f-eb76-4acf-bb5e-2cd44321b207';
    await useProgramsStore.getState().replaceLocalIdWithServerId(localId!, serverId);

    const cacheWrite = mockSetScopedItem.mock.calls
      .filter(([key]) => key === PROGRAMS_KEY)
      .at(-1)?.[1];
    const cachedPrograms = JSON.parse(cacheWrite ?? '[]');
    expect(cachedPrograms).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: serverId })])
    );
    expect(cachedPrograms).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: localId })])
    );
  });
});
