/**
 * Workout Store (Zustand)
 *
 * Central state management for active workout sessions.
 * Handles offline-first persistence to AsyncStorage.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WorkoutSession,
  WorkoutExercise,
  WorkoutSet,
  SetType,
  RestTimerState,
  RestTimerSettings,
  DEFAULT_REST_TIMER_SETTINGS,
} from '../types/workout';
import {
  ACTIVE_WORKOUT_KEY,
  REST_TIMER_SETTINGS_KEY,
} from '../constants/storageKeys';

// Module-level lock to prevent rapid double-clicks from creating multiple sessions
let isStartingWorkout = false;

// Simple UUID generator (no external dependency needed)
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface WorkoutState {
  // Active session
  activeSession: WorkoutSession | null;
  isWorkoutActive: boolean;

  // Timers
  workoutStartTime: number | null;
  isWorkoutTimerPaused: boolean;
  pausedElapsedSeconds: number;
  restTimer: RestTimerState;
  restTimerSettings: RestTimerSettings;

  // UI state
  isLoading: boolean;

  // Number pad state
  activeNumberPad: {
    exerciseLocalId: string;
    setLocalId: string;
    inputType: 'weight' | 'reps';
    pendingValue: string;
    hasError: boolean;
  } | null;

  // Actions - Session
  startWorkout: (name?: string, programWorkoutId?: string) => void;
  finishWorkout: () => Promise<WorkoutSession | null>;
  cancelWorkout: () => void;
  updateWorkoutName: (name: string) => void;
  updateWorkoutNotes: (notes: string) => void;
  pauseWorkoutTimer: () => void;
  resumeWorkoutTimer: () => void;
  toggleWorkoutTimer: () => void;

  // Actions - Exercises
  addExercise: (exerciseId: string, exerciseName: string) => void;
  addExercises: (exercises: Array<{ id: string; name: string }>) => void;
  removeExercise: (localId: string) => void;
  reorderExercises: (fromIndex: number, toIndex: number) => void;
  updateExerciseNotes: (localId: string, notes: string) => void;

  // Actions - Sets
  addSet: (exerciseLocalId: string) => void;
  removeSet: (exerciseLocalId: string, setLocalId: string) => void;
  updateSet: (
    exerciseLocalId: string,
    setLocalId: string,
    updates: Partial<WorkoutSet>
  ) => void;
  completeSet: (exerciseLocalId: string, setLocalId: string) => void;
  updateSetType: (
    exerciseLocalId: string,
    setLocalId: string,
    setType: SetType
  ) => void;

  // Actions - Rest Timer
  startRestTimer: (setType: SetType) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  skipRestTimer: () => void;
  adjustRestTimer: (adjustment: number) => void;
  tickRestTimer: () => void;
  updateRestTimerSettings: (settings: Partial<RestTimerSettings>) => void;

  // Actions - Persistence
  loadActiveSession: () => Promise<void>;
  persistSession: () => Promise<void>;
  clearPersistedSession: () => Promise<void>;
  loadRestTimerSettings: () => Promise<void>;

  // Actions - Number Pad
  openNumberPad: (exerciseLocalId: string, setLocalId: string, inputType: 'weight' | 'reps') => void;
  closeNumberPad: () => void;
  updatePendingValue: (value: string) => void;
  setNumberPadError: (hasError: boolean) => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  subscribeWithSelector((set, get) => ({
    activeSession: null,
    isWorkoutActive: false,
    workoutStartTime: null,
    isWorkoutTimerPaused: false,
    pausedElapsedSeconds: 0,
    restTimer: {
      isActive: false,
      remainingSeconds: 0,
      totalSeconds: 0,
      setType: 'normal',
    },
    restTimerSettings: DEFAULT_REST_TIMER_SETTINGS,
    isLoading: false,
    activeNumberPad: null,

    // ========================================
    // Session Actions
    // ========================================

    startWorkout: (name, programWorkoutId) => {
      // Synchronous module-level check - blocks rapid clicks immediately
      if (isStartingWorkout || get().isWorkoutActive) return;
      isStartingWorkout = true;

      const session: WorkoutSession = {
        localId: generateId(),
        name: name || (() => {
          const date = new Date();
          const month = date.toLocaleDateString('en-US', { month: 'long' });
          const day = date.getDate();
          const suffix = day === 1 || day === 21 || day === 31 ? 'st'
            : day === 2 || day === 22 ? 'nd'
            : day === 3 || day === 23 ? 'rd'
            : 'th';
          return `${month} ${day}${suffix}`;
        })(),
        notes: '',
        startedAt: new Date(),
        completedAt: null,
        exercises: [],
        isSynced: false,
        ...(programWorkoutId && { programWorkoutId }),
      };

      set({
        activeSession: session,
        isWorkoutActive: true,
        workoutStartTime: Date.now(),
        isWorkoutTimerPaused: false,
        pausedElapsedSeconds: 0,
        restTimer: {
          isActive: false,
          remainingSeconds: 0,
          totalSeconds: 0,
          setType: 'normal',
        },
      });

      get().persistSession();
    },

    finishWorkout: async () => {
      const { activeSession } = get();
      if (!activeSession) return null;

      const completedSession: WorkoutSession = {
        ...activeSession,
        completedAt: new Date(),
      };

      isStartingWorkout = false; // Reset lock

      // Clear active state
      set({
        activeSession: null,
        isWorkoutActive: false,
        workoutStartTime: null,
        isWorkoutTimerPaused: false,
        pausedElapsedSeconds: 0,
        restTimer: {
          isActive: false,
          remainingSeconds: 0,
          totalSeconds: 0,
          setType: 'normal',
        },
      });

      await get().clearPersistedSession();

      return completedSession;
    },

    cancelWorkout: () => {
      isStartingWorkout = false; // Reset lock
      set({
        activeSession: null,
        isWorkoutActive: false,
        workoutStartTime: null,
        isWorkoutTimerPaused: false,
        pausedElapsedSeconds: 0,
        restTimer: {
          isActive: false,
          remainingSeconds: 0,
          totalSeconds: 0,
          setType: 'normal',
        },
      });
      get().clearPersistedSession();
    },

    updateWorkoutName: (name) => {
      const { activeSession } = get();
      if (!activeSession) return;

      set({
        activeSession: { ...activeSession, name },
      });
      get().persistSession();
    },

    updateWorkoutNotes: (notes) => {
      const { activeSession } = get();
      if (!activeSession) return;

      set({
        activeSession: { ...activeSession, notes },
      });
      get().persistSession();
    },

    pauseWorkoutTimer: () => {
      const { workoutStartTime, isWorkoutTimerPaused, pausedElapsedSeconds } = get();
      if (!workoutStartTime || isWorkoutTimerPaused) return;

      // Calculate elapsed time and store it
      const currentElapsed = Math.floor((Date.now() - workoutStartTime) / 1000) + pausedElapsedSeconds;
      set({
        isWorkoutTimerPaused: true,
        pausedElapsedSeconds: currentElapsed,
        workoutStartTime: null,
      });
    },

    resumeWorkoutTimer: () => {
      const { isWorkoutTimerPaused } = get();
      if (!isWorkoutTimerPaused) return;

      // Reset start time to now (elapsed is preserved in pausedElapsedSeconds)
      set({
        isWorkoutTimerPaused: false,
        workoutStartTime: Date.now(),
      });
    },

    toggleWorkoutTimer: () => {
      const { isWorkoutTimerPaused } = get();
      if (isWorkoutTimerPaused) {
        get().resumeWorkoutTimer();
      } else {
        get().pauseWorkoutTimer();
      }
    },

    // ========================================
    // Exercise Actions
    // ========================================

    addExercise: (exerciseId, exerciseName) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const newExercise: WorkoutExercise = {
        localId: generateId(),
        exerciseId,
        exerciseName,
        sets: [
          {
            localId: generateId(),
            setNumber: 1,
            setType: 'normal',
            weight: null,
            reps: null,
            rpe: null,
            restSeconds: null,
            notes: '',
            isCompleted: false,
            orderIndex: 0,
          },
        ],
        notes: '',
        orderIndex: activeSession.exercises.length,
      };

      set({
        activeSession: {
          ...activeSession,
          exercises: [...activeSession.exercises, newExercise],
        },
      });
      get().persistSession();
    },

    addExercises: (exercises) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const startIndex = activeSession.exercises.length;
      const newExercises: WorkoutExercise[] = exercises.map((ex, i) => ({
        localId: generateId(),
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: [
          {
            localId: generateId(),
            setNumber: 1,
            setType: 'normal',
            weight: null,
            reps: null,
            rpe: null,
            restSeconds: null,
            notes: '',
            isCompleted: false,
            orderIndex: 0,
          },
        ],
        notes: '',
        orderIndex: startIndex + i,
      }));

      set({
        activeSession: {
          ...activeSession,
          exercises: [...activeSession.exercises, ...newExercises],
        },
      });
      get().persistSession();
    },

    removeExercise: (localId) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const filtered = activeSession.exercises.filter(
        (ex) => ex.localId !== localId
      );
      // Reindex remaining exercises
      const reindexed = filtered.map((ex, i) => ({ ...ex, orderIndex: i }));

      set({
        activeSession: {
          ...activeSession,
          exercises: reindexed,
        },
      });
      get().persistSession();
    },

    reorderExercises: (fromIndex, toIndex) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const exercises = [...activeSession.exercises];
      const [removed] = exercises.splice(fromIndex, 1);
      exercises.splice(toIndex, 0, removed);

      // Reindex
      const reindexed = exercises.map((ex, i) => ({ ...ex, orderIndex: i }));

      set({
        activeSession: {
          ...activeSession,
          exercises: reindexed,
        },
      });
      get().persistSession();
    },

    updateExerciseNotes: (localId, notes) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const exercises = activeSession.exercises.map((ex) =>
        ex.localId === localId ? { ...ex, notes } : ex
      );

      set({
        activeSession: {
          ...activeSession,
          exercises,
        },
      });
      get().persistSession();
    },

    // ========================================
    // Set Actions
    // ========================================

    addSet: (exerciseLocalId) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const exercises = activeSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: WorkoutSet = {
          localId: generateId(),
          setNumber: ex.sets.length + 1,
          setType: 'normal',
          weight: null,
          reps: null,
          rpe: null,
          restSeconds: null,
          notes: '',
          isCompleted: false,
          orderIndex: ex.sets.length,
        };

        return { ...ex, sets: [...ex.sets, newSet] };
      });

      set({
        activeSession: {
          ...activeSession,
          exercises,
        },
      });
      get().persistSession();
    },

    removeSet: (exerciseLocalId, setLocalId) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const exercises = activeSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const filtered = ex.sets.filter((s) => s.localId !== setLocalId);
        // Reindex sets
        const reindexed = filtered.map((s, i) => ({
          ...s,
          setNumber: i + 1,
          orderIndex: i,
        }));

        return { ...ex, sets: reindexed };
      });

      set({
        activeSession: {
          ...activeSession,
          exercises,
        },
      });
      get().persistSession();
    },

    updateSet: (exerciseLocalId, setLocalId, updates) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const exercises = activeSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const sets = ex.sets.map((s) =>
          s.localId === setLocalId ? { ...s, ...updates } : s
        );

        return { ...ex, sets };
      });

      set({
        activeSession: {
          ...activeSession,
          exercises,
        },
      });
      get().persistSession();
    },

    completeSet: (exerciseLocalId, setLocalId) => {
      const { activeSession, restTimerSettings } = get();
      if (!activeSession) return;

      let completedSetType: SetType = 'normal';

      const exercises = activeSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const sets = ex.sets.map((s) => {
          if (s.localId !== setLocalId) return s;
          completedSetType = s.setType;
          return { ...s, isCompleted: !s.isCompleted };
        });

        return { ...ex, sets };
      });

      set({
        activeSession: {
          ...activeSession,
          exercises,
        },
      });

      // Find the set to check if it was completed (toggled on)
      const exercise = exercises.find((ex) => ex.localId === exerciseLocalId);
      const completedSet = exercise?.sets.find((s) => s.localId === setLocalId);

      // Auto-start rest timer if set was marked complete
      if (completedSet?.isCompleted) {
        get().startRestTimer(completedSetType);
      }

      get().persistSession();
    },

    updateSetType: (exerciseLocalId, setLocalId, setType) => {
      get().updateSet(exerciseLocalId, setLocalId, { setType });
    },

    // ========================================
    // Rest Timer Actions
    // ========================================

    startRestTimer: (setType) => {
      const { restTimerSettings } = get();

      let duration: number;
      switch (setType) {
        case 'warmup':
          duration = restTimerSettings.warmupSeconds;
          break;
        case 'dropset':
          duration = restTimerSettings.dropsetSeconds;
          break;
        default:
          duration = restTimerSettings.normalSeconds;
      }

      if (duration === 0) return;

      set({
        restTimer: {
          isActive: true,
          remainingSeconds: duration,
          totalSeconds: duration,
          setType,
        },
      });
    },

    pauseRestTimer: () => {
      set((state) => ({
        restTimer: {
          ...state.restTimer,
          isActive: false,
        },
      }));
    },

    resumeRestTimer: () => {
      set((state) => ({
        restTimer: {
          ...state.restTimer,
          isActive: true,
        },
      }));
    },

    skipRestTimer: () => {
      set({
        restTimer: {
          isActive: false,
          remainingSeconds: 0,
          totalSeconds: 0,
          setType: 'normal',
        },
      });
    },

    adjustRestTimer: (adjustment) => {
      set((state) => ({
        restTimer: {
          ...state.restTimer,
          remainingSeconds: Math.max(0, state.restTimer.remainingSeconds + adjustment),
        },
      }));
    },

    tickRestTimer: () => {
      const { restTimer } = get();
      if (!restTimer.isActive || restTimer.remainingSeconds <= 0) return;

      const newRemaining = restTimer.remainingSeconds - 1;

      set({
        restTimer: {
          ...restTimer,
          remainingSeconds: newRemaining,
          isActive: newRemaining > 0,
        },
      });
    },

    updateRestTimerSettings: async (settings) => {
      const { restTimerSettings } = get();
      const newSettings = { ...restTimerSettings, ...settings };

      set({ restTimerSettings: newSettings });

      try {
        await AsyncStorage.setItem(
          REST_TIMER_SETTINGS_KEY,
          JSON.stringify(newSettings)
        );
      } catch (error) {
        console.warn('Failed to save rest timer settings:', error);
      }
    },

    // ========================================
    // Persistence Actions
    // ========================================

    loadActiveSession: async () => {
      set({ isLoading: true });

      try {
        const stored = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Rehydrate dates
          const session: WorkoutSession = {
            ...parsed,
            startedAt: new Date(parsed.startedAt),
            completedAt: parsed.completedAt
              ? new Date(parsed.completedAt)
              : null,
          };

          // Only load if not completed
          if (!session.completedAt) {
            set({
              activeSession: session,
              isWorkoutActive: true,
              workoutStartTime: session.startedAt.getTime(),
            });
          }
        }
      } catch (error) {
        console.warn('Failed to load active session:', error);
      } finally {
        set({ isLoading: false });
      }
    },

    persistSession: async () => {
      const { activeSession } = get();
      if (!activeSession) return;

      try {
        await AsyncStorage.setItem(
          ACTIVE_WORKOUT_KEY,
          JSON.stringify(activeSession)
        );
      } catch (error) {
        console.warn('Failed to persist session:', error);
      }
    },

    clearPersistedSession: async () => {
      try {
        await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
      } catch (error) {
        console.warn('Failed to clear persisted session:', error);
      }
    },

    loadRestTimerSettings: async () => {
      try {
        const stored = await AsyncStorage.getItem(REST_TIMER_SETTINGS_KEY);
        if (stored) {
          const settings = JSON.parse(stored);
          set({ restTimerSettings: settings });
        }
      } catch (error) {
        console.warn('Failed to load rest timer settings:', error);
      }
    },

    // ========================================
    // Number Pad Actions
    // ========================================

    openNumberPad: (exerciseLocalId, setLocalId, inputType) => {
      // Get the current value to initialize pendingValue
      const { activeSession } = get();
      const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);
      const set_ = exercise?.sets.find(s => s.localId === setLocalId);
      const currentValue = set_?.[inputType];
      const pendingValue = currentValue !== null && currentValue !== undefined
        ? currentValue.toString()
        : '';

      set({
        activeNumberPad: { exerciseLocalId, setLocalId, inputType, pendingValue, hasError: false },
      });
    },

    closeNumberPad: () => {
      set({ activeNumberPad: null });
    },

    updatePendingValue: (value) => {
      const { activeNumberPad } = get();
      if (!activeNumberPad) return;

      set({
        activeNumberPad: { ...activeNumberPad, pendingValue: value, hasError: false },
      });
    },

    setNumberPadError: (hasError) => {
      const { activeNumberPad } = get();
      if (!activeNumberPad) return;

      set({
        activeNumberPad: { ...activeNumberPad, hasError },
      });
    },
  }))
);

// ========================================
// Helper Selectors
// ========================================

/**
 * Get workout summary statistics
 */
export const getWorkoutSummary = (session: WorkoutSession | null) => {
  if (!session) {
    return {
      totalExercises: 0,
      totalSets: 0,
      totalReps: 0,
      totalVolume: 0,
      durationSeconds: 0,
    };
  }

  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;

  session.exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      if (s.isCompleted) {
        totalSets++;
        totalReps += s.reps || 0;
        totalVolume += (s.weight || 0) * (s.reps || 0);
      }
    });
  });

  const durationSeconds = session.completedAt
    ? Math.floor(
        (session.completedAt.getTime() - session.startedAt.getTime()) / 1000
      )
    : Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

  return {
    totalExercises: session.exercises.length,
    totalSets,
    totalReps,
    totalVolume,
    durationSeconds,
  };
};

/**
 * Check if workout has incomplete sets
 */
export const hasIncompleteSets = (session: WorkoutSession | null): boolean => {
  if (!session) return false;

  return session.exercises.some((ex) =>
    ex.sets.some((s) => !s.isCompleted)
  );
};

/**
 * Get rest timer color based on remaining percentage
 * Interpolates from green (100%) -> yellow (50%) -> red (0%)
 */
export const getRestTimerColor = (
  remainingSeconds: number,
  totalSeconds: number
): string => {
  if (totalSeconds === 0) return '#b9bec7'; // Gray when inactive

  const percent = Math.min(1, remainingSeconds / totalSeconds); // Cap at 100% for added time

  if (percent > 0.5) {
    // Green to Yellow (100% to 50%)
    const t = (1 - percent) * 2;
    const r = Math.round(0 + (234 - 0) * t);
    const g = Math.round(188 + (179 - 188) * t);
    const b = Math.round(91 + (8 - 91) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Red (50% to 0%)
    const t = (0.5 - percent) * 2;
    const r = Math.round(234 + (239 - 234) * t);
    const g = Math.round(179 + (68 - 179) * t);
    const b = Math.round(8 + (68 - 8) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
};

/**
 * Get rest timer background color (20% opacity version)
 * Same interpolation as getRestTimerColor but with opacity
 */
export const getRestTimerBackgroundColor = (
  remainingSeconds: number,
  totalSeconds: number
): string => {
  if (totalSeconds === 0) return 'rgba(156, 163, 175, 0.2)'; // Gray when inactive

  const percent = Math.min(1, remainingSeconds / totalSeconds); // Cap at 100% for added time

  if (percent > 0.5) {
    // Green to Yellow (100% to 50%)
    const t = (1 - percent) * 2;
    const r = Math.round(0 + (234 - 0) * t);
    const g = Math.round(188 + (179 - 188) * t);
    const b = Math.round(91 + (8 - 91) * t);
    return `rgba(${r}, ${g}, ${b}, 0.2)`;
  } else {
    // Yellow to Red (50% to 0%)
    const t = (0.5 - percent) * 2;
    const r = Math.round(234 + (239 - 234) * t);
    const g = Math.round(179 + (68 - 179) * t);
    const b = Math.round(8 + (68 - 8) * t);
    return `rgba(${r}, ${g}, ${b}, 0.2)`;
  }
};
