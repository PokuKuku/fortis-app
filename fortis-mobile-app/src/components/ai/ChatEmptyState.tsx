/**
 * ChatEmptyState Component
 *
 * Premium onboarding experience for AI chat with:
 * - Animated sparkles icon
 * - Engaging headline and subtitle
 * - 2x2 quick actions grid with staggered animations
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
} from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { DumbbellIcon } from '@/src/components/icons/DumbbellIcon';
import { AIIntent } from '@/src/types/ai';

interface QuickAction {
  intent: AIIntent;
  icon: React.ComponentType<{ color: string; size: number }>;
  label: string;
  description: string;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    intent: 'QUERY_STATS',
    icon: ArrowTrendingUpIcon,
    label: 'Check Stats',
    description: 'View your progress',
    prompt: "What's my best bench press?",
  },
  {
    intent: 'ANALYZE_PLATEAU',
    icon: QuestionMarkCircleIcon,
    label: 'Analyze Plateau',
    description: 'Break through limits',
    prompt: 'Why has my progress stalled?',
  },
  {
    intent: 'CREATE_TEMPLATE',
    icon: DumbbellIcon,
    label: 'Create Workout',
    description: 'Build a session',
    prompt: 'Create a push day workout',
  },
  {
    intent: 'CREATE_PROGRAM',
    icon: CalendarDaysIcon,
    label: 'Build Program',
    description: 'Plan your training',
    prompt: 'Build me a 4-day strength program',
  },
];

interface ChatEmptyStateProps {
  onQuickAction: (intent: AIIntent, prompt: string) => void;
}

// Animated sparkles component with subtle pulse
function AnimatedSparkles() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <SparklesIcon color={Colors.success} size={36} />
    </Animated.View>
  );
}

export function ChatEmptyState({ onQuickAction }: ChatEmptyStateProps) {
  const handleQuickAction = (action: QuickAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onQuickAction(action.intent, action.prompt);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={styles.header}
      >
        <AnimatedSparkles />
        <Text style={styles.title}>How can I help you train?</Text>
        <Text style={styles.subtitle}>
          Ask about your stats, create workouts, or analyze your progress
        </Text>
      </Animated.View>

      {/* Quick Actions Grid */}
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action, index) => (
          <Animated.View
            key={action.intent}
            entering={FadeInUp.duration(400)
              .delay(100 + index * 80)
              .easing(Easing.out(Easing.cubic))}
            style={styles.gridItem}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleQuickAction(action)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <action.icon color={Colors.textSecondary} size={IconSizes.md} />
                </View>
                <ChevronRightIcon color={Colors.textTertiary} size={IconSizes.sm} />
              </View>
              <Text style={styles.cardLabel}>{action.label}</Text>
              <Text style={styles.cardDescription}>{action.description}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Hint text */}
      <Animated.Text
        entering={FadeIn.duration(400).delay(500)}
        style={styles.hint}
      >
        Tap a suggestion or type your own question
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['4xl'],
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    gap: Spacing.md,
  },
  gridItem: {
    width: '48%',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: Spacing.lg,
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing['3xl'],
    textAlign: 'center',
  },
});

export default ChatEmptyState;
