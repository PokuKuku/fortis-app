import { useMemo } from 'react';
import { useSuperwallEvents } from 'expo-superwall';
import type { PaywallSkippedReason } from 'expo-superwall';

/**
 * Superwall lifecycle logger. Warnings and errors remain enabled in release
 * builds so TestFlight failures can be diagnosed from device logs.
 */
export function SuperwallDebugEvents() {
  const callbacks = useMemo(
    () => ({
      onPaywallPresent: (info: { name: string }) => {
        console.info('[Superwall] Paywall presented:', info.name);
      },
      onPaywallDismiss: (
        info: { name: string },
        result: { type: string; productId?: string },
      ) => {
        console.info('[Superwall] Paywall dismissed:', info.name, result.type, result.productId);
      },
      onPaywallSkip: (reason: PaywallSkippedReason) => {
        console.warn('[Superwall] Paywall skipped:', reason.type);
      },
      onPaywallError: (error: string) => {
        const normalized = error?.toLowerCase?.() ?? '';
        if (
          normalized.includes('only present one paywall') ||
          normalized.includes('paywall already presented')
        ) {
          console.info('[Superwall] Paywall already presented');
          return;
        }
        console.error('[Superwall] Paywall error:', error);
      },
      onPurchase: (params: { productId?: string; platform?: string }) => {
        console.info('[Superwall] Purchase started:', params.productId, params.platform);
      },
      onPurchaseRestore: () => {
        console.info('[Superwall] Restore started');
      },
      onSubscriptionStatusChange: (status: { status?: string }) => {
        console.info('[Superwall] Subscription status changed:', status?.status);
      },
      onLog: (params: { level: string; scope: string; message: string | null; error?: string | null }) => {
        const normalized = `${params.message ?? ''} ${params.error ?? ''}`.toLowerCase();
        if (
          normalized.includes('only present one paywall') ||
          normalized.includes('paywall already presented')
        ) {
          console.info('[Superwall] Paywall already presented');
          return;
        }
        const log = params.level === 'error' ? console.error : console.warn;
        log('[Superwall][log]', params);
      },
    }),
    [],
  );

  useSuperwallEvents(callbacks);

  return null;
}
