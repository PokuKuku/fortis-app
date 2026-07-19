import { DeviceEventEmitter, type EmitterSubscription } from 'react-native';

const STARTUP_REVEAL_COMPLETE_EVENT = 'fortify-startup-reveal-complete';

// Default to complete so isolated screens/tests are never held back. TabLayout
// explicitly resets this before its child routes render on app startup.
let startupRevealComplete = true;

export const resetStartupReveal = (): void => {
  startupRevealComplete = false;
};

export const completeStartupReveal = (): void => {
  startupRevealComplete = true;
  DeviceEventEmitter.emit(STARTUP_REVEAL_COMPLETE_EVENT);
};

export const isStartupRevealComplete = (): boolean => startupRevealComplete;

export const subscribeToStartupReveal = (
  listener: () => void
): EmitterSubscription => DeviceEventEmitter.addListener(
  STARTUP_REVEAL_COMPLETE_EVENT,
  listener
);
