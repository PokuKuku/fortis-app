import { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, InteractionManager, LayoutChangeEvent, View, type ViewProps } from 'react-native';
import { useInAppTour } from '@/src/contexts/InAppTourContext';

type TourAnchorProps = PropsWithChildren<{
  id: string;
  disabled?: boolean;
  deferMeasurementUntilInteractions?: boolean;
  onTourPress?: () => void;
  onTourLongPress?: () => void;
  tourDelayLongPress?: number;
  onLayout?: (event: LayoutChangeEvent) => void;
} & Omit<ViewProps, 'onLayout'>>;

const ACTIVE_ANCHOR_SETTLE_MS = 120;
const DEFERRED_ANCHOR_SETTLE_MS = 220;

export function TourAnchor({
  id,
  disabled = false,
  deferMeasurementUntilInteractions = false,
  onTourPress,
  onTourLongPress,
  tourDelayLongPress,
  onLayout,
  children,
  style,
  ...viewProps
}: TourAnchorProps) {
  const ref = useRef<View>(null);
  const pressProgress = useRef(new Animated.Value(0)).current;
  const interactionTaskRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lateSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    registerAnchorRect,
    unregisterAnchor,
    registerAnchorAction,
    unregisterAnchorAction,
    activeAnchorId,
    activeSecondaryAnchorId,
    activeArrowAnchorId,
    premeasureAnchorIds = [],
  } = useInAppTour();
  const onTourPressRef = useRef(onTourPress);
  onTourPressRef.current = onTourPress;
  const onTourLongPressRef = useRef(onTourLongPress);
  onTourLongPressRef.current = onTourLongPress;
  const hasTourPress = typeof onTourPress === 'function';
  const hasTourLongPress = typeof onTourLongPress === 'function';
  const invokeTourPress = useCallback(() => {
    onTourPressRef.current?.();
  }, []);
  const invokeTourLongPress = useCallback(() => {
    onTourLongPressRef.current?.();
  }, []);
  const handleTourPressIn = useCallback(() => {
    Animated.timing(pressProgress, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true,
    }).start();
  }, [pressProgress]);
  const handleTourPressOut = useCallback(() => {
    Animated.timing(pressProgress, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [pressProgress]);
  const pressStyle = {
    transform: [
      {
        translateY: pressProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2],
        }),
      },
      {
        scale: pressProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.985],
        }),
      },
    ],
  };
  const tourAction = useMemo(() => ({
    onPress: hasTourPress ? invokeTourPress : undefined,
    onLongPress: hasTourLongPress ? invokeTourLongPress : undefined,
    delayLongPress: tourDelayLongPress,
    onPressIn: handleTourPressIn,
    onPressOut: handleTourPressOut,
  }), [handleTourPressIn, handleTourPressOut, hasTourLongPress, hasTourPress, invokeTourLongPress, invokeTourPress, tourDelayLongPress]);
  const isCurrentAnchor = activeAnchorId === id
    || activeSecondaryAnchorId === id
    || activeArrowAnchorId === id;
  const isPremeasureAnchor = premeasureAnchorIds.some((anchorId) => anchorId === id);
  const shouldMeasureAnchor = isCurrentAnchor || isPremeasureAnchor;
  const shouldMeasureAnchorRef = useRef(shouldMeasureAnchor);
  shouldMeasureAnchorRef.current = shouldMeasureAnchor;

  const measure = useCallback(() => {
    if (disabled) {
      unregisterAnchor(id);
      return;
    }
    if (!shouldMeasureAnchorRef.current) return;
    const node = ref.current;
    if (!node) return;
    node.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) return;
      // Round to whole pixels to avoid jitter from subpixel layout changes.
      registerAnchorRect(id, {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      });
    });
  }, [disabled, id, registerAnchorRect, unregisterAnchor]);

  useEffect(() => {
    if (disabled) {
      unregisterAnchor(id);
    }
  }, [disabled, id, unregisterAnchor]);

  useEffect(() => {
    if (disabled || (!hasTourPress && !hasTourLongPress)) return;
    registerAnchorAction(id, tourAction);
    return () => unregisterAnchorAction(id, tourAction);
  }, [disabled, hasTourLongPress, hasTourPress, id, registerAnchorAction, tourAction, unregisterAnchorAction]);

  useEffect(() => {
    if (disabled || shouldMeasureAnchor) return;
    interactionTaskRef.current?.cancel();
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (lateSettleTimerRef.current) clearTimeout(lateSettleTimerRef.current);
  }, [disabled, shouldMeasureAnchor]);

  useEffect(() => {
    return () => {
      interactionTaskRef.current?.cancel();
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (lateSettleTimerRef.current) clearTimeout(lateSettleTimerRef.current);
      unregisterAnchor(id);
    };
  }, [id, unregisterAnchor]);

  useEffect(() => {
    if (
      disabled
      || !shouldMeasureAnchor
    ) return;

    if (!deferMeasurementUntilInteractions) {
      requestAnimationFrame(measure);
    }

    interactionTaskRef.current?.cancel();
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (lateSettleTimerRef.current) clearTimeout(lateSettleTimerRef.current);

    interactionTaskRef.current = InteractionManager.runAfterInteractions(() => {
      if (deferMeasurementUntilInteractions) {
        // InteractionManager already waits for the route/modal transition.
        // Publish the first valid position immediately, then remeasure once
        // after native layout has had time to settle.
        requestAnimationFrame(measure);
        lateSettleTimerRef.current = setTimeout(() => {
          requestAnimationFrame(measure);
        }, DEFERRED_ANCHOR_SETTLE_MS);
        return;
      }

      settleTimerRef.current = setTimeout(() => {
        requestAnimationFrame(measure);
      }, ACTIVE_ANCHOR_SETTLE_MS);
    });
  }, [
    deferMeasurementUntilInteractions,
    disabled,
    id,
    isCurrentAnchor,
    shouldMeasureAnchor,
    measure,
  ]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    onLayout?.(event);
    if (disabled || !shouldMeasureAnchor) return;
    // Modal-route anchors should wait for the transition to finish before reporting a position.
    if (!deferMeasurementUntilInteractions) {
      requestAnimationFrame(measure);
    }

    interactionTaskRef.current?.cancel();
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (lateSettleTimerRef.current) clearTimeout(lateSettleTimerRef.current);

    interactionTaskRef.current = InteractionManager.runAfterInteractions(() => {
      if (deferMeasurementUntilInteractions) {
        requestAnimationFrame(measure);
        lateSettleTimerRef.current = setTimeout(() => {
          requestAnimationFrame(measure);
        }, DEFERRED_ANCHOR_SETTLE_MS);
        return;
      }

      settleTimerRef.current = setTimeout(() => {
        requestAnimationFrame(measure);
      }, ACTIVE_ANCHOR_SETTLE_MS);
    });
  }, [deferMeasurementUntilInteractions, disabled, isCurrentAnchor, measure, onLayout, shouldMeasureAnchor]);

  return (
    <Animated.View
      ref={ref}
      collapsable={false}
      onLayout={handleLayout}
      {...viewProps}
      style={[style, pressStyle]}
    >
      {children}
    </Animated.View>
  );
}
