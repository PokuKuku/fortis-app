import * as Haptics from 'expo-haptics';

const MANUAL_NAV_HAPTIC_SUPPRESS_MS = 250;
let lastManualNavHapticAt = 0;

export function triggerImmediateNavigationHaptic() {
  lastManualNavHapticAt = Date.now();
  Haptics.selectionAsync().catch(() => undefined);
}

export function shouldSuppressRouteChangeHaptic() {
  return Date.now() - lastManualNavHapticAt < MANUAL_NAV_HAPTIC_SUPPRESS_MS;
}
