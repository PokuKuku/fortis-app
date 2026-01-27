import { useMemo } from 'react';
import { useSuperwallEvents } from 'expo-superwall';

/**
 * Dev-only Superwall event logger.
 * Helps diagnose silent purchase failures from StoreKit/Superwall.
 */
export function SuperwallDebugEvents() {
  const callbacks = useMemo(
    () =>
      __DEV__
        ? {
            onPaywallPresent: (info: { name: string }) => {
              console.log('[Superwall] Paywall presented:', info.name);
            },
            onPaywallDismiss: (
              info: { name: string },
              result: { type: string; productId?: string },
            ) => {
              console.log('[Superwall] Paywall dismissed:', info.name, result.type, result.productId);
            },
            onPaywallError: (error: string) => {
              console.error('[Superwall] Paywall error:', error);
            },
            onPurchase: (params: { productId?: string; platform?: string }) => {
              console.log('[Superwall] Purchase started:', params.productId, params.platform);
            },
            onPurchaseRestore: () => {
              console.log('[Superwall] Restore started');
            },
            onSubscriptionStatusChange: (status: { status?: string }) => {
              console.log('[Superwall] Subscription status changed:', status?.status);
            },
            onLog: (params: { level: string; scope: string; message: string | null }) => {
              console.log('[Superwall][log]', params.level, params.scope, params.message);
            },
          }
        : {},
    [],
  );

  useSuperwallEvents(callbacks);

  return null;
}

