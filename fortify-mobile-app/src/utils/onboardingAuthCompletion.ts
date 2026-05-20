import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PENDING_ONBOARDING_AUTH_COMPLETION_KEY } from '@/src/constants/storageKeys';

type PendingOnboardingAuthCompletionState = {
  isPending: boolean;
  isResolved: boolean;
};

export async function markPendingOnboardingAuthCompletion(): Promise<void> {
  await AsyncStorage.setItem(PENDING_ONBOARDING_AUTH_COMPLETION_KEY, 'true');
}

export async function hasPendingOnboardingAuthCompletion(): Promise<boolean> {
  return (await AsyncStorage.getItem(PENDING_ONBOARDING_AUTH_COMPLETION_KEY)) === 'true';
}

export async function clearPendingOnboardingAuthCompletion(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_ONBOARDING_AUTH_COMPLETION_KEY);
}

export function usePendingOnboardingAuthCompletion(): PendingOnboardingAuthCompletionState {
  const [state, setState] = useState<PendingOnboardingAuthCompletionState>({
    isPending: false,
    isResolved: false,
  });

  useEffect(() => {
    let isActive = true;

    void hasPendingOnboardingAuthCompletion()
      .then((isPending) => {
        if (isActive) {
          setState({ isPending, isResolved: true });
        }
      })
      .catch(() => {
        if (isActive) {
          setState({ isPending: false, isResolved: true });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
