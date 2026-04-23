export const IOS_REVENUECAT_PUBLIC_SDK_KEY = 'appl_xUfcAjGXbhIduaxJcQhipSkOksi';

const IOS_PUBLIC_KEY_PREFIX = 'appl_';
const ANDROID_PUBLIC_KEY_PREFIX = 'goog_';

type SupportedPlatform = 'ios' | 'android';

function trimEnvVar(value?: string | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidPublicKeyForPlatform(platform: SupportedPlatform, value: string): boolean {
  if (!value) {
    return false;
  }

  return platform === 'ios'
    ? value.startsWith(IOS_PUBLIC_KEY_PREFIX)
    : value.startsWith(ANDROID_PUBLIC_KEY_PREFIX);
}

function firstMatchingKey(
  platform: SupportedPlatform,
  candidates: Array<string | undefined>,
): string {
  for (const candidate of candidates) {
    const trimmed = trimEnvVar(candidate);
    if (isValidPublicKeyForPlatform(platform, trimmed)) {
      return trimmed;
    }
  }

  return '';
}

export function getRevenueCatApiKeyForPlatform(
  platform: string,
  env: Record<string, string | undefined> = process.env,
): string {
  if (platform === 'ios') {
    return firstMatchingKey('ios', [
      env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
      env.EXPO_PUBLIC_REVENUECAT_API_KEY,
      IOS_REVENUECAT_PUBLIC_SDK_KEY,
    ]);
  }

  if (platform === 'android') {
    return firstMatchingKey('android', [
      env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
      env.EXPO_PUBLIC_REVENUECAT_API_KEY,
    ]);
  }

  return '';
}

export function shouldEnableRevenueCatAnalytics(isDev: boolean): boolean {
  return !isDev;
}
