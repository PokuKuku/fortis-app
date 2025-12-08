import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export type DragOverlayContextValue = {
  showOverlay: (node: React.ReactNode, x: number, y: number, width: number, height: number) => void;
  updatePosition: (x: number, y: number) => void;
  hideOverlay: () => void;
};

const DragOverlayContext = createContext<DragOverlayContextValue | null>(null);

export function DragOverlayProvider({ children }: { children: React.ReactNode }) {
  const [node, setNode] = useState<React.ReactNode | null>(null);
  const position = useSharedValue({ x: 0, y: 0 });
  const size = useSharedValue({ width: 0, height: 0 });
  const visible = useSharedValue(0);

  const showOverlay = useCallback(
    (content: React.ReactNode, x: number, y: number, width: number, height: number) => {
      setNode(content);
      position.value = { x, y };
      size.value = { width, height };
      visible.value = 1;
    },
    [position, size, visible]
  );

  const updatePosition = useCallback(
    (x: number, y: number) => {
      position.value = { x, y };
    },
    [position]
  );

  const hideOverlay = useCallback(() => {
    visible.value = 0;
    setNode(null);
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: position.value.x },
      { translateY: position.value.y },
    ],
    width: size.value.width || undefined,
    height: size.value.height || undefined,
    opacity: visible.value,
  }));

  const value = useMemo(
    () => ({
      showOverlay,
      updatePosition,
      hideOverlay,
    }),
    [showOverlay, updatePosition, hideOverlay]
  );

  return (
    <DragOverlayContext.Provider value={value}>
      <View style={styles.container} pointerEvents="box-none">
        {children}
        {node ? (
          <Animated.View pointerEvents="none" style={[styles.overlay, animatedStyle]}>
            {node}
          </Animated.View>
        ) : null}
      </View>
    </DragOverlayContext.Provider>
  );
}

export function useDragOverlay() {
  const ctx = useContext(DragOverlayContext);
  if (!ctx) {
    throw new Error('useDragOverlay must be used within DragOverlayProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
});
