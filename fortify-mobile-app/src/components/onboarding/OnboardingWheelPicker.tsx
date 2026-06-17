import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { scale } from '@/src/utils/responsive';

interface OnboardingWheelPickerProps {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  height?: number;
}

const ITEM_HEIGHT = scale(40);
const VISIBLE_ITEMS = 5;

export function OnboardingWheelPicker({
  items,
  selectedIndex,
  onChange,
  height,
}: OnboardingWheelPickerProps) {
  const { colors } = useTheme();
  const listRef = useRef<FlatList<string>>(null);
  const scrollY = useRef(new Animated.Value(selectedIndex * ITEM_HEIGHT)).current;
  const lastHapticIndex = useRef<number | null>(selectedIndex);
  const lastHapticAt = useRef(0);
  const isInteracting = useRef(false);
  const selectedIndexRef = useRef(selectedIndex);
  const suppressNextSyncRef = useRef(false);
  const didMountRef = useRef(false);
  const isMomentumScrollingRef = useRef(false);
  const settleDragTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerHeight = height ?? ITEM_HEIGHT * VISIBLE_ITEMS;
  const paddingVertical = (containerHeight - ITEM_HEIGHT) / 2;

  const clampIndex = useCallback((index: number) => (
    Math.min(Math.max(index, 0), Math.max(0, items.length - 1))
  ), [items.length]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  const clearPendingSettle = useCallback(() => {
    if (!settleDragTimerRef.current) return;
    clearTimeout(settleDragTimerRef.current);
    settleDragTimerRef.current = null;
  }, []);

  useEffect(() => () => {
    clearPendingSettle();
  }, [clearPendingSettle]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      scrollY.setValue(clampIndex(selectedIndex) * ITEM_HEIGHT);
      lastHapticIndex.current = clampIndex(selectedIndex);
      return;
    }

    if (suppressNextSyncRef.current) {
      suppressNextSyncRef.current = false;
      return;
    }

    listRef.current?.scrollToOffset({
      offset: clampIndex(selectedIndex) * ITEM_HEIGHT,
      animated: true,
    });
    scrollY.setValue(clampIndex(selectedIndex) * ITEM_HEIGHT);
    lastHapticIndex.current = clampIndex(selectedIndex);
  }, [clampIndex, selectedIndex, scrollY]);

  const finalizeOffset = useCallback((offsetY: number) => {
    clearPendingSettle();
    const nextIndex = clampIndex(Math.round(offsetY / ITEM_HEIGHT));
    const nextOffset = nextIndex * ITEM_HEIGHT;

    listRef.current?.scrollToOffset({
      offset: nextOffset,
      animated: true,
    });

    if (nextIndex !== selectedIndexRef.current) {
      suppressNextSyncRef.current = true;
      onChange(nextIndex);
    }
    isInteracting.current = false;
  }, [clampIndex, clearPendingSettle, onChange]);

  const maybeHaptic = (nextIndex: number) => {
    if (lastHapticIndex.current === nextIndex) return;
    const now = Date.now();
    if (now - lastHapticAt.current < 70) return;
    lastHapticAt.current = now;
    lastHapticIndex.current = nextIndex;
    void Haptics.selectionAsync();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isInteracting.current) return;
    const rawIndex = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clampedIndex = Math.min(Math.max(rawIndex, 0), items.length - 1);
    maybeHaptic(clampedIndex);
  };

  const handleScrollEndDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    clearPendingSettle();

    settleDragTimerRef.current = setTimeout(() => {
      settleDragTimerRef.current = null;
      if (isMomentumScrollingRef.current) return;
      finalizeOffset(offsetY);
    }, 120);
  }, [clearPendingSettle, finalizeOffset]);

  const handleMomentumScrollBegin = useCallback(() => {
    clearPendingSettle();
    isMomentumScrollingRef.current = true;
    isInteracting.current = true;
  }, [clearPendingSettle]);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isMomentumScrollingRef.current = false;
    finalizeOffset(event.nativeEvent.contentOffset.y);
  }, [finalizeOffset]);

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const inputRange = [
      (index - 2) * ITEM_HEIGHT,
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
      (index + 2) * ITEM_HEIGHT,
    ];

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.25, 0.5, 1, 0.5, 0.25],
      extrapolate: 'clamp',
    });

    const scaleValue = scrollY.interpolate({
      inputRange,
      outputRange: [0.9, 0.95, 1, 0.95, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.item, { opacity, transform: [{ scale: scaleValue }] }]}
      >
        <Text style={[styles.itemText, { color: colors.textPrimary }]}>{item}</Text>
      </Animated.View>
    );
  };

  const getItemLayout = (_: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  return (
    <View style={[styles.container, { height: containerHeight }]}> 
      <Animated.FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={renderItem}
        initialScrollIndex={clampIndex(selectedIndex)}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="normal"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onScrollBeginDrag={() => {
          clearPendingSettle();
          isMomentumScrollingRef.current = false;
          isInteracting.current = true;
        }}
        onScrollEndDrag={handleScrollEndDrag}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical }}
      />
      <View style={[styles.centerHighlight, { borderColor: colors.glassBorder }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  centerHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
});
