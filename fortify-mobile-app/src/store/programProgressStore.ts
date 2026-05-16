import { create } from 'zustand';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { PROGRAM_PROGRESS_KEY } from '@/src/constants/storageKeys';
import {
  fetchAllProgramProgressEntries,
  upsertProgramProgressEntry,
  type SyncedProgramProgressEntry,
} from '@/src/services/programProgressService';
import type { ProgramProgressHistoryEntry } from '@/src/types/workout';

export interface ProgramProgressHistory extends ProgramProgressHistoryEntry {}

export interface ProgramProgressEntry {
  programId: string;
  currentCycle: number;
  completedDayNumbers: number[];
  nextDayNumberOverride: number | null;
  history: ProgramProgressHistory[];
  lastWorkoutId: string | null;
  lastWorkoutAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string | null;
}

interface ProgramProgressState {
  progressByProgram: Record<string, ProgramProgressEntry>;
  isLoaded: boolean;
  loadProgress: () => Promise<void>;
  startProgram: (programId: string) => void;
  markWorkoutComplete: (
    programId: string,
    dayNumber: number,
    totalDays: number,
    completedAt?: string,
    lastWorkoutId?: string | null
  ) => void;
  restartProgram: (programId: string) => void;
  trimCompletedDays: (programId: string, totalDays: number) => void;
  setNextDayNumber: (programId: string, dayNumber: number, totalDays: number) => void;
  migrateProgramId: (fromProgramId: string, toProgramId: string) => void;
  getNextDayNumber: (programId: string, totalDays: number) => number;
  resetStore: () => void;
}

let loadProgressPromise: Promise<void> | null = null;

const normalizeCompletedDayNumbers = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0)
    )
  ).sort((a, b) => a - b);
};

const normalizeHistory = (value: unknown): ProgramProgressHistory[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const cycle = Number((item as { cycle?: unknown }).cycle);
      const completedAt = typeof (item as { completedAt?: unknown }).completedAt === 'string'
        ? (item as { completedAt: string }).completedAt
        : null;

      if (!Number.isInteger(cycle) || cycle < 1 || !completedAt) {
        return null;
      }

      return {
        cycle,
        completedDayNumbers: normalizeCompletedDayNumbers(
          (item as { completedDayNumbers?: unknown }).completedDayNumbers
        ),
        completedAt,
      };
    })
    .filter((item): item is ProgramProgressHistory => Boolean(item))
    .sort((a, b) => a.cycle - b.cycle);
};

const normalizeNextDayNumberOverride = (value: unknown, totalDays?: number): number | null => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  if (typeof totalDays === 'number' && totalDays > 0 && parsed > totalDays) return null;
  return parsed;
};

const normalizeEntry = (entry: Partial<ProgramProgressEntry> & { programId: string }): ProgramProgressEntry => ({
  programId: entry.programId,
  currentCycle: Math.max(1, Number(entry.currentCycle ?? 1)),
  completedDayNumbers: normalizeCompletedDayNumbers(entry.completedDayNumbers),
  nextDayNumberOverride: normalizeNextDayNumberOverride(entry.nextDayNumberOverride),
  history: normalizeHistory(entry.history),
  lastWorkoutId: entry.lastWorkoutId ?? null,
  lastWorkoutAt: entry.lastWorkoutAt ?? null,
  startedAt: entry.startedAt ?? null,
  completedAt: entry.completedAt ?? null,
  updatedAt: entry.updatedAt ?? null,
});

const createEntry = (
  programId: string,
  overrides: Partial<ProgramProgressEntry> = {}
): ProgramProgressEntry => normalizeEntry({
  programId,
  currentCycle: 1,
  completedDayNumbers: [],
  nextDayNumberOverride: null,
  history: [],
  lastWorkoutId: null,
  lastWorkoutAt: null,
  startedAt: null,
  completedAt: null,
  updatedAt: null,
  ...overrides,
});

const parseStoredProgress = (raw: string | null): Record<string, ProgramProgressEntry> => {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<ProgramProgressEntry>>;
    const entries = Object.entries(parsed ?? {}).map(([programId, entry]) => [
      programId,
      normalizeEntry({ programId, ...entry }),
    ]);
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
};

const persistProgress = async (progressByProgram: Record<string, ProgramProgressEntry>) => {
  await setScopedItem(PROGRAM_PROGRESS_KEY, JSON.stringify(progressByProgram));
};

const getEntryTimestamp = (entry: ProgramProgressEntry | SyncedProgramProgressEntry | undefined): number => {
  if (!entry) return 0;

  const candidates = [
    'updatedAt' in entry ? entry.updatedAt : null,
    entry.lastWorkoutAt ?? null,
    entry.completedAt ?? null,
    entry.startedAt ?? null,
    entry.history[entry.history.length - 1]?.completedAt ?? null,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const timestamp = new Date(candidate).getTime();
    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
  }

  return 0;
};

const mapRemoteEntry = (entry: SyncedProgramProgressEntry): ProgramProgressEntry => normalizeEntry({
  programId: entry.programId,
  currentCycle: entry.currentCycle,
  completedDayNumbers: entry.completedDayNumbers,
  nextDayNumberOverride: entry.nextDayNumberOverride,
  history: entry.history,
  lastWorkoutId: entry.lastWorkoutId,
  lastWorkoutAt: entry.lastWorkoutAt,
  startedAt: entry.startedAt,
  completedAt: entry.completedAt,
  updatedAt: entry.updatedAt,
});

const mergeProgressMaps = (
  localMap: Record<string, ProgramProgressEntry>,
  remoteEntries: SyncedProgramProgressEntry[]
): {
  merged: Record<string, ProgramProgressEntry>;
  pendingRemoteSync: ProgramProgressEntry[];
} => {
  const remoteMap = Object.fromEntries(
    remoteEntries.map((entry) => [entry.programId, mapRemoteEntry(entry)])
  );
  const merged: Record<string, ProgramProgressEntry> = {};
  const pendingRemoteSync: ProgramProgressEntry[] = [];
  const programIds = new Set([...Object.keys(localMap), ...Object.keys(remoteMap)]);

  programIds.forEach((programId) => {
    const localEntry = localMap[programId];
    const remoteEntry = remoteMap[programId];

    if (localEntry && remoteEntry) {
      if (getEntryTimestamp(localEntry) > getEntryTimestamp(remoteEntry)) {
        merged[programId] = localEntry;
        pendingRemoteSync.push(localEntry);
      } else {
        merged[programId] = remoteEntry;
      }
      return;
    }

    if (localEntry) {
      merged[programId] = localEntry;
      pendingRemoteSync.push(localEntry);
      return;
    }

    if (remoteEntry) {
      merged[programId] = remoteEntry;
    }
  });

  return { merged, pendingRemoteSync };
};

const computeNextDayNumber = (entry: ProgramProgressEntry | undefined, totalDays: number): number => {
  if (!entry || totalDays <= 0) return 1;

  const override = normalizeNextDayNumberOverride(entry.nextDayNumberOverride, totalDays);
  if (override) return override;

  const completed = new Set(
    entry.completedDayNumbers.filter((dayNumber) => dayNumber >= 1 && dayNumber <= totalDays)
  );

  for (let dayNumber = 1; dayNumber <= totalDays; dayNumber += 1) {
    if (!completed.has(dayNumber)) return dayNumber;
  }

  return 1;
};

const getNextIncompleteDayNumberAfter = (
  dayNumber: number,
  totalDays: number,
  completedDayNumbers: number[]
): number | null => {
  if (totalDays <= 0) return null;
  const completed = new Set(
    completedDayNumbers.filter((candidate) => candidate >= 1 && candidate <= totalDays)
  );

  for (let offset = 1; offset <= totalDays; offset += 1) {
    const candidate = ((dayNumber - 1 + offset) % totalDays) + 1;
    if (!completed.has(candidate)) return candidate;
  }

  return null;
};

const syncEntryToRemote = async (entry: ProgramProgressEntry) => {
  try {
    const remoteEntry = await upsertProgramProgressEntry({
      programId: entry.programId,
      currentCycle: entry.currentCycle,
      completedDayNumbers: entry.completedDayNumbers,
      nextDayNumberOverride: entry.nextDayNumberOverride,
      history: entry.history,
      lastWorkoutId: entry.lastWorkoutId,
      lastWorkoutAt: entry.lastWorkoutAt,
      startedAt: entry.startedAt,
      completedAt: entry.completedAt,
      updatedAt: entry.updatedAt,
    });

    if (!remoteEntry) {
      return;
    }

    const normalizedRemoteEntry = mapRemoteEntry(remoteEntry);
    const currentEntry = useProgramProgressStore.getState().progressByProgram[entry.programId];
    if (getEntryTimestamp(currentEntry) > getEntryTimestamp(normalizedRemoteEntry)) {
      return;
    }

    const nextMap = {
      ...useProgramProgressStore.getState().progressByProgram,
      [entry.programId]: normalizedRemoteEntry,
    };

    useProgramProgressStore.setState({ progressByProgram: nextMap });
    await persistProgress(nextMap);
  } catch (error) {
    console.warn('Failed to sync program progress:', error);
  }
};

const writeProgressMap = (nextMap: Record<string, ProgramProgressEntry>) => {
  useProgramProgressStore.setState({ progressByProgram: nextMap });
  persistProgress(nextMap).catch((error) => {
    console.warn('Failed to persist program progress:', error);
  });
};

export const useProgramProgressStore = create<ProgramProgressState>((set, get) => ({
  progressByProgram: {},
  isLoaded: false,

  loadProgress: async () => {
    if (get().isLoaded) {
      return;
    }

    if (loadProgressPromise) {
      return loadProgressPromise;
    }

    loadProgressPromise = (async () => {
      const localMap = parseStoredProgress(await getScopedItem(PROGRAM_PROGRESS_KEY));

      try {
        const remoteEntries = await fetchAllProgramProgressEntries();
        if (remoteEntries.length === 0) {
          set({ progressByProgram: localMap, isLoaded: true });
          await persistProgress(localMap);
          await Promise.all(localMap ? Object.values(localMap).map(syncEntryToRemote) : []);
          return;
        }

        const { merged, pendingRemoteSync } = mergeProgressMaps(localMap, remoteEntries);
        set({ progressByProgram: merged, isLoaded: true });
        await persistProgress(merged);
        await Promise.all(pendingRemoteSync.map(syncEntryToRemote));
      } catch (error) {
        console.warn('Failed to load remote program progress:', error);
        set({ progressByProgram: localMap, isLoaded: true });
        await persistProgress(localMap);
      } finally {
        loadProgressPromise = null;
      }
    })();

    return loadProgressPromise;
  },

  startProgram: (programId) => {
    const existing = get().progressByProgram[programId];
    if (existing) return;

    const now = new Date().toISOString();
    const entry = createEntry(programId, {
      startedAt: now,
      updatedAt: now,
    });
    const nextMap = {
      ...get().progressByProgram,
      [programId]: entry,
    };

    writeProgressMap(nextMap);
    void syncEntryToRemote(entry);
  },

  markWorkoutComplete: (programId, dayNumber, totalDays, completedAt, lastWorkoutId = null) => {
    const now = completedAt || new Date().toISOString();
    const existing = get().progressByProgram[programId];
    const entry = existing ?? createEntry(programId, { startedAt: now });

    const completed = new Set(entry.completedDayNumbers);
    completed.add(dayNumber);
    const updatedCompleted = Array.from(completed).sort((a, b) => a - b);
    const completedOverride = normalizeNextDayNumberOverride(
      entry.nextDayNumberOverride,
      totalDays
    ) === dayNumber;
    const nextDayNumberOverride = completedOverride
      ? getNextIncompleteDayNumberAfter(dayNumber, totalDays, updatedCompleted)
      : entry.nextDayNumberOverride;

    let nextEntry = createEntry(programId, {
      ...entry,
      completedDayNumbers: updatedCompleted,
      nextDayNumberOverride,
      lastWorkoutId,
      lastWorkoutAt: now,
      updatedAt: now,
    });

    if (updatedCompleted.length >= totalDays) {
      nextEntry = createEntry(programId, {
        ...nextEntry,
        currentCycle: entry.currentCycle + 1,
        completedDayNumbers: [],
        nextDayNumberOverride: null,
        history: [
          ...entry.history,
          {
            cycle: entry.currentCycle,
            completedDayNumbers: updatedCompleted,
            completedAt: now,
          },
        ],
        startedAt: now,
        completedAt: now,
      });
    }

    const nextMap = {
      ...get().progressByProgram,
      [programId]: nextEntry,
    };

    writeProgressMap(nextMap);
    void syncEntryToRemote(nextEntry);
  },

  restartProgram: (programId) => {
    const existing = get().progressByProgram[programId];
    if (!existing) return;

    const now = new Date().toISOString();
    const nextEntry = createEntry(programId, {
      ...existing,
      currentCycle: existing.currentCycle + 1,
      completedDayNumbers: [],
      nextDayNumberOverride: null,
      history: [
        ...existing.history,
        {
          cycle: existing.currentCycle,
          completedDayNumbers: existing.completedDayNumbers,
          completedAt: now,
        },
      ],
      startedAt: now,
      updatedAt: now,
      completedAt: now,
    });

    const nextMap = {
      ...get().progressByProgram,
      [programId]: nextEntry,
    };

    writeProgressMap(nextMap);
    void syncEntryToRemote(nextEntry);
  },

  trimCompletedDays: (programId, totalDays) => {
    const existing = get().progressByProgram[programId];
    if (!existing) return;

    const now = new Date().toISOString();
    const nextEntry = createEntry(programId, {
      ...existing,
      completedDayNumbers: existing.completedDayNumbers.filter(
        (dayNumber) => dayNumber <= totalDays
      ),
      nextDayNumberOverride: normalizeNextDayNumberOverride(existing.nextDayNumberOverride, totalDays),
      updatedAt: now,
    });

    const nextMap = {
      ...get().progressByProgram,
      [programId]: nextEntry,
    };

    writeProgressMap(nextMap);
    void syncEntryToRemote(nextEntry);
  },

  setNextDayNumber: (programId, dayNumber, totalDays) => {
    const override = normalizeNextDayNumberOverride(dayNumber, totalDays);
    if (!override) return;

    const now = new Date().toISOString();
    const existing = get().progressByProgram[programId];
    const nextEntry = createEntry(programId, {
      ...(existing ?? {}),
      nextDayNumberOverride: override,
      startedAt: existing?.startedAt ?? now,
      updatedAt: now,
    });

    const nextMap = {
      ...get().progressByProgram,
      [programId]: nextEntry,
    };

    writeProgressMap(nextMap);
    void syncEntryToRemote(nextEntry);
  },

  migrateProgramId: (fromProgramId, toProgramId) => {
    const existing = get().progressByProgram[fromProgramId];
    if (!existing) return;

    const now = new Date().toISOString();
    const nextEntry = createEntry(toProgramId, {
      ...existing,
      programId: toProgramId,
      updatedAt: now,
    });

    const nextMap = {
      ...get().progressByProgram,
      [toProgramId]: nextEntry,
    };
    delete nextMap[fromProgramId];

    writeProgressMap(nextMap);
    void syncEntryToRemote(nextEntry);
  },

  getNextDayNumber: (programId, totalDays) => {
    const entry = get().progressByProgram[programId];
    return computeNextDayNumber(entry, totalDays);
  },

  resetStore: () => {
    loadProgressPromise = null;
    set({ progressByProgram: {}, isLoaded: false });
  },
}));
