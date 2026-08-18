import React from 'react';
import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { TourAnchor } from '@/src/components/tour/TourAnchor';

const mockRegisterAnchorAction = jest.fn();
const mockUnregisterAnchorAction = jest.fn();

jest.mock('@/src/contexts/InAppTourContext', () => ({
  useInAppTour: () => ({
    registerAnchorRect: jest.fn(),
    unregisterAnchor: jest.fn(),
    registerAnchorAction: mockRegisterAnchorAction,
    unregisterAnchorAction: mockUnregisterAnchorAction,
    activeAnchorId: null,
    activeSecondaryAnchorId: null,
    activeArrowAnchorId: null,
    premeasureAnchorIds: [],
  }),
}));

describe('TourAnchor actions', () => {
  beforeEach(() => {
    mockRegisterAnchorAction.mockClear();
    mockUnregisterAnchorAction.mockClear();
  });

  it('registers a stable action that invokes the latest highlighted control handler', () => {
    const firstHandler = jest.fn();
    const secondHandler = jest.fn();
    const view = render(
      <TourAnchor id="tour.test.action" onTourPress={firstHandler}>
        <Text>Action</Text>
      </TourAnchor>
    );

    const registeredAction = mockRegisterAnchorAction.mock.calls[0][1] as {
      onPress: () => void;
      onPressIn: () => void;
      onPressOut: () => void;
    };
    act(() => registeredAction.onPressIn());
    act(() => registeredAction.onPressOut());
    act(() => registeredAction.onPress());
    expect(firstHandler).toHaveBeenCalledTimes(1);

    view.rerender(
      <TourAnchor id="tour.test.action" onTourPress={secondHandler}>
        <Text>Action</Text>
      </TourAnchor>
    );
    act(() => registeredAction.onPress());
    expect(secondHandler).toHaveBeenCalledTimes(1);

    view.unmount();
    expect(mockUnregisterAnchorAction).toHaveBeenCalledWith('tour.test.action', registeredAction);
  });

  it('registers long-press actions with their required hold duration', () => {
    const onLongPress = jest.fn();
    render(
      <TourAnchor
        id="tour.test.long-action"
        onTourLongPress={onLongPress}
        tourDelayLongPress={350}
      >
        <Text>Long action</Text>
      </TourAnchor>
    );

    const registeredAction = mockRegisterAnchorAction.mock.calls[0][1] as {
      onLongPress: () => void;
      delayLongPress: number;
    };
    expect(registeredAction.delayLongPress).toBe(350);
    act(() => registeredAction.onLongPress());
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
