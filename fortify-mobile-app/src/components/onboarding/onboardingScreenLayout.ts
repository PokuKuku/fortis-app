interface OnboardingScrollViewOptions {
  useScrollView: boolean;
  isShortScreen: boolean;
  scrollEnabled: boolean;
}

export function shouldUseOnboardingScrollView({
  useScrollView,
  isShortScreen,
  scrollEnabled,
}: OnboardingScrollViewOptions) {
  return useScrollView || (isShortScreen && scrollEnabled);
}
