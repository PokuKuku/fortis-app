/**
 * StainlessSteelPattern.tsx
 *
 * A reusable background component that creates a dark stainless steel aesthetic
 * with diagonal slash pattern, horizontal grain texture, and vignette effects.
 *
 * Used across all screens for visual consistency.
 */
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  Pattern,
  Line,
  Rect,
  RadialGradient,
  Stop,
  G,
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export function StainlessSteelPattern() {

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Base - Off-Black */}
      <LinearGradient
        colors={['#0a0a0a', '#0a0a0a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Brushed Metal Texture Base - Vertical lines (opacity 20%) */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: 0.2,
        }}
        pointerEvents="none"
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
          <G>
            {Array.from({ length: Math.ceil(height / 2) }).map((_, i) => (
              <Line
                key={`v-${i}`}
                x1={0}
                y1={i * 2}
                x2={width}
                y2={i * 2}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
              />
            ))}
          </G>
        </Svg>
      </View>

      {/* Brushed Metal Texture - Horizontal gradient streaks (opacity 10%) */}
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
              id="horizontalStreak"
              x="0"
              y="0"
              width="100"
              height="1"
              patternUnits="userSpaceOnUse"
            >
              <Rect x="0" y="0" width="2" height="1" fill="rgba(255,255,255,0.05)" />
              <Rect x="2" y="0" width="2" height="1" fill="transparent" />
            </Pattern>
          </Defs>
          <Rect width={width} height={height} fill="url(#horizontalStreak)" />
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
            id="slashPattern"
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
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <Line
              x1="15"
              y1="15"
              x2="21"
              y2="21"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </Pattern>

          <RadialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <Stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
          </RadialGradient>
        </Defs>

        <Rect width="100%" height="100%" fill="url(#slashPattern)" />
      </Svg>

      {/* Subtle vignette effects */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.1)']}
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
        <Rect width={width} height={height} fill="url(#vignette)" />
      </Svg>
    </View>
  );
}
