/**
 * ChatHeaderLogo Component
 *
 * Sparkles icon + FORTIS animated logo for chat header.
 * Logo shines with animated gradient when AI is loading.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
  G,
} from 'react-native-svg';
import { SparklesIcon as SparklesOutline } from 'react-native-heroicons/outline';
import { SparklesIcon as SparklesSolid } from 'react-native-heroicons/solid';
import { Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';

const AnimatedSvgLinearGradient = Animated.createAnimatedComponent(SvgLinearGradient);

interface ChatHeaderLogoProps {
  isLoading?: boolean;
}

export function ChatHeaderLogo({ isLoading = false }: ChatHeaderLogoProps) {
  const { colors } = useTheme();
  const shineAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(1)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const sparkleLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const logoWidth = 90;
  const logoHeight = 24;
  const iconSize = 22;

  const shineX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-logoWidth, logoWidth * 2],
  });

  useEffect(() => {
    if (isLoading) {
      // Start shine animation on logo
      shineAnim.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        })
      );
      loopRef.current.start();

      // Start sparkle icon fade animation
      sparkleLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      sparkleLoopRef.current.start();
    } else {
      // Stop animations
      loopRef.current?.stop();
      sparkleLoopRef.current?.stop();
      shineAnim.setValue(0);
      sparkleAnim.setValue(1);
    }

    return () => {
      loopRef.current?.stop();
      sparkleLoopRef.current?.stop();
    };
  }, [isLoading, shineAnim, sparkleAnim]);

  const sparkleOutlineOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.container}>
      {/* Sparkles icon - animated when loading */}
      <View style={styles.sparkleWrapper}>
        <Animated.View style={[styles.sparkleAbsolute, { opacity: sparkleAnim }]}>
          <SparklesSolid color={colors.accent} size={iconSize} />
        </Animated.View>
        <Animated.View style={[styles.sparkleAbsolute, { opacity: sparkleOutlineOpacity }]}>
          <SparklesOutline color={colors.accent} size={iconSize} />
        </Animated.View>
      </View>

      {/* FORTIS animated logo */}
      <Svg height={logoHeight} width={logoWidth} viewBox={`0 0 ${logoWidth} ${logoHeight}`}>
        <Defs>
          {isLoading ? (
            <AnimatedSvgLinearGradient
              id="chatLogoGradient"
              x1={shineX}
              y1="0"
              x2={Animated.add(shineX, logoWidth)}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor={colors.accent} />
              <Stop offset="40%" stopColor={colors.accent} />
              <Stop offset="50%" stopColor="#ffffff" />
              <Stop offset="60%" stopColor={colors.accent} />
              <Stop offset="100%" stopColor={colors.accent} />
            </AnimatedSvgLinearGradient>
          ) : (
            <SvgLinearGradient id="chatLogoGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={colors.accent} />
              <Stop offset="100%" stopColor={colors.accentLight} />
            </SvgLinearGradient>
          )}
        </Defs>
        <G>
          <SvgText
            fill="url(#chatLogoGradient)"
            fontSize={18}
            fontWeight="900"
            letterSpacing={3}
            x={0}
            y={18}
            fontFamily="BankGothicBT-Medium"
          >
            FORTIS
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sparkleWrapper: {
    width: 22,
    height: 22,
    position: 'relative',
  },
  sparkleAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default ChatHeaderLogo;
