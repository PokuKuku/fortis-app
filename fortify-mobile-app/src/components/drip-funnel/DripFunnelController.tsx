import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useSuperwallEvents } from 'expo-superwall';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getDiscountPlacementFromNotification,
  registerDripFunnelPushToken,
  trackDripFunnelConversion,
  type DripFunnelNotificationData,
} from '@/src/services/dripFunnelService';

const PUSH_TOKEN_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function DripFunnelController() {
  const router = useRouter();
  const { isAuthenticated, isAuthResolved } = useAuth();
  const lastPushTokenRefreshAtRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const maybeRegisterPushToken = useCallback(async (force = false) => {
    if (!isAuthResolved || !isAuthenticated) return;

    const now = Date.now();
    if (!force && now - lastPushTokenRefreshAtRef.current < PUSH_TOKEN_REFRESH_INTERVAL_MS) {
      return;
    }

    const didRegister = await registerDripFunnelPushToken();
    if (didRegister) {
      lastPushTokenRefreshAtRef.current = now;
    }
  }, [isAuthResolved, isAuthenticated]);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse | null) => {
    const data = response?.notification.request.content.data as DripFunnelNotificationData | undefined;
    const placement = getDiscountPlacementFromNotification(data);
    if (!placement) return;

    router.replace({
      pathname: '/drip-discount',
      params: { placement },
    } as never);
  }, [router]);

  useEffect(() => {
    void maybeRegisterPushToken(true);
  }, [maybeRegisterPushToken]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previous = appStateRef.current;
      appStateRef.current = nextState;

      if (
        (previous === 'background' || previous === 'inactive') &&
        nextState === 'active'
      ) {
        void maybeRegisterPushToken(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [maybeRegisterPushToken]);

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync()
      .then(handleNotificationResponse)
      .catch(() => undefined);

    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    return () => {
      subscription.remove();
    };
  }, [handleNotificationResponse]);

  useSuperwallEvents({
    onPurchase: (params: { productId?: string; platform?: string }) => {
      void trackDripFunnelConversion({
        resultType: 'purchase_started',
        productId: params.productId ?? null,
        metadata: { platform: params.platform ?? null },
      });
    },
    onPurchaseRestore: () => {
      void trackDripFunnelConversion({ resultType: 'restore_started' });
    },
    onSubscriptionStatusChange: (status: { status?: string }) => {
      if (status?.status === 'ACTIVE') {
        void trackDripFunnelConversion({ resultType: 'subscription_active' });
      }
    },
    onSuperwallEvent: (eventInfo: { event?: { event?: string; productId?: string } }) => {
      const eventType = eventInfo?.event?.event;
      if (
        eventType === 'transactionComplete' ||
        eventType === 'subscriptionStart' ||
        eventType === 'freeTrialStart'
      ) {
        void trackDripFunnelConversion({
          resultType: eventType,
          productId: eventInfo.event?.productId ?? null,
        });
      }
    },
  });

  return null;
}
