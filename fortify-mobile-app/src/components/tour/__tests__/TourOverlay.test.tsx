import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { getTourSlideDirection, TourOverlay } from '@/src/components/tour/TourOverlay';

jest.mock('@/src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: true,
    colors: {
      accent: '#ffffff',
      accentForegroundOnFill: '#000000',
      accentShadow: '#000000',
      buttonFog: ['transparent', 'transparent'],
      buttonGradient: ['#ffffff', '#dddddd'],
      glassBorder: '#444444',
      textPrimary: '#ffffff',
      textSecondary: '#cccccc',
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

describe('TourOverlay', () => {
  it('keeps the tooltip shell mounted while its exit animation completes', () => {
    const view = render(
      <TourOverlay
        visible
        mode="blocking"
        anchorRect={null}
        body="Transitioning tooltip"
        hideTooltip
      />
    );

    const tooltipShell = view.getByTestId('tour-tooltip-shell', { includeHiddenElements: true });
    expect(tooltipShell).toBeTruthy();
    expect(view.getByText('Transitioning tooltip', { includeHiddenElements: true })).toBeTruthy();
    expect(tooltipShell.props.pointerEvents).toBe('none');
  });

  it('alternates the horizontal direction between tooltip handoffs', () => {
    expect(getTourSlideDirection(0)).toBe(-1);
    expect(getTourSlideDirection(1)).toBe(1);
    expect(getTourSlideDirection(2)).toBe(-1);
    expect(getTourSlideDirection(3)).toBe(1);
  });

  it('points upward when the tooltip is placed below its anchor', () => {
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 100, y: 200, width: 120, height: 50 }}
        body="Workouts overview"
        placement="below"
        showArrow
      />
    );

    expect(view.getByTestId('tour-arrow-up')).toBeTruthy();
    expect(view.queryByTestId('tour-arrow-down')).toBeNull();
  });

  it('tracks rounded spotlight geometry', () => {
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 100, y: 200, width: 120, height: 50 }}
        body="Workouts overview"
      />
    );

    const spotlightStyle = StyleSheet.flatten(view.getByTestId('tour-spotlight-hole-0').props.style);

    expect(spotlightStyle.borderRadius).toBeGreaterThan(0);
  });

  it('cuts rounded spotlight holes without an SVG mask', () => {
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 100, y: 200, width: 120, height: 50 }}
        body="Safe rounded spotlight"
      />
    );

    const dimPath = view.getByTestId('tour-spotlight-path').props;
    expect(dimPath.fillRule).toBe(0);
    expect(dimPath.d).toContain(' A ');
    expect(dimPath.mask).toBeUndefined();
  });

  it('blocks touches inside informational highlights by default', () => {
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 100, y: 200, width: 120, height: 50 }}
        body="Informational highlight"
      />
    );

    expect(view.getByTestId('tour-hole-blocker-0')).toBeTruthy();
  });

  it('can point at one control from all four sides', () => {
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 40, y: 120, width: 280, height: 400 }}
        arrowTargetRect={{ x: 150, y: 220, width: 48, height: 36 }}
        body="Press and hold 225"
        showArrow
        arrowDirections={['top', 'right', 'bottom', 'left']}
      />
    );

    expect(view.getByTestId('tour-arrow-top')).toBeTruthy();
    expect(view.getByTestId('tour-arrow-right')).toBeTruthy();
    expect(view.getByTestId('tour-arrow-bottom')).toBeTruthy();
    expect(view.getByTestId('tour-arrow-left')).toBeTruthy();
  });

  it('blocks the highlighted area except for the arrow target when requested', () => {
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 40, y: 120, width: 280, height: 400 }}
        arrowTargetRect={{ x: 150, y: 220, width: 48, height: 36 }}
        body="Press and hold 225"
        allowAnchorInteraction
        allowOnlyArrowTargetInteraction
      />
    );

    expect(view.getByTestId('tour-hole-blocker-top')).toBeTruthy();
    expect(view.getByTestId('tour-hole-blocker-right')).toBeTruthy();
    expect(view.getByTestId('tour-hole-blocker-bottom')).toBeTruthy();
    expect(view.getByTestId('tour-hole-blocker-left')).toBeTruthy();
  });

  it('keeps the main anchor interactive when no separate arrow target exists', () => {
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 260, y: 600, width: 90, height: 52 }}
        body="Tap the highlighted keyboard control"
        allowAnchorInteraction
        allowOnlyArrowTargetInteraction
      />
    );

    expect(view.queryByTestId('tour-hole-blocker-0')).toBeNull();
  });

  it('can handle a highlighted action directly instead of relying on touch passthrough', () => {
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 260, y: 600, width: 52, height: 52 }}
        body="Tap this button to add a workout"
        allowAnchorInteraction
        anchorAction={{ label: 'Add workout', onPress, onPressIn, onPressOut }}
      />
    );

    const action = view.getByLabelText('Add workout');
    fireEvent(action, 'pressIn');
    fireEvent(action, 'pressOut');
    fireEvent.press(action);

    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('supports explicit long-press actions on a separate arrow target', () => {
    const onLongPress = jest.fn();
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 40, y: 120, width: 280, height: 400 }}
        arrowTargetRect={{ x: 260, y: 300, width: 44, height: 44 }}
        anchorActionRect={{ x: 260, y: 300, width: 44, height: 44 }}
        body="Press and hold"
        allowAnchorInteraction
        anchorAction={{ label: 'Complete remaining sets', onLongPress, delayLongPress: 350 }}
      />
    );

    fireEvent(view.getByLabelText('Complete remaining sets'), 'longPress');

    expect(onLongPress).toHaveBeenCalledTimes(1);
    const actionStyle = StyleSheet.flatten(view.getByTestId('tour-anchor-action').props.style);
    expect(actionStyle).toEqual(expect.objectContaining({
      left: 260,
      top: 300,
      width: 44,
      height: 44,
    }));
  });

  it('supports bold emphasis within the tour directions', () => {
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 100, y: 200, width: 120, height: 50 }}
        body="Press and hold 225 to fill the remaining sets."
        boldPhrases={['Press and hold']}
      />
    );

    expect(view.getByText('Press and hold').props.style).toEqual(
      expect.objectContaining({ fontWeight: expect.any(String) })
    );
  });

  it('supports a step-specific vertical spotlight offset', () => {
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 100, y: 200, width: 120, height: 50 }}
        body="Insights navigation"
        holePadding={0}
        holeOffsetY={6}
      />
    );

    const spotlightStyle = StyleSheet.flatten(view.getByTestId('tour-spotlight-hole-0').props.style);
    expect(spotlightStyle.top).toBe(206);
  });

  it('can widen and raise a spotlight without extending its bottom edge', () => {
    const view = render(
      <TourOverlay
        visible
        mode="spotlight"
        anchorRect={{ x: 40, y: 120, width: 280, height: 400 }}
        body="Set controls"
        holePadding={0}
        holePaddingHorizontal={8}
        holePaddingTop={8}
        holePaddingBottom={0}
      />
    );

    const spotlightStyle = StyleSheet.flatten(view.getByTestId('tour-spotlight-hole-0').props.style);
    expect(spotlightStyle.left).toBe(32);
    expect(spotlightStyle.top).toBe(112);
    expect(spotlightStyle.width).toBe(296);
    expect(spotlightStyle.height).toBe(408);
  });

  it('keeps replay and next as independent actions', () => {
    const replay = jest.fn();
    const next = jest.fn();
    const view = render(
      <TourOverlay
        visible
        mode="blocking"
        anchorRect={null}
        body="AI overview"
        auxiliaryAction={{ label: 'Replay introduction', onPress: replay }}
        primaryAction={{ label: 'Next', onPress: next }}
      />
    );

    fireEvent.press(view.getByLabelText('Replay introduction'));
    fireEvent.press(view.getByText('Next'));

    expect(replay).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('provides immediate press feedback hooks without advancing early', () => {
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const view = render(
      <TourOverlay
        visible
        mode="blocking"
        anchorRect={null}
        body="Immediate feedback"
        primaryAction={{ label: 'Continue', onPress, onPressIn, onPressOut }}
      />
    );
    const button = view.getByText('Continue');

    fireEvent(button, 'pressIn');
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();

    fireEvent(button, 'pressOut');
    expect(onPressOut).toHaveBeenCalledTimes(1);

    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the secondary tour action and responds immediately', () => {
    const skip = jest.fn();
    const view = render(
      <TourOverlay
        visible
        mode="blocking"
        anchorRect={null}
        body="Tour introduction"
        secondaryAction={{ label: 'Skip tour', onPress: skip }}
      />
    );

    fireEvent.press(view.getByLabelText('Skip tour'));

    expect(skip).toHaveBeenCalledTimes(1);
  });

  it('does not fire a disabled secondary tour action', () => {
    const skip = jest.fn();
    const view = render(
      <TourOverlay
        visible
        mode="blocking"
        anchorRect={null}
        body="Tour introduction"
        secondaryAction={{ label: 'Skip tour', onPress: skip, disabled: true }}
      />
    );

    fireEvent.press(view.getByLabelText('Skip tour'));

    expect(skip).not.toHaveBeenCalled();
  });
});
