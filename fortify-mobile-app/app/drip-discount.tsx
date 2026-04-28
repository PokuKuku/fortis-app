import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlacement, useSuperwall } from 'expo-superwall';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import {
  DRIP_FUNNEL_DISCOUNT_OFFER,
  DRIP_FUNNEL_DISCOUNT_PLACEMENT,
  trackDripFunnelConversion,
} from '@/src/services/dripFunnelService';

const PRESENT_DELAY_MS = 750;
const MAX_PRESENT_ATTEMPTS = 3;
const READY_TIMEOUT_MS = 8_000;
const PRESENT_TIMEOUT_MS = 12_000;

const timeoutAfter = (ms: number) =>
  new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timed out after ${ms}ms`));
    }, ms);
  });

export default function DripDiscountScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ placement?: string }>();
  const placement =
    typeof params.placement === 'string' && params.placement.trim().length > 0
      ? params.placement
      : DRIP_FUNNEL_DISCOUNT_PLACEMENT;
  const [statusMessage, setStatusMessage] = useState('Preparing your discount...');
  const attemptRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didPresentRef = useRef(false);
  const { dismiss, hasSuperwallError, isSuperwallReady } = useSuperwall((state) => ({
    dismiss: state.dismiss,
    hasSuperwallError: state.configurationError !== null,
    isSuperwallReady: state.isConfigured && !state.isLoading,
  }));

  const scheduleRetry = useCallback((delayMs = PRESENT_DELAY_MS) => {
    if (attemptRef.current >= MAX_PRESENT_ATTEMPTS) {
      setStatusMessage('Unable to open the discount right now. Please try again.');
      return;
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    retryTimeoutRef.current = setTimeout(() => {
      retryTimeoutRef.current = null;
      void presentDiscount();
    }, delayMs);
  }, []);

  const { registerPlacement } = usePlacement({
    onPresent: () => {
      didPresentRef.current = true;
      setStatusMessage('Opening your discount...');
    },
    onDismiss: (_paywallInfo, result) => {
      if (result.type === 'purchased' || result.type === 'restored') {
        void trackDripFunnelConversion({
          placement,
          resultType: result.type,
          productId: result.type === 'purchased' ? result.productId : null,
          metadata: { source: 'discount_notification_paywall' },
        });
        return;
      }

      setStatusMessage('Your discount is ready when you are.');
    },
    onError: (error) => {
      console.warn('[DripFunnel] Discount route placement failed:', error);

      if (
        String(error).toLowerCase().includes('one paywall') &&
        attemptRef.current < MAX_PRESENT_ATTEMPTS
      ) {
        setStatusMessage('Switching to your discount...');
        scheduleRetry();
        return;
      }

      setStatusMessage('Unable to open the discount right now. Please try again.');
    },
    onSkip: (reason) => {
      console.warn('[DripFunnel] Discount route placement skipped:', reason.type);
      setStatusMessage('Unable to open the discount right now. Please try again.');
    },
  });

  const presentDiscount = useCallback(async () => {
    didPresentRef.current = false;

    if (hasSuperwallError) {
      setStatusMessage('Unable to load the discount right now. Please try again.');
      return;
    }

    if (!isSuperwallReady) {
      setStatusMessage('Preparing your discount...');
      return;
    }

    if (attemptRef.current >= MAX_PRESENT_ATTEMPTS) {
      setStatusMessage('Unable to open the discount right now. Please try again.');
      return;
    }

    setStatusMessage('Opening your discount...');
    attemptRef.current += 1;
    await dismiss().catch(() => undefined);
    await new Promise((resolve) => setTimeout(resolve, PRESENT_DELAY_MS));

    try {
      await Promise.race([
        registerPlacement({
          placement,
          params: {
            offer: DRIP_FUNNEL_DISCOUNT_OFFER,
            source: 'push_notification',
          },
        }),
        timeoutAfter(PRESENT_TIMEOUT_MS),
      ]);

      if (!didPresentRef.current) {
        setStatusMessage('Unable to open the discount right now. Please try again.');
      }
    } catch (error) {
      console.warn('[DripFunnel] Discount route register failed:', error);
      if (attemptRef.current < MAX_PRESENT_ATTEMPTS) {
        scheduleRetry();
        return;
      }
      setStatusMessage('Unable to open the discount right now. Please try again.');
    }
  }, [dismiss, hasSuperwallError, isSuperwallReady, placement, registerPlacement, scheduleRetry]);

  useEffect(() => {
    void presentDiscount();
  }, [presentDiscount]);

  useEffect(() => {
    if (isSuperwallReady || hasSuperwallError) {
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }
      return;
    }

    readyTimeoutRef.current = setTimeout(() => {
      readyTimeoutRef.current = null;
      setStatusMessage('Still preparing your discount. Check your connection and try again.');
    }, READY_TIMEOUT_MS);

    return () => {
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }
    };
  }, [hasSuperwallError, isSuperwallReady]);

  const handleRetry = useCallback(() => {
    attemptRef.current = 0;
    setStatusMessage('Preparing your discount...');
    void presentDiscount();
  }, [presentDiscount]);

  const handleBackToApp = useCallback(() => {
    router.replace('/paywall-gate');
  }, [router]);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />
      <Text style={[styles.titleText, { color: colors.textPrimary }]}>
        Your Fortify AI discount
      </Text>
      <ActivityIndicator color={colors.textPrimary} />
      <Text style={[styles.statusText, { color: colors.textSecondary }]}>
        {statusMessage}
      </Text>
      {statusMessage.includes('try again') ? (
        <Pressable
          onPress={handleRetry}
          style={[
            styles.retryButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.surfaceElevated,
            },
          ]}
        >
          <Text style={[styles.retryText, { color: colors.textPrimary }]}>Try Again</Text>
        </Pressable>
      ) : null}
      {statusMessage.includes('ready when you are') ? (
        <Pressable
          onPress={handleBackToApp}
          style={[
            styles.secondaryButton,
            {
              borderColor: colors.border,
              backgroundColor: colors.surfaceOverlay,
            },
          ]}
        >
          <Text style={[styles.retryText, { color: colors.textPrimary }]}>Back to Fortify</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titleText: {
    marginBottom: 18,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusText: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 18,
    minHeight: 44,
    minWidth: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    minHeight: 44,
    minWidth: 136,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
  },
});
