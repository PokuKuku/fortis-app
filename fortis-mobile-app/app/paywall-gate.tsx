import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlacement, useSuperwallEvents } from 'expo-superwall';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { useTheme } from '@/src/contexts/ThemeContext';

const POST_SIGN_UP_PLACEMENT = 'fortis_first';
const PAYWALL_GATE_FALLBACK_MS = 7000;

export default function PaywallGateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { queueTourStartAfterPaywallClose } = useInAppTour();
  const hasRegisteredRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  const finishGate = useCallback(() => {
    if (hasNavigatedRef.current) {
      return;
    }
    hasNavigatedRef.current = true;
    queueTourStartAfterPaywallClose();
    router.replace('/(tabs)');
  }, [queueTourStartAfterPaywallClose, router]);

  useSuperwallEvents({
    onPaywallDismiss: finishGate,
    onPaywallSkip: finishGate,
    onPaywallError: finishGate,
  });

  const { registerPlacement } = usePlacement({
    onDismiss: finishGate,
    onSkip: finishGate,
    onError: finishGate,
  });

  useEffect(() => {
    if (hasRegisteredRef.current) {
      return;
    }
    hasRegisteredRef.current = true;
    void (async () => {
      try {
        await registerPlacement({ placement: POST_SIGN_UP_PLACEMENT });
      } catch {
        finishGate();
      }
    })();
  }, [finishGate, registerPlacement]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      finishGate();
    }, PAYWALL_GATE_FALLBACK_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [finishGate]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
