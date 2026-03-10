/**
 * AnimatedLogo.tsx
 *
 * FORTIFY logo with animated metallic shine effect.
 * Uses SVG LinearGradient animation to create a continuous sweeping shine.
 */
import { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, ViewStyle, InteractionManager, useWindowDimensions } from 'react-native';
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
  introDurationMs?: number;
  shineDurationMs?: number;
  pulseWhileLoading?: boolean;
  pulseDurationMs?: number;
}

const LOGO_TEXT = 'FORTIFY';
const LETTER_SPACING_RATIO = 3 / 18;

export function AnimatedLogo({
  size = 'small',
  centered = false,
  animate = true,
  introDurationMs,
  shineDurationMs,
  pulseWhileLoading = false,
  pulseDurationMs,
}: AnimatedLogoProps) {
  const { colors } = useTheme();
  const { fontScale } = useWindowDimensions();
  const shouldAnimate = animate;
  const introDuration = Math.max(0, introDurationMs ?? 800);
  const shineDuration = Math.max(0, shineDurationMs ?? 3500);
  const pulseDuration = Math.max(400, pulseDurationMs ?? 1400);
  const shineAnim = useRef(new Animated.Value(0)).current;
  // Keep logo visible on first paint even if JS effects are delayed under load.
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseScaleAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacityAnim = useRef(new Animated.Value(1)).current;
  const [paintTick, setPaintTick] = useState(0);
  const gradientId = useRef(
    `textGradient-${size}-${Math.random().toString(36).slice(2, 9)}`
  ).current;

  // Size configurations
  const baseConfig = size === 'large'
    ? { width: 326, height: 60, fontSize: 42, y: 48 }
    : { width: 186, height: 32, fontSize: 20, y: 24 };
  const scaledConfig = {
    width: Math.round(baseConfig.width * fontScale),
    height: Math.round(baseConfig.height * fontScale),
    fontSize: Math.round(baseConfig.fontSize * fontScale),
    y: Math.round(baseConfig.y * fontScale),
  };
  const letterSpacing = Math.round(scaledConfig.fontSize * LETTER_SPACING_RATIO * 10) / 10;
  const config = { ...scaledConfig, letterSpacing };
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
      pulseScaleAnim.setValue(1);
      pulseOpacityAnim.setValue(1);
      return;
    }

    fadeAnim.setValue(1);
    scaleAnim.setValue(0.95);
    shineAnim.setValue(0);
    pulseScaleAnim.setValue(1);
    pulseOpacityAnim.setValue(1);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: introDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: introDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const shineLoop = Animated.loop(
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: shineDuration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    shineLoop.start();

    let pulseLoop: Animated.CompositeAnimation | null = null;
    if (pulseWhileLoading) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScaleAnim, {
              toValue: 1.02,
              duration: pulseDuration / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacityAnim, {
              toValue: 0.84,
              duration: pulseDuration / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseScaleAnim, {
              toValue: 1,
              duration: pulseDuration / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacityAnim, {
              toValue: 1,
              duration: pulseDuration / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.start();
    }

    return () => {
      shineLoop.stop();
      pulseLoop?.stop();
    };
  }, [
    fadeAnim,
    introDuration,
    pulseDuration,
    pulseOpacityAnim,
    pulseScaleAnim,
    pulseWhileLoading,
    scaleAnim,
    shineAnim,
    shineDuration,
    shouldAnimate,
  ]);

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }
    let isActive = true;
    const task = InteractionManager.runAfterInteractions(() => {
      if (!isActive) return;
      setPaintTick((current) => current + 1);
    });

    return () => {
      isActive = false;
      task.cancel();
    };
  }, [shouldAnimate]);

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
        <Animated.View
          style={{
            opacity: shouldAnimate && pulseWhileLoading ? pulseOpacityAnim : 1,
            transform: [{ scale: shouldAnimate && pulseWhileLoading ? pulseScaleAnim : 1 }],
          }}
        >
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
              key={`logo-text-${paintTick}`}
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
      </Animated.View>
    </View>
  );
}
