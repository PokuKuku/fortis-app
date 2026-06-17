import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

const apiKey = (Constants.expoConfig?.extra?.posthogProjectToken as string | undefined)?.trim();
const host = (Constants.expoConfig?.extra?.posthogHost as string | undefined)?.trim();
const isPostHogConfigured = Boolean(apiKey && apiKey !== 'phc_your_project_token_here');
const isSessionReplayNativeModuleLinked =
  (Platform.OS === 'ios' || Platform.OS === 'android') &&
  Boolean(NativeModules.PosthogReactNativeSessionReplay);
const isSessionReplayEnabled =
  isPostHogConfigured &&
  isSessionReplayNativeModuleLinked &&
  !__DEV__;

if (!isPostHogConfigured) {
  console.warn('[PostHog] Project token not configured. Analytics disabled. Set POSTHOG_PROJECT_TOKEN in .env.');
}

if (isPostHogConfigured && !isSessionReplayNativeModuleLinked && Platform.OS !== 'web') {
  console.warn(
    '[PostHog] Session replay native module is not linked; rebuild the native app to enable replay.'
  );
}

if (isPostHogConfigured && isSessionReplayNativeModuleLinked && __DEV__) {
  console.warn('[PostHog] Session replay disabled in development builds to avoid dev reload watchdog hangs.');
}

export const posthog = new PostHog(apiKey || 'placeholder_key', {
  ...(host ? { host } : {}),
  disabled: !isPostHogConfigured,
  captureAppLifecycleEvents: true,
  enableSessionReplay: isSessionReplayEnabled,
  sessionReplayConfig: {
    maskAllTextInputs: true,
    maskAllImages: true,
    maskAllSandboxedViews: true,
    throttleDelayMs: 500,
  },
  flushAt: 20,
  flushInterval: 10000,
  maxBatchSize: 100,
  maxQueueSize: 1000,
  preloadFeatureFlags: true,
  sendFeatureFlagEvent: true,
  featureFlagsRequestTimeoutMs: 10000,
  requestTimeout: 10000,
  fetchRetryCount: 3,
  fetchRetryDelay: 3000,
});

export const isPostHogEnabled = isPostHogConfigured;
