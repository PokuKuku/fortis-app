import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
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
const READY_TIMEOUT_MS = 8_000;

export default function DripDiscountScreen() {
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
      setStatusMessage('Opening your discount...');
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
      await registerPlacement({
        placement,
        params: {
          offer: DRIP_FUNNEL_DISCOUNT_OFFER,
          source: 'push_notification',
        },
      });
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
});
