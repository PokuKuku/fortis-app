import { useCallback, useEffect, useState } from 'react';
import {
  loadDevHomeTestControlsVisible,
  saveDevHomeTestControlsVisible,
  subscribeToDevHomeTestControlsVisibility,
} from '@/src/services/devPreferencesService';

export function useDevHomeTestControlsVisibility() {
  const [visible, setVisibleState] = useState(__DEV__);

  useEffect(() => {
    if (!__DEV__) {
      setVisibleState(false);
      return;
    }

    let mounted = true;
    void loadDevHomeTestControlsVisible().then((storedVisible) => {
      if (mounted) setVisibleState(storedVisible);
    });
    const subscription = subscribeToDevHomeTestControlsVisibility((nextVisible) => {
      setVisibleState(nextVisible);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const setVisible = useCallback(async (nextVisible: boolean) => {
    if (!__DEV__) return;
    setVisibleState(nextVisible);
    await saveDevHomeTestControlsVisible(nextVisible);
  }, []);

  return { visible, setVisible };
}
