import { useEffect, useRef } from 'react';
import { useSuperwall, useUser } from 'expo-superwall';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SUPERWALL_DEVICE_ID_KEY = 'superwall_device_id';

const getOrCreateSuperwallDeviceId = async (): Promise<string> => {
  const secureId = await SecureStore.getItemAsync(SUPERWALL_DEVICE_ID_KEY);
  if (secureId) return secureId;

  const storedId = await AsyncStorage.getItem(SUPERWALL_DEVICE_ID_KEY);
  if (storedId) {
    await SecureStore.setItemAsync(SUPERWALL_DEVICE_ID_KEY, storedId);
    return storedId;
  }

  const newId = Crypto.randomUUID();
  await SecureStore.setItemAsync(SUPERWALL_DEVICE_ID_KEY, newId);
  await AsyncStorage.setItem(SUPERWALL_DEVICE_ID_KEY, newId);
  return newId;
};

export function SuperwallAuthSync() {
  const { identify, refresh } = useUser();
  const { isLoaded, hasError } = useSuperwall((state) => ({
    isLoaded: !state.isLoading && state.isConfigured,
    hasError: state.configurationError !== null,
  }));
  const hasIdentifiedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        // Superwall can take a moment to configure; avoid doing a one-time sync too early.
        if (!isLoaded || hasError || hasIdentifiedRef.current) {
          return;
        }

        const deviceId = await getOrCreateSuperwallDeviceId();
        await identify(deviceId);
        await refresh();
        hasIdentifiedRef.current = true;
      } catch (error) {
        if (isMounted) {
          console.warn('[Superwall] Failed to sync user:', error);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [hasError, identify, isLoaded, refresh]);

  return null;
}
