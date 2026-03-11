import * as Crypto from 'expo-crypto';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { requestAIDataSharingConsent } from './aiConsentService';
import type {
  WorkoutVoiceInterpretation,
  WorkoutVoiceRequest,
  WorkoutVoiceResponse,
} from '../types/workoutVoice';

const isInterpretation = (value: unknown): value is WorkoutVoiceInterpretation => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.transcript === 'string'
    && (typeof record.sets === 'number' || record.sets === null)
    && (typeof record.weight === 'number' || record.weight === null)
    && (typeof record.reps === 'number' || record.reps === null)
    && (record.weightUnit === 'lbs' || record.weightUnit === 'kg' || record.weightUnit === null)
    && typeof record.inferredSets === 'boolean'
    && typeof record.inferredWeightUnit === 'boolean'
    && Array.isArray(record.missingFields)
    && (record.confidence === 'high' || record.confidence === 'medium' || record.confidence === 'low')
  );
};

const normalizeResponse = (data: unknown): WorkoutVoiceResponse => {
  if (!data || typeof data !== 'object') {
    return {
      type: 'error',
      error: {
        code: 'INVALID_RESPONSE',
        message: 'The voice logging service returned an invalid response.',
        retryable: true,
      },
    };
  }

  const record = data as Record<string, unknown>;
  if (record.type === 'success' && isInterpretation(record.interpretation)) {
    return {
      type: 'success',
      interpretation: record.interpretation,
    };
  }

  const error = record.error as Record<string, unknown> | undefined;
  return {
    type: 'error',
    error: {
      code: typeof error?.code === 'string' ? error.code : 'VOICE_LOG_ERROR',
      message: typeof error?.message === 'string'
        ? error.message
        : 'Unable to interpret that workout entry.',
      retryable: typeof error?.retryable === 'boolean' ? error.retryable : true,
    },
  };
};

export async function interpretWorkoutVoiceLog(
  request: WorkoutVoiceRequest
): Promise<WorkoutVoiceResponse> {
  const allowed = await requestAIDataSharingConsent();
  if (!allowed) {
    return {
      type: 'error',
      error: {
        code: 'CONSENT_REQUIRED',
        message: 'Allow AI data sharing to use voice workout logging.',
        retryable: false,
      },
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      type: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Supabase is not configured.',
        retryable: false,
      },
    };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return {
      type: 'error',
      error: {
        code: 'UNAUTHORIZED',
        message: 'Please sign in to use voice workout logging.',
        retryable: false,
      },
    };
  }

  try {
    const { data, error, response } = await supabase.functions.invoke('workout-voice-log', {
      body: request,
    });

    if (error) {
      if (response) {
        try {
          const parsed = await response.json();
          return normalizeResponse(parsed);
        } catch {
          // Fall through to generic error
        }
      }

      return {
        type: 'error',
        error: {
          code: 'VOICE_LOG_ERROR',
          message: error.message || 'Unable to interpret that workout entry.',
          retryable: true,
        },
      };
    }

    return normalizeResponse(data);
  } catch (error) {
    return {
      type: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unexpected voice logging error.',
        retryable: true,
      },
    };
  }
}

export const createVoiceLogFileName = (extension = 'm4a') =>
  `workout-voice-${Crypto.randomUUID()}.${extension}`;
