import {
  canCreateFreeProgram,
  canCreateFreeWorkoutTemplate,
  entitlementsInfoHasProAccess,
  isUserSubscribedSkipReason,
  subscriptionHasProAccess,
} from '@/src/components/superwall/proFeatureAccess';

describe('proFeatureAccess', () => {
  it('requires the Fortis Pro entitlement for Pro access', () => {
    expect(subscriptionHasProAccess({ status: 'INACTIVE' })).toBe(false);
    expect(subscriptionHasProAccess({
      status: 'ACTIVE',
      entitlements: [{ id: 'other_entitlement', type: 'SERVICE_LEVEL' }],
    })).toBe(false);
    expect(subscriptionHasProAccess({
      status: 'ACTIVE',
      entitlements: [{ id: 'fortis_pro', type: 'SERVICE_LEVEL' }],
    })).toBe(true);
  });

  it('detects Pro access from entitlement fetch results', () => {
    expect(entitlementsInfoHasProAccess({ active: [], inactive: [] })).toBe(false);
    expect(entitlementsInfoHasProAccess({
      active: [{ id: 'fortis_pro', type: 'SERVICE_LEVEL' }],
      inactive: [],
    })).toBe(true);
  });

  it('allows one free program and four free saved workout templates', () => {
    expect(canCreateFreeProgram(0, false)).toBe(true);
    expect(canCreateFreeProgram(1, false)).toBe(false);
    expect(canCreateFreeProgram(1, true)).toBe(true);

    expect(canCreateFreeWorkoutTemplate(3, false)).toBe(true);
    expect(canCreateFreeWorkoutTemplate(4, false)).toBe(false);
    expect(canCreateFreeWorkoutTemplate(4, true)).toBe(true);
  });

  it('recognizes Superwall already-subscribed skip payloads', () => {
    expect(isUserSubscribedSkipReason({ reason: 'userIsSubscribed' })).toBe(true);
    expect(isUserSubscribedSkipReason({ type: 'UserIsSubscribed' })).toBe(true);
    expect(isUserSubscribedSkipReason({ type: 'PlacementNotFound' })).toBe(false);
    expect(isUserSubscribedSkipReason({ reason: 'holdout' })).toBe(false);
  });
});
