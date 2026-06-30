import { useProgramsStore } from '@/src/store/programsStore';
import { useStartPresetStore, type StartPreset } from '@/src/store/startPresetStore';
import { supabase } from '@/src/lib/supabase';
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
  },
  isSupabaseConfigured: jest.fn(() => true),
}));

const buildServerProgram = (): Program => {
  const now = new Date().toISOString();
  return {
    id: 'server-program-1',
    name: 'Server Program',
    description: undefined,
    difficulty: 'intermediate',
    goal: undefined,
    durationWeeks: undefined,
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
        id: 'server-workout-1',
        name: 'Day 1',
        dayNumber: 1,
        exercises: [],
      },
    ],
  };
};

describe('programsStore deleteProgram', () => {
  const supabaseFromMock = supabase.from as jest.Mock;
  const originalSetPreset = useStartPresetStore.getState().setPreset;

  afterEach(() => {
    useStartPresetStore.setState({ setPreset: originalSetPreset });
    useStartPresetStore.getState().resetStore();
    useProgramsStore.getState().resetStore();
    jest.clearAllMocks();
  });

  it('removes server programs from local state before the delete request resolves', async () => {
    const program = buildServerProgram();
    let resolveDelete: (value: { error: null }) => void = () => undefined;
    const deletePromise = new Promise<{ error: null }>((resolve) => {
      resolveDelete = resolve;
    });
    const eqMock = jest.fn(() => deletePromise);
    const deleteMock = jest.fn(() => ({ eq: eqMock }));
    supabaseFromMock.mockReturnValue({ delete: deleteMock });
    useProgramsStore.setState({ programs: [program] });

    const resultPromise = useProgramsStore.getState().deleteProgram(program.id);

    expect(useProgramsStore.getState().programs).toEqual([]);

    resolveDelete({ error: null });
    await expect(resultPromise).resolves.toBe(true);
    expect(deleteMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith('id', program.id);
  });

  it('clears a matching FAB program preset before deleting the program', async () => {
    const program = buildServerProgram();
    const setPresetMock = jest.fn(async (preset: StartPreset | null) => {
      useStartPresetStore.setState({ preset });
    });
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    const deleteMock = jest.fn(() => ({ eq: eqMock }));
    supabaseFromMock.mockReturnValue({ delete: deleteMock });
    useProgramsStore.setState({ programs: [program] });
    useStartPresetStore.setState({
      preset: { type: 'program', programId: program.id },
      setPreset: setPresetMock,
    });

    const result = await useProgramsStore.getState().deleteProgram(program.id);

    expect(result).toBe(true);
    expect(setPresetMock).toHaveBeenCalledWith(null);
    expect(useStartPresetStore.getState().preset).toBeNull();
  });

  it('restores the program if the server delete fails', async () => {
    const program = buildServerProgram();
    const eqMock = jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } });
    const deleteMock = jest.fn(() => ({ eq: eqMock }));
    supabaseFromMock.mockReturnValue({ delete: deleteMock });
    useProgramsStore.setState({ programs: [program] });

    const result = await useProgramsStore.getState().deleteProgram(program.id);

    expect(result).toBe(false);
    expect(useProgramsStore.getState().programs).toEqual([program]);
    expect(useProgramsStore.getState().error).toBe('Delete failed');
  });
});
