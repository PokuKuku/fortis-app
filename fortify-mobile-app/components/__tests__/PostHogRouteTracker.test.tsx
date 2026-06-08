import React from 'react';
import { render } from '@testing-library/react-native';
import * as ExpoRouter from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { PostHogRouteTracker } from '@/src/components/analytics/PostHogRouteTracker';

jest.mock('posthog-react-native', () => ({
  usePostHog: jest.fn(),
}));

describe('PostHogRouteTracker', () => {
  const screen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePostHog as jest.Mock).mockReturnValue({ screen });
  });

  it('tracks route screen views with route metadata', () => {
    const usePathnameMock = ExpoRouter.usePathname as jest.Mock;
    const useSegmentsMock = ExpoRouter.useSegments as jest.Mock;

    usePathnameMock.mockReturnValue('/onboarding/gender');
    useSegmentsMock.mockReturnValue(['onboarding', 'gender']);

    render(<PostHogRouteTracker />);

    expect(screen).toHaveBeenCalledWith(
      '/onboarding/gender',
      expect.objectContaining({
        previous_screen: null,
        top_level_segment: 'onboarding',
        segment_count: 2,
      })
    );
  });

  it('does not retrack the same pathname on rerender', () => {
    const usePathnameMock = ExpoRouter.usePathname as jest.Mock;
    const useSegmentsMock = ExpoRouter.useSegments as jest.Mock;

    usePathnameMock.mockReturnValue('/onboarding/welcome');
    useSegmentsMock.mockReturnValue(['onboarding', 'welcome']);

    const { rerender } = render(<PostHogRouteTracker />);
    rerender(<PostHogRouteTracker />);

    expect(screen).toHaveBeenCalledTimes(1);
  });

  it('tracks the previous screen on route changes', () => {
    const usePathnameMock = ExpoRouter.usePathname as jest.Mock;
    const useSegmentsMock = ExpoRouter.useSegments as jest.Mock;

    usePathnameMock.mockReturnValue('/onboarding/welcome');
    useSegmentsMock.mockReturnValue(['onboarding', 'welcome']);

    const { rerender } = render(<PostHogRouteTracker />);

    usePathnameMock.mockReturnValue('/onboarding/gender');
    useSegmentsMock.mockReturnValue(['onboarding', 'gender']);
    rerender(<PostHogRouteTracker />);

    expect(screen).toHaveBeenLastCalledWith(
      '/onboarding/gender',
      expect.objectContaining({
        previous_screen: '/onboarding/welcome',
        top_level_segment: 'onboarding',
        segment_count: 2,
      })
    );
  });
});
