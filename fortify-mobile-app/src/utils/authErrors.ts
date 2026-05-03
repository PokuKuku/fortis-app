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

