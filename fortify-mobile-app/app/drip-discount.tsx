import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { usePlacement, useSuperwall } from 'expo-superwall';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  DRIP_FUNNEL_DISCOUNT_OFFER,
  DRIP_FUNNEL_DISCOUNT_PLACEMENT,
} from '@/src/services/dripFunnelService';

const PRESENT_DELAY_MS = 750;
const MAX_PRESENT_ATTEMPTS = 3;

export default function DripDiscountScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ placement?: string }>();
  const placement =
    typeof params.placement === 'string' && params.placement.trim().length > 0
      ? params.placement
      : DRIP_FUNNEL_DISCOUNT_PLACEMENT;
  const attemptRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { dismiss, isSuperwallReady } = useSuperwall((state) => ({
    dismiss: state.dismiss,
    isSuperwallReady: state.isConfigured && !state.isLoading,
  }));

  const { registerPlacement } = usePlacement({
    onError: (error) => {
      if (__DEV__) {
        console.warn('[DripFunnel] Discount route placement failed:', error);
      }

      if (
        String(error).toLowerCase().includes('one paywall') &&
        attemptRef.current < MAX_PRESENT_ATTEMPTS
      ) {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          void presentDiscount();
        }, PRESENT_DELAY_MS);
      }
    },
  });

  const presentDiscount = useCallback(async () => {
    if (!isSuperwallReady || attemptRef.current >= MAX_PRESENT_ATTEMPTS) {
      return;
    }

    attemptRef.current += 1;
    await dismiss().catch(() => undefined);
    await new Promise((resolve) => setTimeout(resolve, PRESENT_DELAY_MS));

    await registerPlacement({
      placement,
      params: {
        offer: DRIP_FUNNEL_DISCOUNT_OFFER,
        source: 'push_notification',
      },
    });
  }, [dismiss, isSuperwallReady, placement, registerPlacement]);

  useEffect(() => {
    void presentDiscount();
  }, [presentDiscount]);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      <ActivityIndicator color={colors.textPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
