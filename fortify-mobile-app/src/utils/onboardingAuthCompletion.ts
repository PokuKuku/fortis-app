import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { PENDING_ONBOARDING_AUTH_COMPLETION_KEY } from '@/src/constants/storageKeys';

const PENDING_ONBOARDING_AUTH_COMPLETION_CHANGED =
  'fortify-pending-onboarding-auth-completion-changed';

let cachedPendingCompletion: boolean | null = null;
let pendingCompletionCacheRevision = 0;

type PendingOnboardingAuthCompletionState = {
  isPending: boolean;
  isResolved: boolean;
};

export async function markPendingOnboardingAuthCompletion(): Promise<void> {
  const previousValue = cachedPendingCompletion;
  pendingCompletionCacheRevision += 1;
  cachedPendingCompletion = true;
  try {
    await AsyncStorage.setItem(PENDING_ONBOARDING_AUTH_COMPLETION_KEY, 'true');
    DeviceEventEmitter.emit(PENDING_ONBOARDING_AUTH_COMPLETION_CHANGED, true);
  } catch (error) {
    pendingCompletionCacheRevision += 1;
    cachedPendingCompletion = previousValue;
    throw error;
  }
}

export async function hasPendingOnboardingAuthCompletion(): Promise<boolean> {
  if (cachedPendingCompletion !== null) {
    return cachedPendingCompletion;
  }

  const readRevision = pendingCompletionCacheRevision;
  const isPending =
    (await AsyncStorage.getItem(PENDING_ONBOARDING_AUTH_COMPLETION_KEY)) === 'true';
  if (pendingCompletionCacheRevision === readRevision) {
    cachedPendingCompletion = isPending;
  }
  return cachedPendingCompletion ?? isPending;
}

export async function clearPendingOnboardingAuthCompletion(): Promise<void> {
  const previousValue = cachedPendingCompletion;
  pendingCompletionCacheRevision += 1;
  cachedPendingCompletion = false;
  try {
    await AsyncStorage.removeItem(PENDING_ONBOARDING_AUTH_COMPLETION_KEY);
    DeviceEventEmitter.emit(PENDING_ONBOARDING_AUTH_COMPLETION_CHANGED, false);
  } catch (error) {
    pendingCompletionCacheRevision += 1;
    cachedPendingCompletion = previousValue;
    throw error;
  }
}

export function usePendingOnboardingAuthCompletion(): PendingOnboardingAuthCompletionState {
  const [state, setState] = useState<PendingOnboardingAuthCompletionState>({
    isPending: false,
    isResolved: false,
  });

  useEffect(() => {
    let isActive = true;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let readAttempt = 0;
    const subscription = DeviceEventEmitter.addListener(
      PENDING_ONBOARDING_AUTH_COMPLETION_CHANGED,
      (isPending: boolean) => {
        if (isActive) {
          setState({ isPending, isResolved: true });
        }
      },
    );

    const resolvePendingCompletion = () => {
      readAttempt += 1;
      void hasPendingOnboardingAuthCompletion()
        .then((isPending) => {
          if (isActive) {
            setState({ isPending, isResolved: true });
          }
        })
        .catch(() => {
          if (!isActive) return;
          if (readAttempt < 3) {
            retryTimeout = setTimeout(resolvePendingCompletion, readAttempt * 150);
            return;
          }
          // Stay unresolved rather than incorrectly treating an unreadable
          // completion intent as an ordinary incomplete profile.
          setState({ isPending: false, isResolved: false });
        });
    };

    resolvePendingCompletion();

    return () => {
      isActive = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      subscription.remove();
    };
  }, []);

  return state;
}
