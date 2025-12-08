import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useDragOverlay } from './DragOverlay';

type LayoutConfig = {
  itemWidth: number;
  itemHeight: number;
  gap: number;
  numColumns: number;
};

type PositionMap = Record<string, number>;

type DraggableGridProps<T> = {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  onReorder: (items: T[]) => void;
  numColumns: number;
  itemHeight: number;
  gap?: number;
};

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 220,
};

const clamp = (value: number, lower: number, upper: number) => {
  'worklet';
  return Math.max(lower, Math.min(value, upper));
};

const objectMove = (positions: PositionMap, from: number, to: number) => {
  'worklet';
  if (from === to) return positions;

  const next: PositionMap = { ...positions };
  for (const key in positions) {
    if (!Object.prototype.hasOwnProperty.call(positions, key)) continue;
    const pos = positions[key];
    if (pos === from) {
      next[key] = to;
    } else if (from < to && pos > from && pos <= to) {
      next[key] = pos - 1;
    } else if (from > to && pos < from && pos >= to) {
      next[key] = pos + 1;
    }
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
  positions: Animated.SharedValue<PositionMap>;
  layoutConfig: Animated.SharedValue<LayoutConfig>;
  activeKey: Animated.SharedValue<string | null>;
  dataLength: Animated.SharedValue<number>;
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  onDrop: (positions: PositionMap) => void;
  overlay?: ReturnType<typeof useDragOverlay>;
  containerOffset: Animated.SharedValue<{ x: number; y: number }>;
  itemWidth: number;
  itemHeight: number;
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
  overlay,
  containerOffset,
  itemWidth,
  itemHeight,
}: DraggableItemProps<T>) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const localOpacity = useSharedValue(1);
  const [isActiveRender, setIsActiveRender] = useState(false);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  }, []);

  const renderOverlay = useCallback(
    (currentIndex: number, screenX: number, screenY: number) => {
      if (!overlay) return;
      overlay.showOverlay(
        <View style={{ width: itemWidth, height: itemHeight }}>
          {renderItem(item, currentIndex, true)}
        </View>,
        screenX,
        screenY,
        itemWidth,
        itemHeight
      );
    },
    [overlay, renderItem, item, itemWidth, itemHeight]
  );

  const updateOverlayPosition = useCallback(
    (screenX: number, screenY: number) => overlay?.updatePosition(screenX, screenY),
    [overlay]
  );

  const hideOverlay = useCallback(() => overlay?.hideOverlay(), [overlay]);

  const animatedStyle = useAnimatedStyle(() => {
    const currentIndex = positions.value[itemKey] ?? index;
    const dragging = activeKey.value === itemKey;
    const target = getPositionForIndex(currentIndex, layoutConfig.value);

    const translateXValue = dragging
      ? translateX.value
      : withSpring(target.x, SPRING_CONFIG);
    const translateYValue = dragging
      ? translateY.value
      : withSpring(target.y, SPRING_CONFIG);

    return {
      position: 'absolute',
      width: layoutConfig.value.itemWidth,
      height: layoutConfig.value.itemHeight,
      transform: [
        { translateX: translateXValue },
        { translateY: translateYValue },
        { scale: withSpring(dragging ? 1.05 : 1, SPRING_CONFIG) },
      ],
      zIndex: dragging ? 10 : 1,
      opacity: dragging ? localOpacity.value : 1,
    };
  }, [activeKey, index, itemKey, layoutConfig, localOpacity, positions, translateX, translateY]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(layoutConfig.value.itemWidth > 0)
        .onStart(() => {
          const currentIndex = positions.value[itemKey] ?? 0;
          const startPosition = getPositionForIndex(currentIndex, layoutConfig.value);
          translateX.value = startPosition.x;
          translateY.value = startPosition.y;
          startX.value = startPosition.x;
          startY.value = startPosition.y;
          activeKey.value = itemKey;
          localOpacity.value = 0;
          runOnJS(setIsActiveRender)(true);
          runOnJS(triggerHaptic)();
          runOnJS(renderOverlay)(
            currentIndex,
            containerOffset.value.x + startPosition.x,
            containerOffset.value.y + startPosition.y
          );
        })
        .onChange((event) => {
          translateX.value = startX.value + event.translationX;
          translateY.value = startY.value + event.translationY;

          const currentIndex = positions.value[itemKey] ?? 0;
          const newIndex = getIndexForPosition(
            translateX.value,
            translateY.value,
            layoutConfig.value,
            dataLength.value
          );

          if (newIndex !== currentIndex) {
            positions.value = objectMove(positions.value, currentIndex, newIndex);
          }

          runOnJS(updateOverlayPosition)(
            containerOffset.value.x + translateX.value,
            containerOffset.value.y + translateY.value
          );
        })
        .onFinalize(() => {
          const finalIndex = positions.value[itemKey] ?? 0;
          const destination = getPositionForIndex(finalIndex, layoutConfig.value);
          activeKey.value = null;
          runOnJS(setIsActiveRender)(false);
          translateX.value = withSpring(destination.x, SPRING_CONFIG);
          translateY.value = withSpring(destination.y, SPRING_CONFIG, () => {
            localOpacity.value = withTiming(1, { duration: 120 });
          });
          runOnJS(hideOverlay)();
          runOnJS(onDrop)(positions.value);
        }),
    [
      activeKey,
      containerOffset,
      dataLength,
      hideOverlay,
      itemKey,
      layoutConfig,
      localOpacity,
      onDrop,
      positions,
      renderOverlay,
      setIsActiveRender,
      triggerHaptic,
      translateX,
      translateY,
      updateOverlayPosition,
      startX,
      startY,
      itemWidth,
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
}: DraggableGridProps<T>) {
  const overlay = useDragOverlay();
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerRef = useRef<View>(null);
  const containerOffset = useSharedValue({ x: 0, y: 0 });
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

  const handleDrop = useCallback(
    (positionsMap: PositionMap) => {
      const orderedKeys = Object.entries(positionsMap)
        .sort((a, b) => a[1] - b[1])
        .map(([key]) => key);

      const orderedItems = orderedKeys
        .map((key) => dataMapRef.current.get(key))
        .filter((value): value is T => Boolean(value));

      onReorder(orderedItems);
    },
    [onReorder]
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      setContainerWidth(width);
      // Measure absolute position for overlay alignment
      requestAnimationFrame(() => {
        containerRef.current?.measure((x, y, _w, _h, pageX, pageY) => {
          containerOffset.value = { x: pageX, y: pageY };
        });
      });
    },
    [containerOffset]
  );

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
              onDrop={handleDrop}
              overlay={overlay}
              containerOffset={containerOffset}
              itemWidth={itemWidth}
              itemHeight={itemHeight}
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
  },
});
