import {
  shouldRedirectToPaywallGateFromTabs,
  shouldShowPaywallGateConfigError,
} from '@/src/components/superwall/superwallGuards';

describe('superwallGuards', () => {
  describe('shouldShowPaywallGateConfigError', () => {
    it('returns true when Superwall has a configuration error and gate has not navigated', () => {
      expect(
        shouldShowPaywallGateConfigError({
          hasSuperwallError: true,
          hasNavigated: false,
        }),
      ).toBe(true);
    });

    it('returns false once gate has already navigated', () => {
      expect(
        shouldShowPaywallGateConfigError({
          hasSuperwallError: true,
          hasNavigated: true,
        }),
      ).toBe(false);
    });
  });

  describe('shouldRedirectToPaywallGateFromTabs', () => {
    it('redirects authenticated inactive users after Superwall is ready', () => {
      expect(
        shouldRedirectToPaywallGateFromTabs({
          isAuthLoading: false,
          isAuthenticated: true,
          isSuperwallReady: true,
          subscriptionStatus: 'INACTIVE',
        }),
      ).toBe(true);
    });

    it('does not redirect while auth is loading', () => {
      expect(
        shouldRedirectToPaywallGateFromTabs({
          isAuthLoading: true,
          isAuthenticated: true,
          isSuperwallReady: true,
          subscriptionStatus: 'INACTIVE',
        }),
      ).toBe(false);
    });

    it('does not redirect before Superwall is ready', () => {
      expect(
        shouldRedirectToPaywallGateFromTabs({
          isAuthLoading: false,
          isAuthenticated: true,
          isSuperwallReady: false,
          subscriptionStatus: 'INACTIVE',
        }),
      ).toBe(false);
    });

    it('does not redirect active subscribers', () => {
      expect(
        shouldRedirectToPaywallGateFromTabs({
          isAuthLoading: false,
          isAuthenticated: true,
          isSuperwallReady: true,
          subscriptionStatus: 'ACTIVE',
        }),
      ).toBe(false);
    });
  });
});
