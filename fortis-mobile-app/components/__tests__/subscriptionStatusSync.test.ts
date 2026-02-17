import type { SubscriptionStatus } from 'expo-superwall';
import { reconcileSubscriptionStatus } from '@/src/components/superwall/subscriptionStatusSync';

describe('reconcileSubscriptionStatus', () => {
  const activeEntitlement = { id: 'fortis_pro', type: 'SERVICE_LEVEL' } as const;

  it('activates access when active entitlements exist', async () => {
    const getEntitlements = jest.fn().mockResolvedValue({
      active: [activeEntitlement],
      inactive: [],
    });
    const setSubscriptionStatus = jest.fn().mockResolvedValue(undefined);

    const result = await reconcileSubscriptionStatus({
      currentStatus: { status: 'INACTIVE' },
      getEntitlements,
      setSubscriptionStatus,
    });

    expect(result).toEqual({ hasActiveSubscription: true, wasVerified: true });
    expect(setSubscriptionStatus).toHaveBeenCalledWith({
      status: 'ACTIVE',
      entitlements: [activeEntitlement],
    });
  });

  it('downgrades stale active status when no active entitlements remain', async () => {
    const getEntitlements = jest.fn().mockResolvedValue({
      active: [],
      inactive: [activeEntitlement],
    });
    const setSubscriptionStatus = jest.fn().mockResolvedValue(undefined);
    const currentStatus: SubscriptionStatus = {
      status: 'ACTIVE',
      entitlements: [activeEntitlement],
    };

    const result = await reconcileSubscriptionStatus({
      currentStatus,
      getEntitlements,
      setSubscriptionStatus,
    });

    expect(result).toEqual({ hasActiveSubscription: false, wasVerified: true });
    expect(setSubscriptionStatus).toHaveBeenCalledWith({ status: 'INACTIVE' });
  });

  it('does not write status when entitlements already match current active status', async () => {
    const getEntitlements = jest.fn().mockResolvedValue({
      active: [activeEntitlement],
      inactive: [],
    });
    const setSubscriptionStatus = jest.fn().mockResolvedValue(undefined);
    const currentStatus: SubscriptionStatus = {
      status: 'ACTIVE',
      entitlements: [activeEntitlement],
    };

    const result = await reconcileSubscriptionStatus({
      currentStatus,
      getEntitlements,
      setSubscriptionStatus,
    });

    expect(result).toEqual({ hasActiveSubscription: true, wasVerified: true });
    expect(setSubscriptionStatus).not.toHaveBeenCalled();
  });

  it('falls back safely to current status when entitlement fetch fails', async () => {
    const getEntitlements = jest.fn().mockRejectedValue(new Error('network'));
    const setSubscriptionStatus = jest.fn().mockResolvedValue(undefined);

    const result = await reconcileSubscriptionStatus({
      currentStatus: {
        status: 'ACTIVE',
        entitlements: [activeEntitlement],
      },
      getEntitlements,
      setSubscriptionStatus,
    });

    expect(result).toEqual({ hasActiveSubscription: true, wasVerified: false });
    expect(setSubscriptionStatus).not.toHaveBeenCalled();
  });
});
