import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useSuperwallEvents, useUser } from 'expo-superwall';

const RECOVERY_WINDOW_MS = 120_000;
const RECOVERY_POLL_MS = 1_500;

export function SuperwallPurchaseRecovery() {
  const { refresh, getEntitlements, setSubscriptionStatus, subscriptionStatus } = useUser();
  const recoveryDeadlineRef = useRef(0);
  const recoveryInFlightRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });

  const reconcileEntitlements = useCallback(
    async (trigger: string) => {
      if (subscriptionStatus.status === 'ACTIVE') {
        return true;
      }

      try {
        await refresh();
      } catch {
        // Best effort.
      }

      try {
        const entitlements = await getEntitlements();
        if (entitlements.active.length > 0) {
          await setSubscriptionStatus({
            status: 'ACTIVE',
            entitlements: entitlements.active,
          });
          if (__DEV__) {
            console.log('[Superwall] purchase recovery activated subscription', { trigger });
          }
          return true;
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[Superwall] purchase recovery entitlement check failed', { trigger, error });
        }
      }

      return false;
    },
    [getEntitlements, refresh, setSubscriptionStatus, subscriptionStatus.status],
  );

  const runRecoveryLoop = useCallback(async () => {
    if (recoveryInFlightRef.current) {
      return;
    }

    recoveryInFlightRef.current = true;
    try {
      while (Date.now() <= recoveryDeadlineRef.current) {
        const activated = await reconcileEntitlements('recovery-loop');
        if (activated) {
          recoveryDeadlineRef.current = 0;
          return;
        }
        await sleep(RECOVERY_POLL_MS);
      }
    } finally {
      recoveryInFlightRef.current = false;
    }
  }, [reconcileEntitlements]);

  const startRecovery = useCallback(
    (trigger: string) => {
      const nextDeadline = Date.now() + RECOVERY_WINDOW_MS;
      recoveryDeadlineRef.current = Math.max(recoveryDeadlineRef.current, nextDeadline);

      if (__DEV__) {
        console.log('[Superwall] purchase recovery armed', {
          trigger,
          deadlineInMs: recoveryDeadlineRef.current - Date.now(),
        });
      }

      void runRecoveryLoop();
    },
    [runRecoveryLoop],
  );

  useSuperwallEvents({
    onPurchase: () => {
      startRecovery('onPurchase');
    },
    onPurchaseRestore: () => {
      startRecovery('onPurchaseRestore');
    },
    onSuperwallEvent: (eventInfo: { event?: { event?: string } }) => {
      const eventType = eventInfo?.event?.event;
      if (!eventType) return;

      if (
        eventType === 'transactionStart' ||
        eventType === 'transactionComplete' ||
        eventType === 'transactionRestore' ||
        eventType === 'subscriptionStart' ||
        eventType === 'freeTrialStart' ||
        eventType === 'transactionAbandon' ||
        eventType === 'transactionFail' ||
        eventType === 'transactionTimeout'
      ) {
        startRecovery(`event:${eventType}`);
      }
    },
    onSubscriptionStatusChange: (status: { status?: string }) => {
      if (status?.status === 'ACTIVE') {
        recoveryDeadlineRef.current = 0;
      }
    },
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previous = appStateRef.current;
      appStateRef.current = nextState;

      if (
        (previous === 'background' || previous === 'inactive') &&
        nextState === 'active' &&
        recoveryDeadlineRef.current > Date.now()
      ) {
        startRecovery('app-active');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [startRecovery]);

  return null;
}

