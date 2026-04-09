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
        screen_index: 3,
        step_id: 'gender',
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
