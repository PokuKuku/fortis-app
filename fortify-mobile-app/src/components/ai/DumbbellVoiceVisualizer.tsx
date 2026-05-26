import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BorderRadius } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { RealtimeCoachPhase } from '@/src/types/realtimeCoach';

interface DumbbellVoiceVisualizerProps {
  phase: RealtimeCoachPhase;
  coachAudioLevel?: number;
  scale?: number;
}

const PLATE_WIDTHS = [24, 20, 18];
const PLATE_BASE_HEIGHTS = [132, 104, 78];
const PLATE_IDLE_OPACITY = [0.78, 0.62, 0.48];
const PLATE_ACTIVE_OPACITY = [1, 0.84, 0.7];

function withOpacity(color: string, opacity: number): string {
  if (!color.startsWith('#')) return color;

  const hex = color.replace('#', '');
  if (hex.length !== 6) return color;

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function VisualizerBar({
  index,
  activityLevel,
  scale,
}: {
  index: number;
  activityLevel: number;
  scale: number;
}) {
  const { colors } = useTheme();
  const progress = useSharedValue(0.2 + index * 0.07);
  const barOpacity = activityLevel > 0
    ? PLATE_ACTIVE_OPACITY[index]
    : PLATE_IDLE_OPACITY[index];

  useEffect(() => {
    const target = activityLevel > 0
      ? 0.92 - index * 0.07
      : 0.2 + index * 0.04;

    progress.value = withRepeat(
      withTiming(target, {
        duration: activityLevel > 0 ? 380 + index * 72 : 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [activityLevel, index, progress]);

  const style = useAnimatedStyle(() => ({
    height: (PLATE_BASE_HEIGHTS[index] + progress.value * 24 * activityLevel) * scale,
  }), [activityLevel, index, scale]);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          width: PLATE_WIDTHS[index] * scale,
          backgroundColor: withOpacity(colors.accent, barOpacity),
        },
        style,
      ]}
    />
  );
}

export function DumbbellVoiceVisualizer({ phase, coachAudioLevel = 0, scale = 1 }: DumbbellVoiceVisualizerProps) {
  const { colors, isDark } = useTheme();
  const visualizerScale = Math.max(0.74, Math.min(1, scale));
  const normalizedCoachLevel = Math.max(0, Math.min(1, coachAudioLevel));
  const activityLevel = phase === 'coach_speaking'
    ? Math.max(0.28, normalizedCoachLevel)
    : phase === 'connecting'
      ? 0.68
      : 0;
  const handleBackground = isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.44)';

  return (
    <View
      style={[styles.container, {
        width: 276 * visualizerScale,
        height: 156 * visualizerScale,
      }]}
      accessibilityLabel="Voice Coach audio visualizer"
    >
      <View style={[styles.plates, {
        width: 82 * visualizerScale,
        height: 148 * visualizerScale,
        gap: 6 * visualizerScale,
      }]}>
        {PLATE_WIDTHS.map((_, index) => {
          const mirroredIndex = PLATE_WIDTHS.length - index - 1;
          return (
            <VisualizerBar
              key={`left-${index}`}
              index={mirroredIndex}
              activityLevel={activityLevel}
              scale={visualizerScale}
            />
          );
        })}
      </View>
      <View style={[styles.handle, {
        width: 92 * visualizerScale,
        height: 26 * visualizerScale,
        backgroundColor: handleBackground,
        borderColor: colors.border,
      }]} />
      <View style={[styles.plates, {
        width: 82 * visualizerScale,
        height: 148 * visualizerScale,
        gap: 6 * visualizerScale,
      }]}>
        {PLATE_WIDTHS.map((_, index) => (
          <VisualizerBar
            key={`right-${index}`}
            index={index}
            activityLevel={activityLevel}
            scale={visualizerScale}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plates: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    borderRadius: BorderRadius.full,
  },
  handle: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});
