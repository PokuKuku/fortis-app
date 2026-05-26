const mockInvoke = jest.fn();
const mockGetSession = jest.fn();
const mockIsSupabaseConfigured = jest.fn(() => true);
const mockHasConsent = jest.fn(() => Promise.resolve(true));

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
  isSupabaseConfigured: () => mockIsSupabaseConfigured(),
}));

jest.mock('@/src/services/aiConsentService', () => ({
  hasAIDataSharingConsent: () => mockHasConsent(),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-request-id',
}));

import {
  createRealtimeCoachSession,
  reportRealtimeCoachUsage,
} from '@/src/services/realtimeCoachService';

const preferences = {
  personality: 'direct' as const,
  intensity: 0.55,
  voice: 'marin' as const,
};

describe('realtimeCoachService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSupabaseConfigured.mockReturnValue(true);
    mockHasConsent.mockResolvedValue(true);
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } });
  });

  it('requires local AI data sharing consent', async () => {
    mockHasConsent.mockResolvedValue(false);

    const response = await createRealtimeCoachSession(preferences);

    expect(response.type).toBe('error');
    expect(response.type === 'error' ? response.error.code : null).toBe('CONSENT_REQUIRED');
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('invokes the realtime session function with preferences', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        provider: 'gemini',
        accessToken: 'auth_tokens/test-token',
        liveEndpoint: 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained',
        expiresAt: '2026-05-22T22:00:00.000Z',
        model: 'gemini-3.1-flash-live-preview',
        voice: 'marin',
        usage: {
          secondsUsedToday: 300,
          maxSecondsPerDay: 1200,
          maxSecondsPerSession: 300,
        },
      },
      error: null,
      response: null,
    });

    const response = await createRealtimeCoachSession(preferences);

    expect(response.type).toBe('session');
    expect(response.type === 'session' ? response.session.provider : null).toBe('gemini');
    expect(response.type === 'session' ? response.session.accessToken : null).toBe('auth_tokens/test-token');
    expect(mockInvoke).toHaveBeenCalledWith('ai-realtime-session', {
      body: {
        action: 'start_session',
        preferences,
        aiDataSharingConsent: true,
      },
    });
  });

  it('reports actual realtime usage seconds', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        type: 'usage_recorded',
        usage: {
          secondsUsedToday: 45,
          maxSecondsPerDay: 7200,
          maxSecondsPerSession: 1800,
        },
      },
      error: null,
      response: null,
    });

    const usage = await reportRealtimeCoachUsage(45.8);

    expect(usage?.secondsUsedToday).toBe(45);
    expect(mockInvoke).toHaveBeenCalledWith('ai-realtime-session', {
      body: {
        action: 'record_usage',
        aiDataSharingConsent: true,
        secondsUsed: 45,
      },
    });
  });

  it('normalizes edge function errors', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: new Error('Function failed'),
      response: {
        json: async () => ({
          type: 'error',
          requestId: 'edge-request-id',
          error: {
            code: 'RATE_LIMITED',
            message: 'Limit reached',
            retryable: true,
            retryAfterSeconds: 60,
          },
        }),
      },
    });

    const response = await createRealtimeCoachSession(preferences);

    expect(response.type).toBe('error');
    expect(response.type === 'error' ? response.requestId : null).toBe('edge-request-id');
    expect(response.type === 'error' ? response.error.code : null).toBe('RATE_LIMITED');
  });

  it('exposes stale or invalid realtime session payload details in development debug mode', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        clientSecret: 'old-openai-secret',
        model: 'gpt-realtime-mini',
        voice: 'marin',
        usage: {
          secondsUsedToday: 300,
          maxSecondsPerDay: 1200,
          maxSecondsPerSession: 300,
        },
      },
      error: null,
      response: null,
    });

    const response = await createRealtimeCoachSession(preferences);

    expect(response.type).toBe('error');
    expect(response.type === 'error' ? response.error.message : null).toContain('Invalid realtime session response');
    expect(response.type === 'error' ? response.error.message : null).toContain('clientSecret');
  });
});
