import React, { createContext, useCallback, useMemo, useRef } from 'react';
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

export interface DropZone {
  id: string;
  type: 'program';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DragState {
  isDragging: boolean;
  draggedItemId: string | null;
  draggedItemType: 'workout' | 'program' | null;
  absoluteX: number;
  absoluteY: number;
}

export interface DragDropContextValue {
  // Shared animated values
  dragState: SharedValue<DragState>;
  dropZones: SharedValue<DropZone[]>;
  hoveredDropZoneId: SharedValue<string | null>;

  // Actions
  registerDropZone: (zone: DropZone) => void;
  unregisterDropZone: (id: string) => void;
  updateDropZoneBounds: (id: string, bounds: DropZone['bounds']) => void;

  // Drag lifecycle
  startDrag: (itemId: string, itemType: 'workout' | 'program') => void;
  updateDragPosition: (absoluteX: number, absoluteY: number) => void;
  endDrag: () => void;

  // Check if currently dragging
  checkDropZones: (absoluteX: number, absoluteY: number) => string | null;

  // Re-measure all drop zone bounds (call when scroll position may have changed)
  remeasureAllBounds: () => void;

  // Measure callback registry (stored separately from SharedValue for proper closure handling)
  registerMeasureCallback: (id: string, callback: () => void) => void;
  unregisterMeasureCallback: (id: string) => void;
}

export const DragDropContext = createContext<DragDropContextValue | null>(null);

interface DragDropProviderProps {
  children: React.ReactNode;
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  // Shared values for cross-component communication
  const dragState = useSharedValue<DragState>({
    isDragging: false,
    draggedItemId: null,
    draggedItemType: null,
    absoluteX: 0,
    absoluteY: 0,
  });

  const dropZones = useSharedValue<DropZone[]>([]);
  const hoveredDropZoneId = useSharedValue<string | null>(null);

  // Store measure callbacks in a regular ref (not SharedValue) for proper closure handling
  const measureCallbacksRef = useRef<Map<string, () => void>>(new Map());

  // Register a measure callback (stored separately from SharedValue)
  const registerMeasureCallback = useCallback((id: string, callback: () => void) => {
    measureCallbacksRef.current.set(id, callback);
  }, []);

  // Unregister a measure callback
  const unregisterMeasureCallback = useCallback((id: string) => {
    measureCallbacksRef.current.delete(id);
  }, []);

  // Register a new drop zone
  const registerDropZone = useCallback(
    (zone: DropZone) => {
      const existing = dropZones.value.find((z) => z.id === zone.id);
      if (!existing) {
        dropZones.value = [...dropZones.value, zone];
      }
    },
    [dropZones]
  );

  // Unregister a drop zone
  const unregisterDropZone = useCallback(
    (id: string) => {
      dropZones.value = dropZones.value.filter((z) => z.id !== id);
    },
    [dropZones]
  );

  // Update drop zone bounds (called on layout changes)
  const updateDropZoneBounds = useCallback(
    (id: string, bounds: DropZone['bounds']) => {
      dropZones.value = dropZones.value.map((zone) =>
        zone.id === id ? { ...zone, bounds } : zone
      );
    },
    [dropZones]
  );

  // Start dragging an item
  const startDrag = useCallback(
    (itemId: string, itemType: 'workout' | 'program') => {
      dragState.value = {
        isDragging: true,
        draggedItemId: itemId,
        draggedItemType: itemType,
        absoluteX: 0,
        absoluteY: 0,
      };
    },
    [dragState]
  );

  // Update drag position
  const updateDragPosition = useCallback(
    (absoluteX: number, absoluteY: number) => {
      dragState.value = {
        ...dragState.value,
        absoluteX,
        absoluteY,
      };
    },
    [dragState]
  );

  // End dragging
  const endDrag = useCallback(() => {
    dragState.value = {
      isDragging: false,
      draggedItemId: null,
      draggedItemType: null,
      absoluteX: 0,
      absoluteY: 0,
    };
    hoveredDropZoneId.value = null;
  }, [dragState, hoveredDropZoneId]);

  // Check if position is over any drop zone and update hovered state
  const checkDropZones = useCallback(
    (absoluteX: number, absoluteY: number): string | null => {
      const zones = dropZones.value;

      for (const zone of zones) {
        const { bounds } = zone;

        // Skip zones with invalid bounds (not yet measured or zero-sized)
        if (bounds.width === 0 || bounds.height === 0) continue;

        const isInside =
          absoluteX >= bounds.x &&
          absoluteX <= bounds.x + bounds.width &&
          absoluteY >= bounds.y &&
          absoluteY <= bounds.y + bounds.height;

        if (isInside) {
          if (hoveredDropZoneId.value !== zone.id) {
            hoveredDropZoneId.value = zone.id;
          }
          return zone.id;
        }
      }

      if (hoveredDropZoneId.value !== null) {
        hoveredDropZoneId.value = null;
      }
      return null;
    },
    [dropZones, hoveredDropZoneId]
  );

  // Re-measure all drop zone bounds (useful when scroll position has changed)
  const remeasureAllBounds = useCallback(() => {
    measureCallbacksRef.current.forEach((callback) => {
      callback();
    });
  }, []);

  const value = useMemo<DragDropContextValue>(
    () => ({
      dragState,
      dropZones,
      hoveredDropZoneId,
      registerDropZone,
      unregisterDropZone,
      updateDropZoneBounds,
      startDrag,
      updateDragPosition,
      endDrag,
      checkDropZones,
      remeasureAllBounds,
      registerMeasureCallback,
      unregisterMeasureCallback,
    }),
    [
      dragState,
      dropZones,
      hoveredDropZoneId,
      registerDropZone,
      unregisterDropZone,
      updateDropZoneBounds,
      startDrag,
      updateDragPosition,
      endDrag,
      checkDropZones,
      remeasureAllBounds,
      registerMeasureCallback,
      unregisterMeasureCallback,
    ]
  );

  return (
    <DragDropContext.Provider value={value}>
      {children}
    </DragDropContext.Provider>
  );
}
