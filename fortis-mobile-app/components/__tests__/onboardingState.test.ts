const mockGetScopedItem = jest.fn();
const mockSetScopedItem = jest.fn();
const mockRemoveScopedItem = jest.fn();

jest.mock('@/src/utils/scopedStorage', () => ({
  getScopedItem: (...args: unknown[]) => mockGetScopedItem(...args),
  setScopedItem: (...args: unknown[]) => mockSetScopedItem(...args),
  removeScopedItem: (...args: unknown[]) => mockRemoveScopedItem(...args),
}));

describe('onboardingState', () => {
  const loadModule = () =>
    require('@/src/utils/onboardingState') as typeof import('@/src/utils/onboardingState');

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockGetScopedItem.mockReset();
    mockSetScopedItem.mockReset();
    mockRemoveScopedItem.mockReset();
  });

  it('loads onboarding state from scoped storage without requiring auth', async () => {
    mockGetScopedItem.mockResolvedValue(JSON.stringify({ full_name: 'Alex' }));

    const { getOnboardingState } = loadModule();
    const state = await getOnboardingState();

    expect(state).toEqual({ full_name: 'Alex' });
    expect(mockGetScopedItem).toHaveBeenCalledWith('onboarding_state_v1');
  });

  it('persists onboarding state updates to scoped storage', async () => {
    mockGetScopedItem.mockResolvedValueOnce(null);
    mockSetScopedItem.mockResolvedValue(undefined);

    const { updateOnboardingState } = loadModule();
    const next = await updateOnboardingState({ full_name: 'Taylor' });

    expect(next).toEqual({ full_name: 'Taylor' });
    expect(mockSetScopedItem).toHaveBeenCalledWith(
      'onboarding_state_v1',
      JSON.stringify({ full_name: 'Taylor' }),
    );
  });

  it('clears onboarding state from scoped storage', async () => {
    mockRemoveScopedItem.mockResolvedValue(undefined);

    const { clearOnboardingState } = loadModule();
    await clearOnboardingState();

    expect(mockRemoveScopedItem).toHaveBeenCalledWith('onboarding_state_v1');
  });

  it('removes corrupted onboarding state payload', async () => {
    mockGetScopedItem.mockResolvedValue('not-json');
    mockRemoveScopedItem.mockResolvedValue(undefined);

    const { getOnboardingState } = loadModule();
    const state = await getOnboardingState();

    expect(state).toBeNull();
    expect(mockRemoveScopedItem).toHaveBeenCalledWith('onboarding_state_v1');
  });
});
