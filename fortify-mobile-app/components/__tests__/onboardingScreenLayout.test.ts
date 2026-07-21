import { shouldUseOnboardingScrollView } from '@/src/components/onboarding/onboardingScreenLayout';

describe('shouldUseOnboardingScrollView', () => {
  it('keeps explicitly locked screens static on short displays', () => {
    expect(shouldUseOnboardingScrollView({
      useScrollView: false,
      isShortScreen: true,
      scrollEnabled: false,
    })).toBe(false);
  });

  it('preserves the short-screen scrolling fallback for unlocked screens', () => {
    expect(shouldUseOnboardingScrollView({
      useScrollView: false,
      isShortScreen: true,
      scrollEnabled: true,
    })).toBe(true);
  });
});
