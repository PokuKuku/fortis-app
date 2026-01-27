import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { LayoutChangeEvent, View, type ViewProps } from 'react-native';
import { useInAppTour } from '@/src/contexts/InAppTourContext';

type TourAnchorProps = PropsWithChildren<{
  id: string;
  onLayout?: (event: LayoutChangeEvent) => void;
} & Omit<ViewProps, 'onLayout'>>;

export function TourAnchor({ id, onLayout, children, ...viewProps }: TourAnchorProps) {
  const ref = useRef<View>(null);
  const { registerAnchorRect, unregisterAnchor } = useInAppTour();

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) return;
      registerAnchorRect(id, { x, y, width, height });
    });
  }, [id, registerAnchorRect]);

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

