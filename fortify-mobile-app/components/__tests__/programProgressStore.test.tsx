import { useProgramProgressStore } from '@/src/store/programProgressStore';
import {
  fetchAllProgramProgressEntries,
  upsertProgramProgressEntry,
} from '@/src/services/programProgressService';

jest.mock('@/src/utils/scopedStorage', () => ({
  getScopedItem: jest.fn().mockResolvedValue(null),
  setScopedItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/src/services/programProgressService', () => ({
  fetchAllProgramProgressEntries: jest.fn().mockResolvedValue([]),
  upsertProgramProgressEntry: jest.fn().mockResolvedValue(null),
}));

describe('programProgressStore', () => {
  afterEach(() => {
    useProgramProgressStore.setState({
      progressByProgram: {},
      isLoaded: false,
    });
    jest.clearAllMocks();
  });

  it('initializes progress when a program starts', () => {
    useProgramProgressStore.getState().startProgram('program-1');

    const entry = useProgramProgressStore.getState().progressByProgram['program-1'];
    expect(entry).toBeDefined();
    expect(entry.currentCycle).toBe(1);
    expect(entry.completedDayNumbers).toEqual([]);
  });

  it('tracks completed days and rolls to a new cycle', () => {
    useProgramProgressStore.getState().startProgram('program-1');

    useProgramProgressStore.getState().markWorkoutComplete('program-1', 1, 2, '2024-01-02T00:00:00.000Z');
    let entry = useProgramProgressStore.getState().progressByProgram['program-1'];
    expect(entry.completedDayNumbers).toEqual([1]);

    useProgramProgressStore.getState().markWorkoutComplete('program-1', 2, 2, '2024-01-03T00:00:00.000Z');
    entry = useProgramProgressStore.getState().progressByProgram['program-1'];
    expect(entry.currentCycle).toBe(2);
    expect(entry.completedDayNumbers).toEqual([]);
    expect(entry.history).toHaveLength(1);
    expect(entry.history[0].completedDayNumbers).toEqual([1, 2]);
  });

  it('trims completed days when program length changes', () => {
    useProgramProgressStore.getState().startProgram('program-1');
    useProgramProgressStore.setState({
      progressByProgram: {
        'program-1': {
          programId: 'program-1',
          currentCycle: 1,
          completedDayNumbers: [1, 3, 4],
          nextDayNumberOverride: null,
          history: [],
          lastWorkoutId: null,
          lastWorkoutAt: null,
          startedAt: null,
          completedAt: null,
          updatedAt: null,
        },
      },
    });

    useProgramProgressStore.getState().trimCompletedDays('program-1', 3);
    const entry = useProgramProgressStore.getState().progressByProgram['program-1'];
    expect(entry.completedDayNumbers).toEqual([1, 3]);
  });

  it('continues forward after completing a next workout override', () => {
    useProgramProgressStore.getState().startProgram('program-1');
    useProgramProgressStore.getState().markWorkoutComplete('program-1', 1, 3, '2024-01-02T00:00:00.000Z');

    useProgramProgressStore.getState().setNextDayNumber('program-1', 3, 3);
    expect(useProgramProgressStore.getState().getNextDayNumber('program-1', 3)).toBe(3);

    useProgramProgressStore.getState().markWorkoutComplete('program-1', 3, 3, '2024-01-03T00:00:00.000Z');
    const entry = useProgramProgressStore.getState().progressByProgram['program-1'];
    expect(entry.nextDayNumberOverride).toBe(2);
    expect(useProgramProgressStore.getState().getNextDayNumber('program-1', 3)).toBe(2);
  });

  it('continues to the next workout after a skipped-ahead override', () => {
    useProgramProgressStore.getState().startProgram('program-1');

    useProgramProgressStore.getState().setNextDayNumber('program-1', 3, 5);
    expect(useProgramProgressStore.getState().getNextDayNumber('program-1', 5)).toBe(3);

    useProgramProgressStore.getState().markWorkoutComplete('program-1', 3, 5, '2024-01-03T00:00:00.000Z');
    const entry = useProgramProgressStore.getState().progressByProgram['program-1'];
    expect(entry.completedDayNumbers).toEqual([3]);
    expect(entry.nextDayNumberOverride).toBe(4);
    expect(useProgramProgressStore.getState().getNextDayNumber('program-1', 5)).toBe(4);
  });

  it('merges newer local progress into remote state on load', async () => {
    const { getScopedItem } = jest.requireMock('@/src/utils/scopedStorage');
    getScopedItem.mockResolvedValueOnce(JSON.stringify({
      'program-1': {
        programId: 'program-1',
        currentCycle: 2,
        completedDayNumbers: [1],
        history: [{ cycle: 1, completedDayNumbers: [1, 2], completedAt: '2024-01-03T00:00:00.000Z' }],
        lastWorkoutId: null,
        lastWorkoutAt: '2024-01-04T00:00:00.000Z',
        startedAt: '2024-01-01T00:00:00.000Z',
        completedAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-04T00:00:00.000Z',
      },
    }));
    (fetchAllProgramProgressEntries as jest.Mock).mockResolvedValueOnce([
      {
        programId: 'program-1',
        currentCycle: 1,
        completedDayNumbers: [1],
        nextDayNumberOverride: null,
        history: [],
        lastWorkoutId: null,
        lastWorkoutAt: '2024-01-02T00:00:00.000Z',
        startedAt: '2024-01-01T00:00:00.000Z',
        completedAt: null,
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
    ]);

    await useProgramProgressStore.getState().loadProgress();

    const entry = useProgramProgressStore.getState().progressByProgram['program-1'];
    expect(entry.currentCycle).toBe(2);
    expect(entry.history).toHaveLength(1);
    expect(upsertProgramProgressEntry).toHaveBeenCalledTimes(1);
  });
});
