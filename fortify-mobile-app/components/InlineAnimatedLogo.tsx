/**
 * InlineAnimatedLogo.tsx
 *
 * An inline-friendly version of the animated FORTIFY wordmark, sized to match
 * surrounding text (e.g., onboarding greeting).
 */
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/src/contexts/ThemeContext';

const AnimatedSvgLinearGradient = Animated.createAnimatedComponent(SvgLinearGradient);

interface InlineAnimatedLogoProps {
  fontSize?: number;
  animate?: boolean;
  introDurationMs?: number;
  shineDurationMs?: number;
}

const LOGO_TEXT = 'FORTIFY';

export function InlineAnimatedLogo({
  fontSize = 28,
  animate = true,
  introDurationMs,
  shineDurationMs,
}: InlineAnimatedLogoProps) {
  const { colors } = useTheme();
  const resolvedFontSize = Math.round(fontSize);
  const introDuration = Math.max(0, introDurationMs ?? 500);
  const shineDuration = Math.max(0, shineDurationMs ?? 1400);
  const shineAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const gradientId = useRef(`inlineTextGradient-${Math.random().toString(36).slice(2, 9)}`).current;

  const config = useMemo(() => {
    const width = Math.round(resolvedFontSize * 5.3);
    const height = Math.round(resolvedFontSize * 1.55);
    const y = Math.round(resolvedFontSize * 1.22);
    const letterSpacing = 0.5;
    return { width, height, y, letterSpacing };
  }, [resolvedFontSize]);

  const letterOffsets = useMemo(() => {
    const totalSpacing = config.letterSpacing * (LOGO_TEXT.length - 1);
    return LOGO_TEXT.split('').map((_, index) => (index === 0 ? -totalSpacing / 2 : config.letterSpacing));
  }, [config.letterSpacing]);

  const shineX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.width, config.width],
  });

  useEffect(() => {
    if (!animate) {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      shineAnim.setValue(0);
      return;
    }

    fadeAnim.setValue(0);
    scaleAnim.setValue(0.98);
    shineAnim.setValue(0);

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

    return () => {
      shineLoop.stop();
    };
  }, [animate, fadeAnim, introDuration, scaleAnim, shineAnim, shineDuration, resolvedFontSize]);

  const gradientStops = animate
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
    <View style={{ width: config.width, height: config.height }}>
      <Animated.View style={{ opacity: animate ? fadeAnim : 1, transform: [{ scale: animate ? scaleAnim : 1 }] }}>
        <Svg height={config.height} width={config.width} viewBox={`0 0 ${config.width} ${config.height}`}>
          <Defs>
            {animate ? (
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
            fontSize={resolvedFontSize}
            fontWeight="900"
            dx={letterOffsets}
            x={config.width / 2}
            y={config.y}
            textAnchor="middle"
            fontFamily="BankGothicBT-Medium"
          >
            {LOGO_TEXT}
          </SvgText>
        </Svg>
      </Animated.View>
    </View>
  );
}
