/**
 * Suggestion Context Builder
 *
 * Gathers data from stores to build context for suggestion generation.
 */

import { useAIStore } from '../store/aiStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useProgramsStore } from '../store/programsStore';
import { SuggestionContext } from '../types/suggestions';
import { WorkoutSession } from '../types/workout';
import { getMuscleCategory, normalizeMuscle, type MuscleKey } from '@/src/utils/muscleTaxonomy';

/**
 * Map AIIntent to mutation plan type
 */
function getMutationPlanType(
  intent?: string
): 'program' | 'template' | undefined {
  if (!intent) return undefined;

  if (intent === 'CREATE_PROGRAM') return 'program';
  if (intent === 'CREATE_TEMPLATE') return 'template';
  return undefined;
}

/**
 * Extract muscle groups from recent workouts based on exercise names
 * Uses common exercise name patterns to infer muscle groups
 */
function extractRecentMuscleGroups(completedSessions: WorkoutSession[]): string[] {
  const muscleGroups = new Set<string>();
  const recentSessions = completedSessions.slice(0, 3);

  for (const session of recentSessions) {
    for (const exercise of session.exercises || []) {
      const primary = exercise.primaryMuscles ?? [];
      primary.forEach((muscle) => {
        const key = normalizeMuscle(muscle);
        if (!key) return;
        const category = getMuscleCategory(key as MuscleKey);
        if (category !== 'other') {
          muscleGroups.add(category);
        }
      });
    }
  }

  return Array.from(muscleGroups);
}

/**
 * Calculate days since last workout
 */
function getDaysSinceLastWorkout(completedSessions: WorkoutSession[]): number | null {
  if (completedSessions.length === 0) return null;

  const lastSession = completedSessions[0];
  if (!lastSession?.completedAt) return null;

  const lastDate =
    lastSession.completedAt instanceof Date
      ? lastSession.completedAt
      : new Date(lastSession.completedAt);
  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Build suggestion context from current app state
 * Called once per suggestion generation
 */
export function buildSuggestionContext(): SuggestionContext {
  // Get state from stores (direct getState() for performance)
  const aiState = useAIStore.getState();
  const workoutState = useWorkoutStore.getState();
  const programsState = useProgramsStore.getState();

  // Get conversation data
  const messages = aiState.conversation?.messages || [];
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastAssistantMessage =
    lastMessage?.role === 'assistant' ? lastMessage : null;

  // Get mutation plan
  const mutationPlan = aiState.currentMutationPlan;

  // Count templates and programs
  const templates = programsState.programs.filter((p) => p.isTemplate);
  const programs = programsState.programs.filter((p) => !p.isTemplate);

  // Get time info
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  return {
    conversation: {
      lastIntent: lastAssistantMessage?.intent,
      lastAssistantContent: lastAssistantMessage?.content,
      messageCount: messages.length,
      clarificationOptions: lastAssistantMessage?.clarification?.options,
    },
    mutationPlan: {
      exists: mutationPlan !== null,
      type: getMutationPlanType(mutationPlan?.intent),
      intent: mutationPlan?.intent,
    },
    fitness: {
      daysSinceLastWorkout: getDaysSinceLastWorkout(workoutState.completedSessions),
      recentMuscleGroups: extractRecentMuscleGroups(workoutState.completedSessions),
      hasActiveWorkout: workoutState.activeSession !== null,
      templateCount: templates.length,
      programCount: programs.length,
    },
    time: {
      hour,
      isMorning: hour >= 5 && hour < 12,
      isEvening: hour >= 18 && hour < 22,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    },
  };
}
