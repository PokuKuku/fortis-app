import { useEffect, useCallback, useRef } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useDragDropContextOptional } from './useDragDropContext';
import type { DropZone } from '../contexts/DragDropContext';

interface UseDropZoneOptions {
  /**
   * Unique identifier for this drop zone
   */
  id: string;
  /**
   * Type of drop zone (currently only 'program' is supported)
   */
  type: 'program';
  /**
   * Whether this drop zone is currently enabled
   */
  enabled?: boolean;
}

interface UseDropZoneReturn {
  /**
   * Ref to attach to the View component
   */
  ref: React.RefObject<View | null>;
  /**
   * Handler for onLayout to measure bounds
   */
  onLayout: (event: LayoutChangeEvent) => void;
  /**
   * Animated value indicating if this zone is currently hovered
   */
  isHovered: SharedValue<boolean>;
  /**
   * Whether the drag-drop context is available
   */
  contextAvailable: boolean;
}

/**
 * Hook to register a component as a drop zone for drag-and-drop operations.
 *
 * @example
 * ```tsx
 * function ProgramCard({ id, name }: Props) {
 *   const { ref, onLayout, isHovered } = useDropZone({
 *     id: `program-${id}`,
 *     type: 'program',
 *   });
 *
 *   const animatedStyle = useAnimatedStyle(() => ({
 *     borderColor: isHovered.value ? Colors.success : 'transparent',
 *   }));
 *
 *   return (
 *     <Animated.View ref={ref} onLayout={onLayout} style={animatedStyle}>
 *       {name}
 *     </Animated.View>
 *   );
 * }
 * ```
 */
export function useDropZone({
  id,
  type,
  enabled = true,
}: UseDropZoneOptions): UseDropZoneReturn {
  const context = useDragDropContextOptional();
  const ref = useRef<View>(null);
  const boundsRef = useRef<DropZone['bounds'] | null>(null);

  // Derived value for hover state
  const isHovered = useDerivedValue(() => {
    if (!context) return false;
    return context.hoveredDropZoneId.value === id;
  }, [context, id]);

  // Register drop zone on mount, unregister on unmount
  useEffect(() => {
    if (!context || !enabled) return;

    // Register with initial bounds (will be updated on layout)
    context.registerDropZone({
      id,
      type,
      bounds: boundsRef.current || { x: 0, y: 0, width: 0, height: 0 },
    });

    return () => {
      context.unregisterDropZone(id);
    };
  }, [context, id, type, enabled]);

  // Handle layout changes to measure bounds
  const onLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      if (!context || !enabled) return;

      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        ref.current?.measure((x, y, width, height, pageX, pageY) => {
          const bounds: DropZone['bounds'] = {
            x: pageX,
            y: pageY,
            width,
            height,
          };
          boundsRef.current = bounds;
          context.updateDropZoneBounds(id, bounds);
        });
      });
    },
    [context, id, enabled]
  );

  return {
    ref,
    onLayout,
    isHovered,
    contextAvailable: !!context,
  };
}
