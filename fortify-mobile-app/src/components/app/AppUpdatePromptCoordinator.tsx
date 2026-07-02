import { useCallback, useEffect, useRef } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';
import { getIosAppUpdateInfo } from '@/src/services/appUpdateService';

let lastPromptedVersion: string | null = null;

export function AppUpdatePromptCoordinator() {
  const isCheckingRef = useRef(false);

  const checkForUpdate = useCallback(async () => {
    if (Platform.OS !== 'ios' || isCheckingRef.current) return;

    isCheckingRef.current = true;
    try {
      const updateInfo = await getIosAppUpdateInfo();
      if (!updateInfo || lastPromptedVersion === updateInfo.latestVersion) {
        return;
      }

      lastPromptedVersion = updateInfo.latestVersion;
      Alert.alert(
        'Update Available',
        `Fortify ${updateInfo.latestVersion} is available. Update now to get the latest fixes and improvements.`,
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Update',
            onPress: () => {
              void Linking.openURL(updateInfo.storeUrl).catch(() => undefined);
            },
          },
        ]
      );
    } catch {
      // Best effort only. If the App Store lookup fails, try again on the next launch.
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void checkForUpdate();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void checkForUpdate();
      }
    });

    return () => subscription.remove();
  }, [checkForUpdate]);

  return null;
}

