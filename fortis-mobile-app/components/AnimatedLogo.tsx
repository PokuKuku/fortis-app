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
  animate?: boolean;
}

const LOGO_TEXT = 'FORTIS';

export function AnimatedLogo({ size = 'small', centered = false, animate = true }: AnimatedLogoProps) {
  const { colors } = useTheme();
  const shouldAnimate = animate;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const gradientId = useRef(
    `textGradient-${size}-${Math.random().toString(36).slice(2, 9)}`
  ).current;

  // Size configurations
  const config = size === 'large'
    ? { width: 280, height: 60, fontSize: 42, letterSpacing: 6, y: 48 }
    : { width: 160, height: 32, fontSize: 20, letterSpacing: 6, y: 24 };
  const totalSpacing = config.letterSpacing * (LOGO_TEXT.length - 1);
  const letterOffsets = LOGO_TEXT.split('').map((_, index) => {
    if (index === 0) {
      return centered ? -totalSpacing / 2 : 0;
    }
    return config.letterSpacing;
  });

  const shineX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.width, config.width],
  });

  useEffect(() => {
    if (!shouldAnimate) {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      shineAnim.setValue(0);
      return;
    }

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
  }, [fadeAnim, scaleAnim, shineAnim, shouldAnimate]);

  const containerStyle: ViewStyle = centered
    ? { alignItems: 'center', justifyContent: 'center' }
    : { alignItems: 'flex-start', justifyContent: 'flex-start' };

  const gradientStops = shouldAnimate
    ? [
        { offset: '0%', color: colors.accentLight },
        { offset: '30%', color: colors.accent },
        { offset: '45%', color: colors.accentLight },
        { offset: '50%', color: '#ffffff' },
        { offset: '55%', color: colors.accentLight },
        { offset: '70%', color: colors.accent },
        { offset: '100%', color: colors.accentLight },
      ]
    : [
        { offset: '0%', color: colors.accentLight },
        { offset: '50%', color: colors.accent },
        { offset: '100%', color: colors.accentLight },
      ];

  return (
    <View style={containerStyle}>
      <Animated.View style={{ opacity: shouldAnimate ? fadeAnim : 1, transform: [{ scale: shouldAnimate ? scaleAnim : 1 }] }}>
        <Svg height={config.height} width={config.width} viewBox={`0 0 ${config.width} ${config.height}`}>
          <Defs>
            {shouldAnimate ? (
              <AnimatedSvgLinearGradient
                id={gradientId}
                x1={shineX}
                y1="0"
                x2={Animated.add(shineX, config.width)}
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                {gradientStops.map((stop) => (
                  <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
                ))}
              </AnimatedSvgLinearGradient>
            ) : (
              <SvgLinearGradient
                id={gradientId}
                x1="0"
                y1="0"
                x2={config.width}
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                {gradientStops.map((stop) => (
                  <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
                ))}
              </SvgLinearGradient>
            )}
          </Defs>
          <SvgText
            fill={`url(#${gradientId})`}
            fontSize={config.fontSize}
            fontWeight="900"
            dx={letterOffsets}
            x={centered ? config.width / 2 : 0}
            y={config.y}
            textAnchor={centered ? 'middle' : 'start'}
            fontFamily="BankGothicBT-Medium"
          >
            {LOGO_TEXT}
          </SvgText>
        </Svg>
      </Animated.View>
    </View>
  );
}
