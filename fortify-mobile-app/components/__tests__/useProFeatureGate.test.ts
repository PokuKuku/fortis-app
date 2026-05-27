import { renderHook } from '@testing-library/react-native';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';

const mockRegisterPlacement = jest.fn();
const mockRefresh = jest.fn();
const mockGetEntitlements = jest.fn();
const mockSetSubscriptionStatus = jest.fn();
const mockShouldBypassProGateForTour = jest.fn();

let mockSubscriptionStatus: any = { status: 'INACTIVE' };
let mockPlacementCallbacks: any = null;

jest.mock(
  'expo-superwall',
  () => ({
    usePlacement: jest.fn((callbacks) => {
      mockPlacementCallbacks = callbacks;
      return {
        registerPlacement: mockRegisterPlacement,
      };
    }),
    useSuperwall: jest.fn((selector: (state: any) => any) => selector({
      isConfigured: true,
      isLoading: false,
      configurationError: null,
    })),
    useUser: jest.fn(() => ({
      refresh: mockRefresh,
      subscriptionStatus: mockSubscriptionStatus,
      getEntitlements: mockGetEntitlements,
      setSubscriptionStatus: mockSetSubscriptionStatus,
    })),
  }),
  { virtual: true },
);

jest.mock('@/src/contexts/InAppTourContext', () => ({
  useInAppTour: jest.fn(() => ({
    shouldBypassProGateForTour: mockShouldBypassProGateForTour,
  })),
}));

describe('useProFeatureGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscriptionStatus = { status: 'INACTIVE' };
    mockPlacementCallbacks = null;
    mockRefresh.mockResolvedValue({});
    mockGetEntitlements.mockResolvedValue({ active: [], inactive: [] });
    mockSetSubscriptionStatus.mockResolvedValue(undefined);
    mockShouldBypassProGateForTour.mockReturnValue(false);
    mockRegisterPlacement.mockImplementation(async () => {
      mockPlacementCallbacks?.onSkip?.({ type: 'PlacementNotFound' });
    });
  });

  it('runs matching tour placement actions without registering a Superwall placement', async () => {
    mockShouldBypassProGateForTour.mockImplementation(
      (placement) => placement === PAYWALL_PLACEMENTS.voiceExerciseAdd,
    );
    const action = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useProFeatureGate());

    await expect(result.current.runProFeature({
      placement: PAYWALL_PLACEMENTS.voiceExerciseAdd,
    }, action)).resolves.toBe(true);

    expect(action).toHaveBeenCalledTimes(1);
    expect(mockRegisterPlacement).not.toHaveBeenCalled();
  });

  it('does not bypass unrelated placements during the tour', async () => {
    mockShouldBypassProGateForTour.mockImplementation(
      (placement) => placement === PAYWALL_PLACEMENTS.voiceExerciseAdd,
    );
    const action = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useProFeatureGate());

    await expect(result.current.runProFeature({
      placement: PAYWALL_PLACEMENTS.programLimit,
    }, action)).resolves.toBe(false);

    expect(action).not.toHaveBeenCalled();
    expect(mockRegisterPlacement).toHaveBeenCalledWith(expect.objectContaining({
      placement: PAYWALL_PLACEMENTS.programLimit,
    }));
  });

  it('still runs Pro users immediately without registering a Superwall placement', async () => {
    mockSubscriptionStatus = {
      status: 'ACTIVE',
      entitlements: [{ id: 'fortis_pro', type: 'SERVICE_LEVEL' }],
    };
    const action = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useProFeatureGate());

    await expect(result.current.runProFeature({
      placement: PAYWALL_PLACEMENTS.workoutLimit,
    }, action)).resolves.toBe(true);

    expect(action).toHaveBeenCalledTimes(1);
    expect(mockRegisterPlacement).not.toHaveBeenCalled();
  });
});
