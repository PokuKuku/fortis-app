import * as Crypto from 'expo-crypto';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { hasAIDataSharingConsent } from '@/src/services/aiConsentService';
import { sendAIMessage } from '@/src/services/aiService';
import type { AIRequestContext, AIResponse } from '@/src/types/ai';
import type {
  RealtimeCoachPreferences,
  RealtimeCoachScriptAudio,
  RealtimeCoachSession,
  RealtimeCoachUsage,
} from '@/src/types/realtimeCoach';

type RealtimeCoachErrorCode =
  | 'CONSENT_REQUIRED'
  | 'UNAUTHORIZED'
  | 'SUBSCRIPTION_REQUIRED'
  | 'RATE_LIMITED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

export type RealtimeCoachServiceResponse =
  | { type: 'session'; session: RealtimeCoachSession }
  | {
      type: 'error';
      requestId: string;
      error: {
        code: RealtimeCoachErrorCode;
        message: string;
        retryable: boolean;
        retryAfterSeconds?: number;
      };
    };

export type RealtimeCoachScriptAudioResponse =
  | { type: 'script_audio'; audio: RealtimeCoachScriptAudio }
  | Extract<RealtimeCoachServiceResponse, { type: 'error' }>;

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
        action: 'start_session',
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
      console.warn('[Voice Coach] invalid realtime session response', {
        keys: data && typeof data === 'object' ? Object.keys(data) : [],
        provider: data?.provider,
        hasAccessToken: Boolean(data?.accessToken),
        hasLiveEndpoint: Boolean(data?.liveEndpoint),
        hasUsage: Boolean(data?.usage),
        hasModel: Boolean(data?.model),
        hasVoice: Boolean(data?.voice),
      });
      return {
        type: 'error',
        requestId: Crypto.randomUUID(),
        error: {
          code: 'INTERNAL_ERROR',
          message: `Invalid realtime session response: ${JSON.stringify({
            keys: data && typeof data === 'object' ? Object.keys(data) : [],
            provider: data?.provider,
            hasAccessToken: Boolean(data?.accessToken),
            hasLiveEndpoint: Boolean(data?.liveEndpoint),
            hasUsage: Boolean(data?.usage),
            hasModel: Boolean(data?.model),
            hasVoice: Boolean(data?.voice),
          })}`,
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

export async function reportRealtimeCoachUsage(secondsUsed: number): Promise<RealtimeCoachUsage | null> {
  if (!isSupabaseConfigured()) return null;

  const normalizedSeconds = Math.max(0, Math.floor(secondsUsed));
  if (!Number.isFinite(normalizedSeconds) || normalizedSeconds <= 0) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  try {
    const { data, error } = await supabase.functions.invoke('ai-realtime-session', {
      body: {
        action: 'record_usage',
        aiDataSharingConsent: true,
        secondsUsed: normalizedSeconds,
      },
    });

    if (error) {
      console.warn('[Voice Coach] failed to report usage', error.message);
      return null;
    }

    return data?.usage ?? null;
  } catch (error) {
    console.warn('[Voice Coach] failed to report usage', error);
    return null;
  }
}

export async function generateRealtimeCoachScriptAudio(
  script: string,
  preferences: RealtimeCoachPreferences
): Promise<RealtimeCoachScriptAudioResponse> {
  const hasConsent = await hasAIDataSharingConsent();
  if (!hasConsent) {
    return {
      type: 'error',
      requestId: Crypto.randomUUID(),
      error: {
        code: 'CONSENT_REQUIRED',
        message: 'Allow AI data sharing in Settings to use Voice Coach scripts.',
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
        message: 'Please sign in to use Voice Coach scripts.',
        retryable: false,
      },
    };
  }

  try {
    const { data, error, response } = await supabase.functions.invoke('ai-realtime-session', {
      body: {
        action: 'generate_script_audio',
        script,
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
          message: error.message || 'Unable to generate Voice Coach script audio.',
          retryable: true,
        },
      };
    }

    if (
      data?.type !== 'script_audio'
      || typeof data.audioBase64 !== 'string'
      || typeof data.mimeType !== 'string'
      || typeof data.sampleRate !== 'number'
      || typeof data.voice !== 'string'
    ) {
      return {
        type: 'error',
        requestId: Crypto.randomUUID(),
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Invalid Voice Coach script audio response.',
          retryable: true,
        },
      };
    }

    return {
      type: 'script_audio',
      audio: data as RealtimeCoachScriptAudio,
    };
  } catch (error) {
    return {
      type: 'error',
      requestId: Crypto.randomUUID(),
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unable to generate Voice Coach script audio.',
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
