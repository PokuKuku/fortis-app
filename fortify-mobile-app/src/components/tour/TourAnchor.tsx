import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { InteractionManager, LayoutChangeEvent, View, type ViewProps } from 'react-native';
import { useInAppTour } from '@/src/contexts/InAppTourContext';

type TourAnchorProps = PropsWithChildren<{
  id: string;
  disabled?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
} & Omit<ViewProps, 'onLayout'>>;

export function TourAnchor({ id, disabled = false, onLayout, children, ...viewProps }: TourAnchorProps) {
  const ref = useRef<View>(null);
  const interactionTaskRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lateSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { registerAnchorRect, unregisterAnchor, activeAnchorId } = useInAppTour();

  const measure = useCallback(() => {
    if (disabled) {
      unregisterAnchor(id);
      return;
    }
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
    return () => {
      interactionTaskRef.current?.cancel();
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (lateSettleTimerRef.current) clearTimeout(lateSettleTimerRef.current);
      unregisterAnchor(id);
    };
  }, [id, unregisterAnchor]);

  useEffect(() => {
    if (disabled || activeAnchorId !== id) return;

    requestAnimationFrame(measure);

    interactionTaskRef.current?.cancel();
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (lateSettleTimerRef.current) clearTimeout(lateSettleTimerRef.current);

    interactionTaskRef.current = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(measure);
    });
    settleTimerRef.current = setTimeout(() => {
      requestAnimationFrame(measure);
    }, 120);
    lateSettleTimerRef.current = setTimeout(() => {
      requestAnimationFrame(measure);
    }, 320);
  }, [activeAnchorId, disabled, id, measure]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    onLayout?.(event);
    // Measure immediately, then re-measure after interactions/fonts/layout settle on device.
    requestAnimationFrame(measure);

    interactionTaskRef.current?.cancel();
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    if (lateSettleTimerRef.current) clearTimeout(lateSettleTimerRef.current);

    interactionTaskRef.current = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(measure);
    });
    settleTimerRef.current = setTimeout(() => {
      requestAnimationFrame(measure);
    }, 180);
    lateSettleTimerRef.current = setTimeout(() => {
      requestAnimationFrame(measure);
    }, 420);
  }, [measure, onLayout]);

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
