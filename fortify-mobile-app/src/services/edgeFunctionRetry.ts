type EdgeFunctionInvocationResult<T> = {
  data: T | null;
  error: unknown;
  response?: Response;
};

const TRANSIENT_FUNCTION_ERROR_NAMES = new Set([
  'FunctionsFetchError',
  'FunctionsRelayError',
]);

export const isTransientEdgeFunctionError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;

  const name = 'name' in error ? error.name : undefined;
  return typeof name === 'string' && TRANSIENT_FUNCTION_ERROR_NAMES.has(name);
};

const wait = (delayMs: number) => new Promise<void>((resolve) => {
  setTimeout(resolve, delayMs);
});

export async function invokeEdgeFunctionWithRetry<T>(
  invoke: () => Promise<EdgeFunctionInvocationResult<T>>,
  options: {
    retryDelayMs?: number;
    waitForRetry?: (delayMs: number) => Promise<void>;
  } = {}
): Promise<EdgeFunctionInvocationResult<T>> {
  const firstResult = await invoke();
  if (!isTransientEdgeFunctionError(firstResult.error)) {
    return firstResult;
  }

  await (options.waitForRetry ?? wait)(options.retryDelayMs ?? 500);
  return invoke();
}
