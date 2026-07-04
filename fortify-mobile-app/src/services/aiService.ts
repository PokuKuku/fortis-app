/**
 * AI Service
 *
 * Client-side service for interacting with the Fortis AI Edge Function.
 */

import * as Crypto from 'expo-crypto';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  AIIntent,
  AIRequest,
  AIChatMessage,
  AIRequestContext,
  AIResponse,
  AIRateLimitStatus,
  AIImage,
  AIExerciseCatalogEntry,
  AIWorkoutTemplate,
} from '../types/ai';
import type { OnboardingProgramSpec } from '@/src/utils/onboardingProgram';
import { hasAIDataSharingConsent } from '@/src/services/aiConsentService';
import { getAllExercises } from '@/src/services/exerciseService';
import type { ExerciseWithSource } from '@/src/types/exercise';

const MAX_WORKOUT_CONTEXT_EXERCISES = 160;

const WORKOUT_NOUN_PATTERN = String.raw`(?:work\s*out|workout|routine|session|template|training(?:\s+(?:day|session|workout))?|lift|day)`;
const WORKOUT_FOCUS_PATTERN = String.raw`(?:full\s+body|upper\s+body|lower\s+body|push|pull|legs?|chest|back|shoulders?|arms?|biceps|triceps|glutes?|hamstrings?|quads?|calves|core|abs|cardio|conditioning|mobility|strength|hypertrophy)`;
const WORKOUT_CREATE_VERB_PATTERN = String.raw`(?:make|create|build|generate|design|plan|craft|write|recommend|suggest|put together|give me|need|want|show me|can i have|i would like)`;

const WORKOUT_REQUEST_REGEXES = [
  new RegExp(String.raw`\b${WORKOUT_CREATE_VERB_PATTERN}\b[\s\S]{0,100}\b${WORKOUT_NOUN_PATTERN}\b`, 'i'),
  new RegExp(String.raw`\b${WORKOUT_CREATE_VERB_PATTERN}\b[\s\S]{0,80}\b${WORKOUT_FOCUS_PATTERN}\b[\s\S]{0,40}\b${WORKOUT_NOUN_PATTERN}\b`, 'i'),
  new RegExp(String.raw`\b${WORKOUT_CREATE_VERB_PATTERN}\b[\s\S]{0,60}\b${WORKOUT_FOCUS_PATTERN}\b\s+(?:day|lift|session|routine|training)\b`, 'i'),
  new RegExp(String.raw`\b${WORKOUT_FOCUS_PATTERN}\b[\s\S]{0,40}\b${WORKOUT_NOUN_PATTERN}\b`, 'i'),
];

const WORKOUT_TARGET_MUSCLE_MAP: Array<{ regex: RegExp; muscles: string[] }> = [
  { regex: /\bupper body\b/i, muscles: ['chest', 'lats', 'middle back', 'upper_back', 'traps', 'shoulders', 'side_delts', 'biceps', 'triceps'] },
  { regex: /\blower body\b/i, muscles: ['quadriceps', 'quads', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'] },
  { regex: /\bpush\b/i, muscles: ['chest', 'shoulders', 'side_delts', 'front_delts', 'triceps'] },
  { regex: /\bpull\b/i, muscles: ['lats', 'middle back', 'upper_back', 'traps', 'biceps', 'forearms'] },
  { regex: /\blegs?\b/i, muscles: ['quadriceps', 'quads', 'hamstrings', 'glutes', 'calves'] },
  { regex: /\bchest\b/i, muscles: ['chest'] },
  { regex: /\bback\b/i, muscles: ['lats', 'middle back', 'upper_back', 'lower back', 'lower_back', 'traps'] },
  { regex: /\bshoulder(s)?\b/i, muscles: ['shoulders', 'side_delts', 'front_delts', 'rear_delts'] },
  { regex: /\bbicep(s)?\b/i, muscles: ['biceps'] },
  { regex: /\btricep(s)?\b/i, muscles: ['triceps'] },
  { regex: /\barm(s)?\b/i, muscles: ['biceps', 'triceps', 'forearms'] },
  { regex: /\bglute(s)?\b/i, muscles: ['glutes'] },
  { regex: /\bhamstring(s)?\b/i, muscles: ['hamstrings'] },
  { regex: /\bquad(s|riceps)?\b/i, muscles: ['quadriceps', 'quads'] },
  { regex: /\bcal(f|ves)\b/i, muscles: ['calves'] },
  { regex: /\bcore\b|\babs?\b/i, muscles: ['abdominals', 'abs', 'obliques'] },
  { regex: /\bfull body\b/i, muscles: ['chest', 'lats', 'middle back', 'upper_back', 'shoulders', 'side_delts', 'quadriceps', 'quads', 'hamstrings', 'glutes', 'biceps', 'triceps'] },
];

const WORKOUT_EQUIPMENT_MAP: Array<{ regex: RegExp; equipment: string }> = [
  { regex: /\bdumbbell(s)?\b/i, equipment: 'dumbbell' },
  { regex: /\bbarbell(s)?\b/i, equipment: 'barbell' },
  { regex: /\bcable(s)?\b/i, equipment: 'cable' },
  { regex: /\bsmith\b|\bsmith machine\b/i, equipment: 'smith machine' },
  { regex: /\bmachine(s)?\b/i, equipment: 'machine' },
  { regex: /\bkettlebell(s)?\b/i, equipment: 'kettlebell' },
  { regex: /\bband(s)?\b|\bresistance band(s)?\b/i, equipment: 'band' },
  { regex: /\bbodyweight\b|\bbody weight\b|\bno equipment\b|\bwithout equipment\b|\bno gear\b|\bno weights?\b/i, equipment: 'bodyweight' },
];

const normalizeCatalogValue = (value: string | null | undefined): string => (
  (value || '')
    .toLowerCase()
    .replace(/\bkettlebells\b/g, 'kettlebell')
    .replace(/\bbands\b/g, 'band')
    .replace(/\bresistance band\b/g, 'band')
    .replace(/\bbody only\b/g, 'bodyweight')
    .replace(/\bbody weight\b/g, 'bodyweight')
    .trim()
);

const shouldSendWorkoutExerciseCatalog = (
  intent: AIIntent,
  message: string,
  context?: AIRequestContext
): boolean => {
  if (context?.exerciseCatalog?.length) {
    return false;
  }
  if (context?.onboardingProgramSpec) {
    return true;
  }
  if (intent !== 'GENERAL_CHAT' && intent !== 'VISUAL_COACHING' && intent !== 'FORTIS_ANALYST') {
    return false;
  }
  if (context?.voiceWorkoutOnly || context?.currentWorkoutTemplateDraft) {
    return true;
  }
  return WORKOUT_REQUEST_REGEXES.some((regex) => regex.test(message));
};

const extractWorkoutTargetMuscles = (message: string): string[] => {
  const muscles = new Set<string>();
  WORKOUT_TARGET_MUSCLE_MAP.forEach((entry) => {
    if (entry.regex.test(message)) {
      entry.muscles.forEach((muscle) => muscles.add(muscle));
    }
  });
  return Array.from(muscles);
};

const extractWorkoutEquipment = (message: string): string[] => {
  const equipment = new Set<string>();
  WORKOUT_EQUIPMENT_MAP.forEach((entry) => {
    if (entry.regex.test(message)) {
      equipment.add(entry.equipment);
    }
  });
  if (equipment.size === 0 && /\b(at home|home workout|home training)\b/i.test(message)) {
    equipment.add('bodyweight');
    equipment.add('dumbbell');
    equipment.add('band');
    equipment.add('kettlebell');
  }
  return Array.from(equipment);
};

const exerciseMatchesTargetMuscles = (exercise: ExerciseWithSource, targetMuscles: string[]): boolean => {
  if (targetMuscles.length === 0) return true;
  const muscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles]
    .map((muscle) => muscle.toLowerCase());
  return targetMuscles.some((muscle) => muscles.includes(muscle.toLowerCase()));
};

const exerciseMatchesEquipment = (exercise: ExerciseWithSource, equipment: string[]): boolean => {
  if (equipment.length === 0) return true;
  const normalizedEquipment = normalizeCatalogValue(exercise.equipment);
  return equipment.some((item) => normalizedEquipment.includes(normalizeCatalogValue(item)));
};

const scoreWorkoutCatalogExercise = (
  exercise: ExerciseWithSource,
  targetMuscles: string[],
  equipment: string[]
): number => {
  let score = 0;
  if (exercise.images.some((image) => image.startsWith('exercise-gif://'))) score += 12;
  if (exercise.isCurated) score += 4;
  if (exercise.source === 'custom') score -= 6;
  if (exerciseMatchesTargetMuscles(exercise, targetMuscles)) score += targetMuscles.length > 0 ? 10 : 0;
  if (exerciseMatchesEquipment(exercise, equipment)) score += equipment.length > 0 ? 8 : 0;
  if (/\b(bench|press|row|pulldown|pull up|pull-up|squat|deadlift|lunge|hip thrust|push up|plank|crunch)\b/i.test(exercise.name)) {
    score += 3;
  }
  if (/\b(stretch|mobility|warm[- ]?up|cardio)\b/i.test(`${exercise.name} ${exercise.category}`)) {
    score -= 10;
  }
  return score;
};

const buildWorkoutExerciseCatalogForAI = async (
  message: string,
  currentDraft?: AIWorkoutTemplate
): Promise<AIExerciseCatalogEntry[]> => {
  const exercises = await getAllExercises();
  const targetMuscles = extractWorkoutTargetMuscles(message);
  const equipment = extractWorkoutEquipment(message);
  const currentDraftExerciseIds = new Set(
    currentDraft?.exercises
      ?.map((exercise) => exercise.exerciseId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
      ?? []
  );
  const filtered = exercises
    .filter((exercise) => !exercise.isHidden)
    .filter((exercise) => exercise.images.some((image) => image.startsWith('exercise-gif://')))
    .filter((exercise) => exerciseMatchesTargetMuscles(exercise, targetMuscles))
    .filter((exercise) => exerciseMatchesEquipment(exercise, equipment));
  const source = filtered.length >= 12
    ? filtered
    : exercises.filter((exercise) => !exercise.isHidden);

  const selectedById = new Map<string, AIExerciseCatalogEntry>();
  const toCatalogEntry = (exercise: ExerciseWithSource): AIExerciseCatalogEntry => ({
    id: exercise.id,
    slug: exercise.slug,
    name: exercise.name,
    primaryMuscles: exercise.primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
    equipment: exercise.equipment,
    category: exercise.category,
    images: exercise.images.slice(0, 1),
    canonicalId: exercise.canonicalId ?? null,
    canonicalKey: exercise.canonicalKey ?? null,
    isCurated: exercise.isCurated,
    aliases: exercise.aliases,
  });

  exercises
    .filter((exercise) => currentDraftExerciseIds.has(exercise.id))
    .forEach((exercise) => {
      selectedById.set(exercise.id, toCatalogEntry(exercise));
    });

  source
    .map((exercise) => ({
      exercise,
      score: scoreWorkoutCatalogExercise(exercise, targetMuscles, equipment),
    }))
    .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name))
    .slice(0, MAX_WORKOUT_CONTEXT_EXERCISES)
    .forEach(({ exercise }) => {
      selectedById.set(exercise.id, toCatalogEntry(exercise));
    });

  return Array.from(selectedById.values()).slice(0, MAX_WORKOUT_CONTEXT_EXERCISES);
};

async function enrichWorkoutRequestContext(
  intent: AIIntent,
  message: string,
  context?: AIRequestContext
): Promise<AIRequestContext | undefined> {
  if (!shouldSendWorkoutExerciseCatalog(intent, message, context)) {
    return context;
  }

  try {
    const catalogPrompt = context?.onboardingProgramSpec
      ? [
          context.onboardingProgramSpec.trainingEnvironment,
          ...(context.onboardingProgramSpec.muscleFocuses ?? []),
          context.onboardingProgramSpec.fitnessGoal,
          'full body push pull legs upper lower workout',
        ].filter(Boolean).join(' ')
      : message;
    const exerciseCatalog = await buildWorkoutExerciseCatalogForAI(
      catalogPrompt,
      context?.currentWorkoutTemplateDraft
    );
    if (exerciseCatalog.length === 0) {
      return context;
    }
    return {
      ...context,
      exerciseCatalog,
    };
  } catch (error) {
    console.warn('Failed to build bundled workout exercise catalog for AI request:', error);
    return context;
  }
}

async function getAuthenticatedUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Send a message to the AI assistant
 */
export async function sendAIMessage(
  intent: AIIntent,
  message: string,
  context?: AIRequestContext,
  history?: AIChatMessage[],
  images?: AIImage[]
): Promise<AIResponse> {
  const hasConsent = await hasAIDataSharingConsent();
  if (!hasConsent) {
    return {
      type: 'error',
      requestId: Crypto.randomUUID(),
      error: {
        code: 'CONSENT_REQUIRED',
        message: 'Allow AI data sharing in Settings to use AI features.',
        retryable: false,
      },
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      type: 'error',
      requestId: Crypto.randomUUID(),
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Supabase is not configured. Please check your environment variables.',
        retryable: false,
      },
    };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return {
      type: 'error',
      requestId: Crypto.randomUUID(),
      error: {
        code: 'UNAUTHORIZED',
        message: 'Please sign in to use AI features.',
        retryable: false,
      },
    };
  }

  const enrichedContext = await enrichWorkoutRequestContext(intent, message, context);

  const request: AIRequest = {
    intent,
    message,
    context: enrichedContext,
    history,
    images,
  };

  try {
    const { data, error, response } = await supabase.functions.invoke('ai', {
      body: request,
    });

    if (error) {
      if (response) {
        try {
          const parsed = await response.json();
          if (parsed && parsed.type === 'error' && parsed.error) {
            return {
              type: 'error',
              requestId: parsed.requestId || Crypto.randomUUID(),
              error: parsed.error,
            };
          }
        } catch (parseError) {
          console.warn('Failed to parse AI error response:', parseError);
        }
      }
      console.warn('AI function error:', error);
      return {
        type: 'error',
        requestId: Crypto.randomUUID(),
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to get AI response',
          retryable: true,
        },
      };
    }

    return data as AIResponse;
  } catch (err) {
    console.warn('AI service error:', err);
    return {
      type: 'error',
      requestId: Crypto.randomUUID(),
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        retryable: true,
      },
    };
  }
}

/**
 * Send a message to the Fortis analyst
 */
export async function askFortisAnalyst(query: string): Promise<AIResponse> {
  return sendAIMessage('FORTIS_ANALYST', query);
}

export async function generateOnboardingProgramWithAI(spec: OnboardingProgramSpec): Promise<AIResponse> {
  return sendAIMessage('GENERAL_CHAT', 'Generate my personalized onboarding program.', {
    onboardingProgramSpec: {
      id: spec.id,
      trainingEnvironment: spec.trainingEnvironment,
      muscleFocuses: spec.muscleFocuses,
      fitnessPriorities: spec.fitnessPriorities,
      fitnessGoal: spec.fitnessGoal,
      liftingExperience: spec.liftingExperience,
      sessionDurationMinutes: spec.sessionDurationMinutes,
      goalPace: spec.goalPace,
      workoutsPerWeek: spec.workoutsPerWeek,
      scheduleDays: spec.scheduleDays,
      durationWeeks: spec.durationWeeks,
      userName: spec.userName,
      programName: spec.programName,
    },
  });
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(): Promise<AIRateLimitStatus | null> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('ai_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    return null;
  }

  return {
    allowed: true,
    actionsThisMinute: data.actions_this_minute,
    actionsThisHour: data.actions_this_hour,
    actionsThisDay: data.actions_this_day,
    actionsThisWeek: data.actions_this_week ?? 0,
    actionsThisMonth: data.actions_this_month ?? 0,
    maxPerMinute: data.max_per_minute,
    maxPerHour: data.max_per_hour,
    maxPerDay: data.max_per_day,
    maxPerWeek: data.max_per_week ?? 75,
    maxPerMonth: data.max_per_month ?? 150,
  };
}
