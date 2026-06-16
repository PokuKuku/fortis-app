import { useEffect, useCallback, useRef, useState } from 'react';
import type { RefCallback } from 'react';
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
   * Callback ref to attach to the View component
   */
  ref: RefCallback<View>;
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
  const [node, setNode] = useState<View | null>(null);
  const boundsRef = useRef<DropZone['bounds'] | null>(null);
  const setRef = useCallback((nextNode: View | null) => {
    setNode(nextNode);
  }, []);
  const dragState = context?.dragState;
  const hoveredDropZoneId = context?.hoveredDropZoneId;

  // Derived value for hover state
  const isHovered = useDerivedValue(() => {
    if (!dragState || !hoveredDropZoneId) return false;
    const isDragging = dragState.value.isDragging
      && dragState.value.draggedItemType === 'workout';
    return isDragging && hoveredDropZoneId.value === id;
  });

  // Register drop zone on mount, unregister on unmount
  useEffect(() => {
    if (!context || !enabled) return;

    // Register drop zone with initial bounds (no measureFn - stored separately)
    context.registerDropZone({
      id,
      type,
      bounds: boundsRef.current || { x: 0, y: 0, width: 0, height: 0 },
    });

    return () => {
      context.unregisterDropZone(id);
    };
  }, [context, id, type, enabled]);

  // Register measure callback separately (stored in ref, always stays current)
  useEffect(() => {
    if (!context || !enabled) return;

    // Create fresh callback that references current ref
    const measureCallback = () => {
      node?.measure((x, y, width, height, pageX, pageY) => {
        // Guard against undefined/invalid measurements
        if (typeof pageX !== 'number' || typeof pageY !== 'number' ||
            typeof width !== 'number' || typeof height !== 'number' ||
            width === 0 || height === 0) {
          return; // Skip invalid measurements
        }
        const bounds: DropZone['bounds'] = {
          x: pageX,
          y: pageY,
          width,
          height,
        };
        boundsRef.current = bounds;
        context.updateDropZoneBounds(id, bounds);
      });
    };

    context.registerMeasureCallback(id, measureCallback);

    return () => {
      context.unregisterMeasureCallback(id);
    };
  }, [context, id, enabled, node]);

  // Measure after mount as fallback (in case onLayout timing is bad)
  useEffect(() => {
    if (!context || !enabled) return;

    // Small delay to ensure view is rendered
    const timer = setTimeout(() => {
      node?.measure((x, y, width, height, pageX, pageY) => {
        if (typeof pageX !== 'number' || typeof pageY !== 'number' ||
            typeof width !== 'number' || typeof height !== 'number' ||
            width === 0 || height === 0) {
          return;
        }
        const bounds: DropZone['bounds'] = {
          x: pageX,
          y: pageY,
          width,
          height,
        };
        boundsRef.current = bounds;
        context.updateDropZoneBounds(id, bounds);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [context, id, enabled, node]);

  // Handle layout changes to measure bounds
  const onLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      if (!context || !enabled) return;

      // Retry counter to prevent infinite loops
      let retryCount = 0;
      const maxRetries = 5;

      const doMeasure = () => {
        node?.measure((x, y, width, height, pageX, pageY) => {
          // Guard against undefined/invalid measurements
          if (typeof pageX !== 'number' || typeof pageY !== 'number' ||
              typeof width !== 'number' || typeof height !== 'number' ||
              width === 0 || height === 0) {
            // Retry quickly if measurement failed (up to maxRetries times)
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(doMeasure, 50);
            }
            return;
          }
          const bounds: DropZone['bounds'] = {
            x: pageX,
            y: pageY,
            width,
            height,
          };
          boundsRef.current = bounds;
          context.updateDropZoneBounds(id, bounds);
        });
      };

      // Measure immediately - no InteractionManager delay
      requestAnimationFrame(doMeasure);
    },
    [context, id, enabled, node]
  );

  return {
    ref: setRef,
    onLayout,
    isHovered,
    contextAvailable: !!context,
  };
}
