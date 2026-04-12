import * as Crypto from 'expo-crypto';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  ExerciseVoiceEntry,
  ExerciseVoiceInterpretation,
  ExerciseVoiceRequest,
  ExerciseVoiceResponse,
} from '../types/exerciseVoice';

const isEntry = (value: unknown): value is ExerciseVoiceEntry => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.exerciseQuery === 'string'
    && record.exerciseQuery.trim().length > 0
    && (typeof record.setCount === 'number' || record.setCount === null)
    && (record.confidence === 'high' || record.confidence === 'medium' || record.confidence === 'low')
  );
};

const isInterpretation = (value: unknown): value is ExerciseVoiceInterpretation => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.transcript === 'string' && Array.isArray(record.entries) && record.entries.every(isEntry);
};

const normalizeResponse = (data: unknown): ExerciseVoiceResponse => {
  if (!data || typeof data !== 'object') {
    return {
      type: 'error',
      error: {
        code: 'INVALID_RESPONSE',
        message: 'The exercise voice service returned an invalid response.',
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
      code: typeof error?.code === 'string' ? error.code : 'EXERCISE_VOICE_ERROR',
      message: typeof error?.message === 'string'
        ? error.message
        : 'Unable to interpret that exercise request.',
      retryable: typeof error?.retryable === 'boolean' ? error.retryable : true,
    },
  };
};

export async function interpretExerciseVoiceAdd(
  request: ExerciseVoiceRequest
): Promise<ExerciseVoiceResponse> {
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

  try {
    const { data, error, response } = await supabase.functions.invoke('exercise-voice-add', {
      body: request,
    });

    if (error) {
      if (response) {
        try {
          const parsed = await response.json();
          return normalizeResponse(parsed);
        } catch {
          // Fall through.
        }
      }

      return {
        type: 'error',
        error: {
          code: 'EXERCISE_VOICE_ERROR',
          message: error.message || 'Unable to interpret that exercise request.',
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
        message: error instanceof Error ? error.message : 'Unexpected exercise voice error.',
        retryable: true,
      },
    };
  }
}

export const createExerciseVoiceFileName = (extension = 'm4a') =>
  `exercise-voice-${Crypto.randomUUID()}.${extension}`;
