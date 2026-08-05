/**
 * ChatEmptyState Component
 *
 * Premium onboarding experience for AI chat with:
 * - Animated sparkles icon
 * - Engaging headline and subtitle
 * - Responsive quick actions grid with staggered animations
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, {
  FadeInUp,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
import {
  ChevronRightIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  FireIcon,
} from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { AIIntent } from '@/src/types/ai';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getContentWidth, moderateScale, scale } from '@/src/utils/responsive';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';

// Calculate grid dimensions for consistent layout across screen sizes
const GRID_HORIZONTAL_PADDING = scale(Spacing['2xl']);
const GRID_GAP = scale(Spacing.md);
const GRID_COLUMNS: number = 2;
const GRID_MAX_WIDTH = scale(420);
const GRID_WIDTH = getContentWidth(GRID_HORIZONTAL_PADDING, GRID_MAX_WIDTH);
const CARD_WIDTH = GRID_COLUMNS === 1 ? GRID_WIDTH : (GRID_WIDTH - GRID_GAP) / 2;
const CARD_HEIGHT = GRID_COLUMNS === 1 ? scale(120) : scale(140);
const CARD_ICON_SIZE = scale(36);
const CARD_ICON_RADIUS = scale(10);
const CARD_ICON_GLYPH_SIZE = scale(IconSizes.md);
const CARD_CHEVRON_SIZE = scale(IconSizes.sm);
const TITLE_FONT_SIZE = moderateScale(Typography.h2.fontSize as number);
const TITLE_LINE_HEIGHT = moderateScale(Typography.h2.lineHeight as number);
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
    intent: 'GENERAL_CHAT',
    icon: ChartBarIcon,
    label: 'Training Insights',
    description: 'Trends & volume',
    prompt: 'Summarize my training progress over the last few months and key trends',
  },
  {
    intent: 'GENERAL_CHAT',
    icon: FireIcon,
    label: 'Back Workout',
    description: 'Make me a back workout',
    prompt: 'Make me a back workout',
  },
  {
    intent: 'GENERAL_CHAT',
    icon: CalendarDaysIcon,
    label: 'Weekly Focus',
    description: 'What to improve',
    prompt: 'Based on my recent training, what should I focus on next week?',
  },
  {
    intent: 'GENERAL_CHAT',
    icon: FireIcon,
    label: 'Muscle Balance',
    description: 'Strength gaps',
    prompt: 'Which muscle groups am I training the most and which need more work?',
  },
];

interface ChatEmptyStateProps {
  onQuickAction: (intent: AIIntent, prompt: string) => void;
  isTourBackWorkoutStep?: boolean;
  onTourBackWorkoutPress?: () => void;
}


export function ChatEmptyState({
  onQuickAction,
  isTourBackWorkoutStep = false,
  onTourBackWorkoutPress,
}: ChatEmptyStateProps) {
  const { colors, isDark } = useTheme();
  const { fontScale, height } = useWindowDimensions();
  const titleLineHeight = Math.round(TITLE_LINE_HEIGHT * fontScale);
  const labelLineHeight = Math.round(LABEL_LINE_HEIGHT * fontScale);
  const captionLineHeight = Math.round(CAPTION_LINE_HEIGHT * fontScale);
  const verticalOffset = Math.max(scale(52), Math.min(scale(96), height * 0.085));

  // Dynamic theme-aware styles
  const themedStyles = {
    title: { color: colors.textPrimary },
    card: {
      backgroundColor: colors.glassBackground,
      borderColor: colors.glassBorder,
    },
    cardIcon: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    cardLabel: { color: colors.textPrimary },
    cardDescription: { color: colors.textSecondary },
  };

  const handleQuickAction = (action: QuickAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onQuickAction(action.intent, action.prompt);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.centerStack, { paddingTop: verticalOffset }]}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.header}
        >
          <Text style={[styles.title, themedStyles.title, { lineHeight: titleLineHeight }]}>
            Your Training Insights
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
              {action.label === 'Back Workout' ? (
                <TourAnchor
                  id={TOUR_ANCHOR_IDS.aiChatBackWorkout}
                  disabled={!isTourBackWorkoutStep}
                  deferMeasurementUntilInteractions
                >
                  <TouchableOpacity
                    style={[styles.card, themedStyles.card]}
                    onPress={isTourBackWorkoutStep ? onTourBackWorkoutPress : () => handleQuickAction(action)}
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
                    <Text style={[styles.cardLabel, themedStyles.cardLabel, { lineHeight: labelLineHeight }]}>
                      {action.label}
                    </Text>
                    <Text style={[styles.cardDescription, themedStyles.cardDescription, { lineHeight: captionLineHeight }]}>
                      {action.description}
                    </Text>
                  </TouchableOpacity>
                </TourAnchor>
              ) : (
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
                  <Text style={[styles.cardLabel, themedStyles.cardLabel, { lineHeight: labelLineHeight }]}>
                    {action.label}
                  </Text>
                  <Text style={[styles.cardDescription, themedStyles.cardDescription, { lineHeight: captionLineHeight }]}>
                    {action.description}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          ))}
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: GRID_HORIZONTAL_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: scale(Spacing['3xl']),
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontSize: TITLE_FONT_SIZE,
    lineHeight: TITLE_LINE_HEIGHT,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: GRID_WIDTH,
    alignSelf: 'center',
    alignItems: 'stretch',
    columnGap: GRID_GAP,
    rowGap: GRID_GAP,
  },
  gridItem: {
    width: CARD_WIDTH,
    alignSelf: 'stretch',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: scale(BorderRadius.xl),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: scale(Spacing.lg),
    minHeight: CARD_HEIGHT,
    flex: 1,
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
});

export default ChatEmptyState;
