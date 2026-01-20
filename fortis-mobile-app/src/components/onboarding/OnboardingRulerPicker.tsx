import { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, NativeScrollEvent, NativeSyntheticEvent, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Spacing } from '@/constants/Sizes';
import { scale } from '@/src/utils/responsive';

type TickLevel = 'minor' | 'mid' | 'major' | 'label';

interface OnboardingRulerPickerProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange?: (nextValue: number) => void;
  onValueCommit?: (nextValue: number) => void;
  unitLabel: string;
  showLabels?: boolean;
  enableHaptics?: boolean;
}

const TICK_SPACING = scale(12);
const TICK_WIDTH = scale(2);
const CONTAINER_HEIGHT = scale(96);
const CENTER_LINE_HEIGHT = scale(56);

const roundTo = (value: number, decimals: number) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function OnboardingRulerPicker({
  min,
  max,
  step,
  value,
  onValueChange,
  onValueCommit,
  unitLabel,
  showLabels = false,
  enableHaptics = true,
}: OnboardingRulerPickerProps) {
  const { colors, isDark } = useTheme();
  const listRef = useRef<FlatList<number>>(null);
  const lastEmittedIndex = useRef<number | null>(null);
  const lastHapticAt = useRef<number>(0);
  const lastProgrammaticIndex = useRef<number | null>(null);
  const isInteracting = useRef(false);
  const hasMounted = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const count = Math.floor((max - min) / step) + 1;
  const data = useMemo(() => Array.from({ length: count }, (_, index) => index), [count]);

  const decimals = useMemo(() => {
    const stepString = String(step);
    const dotIndex = stepString.indexOf('.');
    return dotIndex >= 0 ? stepString.length - dotIndex - 1 : 0;
  }, [step]);

  const getIndexForValue = (nextValue: number) => {
    const rawIndex = Math.round((nextValue - min) / step);
    return clamp(rawIndex, 0, count - 1);
  };

  const getValueForIndex = (index: number) => roundTo(min + index * step, decimals);

  const currentIndex = getIndexForValue(value);

  useEffect(() => {
    if (!listRef.current || containerWidth === 0) return;
    if (isInteracting.current) return;
    if (lastProgrammaticIndex.current === currentIndex) return;

    listRef.current.scrollToOffset({
      offset: currentIndex * TICK_SPACING,
      animated: hasMounted.current,
    });
    lastProgrammaticIndex.current = currentIndex;
    lastEmittedIndex.current = currentIndex;
    hasMounted.current = true;
  }, [containerWidth, currentIndex]);

  const getTickLevel = (tickValue: number): TickLevel => {
    const scaled = Math.round(tickValue / step);

    if (showLabels && scaled % Math.round(10 / step) === 0) return 'label';
    if (scaled % Math.round(5 / step) === 0) return 'major';
    if (scaled % Math.round(1 / step) === 0) return 'mid';
    return 'minor';
  };

  const maybeHaptic = () => {
    if (!enableHaptics) return;
    const now = Date.now();
    if (now - lastHapticAt.current < 30) return;
    lastHapticAt.current = now;
    Haptics.selectionAsync();
  };

  const handlePreviewIndex = (nextIndex: number) => {
    const clampedIndex = clamp(nextIndex, 0, count - 1);
    if (lastEmittedIndex.current === clampedIndex) return;
    lastEmittedIndex.current = clampedIndex;
    maybeHaptic();
    onValueChange?.(getValueForIndex(clampedIndex));
  };

  const handleCommitIndex = (nextIndex: number) => {
    const clampedIndex = clamp(nextIndex, 0, count - 1);
    onValueCommit?.(getValueForIndex(clampedIndex));
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / TICK_SPACING);
    handlePreviewIndex(nextIndex);
    handleCommitIndex(nextIndex);
    isInteracting.current = false;
    lastProgrammaticIndex.current = clamp(nextIndex, 0, count - 1);
  };

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / TICK_SPACING);
    handlePreviewIndex(nextIndex);
    handleCommitIndex(nextIndex);
  };

  const themedStyles = {
    centerWindow: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    },
    centerLine: {
      backgroundColor: colors.textPrimary,
    },
  };

  const sidePadding = Math.max(containerWidth / 2 - TICK_SPACING / 2, 0);

  const renderItem = ({ item: index }: { item: number }) => {
    const tickValue = getValueForIndex(index);
    const level = getTickLevel(tickValue);

    const height = level === 'label'
      ? scale(44)
      : level === 'major'
        ? scale(36)
        : level === 'mid'
          ? scale(24)
          : scale(16);

    const color = level === 'minor' ? colors.textTertiary : colors.textSecondary;

    return (
      <View style={styles.tickCell}>
        <View style={[styles.tick, { height, width: TICK_WIDTH, backgroundColor: color }]} />
        {showLabels && level === 'label' ? (
          <Text style={[styles.tickLabel, { color: colors.textSecondary }]}>
            {tickValue}{unitLabel}
          </Text>
        ) : null}
      </View>
    );
  };

  const getItemLayout = (_: ArrayLike<number> | null | undefined, index: number) => ({
    length: TICK_SPACING,
    offset: TICK_SPACING * index,
    index,
  });

  return (
    <View
      style={styles.container}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <View style={[styles.centerWindow, themedStyles.centerWindow]} pointerEvents="none" />
      <View style={[styles.centerLine, themedStyles.centerLine]} pointerEvents="none" />

      <FlatList
        ref={listRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => String(item)}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        snapToInterval={TICK_SPACING}
        snapToAlignment="center"
        decelerationRate="fast"
        onScrollBeginDrag={() => {
          isInteracting.current = true;
        }}
        onMomentumScrollBegin={() => {
          isInteracting.current = true;
        }}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={(event) => {
          handleScrollEndDrag(event);
          isInteracting.current = false;
        }}
        onScroll={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / TICK_SPACING);
          handlePreviewIndex(nextIndex);
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CONTAINER_HEIGHT,
    justifyContent: 'center',
  },
  centerWindow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: CENTER_LINE_HEIGHT,
    borderRadius: 16,
    borderWidth: 1,
  },
  centerLine: {
    position: 'absolute',
    width: scale(3),
    height: CENTER_LINE_HEIGHT,
    borderRadius: 2,
    left: '50%',
    marginLeft: -scale(1.5),
  },
  tickCell: {
    width: TICK_SPACING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    borderRadius: 2,
  },
  tickLabel: {
    marginTop: Spacing.xs,
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
