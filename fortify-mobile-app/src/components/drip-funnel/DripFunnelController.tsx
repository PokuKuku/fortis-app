import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { usePlacement, useSuperwall, useSuperwallEvents } from 'expo-superwall';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  DRIP_FUNNEL_DISCOUNT_OFFER,
  getDiscountPlacementFromNotification,
  registerDripFunnelPushToken,
  trackDripFunnelConversion,
  type DripFunnelNotificationData,
} from '@/src/services/dripFunnelService';

const PUSH_TOKEN_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;
const DISCOUNT_PLACEMENT_RETRY_DELAY_MS = 750;
const DISCOUNT_PLACEMENT_MAX_ATTEMPTS = 3;

export function DripFunnelController() {
  const { isAuthenticated, isAuthResolved } = useAuth();
  const pendingPlacementRef = useRef<string | null>(null);
  const placementAttemptRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushTokenRefreshAtRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const { dismiss, isSuperwallReady } = useSuperwall((state) => ({
    dismiss: state.dismiss,
    isSuperwallReady: state.isConfigured && !state.isLoading,
  }));

  const { registerPlacement } = usePlacement({
    onDismiss: (_paywallInfo, result) => {
      if (result.type === 'purchased' || result.type === 'restored') {
        void trackDripFunnelConversion({
          placement: pendingPlacementRef.current,
          resultType: result.type,
          productId: result.type === 'purchased' ? result.productId : null,
          metadata: { source: 'discount_notification_paywall' },
        });
      }
    },
    onError: (error) => {
      if (__DEV__) {
        console.warn('[DripFunnel] Discount placement failed:', error);
      }

      const placement = pendingPlacementRef.current;
      if (
        placement &&
        String(error).toLowerCase().includes('one paywall') &&
        placementAttemptRef.current < DISCOUNT_PLACEMENT_MAX_ATTEMPTS
      ) {
        void dismiss().catch(() => undefined);
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          void openDiscountPlacement(placement);
        }, DISCOUNT_PLACEMENT_RETRY_DELAY_MS);
      }
    },
    onSkip: (reason) => {
      if (__DEV__) {
        console.log('[DripFunnel] Discount placement skipped:', reason.type);
      }
    },
  });

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

  const openDiscountPlacement = useCallback(async (placement: string) => {
    if (!isAuthResolved || !isSuperwallReady) {
      pendingPlacementRef.current = placement;
      return;
    }

    pendingPlacementRef.current = placement;
    placementAttemptRef.current += 1;
    if (placementAttemptRef.current === 1) {
      await dismiss().catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, DISCOUNT_PLACEMENT_RETRY_DELAY_MS));
    }

    await registerPlacement({
      placement,
      params: {
        offer: DRIP_FUNNEL_DISCOUNT_OFFER,
        source: 'push_notification',
      },
    });
  }, [dismiss, isAuthResolved, isSuperwallReady, registerPlacement]);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse | null) => {
    const data = response?.notification.request.content.data as DripFunnelNotificationData | undefined;
    const placement = getDiscountPlacementFromNotification(data);
    if (!placement) return;

    placementAttemptRef.current = 0;
    void openDiscountPlacement(placement);
  }, [openDiscountPlacement]);

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
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync()
      .then(handleNotificationResponse)
      .catch(() => undefined);

    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    return () => {
      subscription.remove();
    };
  }, [handleNotificationResponse]);

  useEffect(() => {
    if (!pendingPlacementRef.current || !isAuthResolved || !isSuperwallReady) {
      return;
    }

    const placement = pendingPlacementRef.current;
    pendingPlacementRef.current = null;
    void openDiscountPlacement(placement);
  }, [isAuthResolved, isSuperwallReady, openDiscountPlacement]);

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
