import { isInvalidRefreshTokenError } from '@/src/utils/authErrors';

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

