import {
  invokeEdgeFunctionWithRetry,
  isTransientEdgeFunctionError,
} from '@/src/services/edgeFunctionRetry';

const result = (error: unknown, data: string | null = null) => ({
  data,
  error,
});

describe('edgeFunctionRetry', () => {
  it.each(['FunctionsFetchError', 'FunctionsRelayError'])(
    'recognizes %s as transient',
    (name) => {
      expect(isTransientEdgeFunctionError({ name })).toBe(true);
    }
  );

  it('does not classify Edge Function HTTP errors as transient', () => {
    expect(isTransientEdgeFunctionError({ name: 'FunctionsHttpError' })).toBe(false);
  });

  it('retries once after a transport failure', async () => {
    const invoke = jest
      .fn()
      .mockResolvedValueOnce(result({ name: 'FunctionsFetchError' }))
      .mockResolvedValueOnce(result(null, 'ok'));
    const waitForRetry = jest.fn().mockResolvedValue(undefined);

    await expect(invokeEdgeFunctionWithRetry(invoke, { waitForRetry })).resolves.toEqual(
      result(null, 'ok')
    );
    expect(invoke).toHaveBeenCalledTimes(2);
    expect(waitForRetry).toHaveBeenCalledWith(500);
  });

  it('does not retry a structured HTTP error', async () => {
    const httpError = { name: 'FunctionsHttpError' };
    const invoke = jest.fn().mockResolvedValue(result(httpError));

    await expect(invokeEdgeFunctionWithRetry(invoke)).resolves.toEqual(result(httpError));
    expect(invoke).toHaveBeenCalledTimes(1);
  });
});
