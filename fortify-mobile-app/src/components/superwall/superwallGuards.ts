export type SuperwallSubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'UNKNOWN' | string;

export function shouldShowPaywallGateConfigError(params: {
  hasSuperwallError: boolean;
  hasNavigated: boolean;
}): boolean {
  const { hasSuperwallError, hasNavigated } = params;
  return hasSuperwallError && !hasNavigated;
}

export function shouldRedirectToPaywallGateFromTabs(params: {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  isSuperwallReady: boolean;
  subscriptionStatus: SuperwallSubscriptionStatus;
}): boolean {
  const { isAuthLoading, isAuthenticated, isSuperwallReady, subscriptionStatus } = params;

  if (isAuthLoading || !isAuthenticated) {
    return false;
  }

  if (!isSuperwallReady) {
    return false;
  }

  return subscriptionStatus === 'INACTIVE';
}
