import * as Crypto from 'expo-crypto';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { hasAIDataSharingConsent } from '@/src/services/aiConsentService';
import { sendAIMessage } from '@/src/services/aiService';
import type { AIRequestContext, AIResponse } from '@/src/types/ai';
import type {
  RealtimeCoachPreferences,
  RealtimeCoachSession,
} from '@/src/types/realtimeCoach';

export type RealtimeCoachServiceResponse =
  | { type: 'session'; session: RealtimeCoachSession }
  | {
      type: 'error';
      requestId: string;
      error: {
        code: 'CONSENT_REQUIRED' | 'UNAUTHORIZED' | 'SUBSCRIPTION_REQUIRED' | 'RATE_LIMITED' | 'INTERNAL_ERROR';
        message: string;
        retryable: boolean;
        retryAfterSeconds?: number;
      };
    };

export async function createRealtimeCoachSession(
  preferences: RealtimeCoachPreferences
): Promise<RealtimeCoachServiceResponse> {
  const hasConsent = await hasAIDataSharingConsent();
  if (!hasConsent) {
    return {
      type: 'error',
      requestId: Crypto.randomUUID(),
      error: {
        code: 'CONSENT_REQUIRED',
        message: 'Allow AI data sharing in Settings to use Voice Coach.',
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
        message: 'Supabase is not configured.',
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
        message: 'Please sign in to use Voice Coach.',
        retryable: false,
      },
    };
  }

  try {
    const { data, error, response } = await supabase.functions.invoke('ai-realtime-session', {
      body: {
        preferences,
        aiDataSharingConsent: true,
      },
    });

    if (error) {
      if (response) {
        try {
          const parsed = await response.json();
          if (parsed?.type === 'error' && parsed.error) {
            return {
              type: 'error',
              requestId: parsed.requestId || Crypto.randomUUID(),
              error: parsed.error,
            };
          }
        } catch {
          // Fall through to generic error.
        }
      }

      return {
        type: 'error',
        requestId: Crypto.randomUUID(),
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Unable to start Voice Coach.',
          retryable: true,
        },
      };
    }

    if (
      data?.provider !== 'gemini'
      || !data?.accessToken
      || !data?.liveEndpoint
      || !data?.usage
      || !data?.model
      || !data?.voice
    ) {
      return {
        type: 'error',
        requestId: Crypto.randomUUID(),
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Voice Coach returned an invalid session.',
          retryable: true,
        },
      };
    }

    return {
      type: 'session',
      session: data as RealtimeCoachSession,
    };
  } catch (error) {
    return {
      type: 'error',
      requestId: Crypto.randomUUID(),
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unable to start Voice Coach.',
        retryable: true,
      },
    };
  }
}

export async function generateVoiceWorkoutTemplate(
  prompt: string,
  context?: AIRequestContext
): Promise<AIResponse> {
  return sendAIMessage('GENERAL_CHAT', prompt, context);
}
