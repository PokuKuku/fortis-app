import { ONBOARDING_STATE_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, removeScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

export type OnboardingState = {
  preferred_units?: 'imperial' | 'metric';
  completed?: boolean;
};

export async function getOnboardingState(): Promise<OnboardingState | null> {
  const stored = await getScopedItem(ONBOARDING_STATE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as OnboardingState;
  } catch {
    await removeScopedItem(ONBOARDING_STATE_KEY);
    return null;
  }
}

export async function updateOnboardingState(updates: Partial<OnboardingState>): Promise<OnboardingState> {
  const current = (await getOnboardingState()) ?? {};
  const next = { ...current, ...updates };
  await setScopedItem(ONBOARDING_STATE_KEY, JSON.stringify(next));
  return next;
}

export async function clearOnboardingState(): Promise<void> {
  await removeScopedItem(ONBOARDING_STATE_KEY);
}
