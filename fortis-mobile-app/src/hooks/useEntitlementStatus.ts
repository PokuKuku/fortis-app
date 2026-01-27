import { useUser } from 'expo-superwall';

export type EntitlementStatus = 'UNKNOWN' | 'INACTIVE' | 'ACTIVE';

export function useEntitlementStatus() {
  const { subscriptionStatus, refresh } = useUser();

  const status = (subscriptionStatus?.status ?? 'UNKNOWN') as EntitlementStatus;

  return {
    status,
    isLoaded: status !== 'UNKNOWN',
    isEntitled: status === 'ACTIVE',
    refresh,
  };
}

