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
  ChevronRightIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
} from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { AIIntent } from '@/src/types/ai';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getContentWidth, moderateScale, scale } from '@/src/utils/responsive';

// Calculate grid dimensions for perfect 2-column layout
const GRID_HORIZONTAL_PADDING = scale(Spacing['2xl']);
const GRID_GAP = scale(Spacing.md);
const GRID_WIDTH = getContentWidth(GRID_HORIZONTAL_PADDING, scale(400));
const CARD_WIDTH = (GRID_WIDTH - GRID_GAP) / 2; // Exact width for each card
const CARD_HEIGHT = scale(140);
const CARD_ICON_SIZE = scale(36);
const CARD_ICON_RADIUS = scale(10);
const CARD_ICON_GLYPH_SIZE = scale(IconSizes.md);
const CARD_CHEVRON_SIZE = scale(IconSizes.sm);
const TITLE_FONT_SIZE = moderateScale(Typography.h2.fontSize as number);
const TITLE_LINE_HEIGHT = moderateScale(Typography.h2.lineHeight as number);
const BODY_FONT_SIZE = moderateScale(Typography.body.fontSize as number);
const BODY_LINE_HEIGHT = moderateScale(Typography.body.lineHeight as number);
const LABEL_FONT_SIZE = moderateScale(Typography.label.fontSize as number);
const LABEL_LINE_HEIGHT = moderateScale(Typography.label.lineHeight as number);
const CAPTION_FONT_SIZE = moderateScale(Typography.caption.fontSize as number);
const CAPTION_LINE_HEIGHT = moderateScale(Typography.caption.lineHeight as number);

interface QuickAction {
  intent: AIIntent;
  icon: React.ComponentType<{ color: string; size: number }>;
  label: string;
  description: string;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    intent: 'FORTIS_ANALYST',
    icon: ChartBarIcon,
    label: 'Training Insights',
    description: 'Trends & volume',
    prompt: 'Summarize my training progress over the last few months and key trends',
  },
  {
    intent: 'FORTIS_ANALYST',
    icon: TrophyIcon,
    label: 'My PRs',
    description: 'Personal records',
    prompt: 'Show me my recent personal records and strongest lifts',
  },
  {
    intent: 'FORTIS_ANALYST',
    icon: CalendarDaysIcon,
    label: 'Weekly Focus',
    description: 'What to improve',
    prompt: 'Based on my recent training, what should I focus on next week?',
  },
  {
    intent: 'FORTIS_ANALYST',
    icon: FireIcon,
    label: 'Muscle Balance',
    description: 'Strength gaps',
    prompt: 'Which muscle groups am I training the most and which need more work?',
  },
];

interface ChatEmptyStateProps {
  onQuickAction: (intent: AIIntent, prompt: string) => void;
}


export function ChatEmptyState({ onQuickAction }: ChatEmptyStateProps) {
  const { colors, isDark } = useTheme();

  // Dynamic theme-aware styles
  const themedStyles = {
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    card: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    cardIcon: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    cardLabel: { color: colors.textPrimary },
    cardDescription: { color: colors.textSecondary },
    hint: { color: colors.textTertiary },
  };

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
        <Text style={[styles.title, themedStyles.title]}>Your Training Insights</Text>
        <Text style={[styles.subtitle, themedStyles.subtitle]}>
          Ask about your progress, PRs, programming ideas, and training questions
        </Text>
      </Animated.View>

      {/* Quick Actions Grid */}
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action, index) => (
          <Animated.View
            key={action.label}
            entering={FadeInUp.duration(400)
              .delay(100 + index * 80)
              .easing(Easing.out(Easing.cubic))}
            style={styles.gridItem}
          >
            <TouchableOpacity
              style={[styles.card, themedStyles.card]}
              onPress={() => handleQuickAction(action)}
              activeOpacity={0.85}
              accessibilityLabel={`${action.label}: ${action.description}`}
              accessibilityHint={`Sends: ${action.prompt}`}
              accessibilityRole="button"
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, themedStyles.cardIcon]}>
                  <action.icon color={colors.textSecondary} size={CARD_ICON_GLYPH_SIZE} />
                </View>
                <ChevronRightIcon color={colors.textTertiary} size={CARD_CHEVRON_SIZE} />
              </View>
              <Text style={[styles.cardLabel, themedStyles.cardLabel]}>{action.label}</Text>
              <Text style={[styles.cardDescription, themedStyles.cardDescription]}>{action.description}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Hint text */}
      <Animated.Text
        entering={FadeIn.duration(400).delay(500)}
        style={[styles.hint, themedStyles.hint]}
      >
        Tap a quick action or type your own question
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: GRID_HORIZONTAL_PADDING,
    paddingTop: scale(Spacing['4xl']),
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: scale(Spacing['3xl']),
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: scale(Spacing.sm),
    fontSize: TITLE_FONT_SIZE,
    lineHeight: TITLE_LINE_HEIGHT,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: scale(300),
    fontSize: BODY_FONT_SIZE,
    lineHeight: BODY_LINE_HEIGHT,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: GRID_WIDTH,
    rowGap: GRID_GAP,
  },
  gridItem: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: scale(BorderRadius.xl),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: scale(Spacing.lg),
    height: CARD_HEIGHT,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scale(Spacing.md),
  },
  cardIcon: {
    width: CARD_ICON_SIZE,
    height: CARD_ICON_SIZE,
    borderRadius: CARD_ICON_RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: scale(Spacing.xs),
    fontSize: LABEL_FONT_SIZE,
    lineHeight: LABEL_LINE_HEIGHT,
  },
  cardDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: CAPTION_FONT_SIZE,
    lineHeight: CAPTION_LINE_HEIGHT,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: scale(Spacing['3xl']),
    textAlign: 'center',
    fontSize: CAPTION_FONT_SIZE,
    lineHeight: CAPTION_LINE_HEIGHT,
  },
});

export default ChatEmptyState;
