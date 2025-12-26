/**
 * ChatHeaderLogo Component
 *
 * Sparkles icon + FORTIS animated logo for chat header.
 * Logo shines with animated gradient when AI is loading.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
  G,
} from 'react-native-svg';
import { SparklesIcon as SparklesOutline } from 'react-native-heroicons/outline';
import { SparklesIcon as SparklesSolid } from 'react-native-heroicons/solid';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useAIStore } from '@/src/store/aiStore';

const AnimatedSvgLinearGradient = Animated.createAnimatedComponent(SvgLinearGradient);

interface ChatHeaderLogoProps {
  isLoading?: boolean;
}

export function ChatHeaderLogo({ isLoading = false }: ChatHeaderLogoProps) {
  const shineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(1)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const sparkleLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const rateLimitStatus = useAIStore((state) => state.rateLimitStatus);

  const logoWidth = 90;
  const logoHeight = 24;
  const iconSize = 22;

  // Calculate remaining requests
  const remaining = rateLimitStatus
    ? rateLimitStatus.maxPerDay - rateLimitStatus.actionsThisDay
    : null;
  const isLowRemaining = remaining !== null && remaining < 5;

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

      // Start subtle pulse
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoopRef.current.start();

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
      pulseLoopRef.current?.stop();
      sparkleLoopRef.current?.stop();
      shineAnim.setValue(0);
      pulseAnim.setValue(1);
      sparkleAnim.setValue(1);
    }

    return () => {
      loopRef.current?.stop();
      pulseLoopRef.current?.stop();
      sparkleLoopRef.current?.stop();
    };
  }, [isLoading, shineAnim, pulseAnim, sparkleAnim]);

  const sparkleOutlineOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.container}>
      {/* Sparkles icon - animated when loading */}
      <View style={styles.sparkleWrapper}>
        <Animated.View style={[styles.sparkleAbsolute, { opacity: sparkleAnim }]}>
          <SparklesSolid color={Colors.success} size={iconSize} />
        </Animated.View>
        <Animated.View style={[styles.sparkleAbsolute, { opacity: sparkleOutlineOpacity }]}>
          <SparklesOutline color={Colors.success} size={iconSize} />
        </Animated.View>
      </View>

      {/* FORTIS animated logo */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
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
                <Stop offset="0%" stopColor={Colors.success} />
                <Stop offset="40%" stopColor={Colors.success} />
                <Stop offset="50%" stopColor="#ffffff" />
                <Stop offset="60%" stopColor={Colors.success} />
                <Stop offset="100%" stopColor={Colors.success} />
              </AnimatedSvgLinearGradient>
            ) : (
              <SvgLinearGradient id="chatLogoGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor={Colors.success} />
                <Stop offset="100%" stopColor="#4ade80" />
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
      </Animated.View>

      {/* Rate limit badge */}
      {remaining !== null && (
        <View
          style={[
            styles.rateLimitBadge,
            isLowRemaining && styles.rateLimitBadgeWarning,
          ]}
          accessibilityLabel={`${remaining} requests remaining today`}
        >
          <Text
            style={[
              styles.rateLimitText,
              isLowRemaining && styles.rateLimitTextWarning,
            ]}
          >
            {remaining}
          </Text>
        </View>
      )}
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
  rateLimitBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    marginLeft: Spacing.xs,
  },
  rateLimitBadgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  rateLimitText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  rateLimitTextWarning: {
    color: Colors.warning,
  },
});

export default ChatHeaderLogo;
