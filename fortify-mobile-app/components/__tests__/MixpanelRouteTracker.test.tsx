import React from 'react';
import { render } from '@testing-library/react-native';
import * as ExpoRouter from 'expo-router';
import { MixpanelRouteTracker } from '@/src/components/analytics/MixpanelRouteTracker';
import { trackMixpanelScreenView } from '@/src/lib/mixpanel';

jest.mock('@/src/lib/mixpanel', () => ({
  trackMixpanelScreenView: jest.fn(() => Promise.resolve()),
}));

describe('MixpanelRouteTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks route screen views with route metadata', () => {
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
  });

  it('tracks the onboarding index route', () => {
    const usePathnameMock = ExpoRouter.usePathname as jest.Mock;
    const useSegmentsMock = ExpoRouter.useSegments as jest.Mock;

    usePathnameMock.mockReturnValue('/onboarding');
    useSegmentsMock.mockReturnValue(['onboarding']);

    render(<MixpanelRouteTracker />);

    expect(trackMixpanelScreenView).toHaveBeenCalledWith(
      '/onboarding',
      expect.objectContaining({
        top_level_segment: 'onboarding',
        leaf_segment: 'index',
        segment_count: 1,
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
  });
});
