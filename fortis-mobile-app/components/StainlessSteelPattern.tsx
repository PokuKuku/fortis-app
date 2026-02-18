/**
 * StainlessSteelPattern.tsx
 *
 * A reusable background component that creates a stainless steel aesthetic
 * with diagonal slash pattern, horizontal grain texture, and vignette effects.
 *
 * Supports both dark mode (forge black) and light mode (titanium).
 * Used across all screens for visual consistency.
 */
import { memo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  Pattern,
  Line,
  Rect,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { useTheme } from '@/src/contexts/ThemeContext';

function StainlessSteelPatternComponent() {
  const { colors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  // Theme-specific colors
  const baseColor = colors.patternBase;
  const strokeColor = colors.patternStroke;

  // Vignette color (dark edges on both themes, just different opacity)
  const vignetteColor = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)';
  const vignetteGradientEnd = isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)';
  const grainColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const streakColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const horizontalGrainId = isDark ? 'horizontalGrainDark' : 'horizontalGrainLight';
  const horizontalStreakId = isDark ? 'horizontalStreakDark' : 'horizontalStreakLight';
  const slashPatternId = isDark ? 'slashPatternDark' : 'slashPatternLight';
  const vignetteId = isDark ? 'vignetteDark' : 'vignetteLight';

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Base - Theme-aware background */}
      <LinearGradient
        colors={[baseColor, baseColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Brushed Metal Texture Base - Horizontal lines */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: 0.2,
        }}
        pointerEvents="none"
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
          <Defs>
            <Pattern
              id={horizontalGrainId}
              x="0"
              y="0"
              width="2"
              height="2"
              patternUnits="userSpaceOnUse"
            >
              <Line x1="0" y1="0" x2="2" y2="0" stroke={grainColor} strokeWidth="1" />
            </Pattern>
          </Defs>
          <Rect width={width} height={height} fill={`url(#${horizontalGrainId})`} />
        </Svg>
      </View>

      {/* Brushed Metal Texture - Horizontal gradient streaks */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: 0.1,
        }}
        pointerEvents="none"
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
          <Defs>
            <Pattern
              id={horizontalStreakId}
              x="0"
              y="0"
              width="100"
              height="1"
              patternUnits="userSpaceOnUse"
            >
              <Rect
                x="0"
                y="0"
                width="2"
                height="1"
                fill={streakColor}
              />
              <Rect x="2" y="0" width="2" height="1" fill="transparent" />
            </Pattern>
          </Defs>
          <Rect width={width} height={height} fill={`url(#${horizontalStreakId})`} />
        </Svg>
      </View>

      {/* Stainless steel diagonal slash pattern */}
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <Pattern
            id={slashPatternId}
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <Line
              x1="3"
              y1="9"
              x2="9"
              y2="3"
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <Line
              x1="15"
              y1="15"
              x2="21"
              y2="21"
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </Pattern>

          <RadialGradient id={vignetteId} cx="50%" cy="50%" r="70%">
            <Stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <Stop offset="100%" stopColor={vignetteColor} />
          </RadialGradient>
        </Defs>

        <Rect width="100%" height="100%" fill={`url(#${slashPatternId})`} />
      </Svg>

      {/* Subtle vignette effects */}
      <LinearGradient
        colors={['transparent', vignetteGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Rect width={width} height={height} fill={`url(#${vignetteId})`} />
      </Svg>
    </View>
  );
}

export const StainlessSteelPattern = memo(StainlessSteelPatternComponent);
