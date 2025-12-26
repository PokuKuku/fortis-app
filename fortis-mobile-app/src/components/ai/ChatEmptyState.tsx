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
  Easing,
} from 'react-native-reanimated';
import {
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
    label: 'Track My Gains',
    description: 'See your progress',
    prompt: "How am I doing this month?",
  },
  {
    intent: 'ANALYZE_PLATEAU',
    icon: QuestionMarkCircleIcon,
    label: 'Break Through',
    description: 'Smash that plateau',
    prompt: 'Help me break through my plateau',
  },
  {
    intent: 'CREATE_TEMPLATE',
    icon: DumbbellIcon,
    label: 'Build a Workout',
    description: 'Custom session',
    prompt: 'Design me a killer push day',
  },
  {
    intent: 'CREATE_PROGRAM',
    icon: CalendarDaysIcon,
    label: 'Full Program',
    description: 'Weekly plan',
    prompt: 'Create a 4-week strength program',
  },
];

interface ChatEmptyStateProps {
  onQuickAction: (intent: AIIntent, prompt: string) => void;
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
        <Text style={styles.title}>Ready to Level Up?</Text>
        <Text style={styles.subtitle}>
          Your AI coach is here to build workouts, crush plateaus, and track your gains
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
              accessibilityLabel={`${action.label}: ${action.description}`}
              accessibilityHint={`Sends: ${action.prompt}`}
              accessibilityRole="button"
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
