import React from 'react';
import { render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import * as ExpoRouter from 'expo-router';
import { RouteChangeHaptics } from '@/src/components/haptics/RouteChangeHaptics';

describe('RouteChangeHaptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fires selection haptic on route change', () => {
    const usePathnameMock = ExpoRouter.usePathname as jest.Mock;
    usePathnameMock.mockReturnValue('/');

    const { rerender } = render(<RouteChangeHaptics />);
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();

    usePathnameMock.mockReturnValue('/settings');
    rerender(<RouteChangeHaptics />);

    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('does not fire when route stays the same', () => {
    const usePathnameMock = ExpoRouter.usePathname as jest.Mock;
    usePathnameMock.mockReturnValue('/');

    const { rerender } = render(<RouteChangeHaptics />);
    rerender(<RouteChangeHaptics />);

    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });
});
