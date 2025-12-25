/**
 * Workout Store (Zustand)
 *
 * Central state management for active workout sessions.
 * Handles offline-first persistence to AsyncStorage.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getScopedItem, setScopedItem, removeScopedItem } from '@/src/utils/scopedStorage';
import {
  WorkoutSession,
  WorkoutExercise,
  WorkoutSet,
  SetType,
  RestTimerState,
  RestTimerSettings,
  DEFAULT_REST_TIMER_SETTINGS,
  WeightUnit,
  RpeValue,
} from '../types/workout';
import {
  ACTIVE_WORKOUT_KEY,
  COMPLETED_WORKOUTS_KEY,
  REST_TIMER_SETTINGS_KEY,
  EXERCISE_STICKY_NOTES_KEY,
  EXERCISE_WEIGHT_UNITS_KEY,
  BODY_TYPE_KEY,
} from '../constants/storageKeys';
import { syncWorkoutSession } from '../services/workoutHistoryService';
import {
  syncStickyNote,
  deleteStickyNoteFromCloud,
  fetchStickyNotesFromCloud,
} from '../services/stickyNotesService';
import { isCustomExercise } from '../services/exerciseService';

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

const loadProgramsStore = async () => {
  try {
    return await import('./programsStore');
  } catch {
    return require('./programsStore');
  }
};

const loadProgramProgressStore = async () => {
  try {
    return await import('./programProgressStore');
  } catch {
    return require('./programProgressStore');
  }
};

interface WorkoutState {
  // Active session
  activeSession: WorkoutSession | null;
  isWorkoutActive: boolean;

  // Completed sessions history
  completedSessions: WorkoutSession[];

  // Timers
  workoutStartTime: number | null;
  isWorkoutTimerPaused: boolean;
  pausedElapsedSeconds: number;
  restTimer: RestTimerState;
  restTimerSettings: RestTimerSettings;

  // UI state
  isLoading: boolean;
  showRestTimerComplete: boolean;

  // Number pad state
  activeNumberPad: {
    exerciseLocalId: string;
    setLocalId: string;
    inputType: 'weight' | 'reps';
    pendingValue: string;
    hasError: boolean;
  } | null;

  // Sticky notes (persist across sessions, keyed by exerciseId)
  stickyNotes: Record<string, string>;

  // Weight units (persist across sessions, keyed by exerciseId)
  weightUnits: Record<string, WeightUnit>;

  // Body type preference for muscle heatmap
  bodyType: 'male' | 'female';

  // RPE selector state
  showRpeSelector: boolean;
  showRpeHelp: boolean;

  // Backdated workout date (for logging past workouts)
  backdatedDate: Date | null;

  // Editor session (for template creation and manual workout logging)
  editorSession: WorkoutSession | null;
  editorMode: 'template' | 'log';
  editorDate: Date;

  // Actions - Session
  startWorkout: (name?: string, programWorkoutId?: string, backdateToDate?: Date) => void;
  startWorkoutFromTemplate: (templateId: string) => Promise<boolean>;
  startWorkoutFromProgram: (programId: string, programWorkoutId: string) => Promise<boolean>;
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
  replaceExercise: (localId: string, newExerciseId: string, newExerciseName: string) => void;
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
  dismissRestTimerComplete: () => void;

  // Actions - Persistence
  loadActiveSession: () => Promise<void>;
  persistSession: () => Promise<void>;
  clearPersistedSession: () => Promise<void>;
  loadRestTimerSettings: () => Promise<void>;
  loadCompletedSessions: () => Promise<void>;
  importCompletedSessions: (
    sessions: WorkoutSession[]
  ) => Promise<{ imported: number; skipped: number; skippedSync: number }>;
  resetStore: () => void;

  // Actions - Sticky Notes
  setStickyNote: (exerciseId: string, note: string) => Promise<void>;
  deleteStickyNote: (exerciseId: string) => Promise<void>;
  loadStickyNotes: () => Promise<void>;

  // Actions - Weight Units
  setWeightUnit: (exerciseId: string, unit: WeightUnit) => Promise<void>;
  toggleWeightUnit: (exerciseId: string) => Promise<void>;
  loadWeightUnits: () => Promise<void>;

  // Actions - Body Type
  setBodyType: (type: 'male' | 'female') => Promise<void>;
  loadBodyType: () => Promise<void>;

  // Actions - Number Pad
  openNumberPad: (exerciseLocalId: string, setLocalId: string, inputType: 'weight' | 'reps') => void;
  closeNumberPad: () => void;
  updatePendingValue: (value: string) => void;
  setNumberPadError: (hasError: boolean) => void;

  // Actions - RPE Selector
  openRpeSelector: () => void;
  closeRpeSelector: () => void;
  selectRpe: (rpe: RpeValue) => void;
  openRpeHelp: () => void;
  closeRpeHelp: () => void;

  // Actions - Editor Session
  initEditorSession: () => void;
  initEditorSessionFromTemplate: (templateId: string) => Promise<boolean>;
  setEditorMode: (mode: 'template' | 'log') => void;
  setEditorDate: (date: Date) => void;
  setEditorWorkoutName: (name: string) => void;
  addEditorExercises: (exercises: Array<{ id: string; name: string }>) => void;
  removeEditorExercise: (localId: string) => void;
  addEditorSet: (exerciseLocalId: string) => void;
  removeEditorSet: (exerciseLocalId: string, setLocalId: string) => void;
  updateEditorSet: (
    exerciseLocalId: string,
    setLocalId: string,
    updates: Partial<WorkoutSet>
  ) => void;
  completeEditorSet: (exerciseLocalId: string, setLocalId: string) => void;
  updateEditorSetType: (
    exerciseLocalId: string,
    setLocalId: string,
    setType: SetType
  ) => void;
  openEditorNumberPad: (exerciseLocalId: string, setLocalId: string, inputType: 'weight' | 'reps') => void;
  updateEditorExerciseNotes: (localId: string, notes: string) => void;
  saveEditorAsTemplate: (templateId?: string) => Promise<string | null>;
  saveEditorAsWorkout: () => Promise<void>;
  clearEditorSession: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  subscribeWithSelector((set, get) => ({
    activeSession: null,
    isWorkoutActive: false,
    completedSessions: [],
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
    showRestTimerComplete: false,
    activeNumberPad: null,
    stickyNotes: {},
    weightUnits: {},
    bodyType: 'male',
    showRpeSelector: false,
    showRpeHelp: false,
    backdatedDate: null,
    editorSession: null,
    editorMode: 'template',
    editorDate: new Date(),

    // ========================================
    // Session Actions
    // ========================================

    startWorkout: (name, programWorkoutId, backdateToDate) => {
      // Synchronous module-level check - blocks rapid clicks immediately
      if (isStartingWorkout || get().isWorkoutActive) return;
      isStartingWorkout = true;

      const workoutDate = backdateToDate || new Date();
      const session: WorkoutSession = {
        localId: generateId(),
        name: name || (() => {
          const month = workoutDate.toLocaleDateString('en-US', { month: 'long' });
          const day = workoutDate.getDate();
          const suffix = day === 1 || day === 21 || day === 31 ? 'st'
            : day === 2 || day === 22 ? 'nd'
            : day === 3 || day === 23 ? 'rd'
            : 'th';
          return `${month} ${day}${suffix}`;
        })(),
        notes: '',
        startedAt: workoutDate,
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
        backdatedDate: backdateToDate || null,
        restTimer: {
          isActive: false,
          remainingSeconds: 0,
          totalSeconds: 0,
          setType: 'normal',
        },
      });

      get().persistSession();
    },

    startWorkoutFromTemplate: async (templateId: string) => {
      // Prevent starting if already active
      if (isStartingWorkout || get().isWorkoutActive) return false;
      isStartingWorkout = true;

      try {
        const { useProgramsStore } = await loadProgramsStore();
        const programs = useProgramsStore.getState().programs;

        // Find the template by program ID or workout ID
        const template = programs.find(p => p.isTemplate && p.id === templateId)
          || programs.find(p => p.isTemplate && p.workouts.some(w => w.id === templateId));

        const workout = template?.workouts.find(w => w.id === templateId) || template?.workouts[0];
        if (!template || !workout) {
          isStartingWorkout = false;
          return false;
        }

        // Create exercises with pre-filled sets from template
        const exercises: WorkoutExercise[] = workout.exercises.map((templateEx, exIndex) => {
          // Create sets based on template's setDetails or default empty sets
          const sets: WorkoutSet[] = [];
          const numSets = templateEx.setDetails?.length || templateEx.sets;

          for (let i = 0; i < numSets; i++) {
            const setDetail = templateEx.setDetails?.[i];
            sets.push({
              localId: generateId(),
              setNumber: i + 1,
              setType: 'normal',
              weight: setDetail?.weight ?? null,
              reps: setDetail?.reps ?? null,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: false,
              orderIndex: i,
            });
          }

          return {
            localId: generateId(),
            exerciseId: templateEx.exerciseId,
            exerciseName: templateEx.exerciseName,
            sets,
            notes: templateEx.notes || '',
            orderIndex: exIndex,
          };
        });

        // Create session with pre-filled exercises
        const session: WorkoutSession = {
          localId: generateId(),
          name: template.name,
          notes: '',
          startedAt: new Date(),
          completedAt: null,
          exercises,
          isSynced: false,
          programId: template.id,
          originalExerciseIds: exercises.map(ex => ex.exerciseId),
          originalSetCounts: exercises.map(ex => ex.sets.length),
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

        // Update last performed timestamp on template
        useProgramsStore.getState().updateLastPerformed(template.id);

        return true;
      } catch (error) {
        console.error('Failed to start workout from template:', error);
        isStartingWorkout = false;
        return false;
      }
    },

    startWorkoutFromProgram: async (programId: string, programWorkoutId: string) => {
      if (isStartingWorkout || get().isWorkoutActive) return false;
      isStartingWorkout = true;

      try {
        const { useProgramsStore } = await loadProgramsStore();
        const programs = useProgramsStore.getState().programs;

        const program = programs.find((p) => p.id === programId && !p.isTemplate);
        const workout = program?.workouts.find((w) => w.id === programWorkoutId);

        if (!program || !workout) {
          isStartingWorkout = false;
          return false;
        }

        const { useProgramProgressStore } = await loadProgramProgressStore();
        useProgramProgressStore.getState().startProgram(programId);

        const exercises: WorkoutExercise[] = workout.exercises.map((programEx, exIndex) => {
          const sets: WorkoutSet[] = [];
          const numSets = programEx.sets;

          for (let i = 0; i < numSets; i++) {
            sets.push({
              localId: generateId(),
              setNumber: i + 1,
              setType: 'normal',
              weight: null,
              reps: null,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: false,
              orderIndex: i,
            });
          }

          return {
            localId: generateId(),
            exerciseId: programEx.exerciseId,
            exerciseName: programEx.exerciseName,
            sets,
            notes: programEx.notes || '',
            orderIndex: exIndex,
          };
        });

        const session: WorkoutSession = {
          localId: generateId(),
          name: workout.name,
          programName: program.name,
          notes: '',
          startedAt: new Date(),
          completedAt: null,
          exercises,
          isSynced: false,
          programId,
          programWorkoutId,
          originalExerciseIds: exercises.map((ex) => ex.exerciseId),
          originalSetCounts: exercises.map((ex) => ex.sets.length),
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
        useProgramsStore.getState().updateLastPerformed(programId);

        return true;
      } catch (error) {
        console.error('Failed to start workout from program:', error);
        isStartingWorkout = false;
        return false;
      }
    },

    finishWorkout: async () => {
      const { activeSession, completedSessions, backdatedDate } = get();
      if (!activeSession) return null;

      const completedSession: WorkoutSession = {
        ...activeSession,
        completedAt: backdatedDate || new Date(),
      };

      isStartingWorkout = false; // Reset lock

      // Add to completed sessions history
      const updatedSessions = [completedSession, ...completedSessions];

      // Clear active state and update completed sessions
      set({
        activeSession: null,
        isWorkoutActive: false,
        completedSessions: updatedSessions,
        workoutStartTime: null,
        isWorkoutTimerPaused: false,
        pausedElapsedSeconds: 0,
        backdatedDate: null,
        restTimer: {
          isActive: false,
          remainingSeconds: 0,
          totalSeconds: 0,
          setType: 'normal',
        },
      });

      // Persist completed sessions to AsyncStorage
      try {
        await setScopedItem(
          COMPLETED_WORKOUTS_KEY,
          JSON.stringify(updatedSessions)
        );
      } catch (error) {
        console.warn('Failed to persist completed sessions:', error);
      }

      await get().clearPersistedSession();

      if (completedSession.programId && completedSession.programWorkoutId) {
        try {
          const { useProgramsStore } = await loadProgramsStore();
          const { useProgramProgressStore } = await loadProgramProgressStore();
          const program = useProgramsStore
            .getState()
            .programs.find((p) => p.id === completedSession.programId && !p.isTemplate);
          const workout = program?.workouts.find((w) => w.id === completedSession.programWorkoutId);

          if (program && workout) {
            useProgramProgressStore
              .getState()
              .markWorkoutComplete(
                program.id,
                workout.dayNumber,
                program.workouts.length,
                completedSession.completedAt?.toISOString()
              );
            useProgramsStore.getState().updateLastPerformed(program.id);
          }
        } catch (error) {
          console.warn('Failed to update program progress:', error);
        }
      }

      // Sync to Supabase (async, non-blocking)
      // If offline or not authenticated, it will be queued for later
      syncWorkoutSession(completedSession).catch(error => {
        console.warn('Failed to sync workout session:', error);
      });

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
        backdatedDate: null,
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

    replaceExercise: (localId, newExerciseId, newExerciseName) => {
      const { activeSession } = get();
      if (!activeSession) return;

      const exercises = activeSession.exercises.map((ex) => {
        if (ex.localId !== localId) return ex;

        // Replace with new exercise, reset sets to single empty set
        return {
          ...ex,
          exerciseId: newExerciseId,
          exerciseName: newExerciseName,
          sets: [
            {
              localId: generateId(),
              setNumber: 1,
              setType: 'normal' as const,
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
        };
      });

      set({
        activeSession: {
          ...activeSession,
          exercises,
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
      const timerComplete = newRemaining <= 0;

      set({
        restTimer: {
          ...restTimer,
          remainingSeconds: newRemaining,
          isActive: !timerComplete,
        },
        // Show the "Time's Up" modal when timer completes
        ...(timerComplete && { showRestTimerComplete: true }),
      });
    },

    updateRestTimerSettings: async (settings) => {
      const { restTimerSettings } = get();
      const newSettings = { ...restTimerSettings, ...settings };

      set({ restTimerSettings: newSettings });

      try {
        await setScopedItem(
          REST_TIMER_SETTINGS_KEY,
          JSON.stringify(newSettings)
        );
      } catch (error) {
        console.warn('Failed to save rest timer settings:', error);
      }
    },

    dismissRestTimerComplete: () => {
      set({ showRestTimerComplete: false });
    },

    // ========================================
    // Persistence Actions
    // ========================================

    loadActiveSession: async () => {
      set({ isLoading: true });

      try {
        const stored = await getScopedItem(ACTIVE_WORKOUT_KEY);
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
        await setScopedItem(
          ACTIVE_WORKOUT_KEY,
          JSON.stringify(activeSession)
        );
      } catch (error) {
        console.warn('Failed to persist session:', error);
      }
    },

    clearPersistedSession: async () => {
      try {
        await removeScopedItem(ACTIVE_WORKOUT_KEY);
      } catch (error) {
        console.warn('Failed to clear persisted session:', error);
      }
    },

    loadRestTimerSettings: async () => {
      try {
        const stored = await getScopedItem(REST_TIMER_SETTINGS_KEY);
        if (stored) {
          const settings = JSON.parse(stored);
          set({ restTimerSettings: settings });
        }
      } catch (error) {
        console.warn('Failed to load rest timer settings:', error);
      }
    },

    loadCompletedSessions: async () => {
      try {
        const stored = await getScopedItem(COMPLETED_WORKOUTS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Rehydrate dates for each session
          const sessions: WorkoutSession[] = parsed.map((session: WorkoutSession) => ({
            ...session,
            startedAt: new Date(session.startedAt),
            completedAt: session.completedAt ? new Date(session.completedAt) : null,
          }));
          set({ completedSessions: sessions });
        }
      } catch (error) {
        console.warn('Failed to load completed sessions:', error);
      }
    },

    importCompletedSessions: async (sessions) => {
      if (sessions.length === 0) {
        return { imported: 0, skipped: 0, skippedSync: 0 };
      }

      const { completedSessions } = get();
      const existingIds = new Set(completedSessions.map((session) => session.localId));
      const newSessions = sessions.filter((session) => !existingIds.has(session.localId));
      const skipped = sessions.length - newSessions.length;

      if (newSessions.length === 0) {
        return { imported: 0, skipped, skippedSync: 0 };
      }

      const updatedSessions = [...newSessions, ...completedSessions].sort(
        (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
      );

      set({ completedSessions: updatedSessions });

      try {
        await setScopedItem(COMPLETED_WORKOUTS_KEY, JSON.stringify(updatedSessions));
      } catch (error) {
        console.warn('Failed to persist imported sessions:', error);
      }

      let skippedSync = 0;

      newSessions.forEach((session) => {
        const hasCustomExercise = session.exercises.some((exercise) =>
          isCustomExercise(exercise.exerciseId)
        );
        if (hasCustomExercise) {
          skippedSync += 1;
          return;
        }
        syncWorkoutSession(session).catch((error) => {
          console.warn('Failed to sync imported workout session:', error);
        });
      });

      return { imported: newSessions.length, skipped, skippedSync };
    },

    // ========================================
    // Sticky Notes Actions
    // ========================================

    setStickyNote: async (exerciseId, note) => {
      const { stickyNotes } = get();
      const trimmedNote = note.trim();

      let newNotes: Record<string, string>;
      if (trimmedNote === '') {
        // Remove empty notes
        const { [exerciseId]: _, ...rest } = stickyNotes;
        newNotes = rest;
        // Also delete from cloud
        deleteStickyNoteFromCloud(exerciseId).catch((err) => {
          console.warn('Failed to delete sticky note from cloud:', err);
        });
      } else {
        newNotes = { ...stickyNotes, [exerciseId]: trimmedNote };
        // Sync to cloud in background
        syncStickyNote(exerciseId, trimmedNote).catch((err) => {
          console.warn('Failed to sync sticky note to cloud:', err);
        });
      }

      set({ stickyNotes: newNotes });

      try {
        await setScopedItem(
          EXERCISE_STICKY_NOTES_KEY,
          JSON.stringify(newNotes)
        );
      } catch (error) {
        console.warn('Failed to save sticky notes:', error);
      }
    },

    deleteStickyNote: async (exerciseId) => {
      const { stickyNotes } = get();
      const { [exerciseId]: _, ...newNotes } = stickyNotes;

      set({ stickyNotes: newNotes });

      // Delete from cloud in background
      deleteStickyNoteFromCloud(exerciseId).catch((err) => {
        console.warn('Failed to delete sticky note from cloud:', err);
      });

      try {
        await setScopedItem(
          EXERCISE_STICKY_NOTES_KEY,
          JSON.stringify(newNotes)
        );
      } catch (error) {
        console.warn('Failed to save sticky notes:', error);
      }
    },

    loadStickyNotes: async () => {
      try {
        // Load local notes first (fast)
        const stored = await getScopedItem(EXERCISE_STICKY_NOTES_KEY);
        const localNotes = stored ? JSON.parse(stored) : {};
        set({ stickyNotes: localNotes });

        // Fetch cloud notes and merge (cloud is source of truth for UUID exercises)
        const cloudNotes = await fetchStickyNotesFromCloud();
        if (Object.keys(cloudNotes).length > 0) {
          // Merge: cloud notes override local for same exerciseId
          // Local notes for non-UUID exercises are preserved
          const mergedNotes = { ...localNotes, ...cloudNotes };
          set({ stickyNotes: mergedNotes });

          // Persist merged notes locally
          await setScopedItem(
            EXERCISE_STICKY_NOTES_KEY,
            JSON.stringify(mergedNotes)
          );
        }
      } catch (error) {
        console.warn('Failed to load sticky notes:', error);
      }
    },

    // ========================================
    // Weight Units Actions
    // ========================================

    setWeightUnit: async (exerciseId, unit) => {
      const { weightUnits } = get();
      const newUnits = { ...weightUnits, [exerciseId]: unit };

      set({ weightUnits: newUnits });

      try {
        await setScopedItem(
          EXERCISE_WEIGHT_UNITS_KEY,
          JSON.stringify(newUnits)
        );
      } catch (error) {
        console.warn('Failed to save weight units:', error);
      }
    },

    toggleWeightUnit: async (exerciseId) => {
      const { weightUnits, activeSession } = get();
      const currentUnit = weightUnits[exerciseId] || 'lbs';
      const newUnit: WeightUnit = currentUnit === 'lbs' ? 'kg' : 'lbs';

      // Convert weight values for all sets of this exercise in active session
      if (activeSession) {
        const exercises = activeSession.exercises.map((ex) => {
          if (ex.exerciseId !== exerciseId) return ex;

          const sets = ex.sets.map((s) => {
            if (s.weight === null) return s;

            // Convert weight value
            let convertedWeight: number;
            if (currentUnit === 'lbs') {
              // lbs to kg
              convertedWeight = s.weight * 0.453592;
            } else {
              // kg to lbs
              convertedWeight = s.weight / 0.453592;
            }

            // Round to 1 decimal place
            convertedWeight = Math.round(convertedWeight * 10) / 10;

            return { ...s, weight: convertedWeight };
          });

          return { ...ex, sets };
        });

        set({
          activeSession: {
            ...activeSession,
            exercises,
          },
        });

        // Persist the updated session
        get().persistSession();
      }

      await get().setWeightUnit(exerciseId, newUnit);
    },

    loadWeightUnits: async () => {
      try {
        const stored = await getScopedItem(EXERCISE_WEIGHT_UNITS_KEY);
        if (stored) {
          const units = JSON.parse(stored);
          set({ weightUnits: units });
        }
      } catch (error) {
        console.warn('Failed to load weight units:', error);
      }
    },

    // ========================================
    // Body Type Actions
    // ========================================

    setBodyType: async (type) => {
      set({ bodyType: type });

      try {
        await setScopedItem(BODY_TYPE_KEY, type);
      } catch (error) {
        console.warn('Failed to save body type:', error);
      }
    },

    loadBodyType: async () => {
      try {
        const stored = await getScopedItem(BODY_TYPE_KEY);
        if (stored === 'male' || stored === 'female') {
          set({ bodyType: stored });
        }
      } catch (error) {
        console.warn('Failed to load body type:', error);
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

    // ========================================
    // RPE Selector Actions
    // ========================================

    openRpeSelector: () => {
      set({ showRpeSelector: true });
    },

    closeRpeSelector: () => {
      set({ showRpeSelector: false });
    },

    selectRpe: (rpe) => {
      const { activeNumberPad, activeSession } = get();
      if (!activeNumberPad || !activeSession) return;

      const { exerciseLocalId, setLocalId } = activeNumberPad;

      // Update the set's RPE value
      const exercises = activeSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const sets = ex.sets.map((s) =>
          s.localId === setLocalId ? { ...s, rpe } : s
        );

        return { ...ex, sets };
      });

      set({
        activeSession: { ...activeSession, exercises },
      });

      get().persistSession();
    },

    openRpeHelp: () => {
      set({ showRpeHelp: true });
    },

    closeRpeHelp: () => {
      set({ showRpeHelp: false });
    },

    // ========================================
    // Editor Session Actions
    // ========================================

    initEditorSession: () => {
      const session: WorkoutSession = {
        localId: generateId(),
        name: '',
        notes: '',
        startedAt: new Date(),
        completedAt: null,
        exercises: [],
        isSynced: false,
      };

      set({
        editorSession: session,
        editorDate: new Date(),
        activeNumberPad: null,
      });
    },

    initEditorSessionFromTemplate: async (templateId) => {
      try {
        const { useProgramsStore } = await loadProgramsStore();
        const programs = useProgramsStore.getState().programs;

        const template = programs.find(p => p.id === templateId && p.isTemplate);
        if (!template || !template.workouts[0]) {
          get().initEditorSession();
          return false;
        }

        const workout = template.workouts[0];
        const sortedExercises = [...workout.exercises].sort(
          (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
        );

        const exercises: WorkoutExercise[] = sortedExercises.map((templateEx, exIndex) => {
          const numSets = Math.max(1, templateEx.setDetails?.length ?? templateEx.sets ?? 1);
          const sets: WorkoutSet[] = [];

          for (let i = 0; i < numSets; i++) {
            const setDetail = templateEx.setDetails?.[i];
            sets.push({
              localId: generateId(),
              setNumber: i + 1,
              setType: 'normal',
              weight: setDetail?.weight ?? null,
              reps: setDetail?.reps ?? null,
              rpe: null,
              restSeconds: null,
              notes: '',
              isCompleted: false,
              orderIndex: i,
            });
          }

          return {
            localId: generateId(),
            exerciseId: templateEx.exerciseId,
            exerciseName: templateEx.exerciseName,
            sets,
            notes: templateEx.notes || '',
            orderIndex: exIndex,
          };
        });

        const session: WorkoutSession = {
          localId: generateId(),
          name: template.name,
          notes: '',
          startedAt: new Date(),
          completedAt: null,
          exercises,
          isSynced: false,
        };

        set({
          editorSession: session,
          editorDate: new Date(),
          editorMode: 'template',
          activeNumberPad: null,
        });

        return true;
      } catch (error) {
        console.error('Failed to init editor session from template:', error);
        get().initEditorSession();
        return false;
      }
    },

    setEditorMode: (mode) => {
      set({ editorMode: mode });
    },

    setEditorDate: (date) => {
      set({ editorDate: date });
    },

    setEditorWorkoutName: (name) => {
      let { editorSession } = get();

      // Auto-initialize session if it doesn't exist (handles race condition)
      if (!editorSession) {
        editorSession = {
          localId: generateId(),
          name: '',
          notes: '',
          startedAt: new Date(),
          completedAt: null,
          exercises: [],
          isSynced: false,
        };
      }

      set({
        editorSession: { ...editorSession, name },
      });
    },

    addEditorExercises: (exercises) => {
      const { editorSession } = get();
      if (!editorSession) return;

      const startIndex = editorSession.exercises.length;
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
        editorSession: {
          ...editorSession,
          exercises: [...editorSession.exercises, ...newExercises],
        },
      });
    },

    removeEditorExercise: (localId) => {
      const { editorSession } = get();
      if (!editorSession) return;

      const filtered = editorSession.exercises.filter(
        (ex) => ex.localId !== localId
      );
      const reindexed = filtered.map((ex, i) => ({ ...ex, orderIndex: i }));

      set({
        editorSession: {
          ...editorSession,
          exercises: reindexed,
        },
      });
    },

    addEditorSet: (exerciseLocalId) => {
      const { editorSession } = get();
      if (!editorSession) return;

      const exercises = editorSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

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
        editorSession: {
          ...editorSession,
          exercises,
        },
      });
    },

    removeEditorSet: (exerciseLocalId, setLocalId) => {
      const { editorSession } = get();
      if (!editorSession) return;

      const exercises = editorSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const filtered = ex.sets.filter((s) => s.localId !== setLocalId);
        const reindexed = filtered.map((s, i) => ({
          ...s,
          setNumber: i + 1,
          orderIndex: i,
        }));

        return { ...ex, sets: reindexed };
      });

      set({
        editorSession: {
          ...editorSession,
          exercises,
        },
      });
    },

    updateEditorSet: (exerciseLocalId, setLocalId, updates) => {
      const { editorSession } = get();
      if (!editorSession) return;

      const exercises = editorSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const sets = ex.sets.map((s) =>
          s.localId === setLocalId ? { ...s, ...updates } : s
        );

        return { ...ex, sets };
      });

      set({
        editorSession: {
          ...editorSession,
          exercises,
        },
      });
    },

    completeEditorSet: (exerciseLocalId, setLocalId) => {
      const { editorSession } = get();
      if (!editorSession) return;

      const exercises = editorSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const sets = ex.sets.map((s) => {
          if (s.localId !== setLocalId) return s;
          return { ...s, isCompleted: !s.isCompleted };
        });

        return { ...ex, sets };
      });

      set({
        editorSession: {
          ...editorSession,
          exercises,
        },
      });
    },

    updateEditorSetType: (exerciseLocalId, setLocalId, setType) => {
      get().updateEditorSet(exerciseLocalId, setLocalId, { setType });
    },

    openEditorNumberPad: (exerciseLocalId, setLocalId, inputType) => {
      const { editorSession } = get();
      const exercise = editorSession?.exercises.find(e => e.localId === exerciseLocalId);
      const set_ = exercise?.sets.find(s => s.localId === setLocalId);
      const currentValue = set_?.[inputType];
      const pendingValue = currentValue !== null && currentValue !== undefined
        ? currentValue.toString()
        : '';

      set({
        activeNumberPad: { exerciseLocalId, setLocalId, inputType, pendingValue, hasError: false },
      });
    },

    updateEditorExerciseNotes: (localId, notes) => {
      const { editorSession } = get();
      if (!editorSession) return;

      const exercises = editorSession.exercises.map((ex) =>
        ex.localId === localId ? { ...ex, notes } : ex
      );

      set({
        editorSession: {
          ...editorSession,
          exercises,
        },
      });
    },

    saveEditorAsTemplate: async (templateId) => {
      const { editorSession } = get();
      if (!editorSession || !editorSession.name.trim()) return null;

      const { useProgramsStore } = await loadProgramsStore();
      const { createWorkoutTemplate, updateWorkoutTemplate } = useProgramsStore.getState();

      const exercisesToSave = editorSession.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: ex.sets.length,
        reps: '8-12', // Default rep range for templates
        restSeconds: 120,
        // Include full set details (weight, reps for each set)
        setDetails: ex.sets.map(set => ({
          weight: set.weight,
          reps: set.reps,
        })),
      }));

      if (templateId) {
        const updatedId = await updateWorkoutTemplate(
          templateId,
          editorSession.name.trim(),
          exercisesToSave
        );
        return updatedId;
      }

      const newTemplateId = await createWorkoutTemplate(editorSession.name.trim(), exercisesToSave);
      return newTemplateId;
    },

    saveEditorAsWorkout: async () => {
      const { editorSession, editorDate, completedSessions } = get();
      if (!editorSession) return;

      // Auto-complete sets that have both weight and reps (for logged workouts)
      const exercisesWithCompletedSets = editorSession.exercises.map(exercise => ({
        ...exercise,
        sets: exercise.sets.map(set => ({
          ...set,
          // Mark as completed if it has both weight and reps
          isCompleted: set.weight !== null && set.reps !== null ? true : set.isCompleted,
        })),
      }));

      // Create completed session with backdated timestamps
      const completedSession: WorkoutSession = {
        ...editorSession,
        exercises: exercisesWithCompletedSets,
        name: editorSession.name || (() => {
          const date = editorDate;
          const month = date.toLocaleDateString('en-US', { month: 'long' });
          const day = date.getDate();
          const suffix = day === 1 || day === 21 || day === 31 ? 'st'
            : day === 2 || day === 22 ? 'nd'
            : day === 3 || day === 23 ? 'rd'
            : 'th';
          return `${month} ${day}${suffix}`;
        })(),
        startedAt: editorDate,
        completedAt: editorDate,
        isSynced: false,
      };

      // Add to completed sessions history
      const updatedSessions = [completedSession, ...completedSessions];

      set({
        completedSessions: updatedSessions,
      });

      // Persist completed sessions to AsyncStorage
      try {
        await setScopedItem(
          COMPLETED_WORKOUTS_KEY,
          JSON.stringify(updatedSessions)
        );
      } catch (error) {
        console.warn('Failed to persist completed sessions:', error);
      }

      // Sync to Supabase (async, non-blocking)
      syncWorkoutSession(completedSession).catch(error => {
        console.warn('Failed to sync workout session:', error);
      });
    },

    clearEditorSession: () => {
      set({
        editorSession: null,
        editorMode: 'template',
        editorDate: new Date(),
      });
    },

    resetStore: () => {
      isStartingWorkout = false;
      set({
        activeSession: null,
        isWorkoutActive: false,
        completedSessions: [],
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
        showRestTimerComplete: false,
        activeNumberPad: null,
        stickyNotes: {},
        weightUnits: {},
        bodyType: 'male',
        showRpeSelector: false,
        showRpeHelp: false,
        backdatedDate: null,
        editorSession: null,
        editorMode: 'template',
        editorDate: new Date(),
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
 * Check if workout has template modifications (for showing "Save as Template" button)
 * Returns true if: blank workout OR template workout with exercise changes
 */
export const hasTemplateModifications = (session: WorkoutSession | null): boolean => {
  if (!session) return false;

  // Blank workout - always show save option
  if (!session.programId || !session.originalExerciseIds) {
    return true;
  }

  // Get current exercise IDs
  const currentIds = session.exercises.map(ex => ex.exerciseId);
  const originalIds = session.originalExerciseIds;

  // Check if exercise count differs (additions or removals)
  if (currentIds.length !== originalIds.length) return true;

  // Check if any exercise was replaced (same count but different IDs)
  const hasChanges = currentIds.some((id, index) => id !== originalIds[index]);
  if (hasChanges) return true;

  // Check if any set count changed for an exercise
  if (session.originalSetCounts && session.originalSetCounts.length === session.exercises.length) {
    const hasSetChanges = session.exercises.some(
      (ex, index) => ex.sets.length !== session.originalSetCounts![index]
    );
    if (hasSetChanges) return true;
  }

  return false;
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
