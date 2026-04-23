import {
  IOS_REVENUECAT_PUBLIC_SDK_KEY,
  getRevenueCatApiKeyForPlatform,
  shouldEnableRevenueCatAnalytics,
} from '@/src/components/revenuecat/revenueCatConfig';

describe('revenueCatConfig', () => {
  it('returns the iOS platform key when present', () => {
    expect(
      getRevenueCatApiKeyForPlatform('ios', {
        EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: 'appl_ios_key',
        EXPO_PUBLIC_REVENUECAT_API_KEY: 'appl_shared_key',
      }),
    ).toBe('appl_ios_key');
  });

  it('falls back to the bundled iOS key when env is missing', () => {
    expect(getRevenueCatApiKeyForPlatform('ios', {})).toBe(IOS_REVENUECAT_PUBLIC_SDK_KEY);
  });

  it('ignores an iOS shared key on Android', () => {
    expect(
      getRevenueCatApiKeyForPlatform('android', {
        EXPO_PUBLIC_REVENUECAT_API_KEY: 'appl_ios_key',
      }),
    ).toBe('');
  });

  it('returns the Android platform key when it has the correct prefix', () => {
    expect(
      getRevenueCatApiKeyForPlatform('android', {
        EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: 'goog_android_key',
        EXPO_PUBLIC_REVENUECAT_API_KEY: 'appl_ios_key',
      }),
    ).toBe('goog_android_key');
  });

  it('enables analytics for non-dev builds only', () => {
    expect(shouldEnableRevenueCatAnalytics(false)).toBe(true);
    expect(shouldEnableRevenueCatAnalytics(true)).toBe(false);
  });
});
