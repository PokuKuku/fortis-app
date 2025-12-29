import { create } from 'zustand';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { PROGRAM_PROGRESS_KEY } from '@/src/constants/storageKeys';

export interface ProgramProgressHistory {
  cycle: number;
  completedDayNumbers: number[];
  completedAt: string;
}

export interface ProgramProgressEntry {
  programId: string;
  currentCycle: number;
  completedDayNumbers: number[];
  history: ProgramProgressHistory[];
  lastWorkoutAt: string | null;
}

interface ProgramProgressState {
  progressByProgram: Record<string, ProgramProgressEntry>;
  isLoaded: boolean;
  loadProgress: () => Promise<void>;
  startProgram: (programId: string) => void;
  markWorkoutComplete: (programId: string, dayNumber: number, totalDays: number, completedAt?: string) => void;
  restartProgram: (programId: string) => void;
  trimCompletedDays: (programId: string, totalDays: number) => void;
  migrateProgramId: (fromProgramId: string, toProgramId: string) => void;
  getNextDayNumber: (programId: string, totalDays: number) => number;
  resetStore: () => void;
}

const persistProgress = async (progressByProgram: Record<string, ProgramProgressEntry>) => {
  await setScopedItem(PROGRAM_PROGRESS_KEY, JSON.stringify(progressByProgram));
};

export const useProgramProgressStore = create<ProgramProgressState>((set, get) => ({
  progressByProgram: {},
  isLoaded: false,

  loadProgress: async () => {
    try {
      const stored = await getScopedItem(PROGRAM_PROGRESS_KEY);
      if (stored) {
        set({ progressByProgram: JSON.parse(stored), isLoaded: true });
        return;
      }
      set({ progressByProgram: {}, isLoaded: true });
    } catch (error) {
      console.warn('Failed to load program progress:', error);
      set({ progressByProgram: {}, isLoaded: true });
      return;
    }
  },

  startProgram: (programId) => {
    const existing = get().progressByProgram[programId];
    if (existing) return;

    const entry: ProgramProgressEntry = {
      programId,
      currentCycle: 1,
      completedDayNumbers: [],
      history: [],
      lastWorkoutAt: null,
    };

    set((state) => ({
      progressByProgram: {
        ...state.progressByProgram,
        [programId]: entry,
      },
    }));

    persistProgress({
      ...get().progressByProgram,
      [programId]: entry,
    }).catch((error) => {
      console.warn('Failed to persist program progress:', error);
    });
  },

  markWorkoutComplete: (programId, dayNumber, totalDays, completedAt) => {
    const now = completedAt || new Date().toISOString();
    const existing = get().progressByProgram[programId];
    const entry: ProgramProgressEntry = existing || {
      programId,
      currentCycle: 1,
      completedDayNumbers: [],
      history: [],
      lastWorkoutAt: null,
    };

    const completed = new Set(entry.completedDayNumbers);
    completed.add(dayNumber);
    const updatedCompleted = Array.from(completed).sort((a, b) => a - b);

    let nextEntry: ProgramProgressEntry = {
      ...entry,
      completedDayNumbers: updatedCompleted,
      lastWorkoutAt: now,
    };

    if (updatedCompleted.length >= totalDays) {
      nextEntry = {
        ...nextEntry,
        currentCycle: entry.currentCycle + 1,
        completedDayNumbers: [],
        history: [
          ...entry.history,
          {
            cycle: entry.currentCycle,
            completedDayNumbers: updatedCompleted,
            completedAt: now,
          },
        ],
      };
    }

    set((state) => ({
      progressByProgram: {
        ...state.progressByProgram,
        [programId]: nextEntry,
      },
    }));

    persistProgress({
      ...get().progressByProgram,
      [programId]: nextEntry,
    }).catch((error) => {
      console.warn('Failed to persist program progress:', error);
    });
  },

  restartProgram: (programId) => {
    const existing = get().progressByProgram[programId];
    if (!existing) return;

    const now = new Date().toISOString();
    const nextEntry: ProgramProgressEntry = {
      ...existing,
      currentCycle: existing.currentCycle + 1,
      completedDayNumbers: [],
      history: [
        ...existing.history,
        {
          cycle: existing.currentCycle,
          completedDayNumbers: existing.completedDayNumbers,
          completedAt: now,
        },
      ],
      lastWorkoutAt: existing.lastWorkoutAt,
    };

    set((state) => ({
      progressByProgram: {
        ...state.progressByProgram,
        [programId]: nextEntry,
      },
    }));

    persistProgress({
      ...get().progressByProgram,
      [programId]: nextEntry,
    }).catch((error) => {
      console.warn('Failed to persist program progress:', error);
    });
  },

  trimCompletedDays: (programId, totalDays) => {
    const existing = get().progressByProgram[programId];
    if (!existing) return;

    const trimmed = existing.completedDayNumbers.filter((dayNumber) => dayNumber <= totalDays);
    const nextEntry: ProgramProgressEntry = {
      ...existing,
      completedDayNumbers: trimmed,
    };

    set((state) => ({
      progressByProgram: {
        ...state.progressByProgram,
        [programId]: nextEntry,
      },
    }));

    persistProgress({
      ...get().progressByProgram,
      [programId]: nextEntry,
    }).catch((error) => {
      console.warn('Failed to persist program progress:', error);
    });
  },

  migrateProgramId: (fromProgramId, toProgramId) => {
    const existing = get().progressByProgram[fromProgramId];
    if (!existing) return;

    const nextEntry: ProgramProgressEntry = {
      ...existing,
      programId: toProgramId,
    };

    const nextMap = { ...get().progressByProgram };
    delete nextMap[fromProgramId];
    nextMap[toProgramId] = nextEntry;

    set({ progressByProgram: nextMap });

    persistProgress(nextMap).catch((error) => {
      console.warn('Failed to persist program progress:', error);
    });
  },

  getNextDayNumber: (programId, totalDays) => {
    const entry = get().progressByProgram[programId];
    const completed = new Set(entry?.completedDayNumbers || []);
    for (let day = 1; day <= totalDays; day += 1) {
      if (!completed.has(day)) return day;
    }
    return 1;
  },

  resetStore: () => {
    set({ progressByProgram: {}, isLoaded: false });
  },
}));
