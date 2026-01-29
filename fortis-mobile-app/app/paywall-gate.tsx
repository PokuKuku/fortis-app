import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { usePlacement, useSuperwallEvents } from 'expo-superwall';

const POST_SIGN_UP_PLACEMENT = 'fortis_first';

export default function PaywallGateScreen() {
  const router = useRouter();
  const hasRegisteredRef = useRef(false);
  const hasNavigatedRef = useRef(false);

  const finishGate = () => {
    if (hasNavigatedRef.current) {
      return;
    }
    hasNavigatedRef.current = true;
    router.replace('/(tabs)');
  };

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
    void registerPlacement({ placement: POST_SIGN_UP_PLACEMENT });
  }, [registerPlacement]);

  return null;
}
