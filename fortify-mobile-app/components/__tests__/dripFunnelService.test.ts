import {
  DRIP_FUNNEL_CAMPAIGN_KEY,
  DRIP_FUNNEL_DISCOUNT_PLACEMENT,
  DRIP_FUNNEL_INITIAL_PLACEMENTS,
  getDiscountPlacementFromNotification,
  isDripFunnelInitialPlacement,
  isDripFunnelNotification,
  trackDripFunnelPaywallPresented,
} from '@/src/services/dripFunnelService';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    easConfig: { projectId: 'project-1' },
    expoConfig: { extra: { eas: { projectId: 'project-1' } } },
    sessionId: 'session-1',
  },
}));

jest.mock('@/src/lib/supabase', () => ({
  isSupabaseConfigured: jest.fn(() => true),
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

describe('dripFunnelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { supabase } = jest.requireMock('@/src/lib/supabase');
    supabase.functions.invoke.mockResolvedValue({});
  });

  it('recognizes only the initial paywall placements for scheduling', () => {
    expect(DRIP_FUNNEL_INITIAL_PLACEMENTS.has('fortis_first')).toBe(true);
    expect(isDripFunnelInitialPlacement('fortis_first')).toBe(true);
    expect(isDripFunnelInitialPlacement(DRIP_FUNNEL_DISCOUNT_PLACEMENT)).toBe(false);
    expect(isDripFunnelInitialPlacement(null)).toBe(false);
  });

  it('recognizes drip notification payloads', () => {
    expect(isDripFunnelNotification({ campaignKey: DRIP_FUNNEL_CAMPAIGN_KEY })).toBe(true);
    expect(isDripFunnelNotification({ kind: 'drip-discount' })).toBe(true);
    expect(isDripFunnelNotification({ offer: 'drip_discount_25' })).toBe(true);
    expect(isDripFunnelNotification({ kind: 'workout-reminder' })).toBe(false);
  });

  it('resolves the discount placement from notification data', () => {
    expect(getDiscountPlacementFromNotification({
      campaignKey: DRIP_FUNNEL_CAMPAIGN_KEY,
      placement: 'custom_discount_placement',
    })).toBe('custom_discount_placement');

    expect(getDiscountPlacementFromNotification({
      campaignKey: DRIP_FUNNEL_CAMPAIGN_KEY,
    })).toBe(DRIP_FUNNEL_DISCOUNT_PLACEMENT);

    expect(getDiscountPlacementFromNotification({
      kind: 'workout-reminder',
    })).toBeNull();
  });

  it('schedules only initial paywall presentations', async () => {
    const { supabase } = jest.requireMock('@/src/lib/supabase');

    await expect(trackDripFunnelPaywallPresented({
      placement: 'fortis_first',
      paywallName: 'Onboarding Paywall',
      resultType: 'presented',
    })).resolves.toBe(true);

    expect(supabase.functions.invoke).toHaveBeenCalledWith('drip-funnel', {
      body: {
        action: 'paywall_presented',
        placement: 'fortis_first',
        paywallName: 'Onboarding Paywall',
        resultType: 'presented',
      },
    });

    supabase.functions.invoke.mockClear();

    await expect(trackDripFunnelPaywallPresented({
      placement: DRIP_FUNNEL_DISCOUNT_PLACEMENT,
    })).resolves.toBe(false);

    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });
});
