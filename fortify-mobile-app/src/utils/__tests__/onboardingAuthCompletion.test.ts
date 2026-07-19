describe('onboardingAuthCompletion', () => {
  const loadModule = () => {
    jest.resetModules();
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const completion = require('@/src/utils/onboardingAuthCompletion') as typeof import('@/src/utils/onboardingAuthCompletion');
    return { AsyncStorage, completion };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not report a pending completion when persistence fails', async () => {
    const { AsyncStorage, completion } = loadModule();
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('storage unavailable'));
    AsyncStorage.getItem.mockResolvedValueOnce(null);

    await expect(completion.markPendingOnboardingAuthCompletion()).rejects.toThrow(
      'storage unavailable',
    );
    await expect(completion.hasPendingOnboardingAuthCompletion()).resolves.toBe(false);
  });

  it('does not let an older storage read overwrite a newly persisted completion intent', async () => {
    const { AsyncStorage, completion } = loadModule();
    const deferredRead: { resolve?: (value: string | null) => void } = {};
    AsyncStorage.getItem.mockImplementationOnce(
      () => new Promise<string | null>((resolve) => {
        deferredRead.resolve = resolve;
      }),
    );
    AsyncStorage.setItem.mockResolvedValueOnce(undefined);

    const pendingRead = completion.hasPendingOnboardingAuthCompletion();
    await completion.markPendingOnboardingAuthCompletion();
    deferredRead.resolve?.(null);

    await expect(pendingRead).resolves.toBe(true);
    await expect(completion.hasPendingOnboardingAuthCompletion()).resolves.toBe(true);
  });
});
