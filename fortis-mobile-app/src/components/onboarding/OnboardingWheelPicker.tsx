import React, { useEffect, useRef } from 'react';
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
  const containerHeight = height ?? ITEM_HEIGHT * VISIBLE_ITEMS;
  const paddingVertical = (containerHeight - ITEM_HEIGHT) / 2;

  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
    scrollY.setValue(selectedIndex * ITEM_HEIGHT);
  }, [selectedIndex, scrollY]);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (nextIndex !== selectedIndex) {
      Haptics.selectionAsync();
      onChange(nextIndex);
    }
  };

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
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
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
