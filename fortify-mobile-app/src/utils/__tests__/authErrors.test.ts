import {
  isExpectedPostHogFlushNetworkError,
  isInvalidRefreshTokenError,
  shouldSuppressDevConsoleError,
} from '@/src/utils/authErrors';

describe('isInvalidRefreshTokenError', () => {
  it('matches Supabase stale refresh-token errors', () => {
    expect(
      isInvalidRefreshTokenError({
        name: 'AuthApiError',
        message: 'Invalid Refresh Token: Refresh Token Not Found',
      })
    ).toBe(true);
  });

  it('does not match unrelated auth errors', () => {
    expect(
      isInvalidRefreshTokenError({
        name: 'AuthApiError',
        message: 'Invalid login credentials',
      })
    ).toBe(false);
  });

  it('does not match non-error values', () => {
    expect(isInvalidRefreshTokenError(null)).toBe(false);
    expect(isInvalidRefreshTokenError('Invalid Refresh Token')).toBe(false);
  });
});

describe('isExpectedPostHogFlushNetworkError', () => {
  it('matches PostHog flush errors with the network error name', () => {
    expect(isExpectedPostHogFlushNetworkError([
      'Error while flushing PostHog',
      {
        name: 'PostHogFetchNetworkError',
        message: 'Request failed',
      },
    ])).toBe(true);
  });

  it('matches PostHog flush errors with only the network error message', () => {
    expect(isExpectedPostHogFlushNetworkError([
      'Error while flushing PostHog',
      {
        message: 'Network error while fetching PostHog',
      },
    ])).toBe(true);
  });

  it('does not match PostHog HTTP or API flush errors', () => {
    expect(isExpectedPostHogFlushNetworkError([
      'Error while flushing PostHog: message=Bad request, response body=invalid',
      {
        name: 'PostHogFetchHttpError',
        message: 'Bad request',
      },
    ])).toBe(false);
  });

  it('does not match unrelated console errors', () => {
    expect(isExpectedPostHogFlushNetworkError([
      'Unable to finish onboarding',
      {
        name: 'PostHogFetchNetworkError',
        message: 'Network error while fetching PostHog',
      },
    ])).toBe(false);
  });
});

describe('shouldSuppressDevConsoleError', () => {
  it('keeps stale refresh token and expected PostHog network errors quiet', () => {
    expect(shouldSuppressDevConsoleError([{
      name: 'AuthApiError',
      message: 'Invalid Refresh Token: Refresh Token Not Found',
    }])).toBe(true);

    expect(shouldSuppressDevConsoleError([
      'Error while flushing PostHog',
      {
        name: 'PostHogFetchNetworkError',
        message: 'Network error while fetching PostHog',
      },
    ])).toBe(true);
  });

  it('preserves unrelated console errors', () => {
    expect(shouldSuppressDevConsoleError([
      'Unable to finish onboarding',
      new Error('Database update failed'),
    ])).toBe(false);
  });
});
