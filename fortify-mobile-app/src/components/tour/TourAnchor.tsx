import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { LayoutChangeEvent, View, type ViewProps } from 'react-native';
import { useInAppTour } from '@/src/contexts/InAppTourContext';

type TourAnchorProps = PropsWithChildren<{
  id: string;
  disabled?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
} & Omit<ViewProps, 'onLayout'>>;

export function TourAnchor({ id, disabled = false, onLayout, children, ...viewProps }: TourAnchorProps) {
  const ref = useRef<View>(null);
  const { registerAnchorRect, unregisterAnchor } = useInAppTour();

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
      unregisterAnchor(id);
    };
  }, [id, unregisterAnchor]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    onLayout?.(event);
    // Defer measurement until after layout settles.
    requestAnimationFrame(measure);
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
