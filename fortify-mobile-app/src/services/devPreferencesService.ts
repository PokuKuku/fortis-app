import { DeviceEventEmitter, type EmitterSubscription } from 'react-native';
import { DEV_HOME_TEST_CONTROLS_VISIBLE_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

const DEV_HOME_TEST_CONTROLS_VISIBILITY_EVENT = 'fortify-dev-home-test-controls-visibility';

export async function loadDevHomeTestControlsVisible(): Promise<boolean> {
  if (!__DEV__) return false;
  return (await getScopedItem(DEV_HOME_TEST_CONTROLS_VISIBLE_KEY)) !== 'false';
}

export async function saveDevHomeTestControlsVisible(visible: boolean): Promise<void> {
  if (!__DEV__) return;
  await setScopedItem(DEV_HOME_TEST_CONTROLS_VISIBLE_KEY, visible ? 'true' : 'false');
  DeviceEventEmitter.emit(DEV_HOME_TEST_CONTROLS_VISIBILITY_EVENT, visible);
}

export function subscribeToDevHomeTestControlsVisibility(
  listener: (visible: boolean) => void
): EmitterSubscription {
  return DeviceEventEmitter.addListener(
    DEV_HOME_TEST_CONTROLS_VISIBILITY_EVENT,
    listener
  );
}
