/**
 * AnimatedLogo.tsx
 *
 * FORTIS logo with animated metallic shine effect.
 * Uses SVG LinearGradient animation to create a continuous sweeping shine.
 */
import { useEffect, useRef } from 'react';
import { View, Animated, Easing, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '@/src/contexts/ThemeContext';

const AnimatedSvgLinearGradient = Animated.createAnimatedComponent(SvgLinearGradient);

interface AnimatedLogoProps {
  size?: 'small' | 'large';
  centered?: boolean;
}

export function AnimatedLogo({ size = 'small', centered = false }: AnimatedLogoProps) {
  const { colors } = useTheme();
  const shineAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const gradientId = useRef(
    `textGradient-${size}-${Math.random().toString(36).slice(2, 9)}`
  ).current;

  // Size configurations
  const config = size === 'large'
    ? { width: 280, height: 60, fontSize: 42, letterSpacing: 8, y: 48 }
    : { width: 160, height: 32, fontSize: 20, letterSpacing: 6, y: 24 };

  const shineX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.width, config.width],
  });

  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);
    shineAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const shineLoop = Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    shineLoop.start();

    return () => {
      shineLoop.stop();
    };
  }, [fadeAnim, scaleAnim, shineAnim]);

  const containerStyle: ViewStyle = centered
    ? { alignItems: 'center', justifyContent: 'center' }
    : { alignItems: 'flex-start', justifyContent: 'flex-start' };

  return (
    <View style={containerStyle}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <Svg height={config.height} width={config.width} viewBox={`0 0 ${config.width} ${config.height}`}>
          <Defs>
            <AnimatedSvgLinearGradient
              id={gradientId}
              x1={shineX}
              y1="0"
              x2={Animated.add(shineX, config.width)}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor={colors.accentLight} />
              <Stop offset="30%" stopColor={colors.accent} />
              <Stop offset="45%" stopColor={colors.accentLight} />
              <Stop offset="50%" stopColor="#ffffff" />
              <Stop offset="55%" stopColor={colors.accentLight} />
              <Stop offset="70%" stopColor={colors.accent} />
              <Stop offset="100%" stopColor={colors.accentLight} />
            </AnimatedSvgLinearGradient>
          </Defs>
          <SvgText
            fill={`url(#${gradientId})`}
            fontSize={config.fontSize}
            fontWeight="900"
            letterSpacing={config.letterSpacing}
            x={centered ? config.width / 2 : 0}
            y={config.y}
            textAnchor={centered ? 'middle' : 'start'}
            fontFamily="BankGothicBT-Medium"
          >
            FORTIS
          </SvgText>
        </Svg>
      </Animated.View>
    </View>
  );
}
