import type {
  Entitlement,
  EntitlementsInfo,
  SubscriptionStatus,
} from 'expo-superwall';

type ReconcileSubscriptionStatusParams = {
  currentStatus: SubscriptionStatus;
  getEntitlements: () => Promise<EntitlementsInfo>;
  setSubscriptionStatus: (status: SubscriptionStatus) => Promise<void>;
  onError?: (error: unknown) => void;
};

export type ReconcileSubscriptionStatusResult = {
  hasActiveSubscription: boolean;
  wasVerified: boolean;
};

const sortUniqueIds = (entitlements: Entitlement[]): string[] =>
  [...new Set(entitlements.map((entitlement) => entitlement.id))].sort();

const toActiveStatus = (entitlements: Entitlement[]): SubscriptionStatus => ({
  status: 'ACTIVE',
  entitlements,
});

const nextStatusFromEntitlements = (
  entitlementsInfo: EntitlementsInfo,
): { nextStatus: SubscriptionStatus; hasActiveSubscription: boolean } => {
  const activeEntitlements = Array.isArray(entitlementsInfo.active)
    ? entitlementsInfo.active.filter(
        (entitlement): entitlement is Entitlement =>
          Boolean(entitlement) &&
          typeof entitlement.id === 'string' &&
          entitlement.id.length > 0,
      )
    : [];

  if (activeEntitlements.length > 0) {
    return {
      nextStatus: toActiveStatus(activeEntitlements),
      hasActiveSubscription: true,
    };
  }

  return {
    nextStatus: { status: 'INACTIVE' },
    hasActiveSubscription: false,
  };
};

const shouldUpdateStatus = (
  currentStatus: SubscriptionStatus,
  nextStatus: SubscriptionStatus,
): boolean => {
  if (currentStatus.status !== nextStatus.status) {
    return true;
  }

  if (nextStatus.status !== 'ACTIVE' || currentStatus.status !== 'ACTIVE') {
    return false;
  }

  const currentIds = sortUniqueIds(currentStatus.entitlements);
  const nextIds = sortUniqueIds(nextStatus.entitlements);

  if (currentIds.length !== nextIds.length) {
    return true;
  }

  return currentIds.some((id, index) => id !== nextIds[index]);
};

export async function reconcileSubscriptionStatus(
  params: ReconcileSubscriptionStatusParams,
): Promise<ReconcileSubscriptionStatusResult> {
  const { currentStatus, getEntitlements, setSubscriptionStatus, onError } = params;

  try {
    const entitlementsInfo = await getEntitlements();
    const { nextStatus, hasActiveSubscription } = nextStatusFromEntitlements(entitlementsInfo);

    if (shouldUpdateStatus(currentStatus, nextStatus)) {
      await setSubscriptionStatus(nextStatus);
    }

    return {
      hasActiveSubscription,
      wasVerified: true,
    };
  } catch (error) {
    onError?.(error);
    return {
      hasActiveSubscription: currentStatus.status === 'ACTIVE',
      wasVerified: false,
    };
  }
}
