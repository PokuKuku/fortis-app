import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlusIcon, EyeIcon } from 'react-native-heroicons/outline';
import { BorderRadius, FontSizes, Spacing } from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { AIProgramTemplate } from '@/src/types/ai';

interface Props {
  template: AIProgramTemplate;
  isAdding?: boolean;
  isAdded?: boolean;
  onAdd: () => void;
  onOpen: () => void;
  onView: (workoutIndex?: number) => void;
}

export function ChatProgramTemplateCard({
  template,
  isAdding = false,
  isAdded = false,
  onAdd,
  onOpen,
  onView,
}: Props) {
  const { colors, isDark } = useTheme();
  const workoutCount = template.workouts.length;
  const meta = [
    template.durationWeeks ? `${template.durationWeeks} weeks` : null,
    `${workoutCount} day${workoutCount === 1 ? '' : 's'}`,
  ].filter(Boolean).join(' • ');

  return (
    <View style={[styles.card, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {template.name}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{meta}</Text>
      </View>

      <View style={styles.split}>
        {template.workouts.map((workout, index) => (
          <TouchableOpacity
            key={`${workout.name}-${index}`}
            style={[
              styles.workoutRow,
              { borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' },
            ]}
            onPress={() => onView(index)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`View ${workout.name} exercises`}
          >
            <Text style={[styles.day, { color: colors.accent }]}>D{index + 1}</Text>
            <Text style={[styles.workoutName, { color: colors.textPrimary }]} numberOfLines={1}>
              {workout.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.action,
            styles.viewAction,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.055)',
              borderColor: colors.glassBorder,
            },
          ]}
          onPress={() => onView()}
          activeOpacity={0.8}
        >
          <EyeIcon size={17} color={colors.textPrimary} strokeWidth={2.2} />
          <Text style={[styles.actionText, { color: colors.textPrimary }]}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.action,
            styles.addAction,
            { backgroundColor: isAdded ? Colors.success : colors.accent },
            isAdding && styles.disabled,
          ]}
          onPress={isAdded ? onOpen : onAdd}
          disabled={isAdding}
          activeOpacity={0.8}
        >
          {isAdded
            ? <EyeIcon size={17} color={Colors.white} strokeWidth={2.2} />
            : isAdding
              ? null
              : <PlusIcon size={17} color={colors.accentForegroundOnFill} strokeWidth={2.2} />}
          <Text style={[styles.actionText, { color: isAdded ? Colors.white : colors.accentForegroundOnFill }]}>
            {isAdding ? 'Adding...' : isAdded ? 'Open Saved' : 'Add to Programs'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.md,
  },
  header: { gap: 4 },
  title: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: FontSizes.lg,
    letterSpacing: 0.7,
  },
  meta: { fontSize: FontSizes.sm, fontWeight: '600' },
  split: { gap: 0 },
  workoutRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  day: {
    width: 30,
    fontFamily: 'BankGothicBT-Medium',
    fontSize: FontSizes.sm,
    letterSpacing: 0.35,
  },
  workoutName: {
    flex: 1,
    fontFamily: 'BankGothicBT-Medium',
    fontSize: FontSizes.base,
    letterSpacing: 0.45,
  },
  action: {
    minHeight: 42,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  actions: { gap: Spacing.sm },
  viewAction: { width: '100%', borderWidth: 1 },
  addAction: { width: '100%' },
  actionText: { fontSize: FontSizes.sm, fontWeight: '800' },
  disabled: { opacity: 0.7 },
});
