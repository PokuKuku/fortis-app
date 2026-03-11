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
import { WorkoutVoiceInterpretation } from '../types/workoutVoice';
import {
  ACTIVE_WORKOUT_KEY,
  COMPLETED_WORKOUTS_KEY,
  REST_TIMER_SETTINGS_KEY,
  EXERCISE_STICKY_NOTES_KEY,
  EXERCISE_WEIGHT_UNITS_KEY,
  BODY_TYPE_KEY,
} from '../constants/storageKeys';
import { syncWorkoutSession, resyncMissingSets } from '../services/workoutHistoryService';
import {
  syncStickyNote,
  deleteStickyNoteFromCloud,
  fetchStickyNotesFromCloud,
} from '../services/stickyNotesService';
import { isCustomExercise } from '../services/exerciseService';
import { generateSecureUUID as generateId } from '../utils/uuid';
import { getSessionVolume, type VolumeContext } from '../utils/workoutVolume';

// Module-level lock to prevent rapid double-clicks from creating multiple sessions
let isStartingWorkout = false;

/**
 * Helper to get the set type from the most recent matching workout history.
 * Used to inherit set types when creating new sets.
 */
function getSetTypeFromHistory(
  completedSessions: WorkoutSession[],
  exerciseId: string,
  setIndex: number,
  context?: { programWorkoutId?: string; programId?: string; workoutName?: string }
): SetType {
  // Find the most recent matching session
  const isMatchingWorkout = (session: WorkoutSession) => {
    if (context?.programWorkoutId) {
      return session.programWorkoutId === context.programWorkoutId;
    }
    if (context?.programId) {
      return session.programId === context.programId;
    }
    if (context?.workoutName) {
      return session.name === context.workoutName;
    }
    return true;
  };

  let latestExercise: WorkoutExercise | null = null;
  let latestTimestamp = -1;

  completedSessions.forEach((session) => {
    if (!isMatchingWorkout(session)) return;
    const exercise = session.exercises.find((ex) => ex.exerciseId === exerciseId);
    if (!exercise) return;

    const timestamp = (session.completedAt ?? session.startedAt).getTime();
    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
      latestExercise = exercise;
    }
  });

  if (!latestExercise) return 'normal';

  // Get the set at the same index if it exists
  // Type assertion needed due to TypeScript narrowing limitation with forEach closures
  const exercise = latestExercise as WorkoutExercise;
  const orderedSets = [...exercise.sets].sort((a, b) => a.orderIndex - b.orderIndex);
  const previousSet = orderedSets[setIndex];

  return previousSet?.setType || 'normal';
}

function buildNewActiveSet(
  exercise: WorkoutExercise,
  activeSession: WorkoutSession,
  weightUnits: Record<string, WeightUnit>,
  completedSessions: WorkoutSession[],
  setIndex: number
): WorkoutSet {
  const context = {
    programWorkoutId: activeSession.programWorkoutId,
    programId: activeSession.programId,
    workoutName: activeSession.name,
  };

  const inheritedSetType = getSetTypeFromHistory(
    completedSessions,
    exercise.exerciseId,
    setIndex,
    context
  );

  return {
    localId: generateId(),
    setNumber: setIndex + 1,
    setType: inheritedSetType,
    weight: null,
    weightUnit: weightUnits[exercise.exerciseId] || 'lbs',
    reps: null,
    rpe: null,
    restSeconds: null,
    notes: '',
    isCompleted: false,
    orderIndex: setIndex,
  };
}

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
  syncingSessionIds: string[];

  // Timers
  workoutStartTime: number | null;
  isWorkoutTimerPaused: boolean;
  pausedElapsedSeconds: number;
  restTimer: RestTimerState;
  restTimerSettings: RestTimerSettings;
  restTimerNextStartSeconds: number | null;

  // UI state
  isLoading: boolean;
  showRestTimerComplete: boolean;
  workoutOverlayCount: number;

  // Number pad state
  activeNumberPad: {
    exerciseLocalId: string;
    setLocalId: string;
    inputType: 'weight' | 'reps';
    pendingValue: string;
    hasError: boolean;
    shouldReplaceOnNextInput?: boolean;
  } | null;
  validationErrorsBySet: Record<string, { weight?: boolean; reps?: boolean }>;
  validationErrorsTrigger: number;

  // Sticky notes (persist across sessions, keyed by exerciseId)
  stickyNotes: Record<string, string>;
  // Sticky note edits staged while using the workout editor.
  // These should only be committed when the user explicitly saves.
  editorStickyNotesDraft: Record<string, string>;

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
  setActiveSessionProgramContext: (programId: string, programWorkoutId?: string) => void;
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
  applyVoiceLog: (
    exerciseLocalId: string,
    interpretation: WorkoutVoiceInterpretation
  ) => { appliedSetLocalIds: string[]; addedSetCount: number } | null;

  // Actions - Rest Timer
  startRestTimer: (setType: SetType) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  skipRestTimer: () => void;
  adjustRestTimer: (adjustment: number) => void;
  adjustRestTimerNextStart: (adjustment: number) => void;
  tickRestTimer: () => void;
  updateRestTimerSettings: (settings: Partial<RestTimerSettings>) => void;
  dismissRestTimerComplete: () => void;
  registerWorkoutOverlay: () => void;
  unregisterWorkoutOverlay: () => void;

  // Actions - Persistence
  loadActiveSession: () => Promise<void>;
  persistSession: () => Promise<void>;
  clearPersistedSession: () => Promise<void>;
  loadRestTimerSettings: () => Promise<void>;
  loadCompletedSessions: () => Promise<void>;
  replaceCompletedSessions: (sessions: WorkoutSession[]) => Promise<void>;
  markSessionsSyncing: (localIds: string[]) => void;
  clearSessionsSyncing: (localIds: string[]) => void;
  markSessionsSynced: (localIds: string[]) => Promise<void>;
  resyncMissingSetsToCloud: () => Promise<{
    checked: number;
    resynced: number;
    failed: number;
    errors: string[];
  }>;
  importCompletedSessions: (
    sessions: WorkoutSession[]
  ) => Promise<{ imported: number; skipped: number; skippedSync: number }>;
  updateCompletedWorkoutName: (localId: string, newName: string) => Promise<void>;
  deleteCompletedSession: (localId: string) => Promise<void>;
  updateActiveSessionName: (newName: string) => Promise<void>;
  resetStore: () => void;
  clearCompletedSessions: () => Promise<void>;

  // Actions - Sticky Notes
  setStickyNote: (exerciseId: string, note: string) => Promise<void>;
  deleteStickyNote: (exerciseId: string) => Promise<void>;
  loadStickyNotes: () => Promise<void>;
  setEditorStickyNoteDraft: (exerciseId: string, note: string) => void;
  commitEditorStickyNotesDraft: (exerciseIds?: string[]) => Promise<void>;
  clearEditorStickyNotesDraft: () => void;

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
  setValidationErrorsBySet: (errors: Record<string, { weight?: boolean; reps?: boolean }>) => void;
  applyPendingValueToRemainingSets: () => boolean;

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
  replaceEditorExercise: (localId: string, newExerciseId: string, newExerciseName: string) => void;
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
  closeEditorNumberPad: () => void;
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
    syncingSessionIds: [],
    workoutStartTime: null,
    isWorkoutTimerPaused: false,
    pausedElapsedSeconds: 0,
    restTimer: {
      isActive: false,
      remainingSeconds: 0,
      totalSeconds: 0,
      setType: 'normal',
      endTimestamp: null,
    },
    restTimerSettings: DEFAULT_REST_TIMER_SETTINGS,
    restTimerNextStartSeconds: null,
    isLoading: false,
    showRestTimerComplete: false,
    workoutOverlayCount: 0,
    activeNumberPad: null,
    validationErrorsBySet: {},
    validationErrorsTrigger: 0,
    stickyNotes: {},
    editorStickyNotesDraft: {},
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
          endTimestamp: null,
        },
        restTimerNextStartSeconds: null,
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
        const { weightUnits, completedSessions } = get();

        // Build context for history lookup
        const context = {
          programWorkoutId: workout.id,
          programId: template.id,
          workoutName: template.name,
        };

        const exercises: WorkoutExercise[] = workout.exercises.map((templateEx, exIndex) => {
          const exerciseWeightUnit = weightUnits[templateEx.exerciseId] || 'lbs';
          // Create sets based on template's setDetails or default empty sets
          const sets: WorkoutSet[] = [];
          const numSets = templateEx.setDetails?.length || templateEx.sets;

          for (let i = 0; i < numSets; i++) {
            const setDetail = templateEx.setDetails?.[i];
            const inheritedSetType = getSetTypeFromHistory(completedSessions, templateEx.exerciseId, i, context);

            sets.push({
              localId: generateId(),
              setNumber: i + 1,
              setType: inheritedSetType,
              weight: null, // Always start empty - baseline data is in baselinePerformance
              weightUnit: exerciseWeightUnit,
              reps: null,   // Always start empty - baseline data is in baselinePerformance
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
            baselinePerformance: templateEx.setDetails ? {
              sets: templateEx.setDetails.map((detail, idx) => ({
                weight: detail.weight,
                weightUnit: exerciseWeightUnit,
                reps: detail.reps,
                setType: sets[idx]?.setType || 'normal',
              })),
            } : undefined,
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
          programWorkoutId: workout.id,
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
            endTimestamp: null,
          },
          restTimerNextStartSeconds: null,
        });

        get().persistSession();

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

        const { weightUnits, completedSessions } = get();

        // Build context for history lookup
        const context = {
          programWorkoutId,
          programId,
          workoutName: workout.name,
        };

        const exercises: WorkoutExercise[] = workout.exercises.map((programEx, exIndex) => {
          const exerciseWeightUnit = weightUnits[programEx.exerciseId] || 'lbs';
          const sets: WorkoutSet[] = [];
          const numSets = programEx.sets;

          for (let i = 0; i < numSets; i++) {
            const inheritedSetType = getSetTypeFromHistory(completedSessions, programEx.exerciseId, i, context);

            sets.push({
              localId: generateId(),
              setNumber: i + 1,
              setType: inheritedSetType,
              weight: null,
              weightUnit: exerciseWeightUnit,
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
            endTimestamp: null,
          },
          restTimerNextStartSeconds: null,
        });

        get().persistSession();

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

      const completedSetCount = activeSession.exercises.reduce(
        (sum, ex) => sum + ex.sets.filter(s => s.isCompleted).length,
        0
      );

      if (completedSetCount === 0) {
        get().cancelWorkout();
        return null;
      }

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
          endTimestamp: null,
        },
        restTimerNextStartSeconds: null,
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
            .programs.find((p) => p.id === completedSession.programId);

          if (program?.isTemplate) {
            useProgramsStore.getState().updateLastPerformed(program.id);
          } else {
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
          }
        } catch (error) {
          console.warn('Failed to update program progress:', error);
        }
      } else if (completedSession.programId) {
        try {
          const { useProgramsStore } = await loadProgramsStore();
          useProgramsStore.getState().updateLastPerformed(completedSession.programId);
        } catch (error) {
          console.warn('Failed to update template last performed:', error);
        }
      }

      // Sync to Supabase (async, non-blocking)
      // If offline or not authenticated, it will be queued for later
      get().markSessionsSyncing([completedSession.localId]);
      syncWorkoutSession(completedSession)
        .then((result) => {
          get().clearSessionsSyncing([completedSession.localId]);
          if (result.success && !result.queued) {
            void get().markSessionsSynced([completedSession.localId]);
          }
        })
        .catch(error => {
          get().clearSessionsSyncing([completedSession.localId]);
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
          endTimestamp: null,
        },
        restTimerNextStartSeconds: null,
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

    setActiveSessionProgramContext: (programId, programWorkoutId) => {
      const { activeSession } = get();
      if (!activeSession) return;
      if (
        activeSession.programId === programId
        && activeSession.programWorkoutId === programWorkoutId
      ) {
        return;
      }

      set({
        activeSession: { ...activeSession, programId, programWorkoutId },
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
      const { activeSession, weightUnits, completedSessions } = get();
      if (!activeSession) return;
      const exerciseWeightUnit = weightUnits[exerciseId] || 'lbs';

      // Get set type from history (for first set, index 0)
      const context = {
        programWorkoutId: activeSession.programWorkoutId,
        programId: activeSession.programId,
        workoutName: activeSession.name,
      };
      const inheritedSetType = getSetTypeFromHistory(completedSessions, exerciseId, 0, context);

      const newExercise: WorkoutExercise = {
        localId: generateId(),
        exerciseId,
        exerciseName,
        sets: [
          {
            localId: generateId(),
            setNumber: 1,
            setType: inheritedSetType,
            weight: null,
            weightUnit: exerciseWeightUnit,
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
      const { activeSession, weightUnits, completedSessions } = get();
      if (!activeSession) return;

      // Build context for history lookup
      const context = {
        programWorkoutId: activeSession.programWorkoutId,
        programId: activeSession.programId,
        workoutName: activeSession.name,
      };

      const startIndex = activeSession.exercises.length;
      const newExercises: WorkoutExercise[] = exercises.map((ex, i) => {
        // Get inherited set type for first set
        const inheritedSetType = getSetTypeFromHistory(completedSessions, ex.id, 0, context);

        return {
          localId: generateId(),
          exerciseId: ex.id,
          exerciseName: ex.name,
          sets: [
            {
              localId: generateId(),
              setNumber: 1,
              setType: inheritedSetType,
              weight: null,
              weightUnit: weightUnits[ex.id] || 'lbs',
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
        };
      });

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
      const { activeSession, weightUnits } = get();
      if (!activeSession) return;
      const exerciseWeightUnit = weightUnits[newExerciseId] || 'lbs';

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
              weightUnit: exerciseWeightUnit,
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
      const { activeSession, weightUnits, completedSessions } = get();
      if (!activeSession) return;

      const exercises = activeSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;
        const newSet = buildNewActiveSet(
          ex,
          activeSession,
          weightUnits,
          completedSessions,
          ex.sets.length
        );

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

    applyVoiceLog: (exerciseLocalId, interpretation) => {
      const { activeSession, completedSessions, weightUnits } = get();
      if (!activeSession) return null;

      const targetSetCount = interpretation.sets;
      if (
        !targetSetCount
        || targetSetCount < 1
        || interpretation.weight === null
        || interpretation.reps === null
        || !interpretation.weightUnit
        || !interpretation.setType
      ) {
        return null;
      }

      let appliedSetLocalIds: string[] = [];
      let addedSetCount = 0;
      let lastAppliedSetType: SetType = 'normal';
      let nextWeightUnits = weightUnits;

      const exercises = activeSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const incompleteIndices = ex.sets.reduce<number[]>((indices, set, index) => {
          if (!set.isCompleted) {
            indices.push(index);
          }
          return indices;
        }, []);

        let nextSets = [...ex.sets];

        for (let i = 0; i < targetSetCount; i += 1) {
          let targetIndex = incompleteIndices[i];

          if (targetIndex === undefined) {
            const newSet = buildNewActiveSet(
              ex,
              activeSession,
              weightUnits,
              completedSessions,
              nextSets.length
            );
            nextSets = [...nextSets, newSet];
            targetIndex = nextSets.length - 1;
            addedSetCount += 1;
          }

          const targetSet = nextSets[targetIndex];
          const updatedSet: WorkoutSet = {
            ...targetSet,
            weight: interpretation.weight,
            weightUnit: interpretation.weightUnit,
            reps: interpretation.reps,
            setType: interpretation.setType,
            isCompleted: true,
          };
          nextSets[targetIndex] = updatedSet;
          appliedSetLocalIds.push(updatedSet.localId);
          lastAppliedSetType = updatedSet.setType;
        }

        nextWeightUnits = {
          ...nextWeightUnits,
          [ex.exerciseId]: interpretation.weightUnit!,
        };

        return {
          ...ex,
          sets: nextSets.map((set, index) => ({
            ...set,
            setNumber: index + 1,
            orderIndex: index,
          })),
        };
      });

      if (appliedSetLocalIds.length === 0) {
        return null;
      }

      set({
        activeSession: {
          ...activeSession,
          exercises,
        },
        activeNumberPad: null,
        validationErrorsBySet: {},
        weightUnits: nextWeightUnits,
      });

      void setScopedItem(EXERCISE_WEIGHT_UNITS_KEY, JSON.stringify(nextWeightUnits)).catch((error) => {
        console.warn('Failed to save weight units:', error);
      });
      get().persistSession();
      get().startRestTimer(lastAppliedSetType);

      return {
        appliedSetLocalIds,
        addedSetCount,
      };
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
      const { activeSession, weightUnits } = get();
      if (!activeSession) return;

      const exercises = activeSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const hasWeightUpdate = Object.prototype.hasOwnProperty.call(updates, 'weight');
        const shouldSetUnit = hasWeightUpdate && !Object.prototype.hasOwnProperty.call(updates, 'weightUnit');
        const currentWeightUnit = weightUnits[ex.exerciseId] || 'lbs';
        const nextUpdates = shouldSetUnit
          ? { ...updates, weightUnit: updates.weight === null ? null : currentWeightUnit }
          : updates;

        const sets = ex.sets.map((s) =>
          s.localId === setLocalId ? { ...s, ...nextUpdates } : s
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
      const { activeSession, restTimerSettings, weightUnits } = get();
      if (!activeSession) return;

      let completedSetType: SetType = 'normal';

      const exercises = activeSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const setIndex = ex.sets.findIndex((s) => s.localId === setLocalId);
        const previousSet = setIndex > 0 ? ex.sets[setIndex - 1] : undefined;
        const currentWeightUnit = weightUnits[ex.exerciseId] || 'lbs';

        const sets = ex.sets.map((s) => {
          if (s.localId !== setLocalId) return s;
          completedSetType = s.setType;
          const nextCompleted = !s.isCompleted;
          if (!nextCompleted) {
            return { ...s, isCompleted: nextCompleted };
          }

          const nextWeight =
            s.weight !== null ? s.weight : (previousSet?.weight ?? null);
          const nextReps =
            s.reps !== null ? s.reps : (previousSet?.reps ?? null);
          const nextWeightUnit =
            nextWeight !== null
              ? (s.weightUnit ?? currentWeightUnit)
              : s.weightUnit ?? null;

          return {
            ...s,
            isCompleted: nextCompleted,
            weight: nextWeight,
            reps: nextReps,
            weightUnit: nextWeightUnit,
          };
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
      const { restTimerNextStartSeconds, restTimerSettings } = get();

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

      if (restTimerNextStartSeconds !== null) {
        duration = restTimerNextStartSeconds;
      }

      if (duration === 0) return;

      const endTimestamp = Date.now() + duration * 1000;

      set({
        restTimer: {
          isActive: true,
          remainingSeconds: duration,
          totalSeconds: duration,
          setType,
          endTimestamp,
        },
        restTimerNextStartSeconds: null,
      });
    },

    pauseRestTimer: () => {
      set((state) => ({
        restTimer: {
          ...state.restTimer,
          isActive: false,
          remainingSeconds: state.restTimer.endTimestamp
            ? Math.max(0, Math.ceil((state.restTimer.endTimestamp - Date.now()) / 1000))
            : state.restTimer.remainingSeconds,
          endTimestamp: null,
        },
      }));
    },

    resumeRestTimer: () => {
      set((state) => ({
        restTimer: {
          ...state.restTimer,
          isActive: true,
          endTimestamp: state.restTimer.remainingSeconds > 0
            ? Date.now() + state.restTimer.remainingSeconds * 1000
            : null,
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
          endTimestamp: null,
        },
      });
    },

    adjustRestTimer: (adjustment) => {
      set((state) => {
        const currentRemaining = state.restTimer.endTimestamp
          ? Math.max(0, Math.ceil((state.restTimer.endTimestamp - Date.now()) / 1000))
          : state.restTimer.remainingSeconds;
        const newRemaining = Math.max(0, currentRemaining + adjustment);
        return {
          restTimer: {
            ...state.restTimer,
            remainingSeconds: newRemaining,
            endTimestamp: state.restTimer.isActive
              ? Date.now() + newRemaining * 1000
              : null,
          },
        };
      });
    },

    adjustRestTimerNextStart: (adjustment) => {
      const { restTimerNextStartSeconds, restTimerSettings } = get();
      const baseSeconds = restTimerNextStartSeconds ?? restTimerSettings.normalSeconds;
      const nextSeconds = Math.max(0, baseSeconds + adjustment);
      set({ restTimerNextStartSeconds: nextSeconds });
    },

    tickRestTimer: () => {
      const { restTimer } = get();
      if (!restTimer.isActive) return;
      if (!restTimer.endTimestamp && restTimer.remainingSeconds <= 0) return;

      const newRemaining = restTimer.endTimestamp
        ? Math.max(0, Math.ceil((restTimer.endTimestamp - Date.now()) / 1000))
        : Math.max(0, restTimer.remainingSeconds - 1);
      const timerComplete = newRemaining <= 0;

      set({
        restTimer: {
          ...restTimer,
          remainingSeconds: newRemaining,
          isActive: !timerComplete,
          ...(timerComplete && { endTimestamp: null }),
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

    registerWorkoutOverlay: () => {
      set((state) => ({ workoutOverlayCount: state.workoutOverlayCount + 1 }));
    },

    unregisterWorkoutOverlay: () => {
      set((state) => ({ workoutOverlayCount: Math.max(0, state.workoutOverlayCount - 1) }));
    },

    // ========================================
    // Persistence Actions
    // ========================================

    loadActiveSession: async () => {
      const hasActiveSession = Boolean(get().activeSession);

      set({
        isLoading: true,
        ...(hasActiveSession
          ? {}
	          : {
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
	              endTimestamp: null,
	            },
	            restTimerNextStartSeconds: null,
	            showRestTimerComplete: false,
	            activeNumberPad: null,
	            showRpeSelector: false,
	            showRpeHelp: false,
	          }),
      });

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
          if (!session.completedAt && !hasActiveSession) {
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
          return;
        }
        set({ restTimerSettings: DEFAULT_REST_TIMER_SETTINGS });
      } catch (error) {
        console.warn('Failed to load rest timer settings:', error);
        set({ restTimerSettings: DEFAULT_REST_TIMER_SETTINGS });
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
          return;
        }
        set({ completedSessions: [] });
      } catch (error) {
        console.warn('Failed to load completed sessions:', error);
        set({ completedSessions: [] });
      }
    },

    replaceCompletedSessions: async (sessions) => {
      set({ completedSessions: sessions });
      try {
        await setScopedItem(COMPLETED_WORKOUTS_KEY, JSON.stringify(sessions));
      } catch (error) {
        console.warn('Failed to persist replaced workout sessions:', error);
      }
    },

    markSessionsSyncing: (localIds) => {
      if (localIds.length === 0) return;
      const existing = new Set(get().syncingSessionIds);
      let didChange = false;
      localIds.forEach((id) => {
        if (!existing.has(id)) {
          existing.add(id);
          didChange = true;
        }
      });
      if (didChange) {
        set({ syncingSessionIds: Array.from(existing) });
      }
    },

    clearSessionsSyncing: (localIds) => {
      if (localIds.length === 0) return;
      const toRemove = new Set(localIds);
      const nextIds = get().syncingSessionIds.filter((id) => !toRemove.has(id));
      if (nextIds.length !== get().syncingSessionIds.length) {
        set({ syncingSessionIds: nextIds });
      }
    },

    markSessionsSynced: async (localIds) => {
      if (localIds.length === 0) return;

      const { completedSessions } = get();
      const idsToSync = new Set(localIds);
      let didChange = false;
      const updatedSessions = completedSessions.map((session) => {
        if (idsToSync.has(session.localId) && !session.isSynced) {
          didChange = true;
          return { ...session, isSynced: true };
        }
        return session;
      });

      if (!didChange) return;

      set({ completedSessions: updatedSessions });

      try {
        await setScopedItem(COMPLETED_WORKOUTS_KEY, JSON.stringify(updatedSessions));
      } catch (error) {
        console.warn('Failed to persist synced workout sessions:', error);
      }
    },

    resyncMissingSetsToCloud: async () => {
      const { completedSessions } = get();
      if (completedSessions.length === 0) {
        return { checked: 0, resynced: 0, failed: 0, errors: [] };
      }

      // Call the resync function from workoutHistoryService
      const result = await resyncMissingSets(completedSessions);
      return result;
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

    updateCompletedWorkoutName: async (localId, newName) => {
      const { completedSessions } = get();

      // Find and update the session
      let didChange = false;
      const updatedSessions = completedSessions.map((session) => {
        if (session.localId === localId && session.name !== newName) {
          didChange = true;
          return { ...session, name: newName };
        }
        return session;
      });

      if (!didChange) return;

      // Update state
      set({ completedSessions: updatedSessions });

      // Persist to AsyncStorage
      try {
        await setScopedItem(COMPLETED_WORKOUTS_KEY, JSON.stringify(updatedSessions));
      } catch (error) {
        console.warn('Failed to persist updated workout name:', error);
      }

      // If the session is already synced, update in Supabase too
      const updatedSession = updatedSessions.find((s) => s.localId === localId);
      if (updatedSession?.isSynced) {
        // Re-sync to update the name in the cloud
        syncWorkoutSession(updatedSession).catch((error) => {
          console.warn('Failed to sync updated workout name to cloud:', error);
        });
      }
    },

    deleteCompletedSession: async (localId) => {
      const { completedSessions, syncingSessionIds } = get();
      const updatedSessions = completedSessions.filter((session) => session.localId !== localId);
      const updatedSyncingIds = syncingSessionIds.filter((id) => id !== localId);

      if (updatedSessions.length === completedSessions.length && updatedSyncingIds.length === syncingSessionIds.length) {
        return;
      }

      set({ completedSessions: updatedSessions, syncingSessionIds: updatedSyncingIds });

      try {
        await setScopedItem(COMPLETED_WORKOUTS_KEY, JSON.stringify(updatedSessions));
      } catch (error) {
        console.warn('Failed to persist deleted workout session:', error);
      }
    },

    updateActiveSessionName: async (newName) => {
      const { activeSession } = get();
      if (!activeSession || activeSession.name === newName) return;

      // Update active session name
      const updatedSession = { ...activeSession, name: newName };
      set({ activeSession: updatedSession });

      // Persist to AsyncStorage
      try {
        await setScopedItem(ACTIVE_WORKOUT_KEY, JSON.stringify(updatedSession));
      } catch (error) {
        console.warn('Failed to persist updated active session name:', error);
      }
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

    setEditorStickyNoteDraft: (exerciseId, note) => {
      set((state) => ({
        editorStickyNotesDraft: {
          ...state.editorStickyNotesDraft,
          [exerciseId]: note,
        },
      }));
    },

    commitEditorStickyNotesDraft: async (exerciseIds) => {
      const { editorStickyNotesDraft, stickyNotes, editorSession } = get();
      const targetExerciseIds = exerciseIds
        ?? editorSession?.exercises.map(ex => ex.exerciseId)
        ?? Object.keys(editorStickyNotesDraft);

      if (targetExerciseIds.length === 0) return;

      const uniqueExerciseIds = Array.from(new Set(targetExerciseIds));
      let hasChanges = false;
      const nextNotes = { ...stickyNotes };

      uniqueExerciseIds.forEach((exerciseId) => {
        if (!Object.prototype.hasOwnProperty.call(editorStickyNotesDraft, exerciseId)) {
          return;
        }

        const trimmedDraft = (editorStickyNotesDraft[exerciseId] || '').trim();
        const current = stickyNotes[exerciseId] || '';
        if (trimmedDraft === current) return;

        hasChanges = true;

        if (trimmedDraft === '') {
          delete nextNotes[exerciseId];
          deleteStickyNoteFromCloud(exerciseId).catch((err) => {
            console.warn('Failed to delete sticky note from cloud:', err);
          });
          return;
        }

        nextNotes[exerciseId] = trimmedDraft;
        syncStickyNote(exerciseId, trimmedDraft).catch((err) => {
          console.warn('Failed to sync sticky note to cloud:', err);
        });
      });

      if (!hasChanges) return;

      set({ stickyNotes: nextNotes });

      try {
        await setScopedItem(
          EXERCISE_STICKY_NOTES_KEY,
          JSON.stringify(nextNotes)
        );
      } catch (error) {
        console.warn('Failed to save sticky notes:', error);
      }
    },

    clearEditorStickyNotesDraft: () => {
      set({ editorStickyNotesDraft: {} });
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
      const { weightUnits, activeSession, editorSession } = get();
      const currentUnit = weightUnits[exerciseId] || 'lbs';
      const newUnit: WeightUnit = currentUnit === 'lbs' ? 'kg' : 'lbs';

      const convertSession = (session: WorkoutSession | null) => {
        if (!session) return null;

        const exercises = session.exercises.map((ex) => {
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

            return { ...s, weight: convertedWeight, weightUnit: newUnit };
          });

          return { ...ex, sets };
        });

        return { ...session, exercises };
      };

      const convertedActiveSession = convertSession(activeSession);
      const convertedEditorSession = convertSession(editorSession);

      set({
        ...(convertedActiveSession && { activeSession: convertedActiveSession }),
        ...(convertedEditorSession && { editorSession: convertedEditorSession }),
      });

      if (convertedActiveSession) {
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
          return;
        }
        set({ weightUnits: {} });
      } catch (error) {
        console.warn('Failed to load weight units:', error);
        set({ weightUnits: {} });
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
          return;
        }
        set({ bodyType: 'male' });
      } catch (error) {
        console.warn('Failed to load body type:', error);
        set({ bodyType: 'male' });
      }
    },

    // ========================================
    // Number Pad Actions
    // ========================================

    openNumberPad: (exerciseLocalId, setLocalId, inputType) => {
      const { activeSession, activeNumberPad } = get();

      if (
        activeNumberPad
        && activeNumberPad.exerciseLocalId === exerciseLocalId
        && activeNumberPad.setLocalId === setLocalId
        && activeNumberPad.inputType === inputType
      ) {
        return;
      }

      if (activeNumberPad && activeSession) {
        const previousExercise = activeSession.exercises.find(
          (ex) => ex.localId === activeNumberPad.exerciseLocalId
        );
        const previousSet = previousExercise?.sets.find(
          (s) => s.localId === activeNumberPad.setLocalId
        );
        const pendingValue = activeNumberPad.pendingValue.trim();
        if (previousSet && pendingValue) {
          const parsedValue = Number(pendingValue);
          if (!Number.isNaN(parsedValue)) {
            get().updateSet(activeNumberPad.exerciseLocalId, activeNumberPad.setLocalId, {
              [activeNumberPad.inputType]: parsedValue,
            });
          }
        }
      }

      // Get the current value to initialize pendingValue
      const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);
      const set_ = exercise?.sets.find(s => s.localId === setLocalId);
      const currentValue = set_?.[inputType];
      const shouldReplaceOnNextInput = currentValue !== null && currentValue !== undefined;
      const pendingValue = shouldReplaceOnNextInput
        ? currentValue.toString()
        : '';

      set({
        activeNumberPad: {
          exerciseLocalId,
          setLocalId,
          inputType,
          pendingValue,
          hasError: false,
          shouldReplaceOnNextInput,
        },
      });
    },

    closeNumberPad: () => {
      set({ activeNumberPad: null });
    },

    updatePendingValue: (value) => {
      const { activeNumberPad } = get();
      if (!activeNumberPad) return;
      if (
        activeNumberPad.pendingValue === value
        && !activeNumberPad.hasError
        && !activeNumberPad.shouldReplaceOnNextInput
      ) {
        return;
      }

      set({
        activeNumberPad: {
          ...activeNumberPad,
          pendingValue: value,
          hasError: false,
          shouldReplaceOnNextInput: false,
        },
      });
    },

    setNumberPadError: (hasError) => {
      const { activeNumberPad } = get();
      if (!activeNumberPad) return;

      set({
        activeNumberPad: { ...activeNumberPad, hasError },
      });
    },

    setValidationErrorsBySet: (errors) => {
      set((state) => ({
        validationErrorsBySet: errors,
        validationErrorsTrigger: state.validationErrorsTrigger + 1,
      }));
    },

    applyPendingValueToRemainingSets: () => {
      const { activeNumberPad, activeSession } = get();
      if (!activeNumberPad || !activeSession) return false;

      const { exerciseLocalId, setLocalId, inputType, pendingValue } = activeNumberPad;

      // Find the exercise and current set
      const exercise = activeSession.exercises.find(ex => ex.localId === exerciseLocalId);
      if (!exercise) return false;

      const setIndex = exercise.sets.findIndex(s => s.localId === setLocalId);
      if (setIndex === -1) return false;

      // Determine value to apply: pending value or current saved value
      const currentSet = exercise.sets[setIndex];
      const valueToApply = pendingValue.trim()
        ? Number(pendingValue)
        : currentSet[inputType];

      if (valueToApply === null || valueToApply === undefined || Number.isNaN(valueToApply)) {
        return false;
      }

      // Find remaining incomplete sets with different values
      const remainingSets = exercise.sets.slice(setIndex + 1);
      const setsToUpdate = remainingSets.filter(
        s => !s.isCompleted && s[inputType] !== valueToApply
      );

      if (setsToUpdate.length === 0) return false;

      // Update each set
      setsToUpdate.forEach(s => {
        get().updateSet(exerciseLocalId, s.localId, { [inputType]: valueToApply });
      });

      return true;
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
        editorStickyNotesDraft: {},
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

        const { weightUnits } = get();
        const exercises: WorkoutExercise[] = sortedExercises.map((templateEx, exIndex) => {
          const exerciseWeightUnit = weightUnits[templateEx.exerciseId] || 'lbs';
          const numSets = Math.max(1, templateEx.setDetails?.length ?? templateEx.sets ?? 1);
          const sets: WorkoutSet[] = [];

          for (let i = 0; i < numSets; i++) {
            const setDetail = templateEx.setDetails?.[i];
            sets.push({
              localId: generateId(),
              setNumber: i + 1,
              setType: 'normal',
              weight: setDetail?.weight ?? null,
              weightUnit: exerciseWeightUnit,
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
          editorStickyNotesDraft: {},
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
      const { editorSession, weightUnits } = get();
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
            weightUnit: weightUnits[ex.id] || 'lbs',
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

    replaceEditorExercise: (localId, newExerciseId, newExerciseName) => {
      const { editorSession, weightUnits } = get();
      if (!editorSession) return;
      const exerciseWeightUnit = weightUnits[newExerciseId] || 'lbs';

      const exercises = editorSession.exercises.map((ex) => {
        if (ex.localId !== localId) return ex;

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
              weightUnit: exerciseWeightUnit,
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
        editorSession: {
          ...editorSession,
          exercises,
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
      const { editorSession, weightUnits } = get();
      if (!editorSession) return;

      const exercises = editorSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const newSet: WorkoutSet = {
          localId: generateId(),
          setNumber: ex.sets.length + 1,
          setType: 'normal',
          weight: null,
          weightUnit: weightUnits[ex.exerciseId] || 'lbs',
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
      const { editorSession, weightUnits } = get();
      if (!editorSession) return;

      const exercises = editorSession.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;

        const hasWeightUpdate = Object.prototype.hasOwnProperty.call(updates, 'weight');
        const shouldSetUnit = hasWeightUpdate && !Object.prototype.hasOwnProperty.call(updates, 'weightUnit');
        const currentWeightUnit = weightUnits[ex.exerciseId] || 'lbs';
        const nextUpdates = shouldSetUnit
          ? { ...updates, weightUnit: updates.weight === null ? null : currentWeightUnit }
          : updates;

        const sets = ex.sets.map((s) =>
          s.localId === setLocalId ? { ...s, ...nextUpdates } : s
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
      const { editorSession, activeNumberPad } = get();

      if (
        activeNumberPad
        && activeNumberPad.exerciseLocalId === exerciseLocalId
        && activeNumberPad.setLocalId === setLocalId
        && activeNumberPad.inputType === inputType
      ) {
        return;
      }

      if (activeNumberPad && editorSession) {
        const previousExercise = editorSession.exercises.find(
          (ex) => ex.localId === activeNumberPad.exerciseLocalId
        );
        const previousSet = previousExercise?.sets.find(
          (s) => s.localId === activeNumberPad.setLocalId
        );
        const pendingValue = activeNumberPad.pendingValue.trim();
        if (previousSet && pendingValue) {
          const parsedValue = Number(pendingValue);
          if (!Number.isNaN(parsedValue)) {
            get().updateEditorSet(activeNumberPad.exerciseLocalId, activeNumberPad.setLocalId, {
              [activeNumberPad.inputType]: parsedValue,
            });
          }
        }
      }

      const exercise = editorSession?.exercises.find(e => e.localId === exerciseLocalId);
      const set_ = exercise?.sets.find(s => s.localId === setLocalId);
      const currentValue = set_?.[inputType];
      const shouldReplaceOnNextInput = currentValue !== null && currentValue !== undefined;
      const pendingValue = shouldReplaceOnNextInput
        ? currentValue.toString()
        : '';

      set({
        activeNumberPad: {
          exerciseLocalId,
          setLocalId,
          inputType,
          pendingValue,
          hasError: false,
          shouldReplaceOnNextInput,
        },
      });
    },

    closeEditorNumberPad: () => {
      set({ activeNumberPad: null });
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

      const completedSetCount = exercisesWithCompletedSets.reduce(
        (sum, ex) => sum + ex.sets.filter(set => set.isCompleted).length,
        0
      );

      if (completedSetCount === 0) {
        return;
      }

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
      get().markSessionsSyncing([completedSession.localId]);
      syncWorkoutSession(completedSession)
        .then((result) => {
          get().clearSessionsSyncing([completedSession.localId]);
          if (result.success && !result.queued) {
            void get().markSessionsSynced([completedSession.localId]);
          }
        })
        .catch(error => {
          get().clearSessionsSyncing([completedSession.localId]);
          console.warn('Failed to sync workout session:', error);
        });
    },

    clearEditorSession: () => {
      set({
        editorSession: null,
        editorMode: 'template',
        editorDate: new Date(),
        editorStickyNotesDraft: {},
      });
    },

    resetStore: () => {
      isStartingWorkout = false;
      set({
        activeSession: null,
        isWorkoutActive: false,
        completedSessions: [],
        syncingSessionIds: [],
        workoutStartTime: null,
        isWorkoutTimerPaused: false,
        pausedElapsedSeconds: 0,
        restTimer: {
          isActive: false,
          remainingSeconds: 0,
          totalSeconds: 0,
          setType: 'normal',
          endTimestamp: null,
        },
        restTimerSettings: DEFAULT_REST_TIMER_SETTINGS,
        restTimerNextStartSeconds: null,
        isLoading: false,
        showRestTimerComplete: false,
        activeNumberPad: null,
        validationErrorsBySet: {},
        validationErrorsTrigger: 0,
        stickyNotes: {},
        weightUnits: {},
        bodyType: 'male',
        showRpeSelector: false,
        showRpeHelp: false,
        backdatedDate: null,
        editorSession: null,
        editorMode: 'template',
        editorDate: new Date(),
        editorStickyNotesDraft: {},
      });
    },

    clearCompletedSessions: async () => {
      // Clear from memory
      set({ completedSessions: [], syncingSessionIds: [] });

      // Clear from AsyncStorage
      try {
        await removeScopedItem(COMPLETED_WORKOUTS_KEY);
        console.log('[WorkoutStore] Cleared completed sessions from storage');
      } catch (error) {
        console.warn('Failed to clear completed sessions from storage:', error);
      }
    },
  }))
);

// ========================================
// Helper Selectors
// ========================================

/**
 * Get workout summary statistics
 */
export const getWorkoutSummary = (
  session: WorkoutSession | null,
  volumeContext?: VolumeContext
) => {
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
        if (!volumeContext) {
          totalVolume += (s.weight || 0) * (s.reps || 0);
        }
      }
    });
  });

  if (volumeContext) {
    totalVolume = getSessionVolume(session, volumeContext);
  }

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
 * Returns true if: blank workout OR template workout with ANY exercise/set changes
 *
 * Modification types detected:
 * - Exercise additions/removals
 * - Exercise replacements (different ID at same position)
 * - Exercise reordering
 * - Set count changes for existing exercises
 */
export const hasTemplateModifications = (session: WorkoutSession | null): boolean => {
  if (!session) return false;

  // Blank workout (no template/program attached) - always show save option
  if (!session.programId || !session.originalExerciseIds) {
    return true;
  }

  // Get current state
  const currentIds = session.exercises.map(ex => ex.exerciseId);
  const originalIds = session.originalExerciseIds;

  // 1. CHECK FOR EXERCISE COUNT CHANGES (additions or removals)
  if (currentIds.length !== originalIds.length) {
    return true;
  }

  // 2. CHECK FOR EXERCISE REPLACEMENTS OR REORDERING
  const hasPositionChanges = currentIds.some((id, index) => id !== originalIds[index]);
  if (hasPositionChanges) {
    return true;
  }

  // 3. CHECK FOR SET COUNT CHANGES (Map-based approach handles edge cases)
  if (session.originalSetCounts && session.originalSetCounts.length > 0) {
    // Build map of exercise ID → original set count
    const originalSetCountMap = new Map<string, number>();

    for (let i = 0; i < originalIds.length; i++) {
      const exerciseId = originalIds[i];
      const setCount = session.originalSetCounts[i];

      if (exerciseId && setCount !== undefined) {
        originalSetCountMap.set(exerciseId, setCount);
      }
    }

    // Check if any current exercise has different set count than original
    const hasSetCountChanges = session.exercises.some(exercise => {
      const originalSetCount = originalSetCountMap.get(exercise.exerciseId);

      // If we have baseline data for this exercise, compare set counts
      if (originalSetCount !== undefined) {
        return exercise.sets.length !== originalSetCount;
      }

      // No baseline data - assume no change (conservative approach)
      return false;
    });

    if (hasSetCountChanges) {
      return true;
    }
  }

  // No modifications detected
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
