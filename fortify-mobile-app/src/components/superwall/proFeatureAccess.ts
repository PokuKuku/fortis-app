import type { Entitlement, EntitlementsInfo, SubscriptionStatus } from 'expo-superwall';

export const PRO_ENTITLEMENT_ID = 'fortis_pro';
export const FREE_PROGRAM_LIMIT = 1;
export const FREE_WORKOUT_TEMPLATE_LIMIT = 4;

const isEntitlement = (value: unknown): value is Entitlement => (
  Boolean(value) &&
  typeof value === 'object' &&
  typeof (value as Entitlement).id === 'string' &&
  (value as Entitlement).id.length > 0
);

export function entitlementsIncludePro(entitlements: unknown): boolean {
  return Array.isArray(entitlements) &&
    entitlements.filter(isEntitlement).some((entitlement) => entitlement.id === PRO_ENTITLEMENT_ID);
}

export function subscriptionHasProAccess(status: SubscriptionStatus | null | undefined): boolean {
  return status?.status === 'ACTIVE' && entitlementsIncludePro(status.entitlements);
}

export function entitlementsInfoHasProAccess(info: EntitlementsInfo | null | undefined): boolean {
  return entitlementsIncludePro(info?.active);
}

export function activeEntitlementsFromInfo(info: EntitlementsInfo | null | undefined): Entitlement[] {
  return Array.isArray(info?.active) ? info.active.filter(isEntitlement) : [];
}

export function isUserSubscribedSkipReason(reason: unknown): boolean {
  if (!reason || typeof reason !== 'object') {
    return false;
  }

  const candidate = reason as { reason?: unknown; type?: unknown };
  return candidate.reason === 'userIsSubscribed' ||
    candidate.type === 'UserIsSubscribed' ||
    candidate.type === 'userIsSubscribed';
}

export function canCreateFreeProgram(programCount: number, isPro: boolean): boolean {
  return isPro || programCount < FREE_PROGRAM_LIMIT;
}

export function canCreateFreeWorkoutTemplate(templateCount: number, isPro: boolean): boolean {
  return isPro || templateCount < FREE_WORKOUT_TEMPLATE_LIMIT;
}
