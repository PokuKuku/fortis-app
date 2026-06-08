export const isInvalidRefreshTokenError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;

  const value = error as { name?: unknown; message?: unknown };
  return (
    value.name === 'AuthApiError' &&
    typeof value.message === 'string' &&
    value.message.includes('Invalid Refresh Token') &&
    value.message.includes('Refresh Token Not Found')
  );
};

const POSTHOG_FLUSH_ERROR_PREFIX = 'Error while flushing PostHog';
const POSTHOG_NETWORK_ERROR_MESSAGE = 'Network error while fetching PostHog';

export const isExpectedPostHogFlushNetworkError = (args: readonly unknown[]): boolean => {
  const hasPostHogFlushPrefix = args.some(
    (value) => typeof value === 'string' && value.startsWith(POSTHOG_FLUSH_ERROR_PREFIX)
  );
  if (!hasPostHogFlushPrefix) return false;

  return args.some((value) => {
    if (!value || typeof value !== 'object') return false;

    const error = value as { name?: unknown; message?: unknown };
    return error.name === 'PostHogFetchNetworkError'
      || error.message === POSTHOG_NETWORK_ERROR_MESSAGE;
  });
};

export const shouldSuppressDevConsoleError = (args: readonly unknown[]): boolean =>
  args.some(isInvalidRefreshTokenError) || isExpectedPostHogFlushNetworkError(args);
