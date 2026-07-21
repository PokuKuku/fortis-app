import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { InteractionManager, LayoutChangeEvent, View, type ViewProps } from 'react-native';
import { useInAppTour } from '@/src/contexts/InAppTourContext';

type TourAnchorProps = PropsWithChildren<{
  id: string;
  disabled?: boolean;
  deferMeasurementUntilInteractions?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
} & Omit<ViewProps, 'onLayout'>>;

export function TourAnchor({
  id,
  disabled = false,
  deferMeasurementUntilInteractions = false,
  onLayout,
  children,
  ...viewProps
}: TourAnchorProps) {
  const ref = useRef<View>(null);
  const interactionTaskRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lateSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    registerAnchorRect,
    unregisterAnchor,
    activeAnchorId,
    activeSecondaryAnchorId,
    activeArrowAnchorId,
  } = useInAppTour();
  const isActiveAnchor = activeAnchorId === id
    || activeSecondaryAnchorId === id
    || activeArrowAnchorId === id;
  const isActiveAnchorRef = useRef(isActiveAnchor);
  isActiveAnchorRef.current = isActiveAnchor;

  const measure = useCallback(() => {
    if (disabled) {
      unregisterAnchor(id);
      return;
    }
    if (!isActiveAnchorRef.current) return;
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
    if (disabled || isActiveAnchor) return;
    interactionTaskRef.current?.cancel();
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (lateSettleTimerRef.current) clearTimeout(lateSettleTimerRef.current);
  }, [disabled, isActiveAnchor]);

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
      || !isActiveAnchor
    ) return;

    if (!deferMeasurementUntilInteractions) {
      requestAnimationFrame(measure);
    }

    interactionTaskRef.current?.cancel();
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (lateSettleTimerRef.current) clearTimeout(lateSettleTimerRef.current);

    interactionTaskRef.current = InteractionManager.runAfterInteractions(() => {
      if (deferMeasurementUntilInteractions) {
        settleTimerRef.current = setTimeout(() => {
          requestAnimationFrame(measure);
        }, 280);
        lateSettleTimerRef.current = setTimeout(() => {
          requestAnimationFrame(measure);
        }, 520);
        return;
      }

      settleTimerRef.current = setTimeout(() => {
        requestAnimationFrame(measure);
      }, 260);
    });
  }, [
    deferMeasurementUntilInteractions,
    disabled,
    id,
    isActiveAnchor,
    measure,
  ]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    onLayout?.(event);
    if (disabled || !isActiveAnchor) return;
    // Modal-route anchors should wait for the transition to finish before reporting a position.
    if (!deferMeasurementUntilInteractions) {
      requestAnimationFrame(measure);
    }

    interactionTaskRef.current?.cancel();
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (lateSettleTimerRef.current) clearTimeout(lateSettleTimerRef.current);

    interactionTaskRef.current = InteractionManager.runAfterInteractions(() => {
      if (deferMeasurementUntilInteractions) {
        settleTimerRef.current = setTimeout(() => {
          requestAnimationFrame(measure);
        }, 280);
        lateSettleTimerRef.current = setTimeout(() => {
          requestAnimationFrame(measure);
        }, 520);
        return;
      }

      settleTimerRef.current = setTimeout(() => {
        requestAnimationFrame(measure);
      }, 260);
    });
  }, [deferMeasurementUntilInteractions, disabled, isActiveAnchor, measure, onLayout]);

  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={handleLayout}
      {...viewProps}
    >
      {children}
    </View>
  );
}
