import React, { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { DragDropContext, DragDropContextValue } from '../contexts/DragDropContext';

type LayoutConfig = {
  itemWidth: number;
  itemHeight: number;
  gap: number;
  numColumns: number;
};

type PositionMap = Record<string, number>;
type ContainerOffset = { x: number; y: number; ready: boolean };

type DraggableGridProps<T> = {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  onReorder: (items: T[]) => void;
  numColumns: number;
  itemHeight: number;
  gap?: number;
  // Cross-container drag-and-drop props
  enableCrossContainerDrag?: boolean;
  dragType?: 'workout' | 'program';
  onCrossContainerDrop?: (sourceItemId: string, targetDropZoneId: string) => void;
};

const SPRING_CONFIG = {
  // Tighter damping to reduce bounce on release
  damping: 24,
  stiffness: 180,
  mass: 1,
};

const clamp = (value: number, lower: number, upper: number) => {
  'worklet';
  return Math.max(lower, Math.min(value, upper));
};

const swapPositions = (positions: PositionMap, from: number, to: number) => {
  'worklet';
  if (from === to) return positions;

  const next: PositionMap = { ...positions };
  let targetKey: string | null = null;
  for (const key in positions) {
    if (!Object.prototype.hasOwnProperty.call(positions, key)) continue;
    if (positions[key] === to) {
      targetKey = key;
      break;
    }
  }
  for (const key in positions) {
    if (!Object.prototype.hasOwnProperty.call(positions, key)) continue;
    if (positions[key] === from) {
      next[key] = to;
      break;
    }
  }
  if (targetKey) {
    next[targetKey] = from;
  }
  return next;
};

const getPositionForIndex = (index: number, config: LayoutConfig) => {
  'worklet';
  const col = index % config.numColumns;
  const row = Math.floor(index / config.numColumns);
  return {
    x: col * (config.itemWidth + config.gap),
    y: row * (config.itemHeight + config.gap),
  };
};

const getIndexForPosition = (
  x: number,
  y: number,
  config: LayoutConfig,
  itemCount: number
) => {
  'worklet';
  if (config.itemWidth <= 0 || config.itemHeight <= 0 || itemCount === 0) {
    return 0;
  }

  const col = clamp(
    Math.round(x / (config.itemWidth + config.gap)),
    0,
    config.numColumns - 1
  );
  const maxRow = Math.max(0, Math.ceil(itemCount / config.numColumns) - 1);
  const row = clamp(
    Math.round(y / (config.itemHeight + config.gap)),
    0,
    maxRow
  );
  const index = row * config.numColumns + col;
  return clamp(index, 0, itemCount - 1);
};

type DraggableItemProps<T> = {
  item: T;
  index: number;
  itemKey: string;
  positions: ReturnType<typeof useSharedValue<PositionMap>>;
  layoutConfig: ReturnType<typeof useSharedValue<LayoutConfig>>;
  activeKey: ReturnType<typeof useSharedValue<string | null>>;
  dataLength: ReturnType<typeof useSharedValue<number>>;
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  onDrop: (itemKey: string, fromIndex: number, toIndex: number) => void;
  containerOffset: ReturnType<typeof useSharedValue<ContainerOffset>>;
  itemWidth: number;
  itemHeight: number;
  // Cross-container drag-and-drop props
  enableCrossContainerDrag?: boolean;
  dragType?: 'workout' | 'program';
  dragDropContext: DragDropContextValue | null;
  onCrossContainerDrop?: (sourceItemId: string, targetDropZoneId: string) => void;
  // Callback to re-measure container offset on drag start
  remeasureContainer?: () => void;
};

function DraggableItem<T>({
  item,
  index,
  itemKey,
  positions,
  layoutConfig,
  activeKey,
  dataLength,
  renderItem,
  onDrop,
  containerOffset,
  itemWidth,
  itemHeight,
  enableCrossContainerDrag,
  dragType,
  dragDropContext,
  onCrossContainerDrop,
  remeasureContainer,
}: DraggableItemProps<T>) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const [isActiveRender, setIsActiveRender] = useState(false);
  const isPressing = useSharedValue(false);
  const originIndex = useSharedValue<number>(0);
  const currentIndex = useSharedValue<number>(index);
  const startIndex = useSharedValue<number>(0);

  // Keep the shared translate values in sync with the item's slot whenever layout or order changes.
  useAnimatedReaction(
    () => {
      const dragging = activeKey.value === itemKey;
      const cfg = layoutConfig.value;

      if (cfg.itemWidth <= 0 || cfg.itemHeight <= 0) return null;
      return {
        dragging,
        target: getPositionForIndex(positions.value[itemKey] ?? index, cfg),
      };
    },
    (result, previous) => {
      if (!result || result.dragging) return;

      const { target } = result;
      const closeToTarget =
        Math.abs(translateX.value - target.x) < 0.5 &&
        Math.abs(translateY.value - target.y) < 0.5;

      if (closeToTarget) return;

      const shouldAnimate = !!previous;
      translateX.value = shouldAnimate ? withSpring(target.x, SPRING_CONFIG) : target.x;
      translateY.value = shouldAnimate ? withSpring(target.y, SPRING_CONFIG) : target.y;
    },
    []
  );

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  }, []);

  const triggerDropZoneHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, []);

  // Track the last hovered drop zone to trigger haptic only on entry
  const lastHoveredDropZoneRef = useRef<string | null>(null);

  // Helper callback to check drop zones from JS thread (called via runOnJS)
  const checkDropZonesAndHaptic = useCallback((absoluteX: number, absoluteY: number) => {
    if (!dragDropContext) return;

    const hoveredZone = dragDropContext.checkDropZones(absoluteX, absoluteY);
    if (hoveredZone && lastHoveredDropZoneRef.current !== hoveredZone) {
      triggerDropZoneHaptic();
    }
    lastHoveredDropZoneRef.current = hoveredZone;
  }, [dragDropContext, triggerDropZoneHaptic]);

  const animatedStyle = useAnimatedStyle(() => {
    const dragging = activeKey.value === itemKey;

    const liftScale = isPressing.value ? 1.03 : 1;

    return {
      position: 'absolute',
      width: layoutConfig.value.itemWidth,
      height: layoutConfig.value.itemHeight,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: withSpring(dragging ? 1.05 : liftScale, SPRING_CONFIG) },
      ],
      zIndex: dragging ? 10 : 1,
      opacity: 1,
    };
  }, [activeKey, index, itemKey, layoutConfig, positions, translateX, translateY]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          if (
            layoutConfig.value.itemWidth <= 0 ||
            layoutConfig.value.itemHeight <= 0 ||
            !containerOffset.value.ready
          ) {
            return;
          }
          isPressing.value = true;
          const startSlot = positions.value[itemKey] ?? index;
          const slotPosition = getPositionForIndex(startSlot, layoutConfig.value);
          // Ensure we begin from the current slot coordinates to avoid any snap on pickup
          translateX.value = slotPosition.x;
          translateY.value = slotPosition.y;
          originIndex.value = startSlot;
          currentIndex.value = startSlot;
          startIndex.value = startSlot;
          startX.value = translateX.value;
          startY.value = translateY.value;
          activeKey.value = itemKey;
          runOnJS(setIsActiveRender)(true);
          runOnJS(triggerHaptic)();

          // Notify cross-container drag context if enabled
          if (enableCrossContainerDrag && dragDropContext && dragType) {
            // Re-measure container offset to account for scroll changes
            if (remeasureContainer) {
              runOnJS(remeasureContainer)();
            }
            // Start drag - bounds are maintained by onLayout, no need to remeasure
            // (remeasureAllBounds removed - it causes Reanimated threading warnings)
            runOnJS(dragDropContext.startDrag)(itemKey, dragType);
          }
        })
        .onChange((event) => {
          if (
            layoutConfig.value.itemWidth <= 0 ||
            layoutConfig.value.itemHeight <= 0 ||
            !containerOffset.value.ready
          ) {
            return;
          }
          const nextX = startX.value + event.translationX;
          const nextY = startY.value + event.translationY;

          // Shared threshold so both visual movement and reorder activation feel consistent
          const activationDistance = Math.max(
            16,
            Math.min(layoutConfig.value.itemWidth, layoutConfig.value.itemHeight) * 0.3
          );
          const baseIndex = originIndex.value;
          const originTarget = getPositionForIndex(baseIndex, layoutConfig.value);
          const movedFromOrigin = Math.hypot(
            nextX - originTarget.x,
            nextY - originTarget.y
          );

          translateX.value = nextX;
          translateY.value = nextY;

          // Ignore moves below the shared activation threshold
          if (movedFromOrigin < activationDistance) {
            return;
          }

          const overIndex = getIndexForPosition(
            nextX + layoutConfig.value.itemWidth / 2,
            nextY + layoutConfig.value.itemHeight / 2,
            layoutConfig.value,
            dataLength.value
          );

          if (overIndex !== currentIndex.value) {
            positions.value = swapPositions(positions.value, currentIndex.value, overIndex);
            currentIndex.value = overIndex;
          }

          // Cross-container drag: update position and check drop zones
          if (enableCrossContainerDrag && dragDropContext) {
            // Calculate absolute position on screen
            const absoluteX = containerOffset.value.x + nextX + layoutConfig.value.itemWidth / 2;
            const absoluteY = containerOffset.value.y + nextY + layoutConfig.value.itemHeight / 2;

            // Update drag position in context (on JS thread)
            runOnJS(dragDropContext.updateDragPosition)(absoluteX, absoluteY);

            // Check drop zones and trigger haptic on entry (must run on JS thread)
            runOnJS(checkDropZonesAndHaptic)(absoluteX, absoluteY);
          }
        })
        .onFinalize(() => {
          if (
            layoutConfig.value.itemWidth <= 0 ||
            layoutConfig.value.itemHeight <= 0 ||
            !containerOffset.value.ready
          ) {
            return;
          }
          isPressing.value = false;

          // Check if we're dropping on a cross-container drop zone
          const hoveredZone = dragDropContext?.hoveredDropZoneId.value;
          if (enableCrossContainerDrag && hoveredZone && onCrossContainerDrop && dragType === 'workout') {
            // Cross-container drop - notify and reset to original position
            runOnJS(onCrossContainerDrop)(itemKey, hoveredZone);

            // Reset position to original slot (don't reorder)
            const originalSlot = startIndex.value;
            const originalPosition = getPositionForIndex(originalSlot, layoutConfig.value);
            translateX.value = withSpring(originalPosition.x, SPRING_CONFIG);
            translateY.value = withSpring(originalPosition.y, SPRING_CONFIG);

            // Reset positions map to original order
            positions.value = { ...positions.value, [itemKey]: startIndex.value };
            currentIndex.value = startIndex.value;
            originIndex.value = startIndex.value;
          } else {
            // Normal reorder within container
            const finalIndex = currentIndex.value;
            originIndex.value = finalIndex;
            const destination = getPositionForIndex(finalIndex, layoutConfig.value);
            translateX.value = withSpring(destination.x, SPRING_CONFIG);
            translateY.value = withSpring(destination.y, SPRING_CONFIG);
            runOnJS(onDrop)(itemKey, startIndex.value, finalIndex);
          }

          activeKey.value = null;
          runOnJS(setIsActiveRender)(false);

          // Clean up drag context state
          if (enableCrossContainerDrag && dragDropContext) {
            runOnJS(dragDropContext.endDrag)();
            lastHoveredDropZoneRef.current = null;
          }
        }),
    [
      activeKey,
      containerOffset,
      dataLength,
      itemKey,
      layoutConfig,
      onDrop,
      positions,
      setIsActiveRender,
      triggerHaptic,
      triggerDropZoneHaptic,
      translateX,
      translateY,
      startX,
      startY,
      itemWidth,
      enableCrossContainerDrag,
      dragType,
      dragDropContext,
      onCrossContainerDrop,
      remeasureContainer,
    ]
  );

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        {renderItem(item, index, isActiveRender)}
      </Animated.View>
    </GestureDetector>
  );
}

export function DraggableGrid<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  numColumns,
  itemHeight,
  gap = 12,
  enableCrossContainerDrag = false,
  dragType,
  onCrossContainerDrop,
}: DraggableGridProps<T>) {
  // Get drag-drop context (optional, for cross-container drag)
  const dragDropContext = useContext(DragDropContext);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerRef = useRef<View>(null);
  const containerOffset = useSharedValue<ContainerOffset>({ x: 0, y: 0, ready: false });
  const positions = useSharedValue<PositionMap>({});
  const layoutConfig = useSharedValue<LayoutConfig>({
    itemWidth: 0,
    itemHeight,
    gap,
    numColumns,
  });
  const dataLength = useSharedValue(data.length);
  const activeKey = useSharedValue<string | null>(null);
  const dataMapRef = useRef<Map<string, T>>(new Map());

  const itemWidth = useMemo(() => {
    if (!containerWidth) return 0;
    const columns = Math.max(1, numColumns);
    return (containerWidth - gap * (columns - 1)) / columns;
  }, [containerWidth, gap, numColumns]);

  const rows = Math.max(1, Math.ceil(data.length / numColumns));
  const containerHeight = rows * (itemHeight + gap) - gap;

  const handleReorder = useCallback(
    (_itemKey: string, _from: number, _to: number) => {
      const posMap = positions.value;
      const orderedKeys = Object.entries(posMap).sort((a, b) => a[1] - b[1]);
      const rebuilt = orderedKeys
        .map(([key]) => dataMapRef.current.get(key))
        .filter((item): item is T => !!item);

      // Only commit if we can rebuild a complete ordering from positions
      if (rebuilt.length === data.length) {
        onReorder(rebuilt);
      }
    },
    [data.length, onReorder, positions]
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      setContainerWidth(width);
      // Measure absolute position for alignment
      requestAnimationFrame(() => {
        containerRef.current?.measure((x, y, _w, _h, pageX, pageY) => {
          containerOffset.value = { x: pageX, y: pageY, ready: true };
        });
      });
    },
    [containerOffset]
  );

  // Re-measure container offset (called on drag start to account for scroll changes)
  const remeasureContainer = useCallback(() => {
    containerRef.current?.measure((x, y, _w, _h, pageX, pageY) => {
      containerOffset.value = { x: pageX, y: pageY, ready: true };
    });
  }, [containerOffset]);

  useEffect(() => {
    positions.value = data.reduce<PositionMap>((acc, item, idx) => {
      acc[keyExtractor(item, idx)] = idx;
      return acc;
    }, {} as PositionMap);
    dataLength.value = data.length;
    dataMapRef.current = new Map(
      data.map((item, idx) => [keyExtractor(item, idx), item])
    );
  }, [data, dataLength, keyExtractor, positions]);

  useEffect(() => {
    layoutConfig.value = {
      itemWidth: itemWidth || 0,
      itemHeight,
      gap,
      numColumns,
    };
  }, [gap, itemHeight, itemWidth, layoutConfig, numColumns]);

  return (
    <View
      ref={containerRef}
      onLayout={handleLayout}
      style={[styles.container, { height: Math.max(containerHeight, itemHeight) }]}
    >
      {itemWidth > 0 &&
        data.map((item, idx) => {
          const itemKey = keyExtractor(item, idx);
          return (
            <DraggableItem
              key={itemKey}
              item={item}
              index={idx}
              itemKey={itemKey}
              positions={positions}
              layoutConfig={layoutConfig}
              activeKey={activeKey}
              dataLength={dataLength}
              renderItem={renderItem}
              onDrop={handleReorder}
              containerOffset={containerOffset}
              itemWidth={itemWidth}
              itemHeight={itemHeight}
              enableCrossContainerDrag={enableCrossContainerDrag}
              dragType={dragType}
              dragDropContext={dragDropContext}
              onCrossContainerDrop={onCrossContainerDrop}
              remeasureContainer={remeasureContainer}
            />
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'visible',
  },
});
