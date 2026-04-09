import React from 'react';
import { render } from '@testing-library/react-native';
import * as ExpoRouter from 'expo-router';
import { MixpanelRouteTracker } from '@/src/components/analytics/MixpanelRouteTracker';
import { trackMixpanelEvent, trackMixpanelScreenView } from '@/src/lib/mixpanel';

jest.mock('@/src/lib/mixpanel', () => ({
  trackMixpanelEvent: jest.fn(() => Promise.resolve()),
  trackMixpanelScreenView: jest.fn(() => Promise.resolve()),
}));

describe('MixpanelRouteTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks onboarding screen views with funnel metadata', () => {
    const usePathnameMock = ExpoRouter.usePathname as jest.Mock;
    const useSegmentsMock = ExpoRouter.useSegments as jest.Mock;

    usePathnameMock.mockReturnValue('/onboarding/gender');
    useSegmentsMock.mockReturnValue(['onboarding', 'gender']);

    render(<MixpanelRouteTracker />);

    expect(trackMixpanelScreenView).toHaveBeenCalledWith(
      '/onboarding/gender',
      expect.objectContaining({
        top_level_segment: 'onboarding',
        leaf_segment: 'gender',
        segment_count: 2,
      })
    );
    expect(trackMixpanelEvent).toHaveBeenCalledWith(
      'onboarding_screen_viewed',
      expect.objectContaining({
        screen_id: 'gender',
        screen_index: 4,
        step_id: 'gender',
      })
    );
  });

  it('tracks the onboarding index screen as profile_name', () => {
    const usePathnameMock = ExpoRouter.usePathname as jest.Mock;
    const useSegmentsMock = ExpoRouter.useSegments as jest.Mock;

    usePathnameMock.mockReturnValue('/onboarding');
    useSegmentsMock.mockReturnValue(['onboarding']);

    render(<MixpanelRouteTracker />);

    expect(trackMixpanelEvent).toHaveBeenCalledWith(
      'onboarding_screen_viewed',
      expect.objectContaining({
        screen_id: 'profile_name',
        screen_index: 2,
        step_id: 'profile_name',
        pathname: '/onboarding',
      })
    );
  });

  it('does not retrack the same pathname on rerender', () => {
    const usePathnameMock = ExpoRouter.usePathname as jest.Mock;
    const useSegmentsMock = ExpoRouter.useSegments as jest.Mock;

    usePathnameMock.mockReturnValue('/onboarding/welcome');
    useSegmentsMock.mockReturnValue(['onboarding', 'welcome']);

    const { rerender } = render(<MixpanelRouteTracker />);
    rerender(<MixpanelRouteTracker />);

    expect(trackMixpanelScreenView).toHaveBeenCalledTimes(1);
    expect(trackMixpanelEvent).toHaveBeenCalledTimes(1);
  });
});
