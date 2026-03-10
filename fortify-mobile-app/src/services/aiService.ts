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
} from '../types/ai';
import { hasAIDataSharingConsent } from '@/src/services/aiConsentService';

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
  history?: AIChatMessage[]
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

  const request: AIRequest = {
    intent,
    message,
    context,
    history,
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
      console.error('AI function error:', error);
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
    console.error('AI service error:', err);
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
