import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BaseModal, useModalStyles } from '@/src/components/ui/BaseModal';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import {
  normalizeWorkoutScheduleDays,
  WEEKDAY_LABELS,
} from '@/src/utils/workoutSchedule';

type WorkoutScheduleEditorModalProps = {
  visible: boolean;
  initialDays: number[];
  isSaving?: boolean;
  onClose: () => void;
  onSave: (days: number[]) => Promise<void> | void;
};

export function WorkoutScheduleEditorModal({
  visible,
  initialDays,
  isSaving = false,
  onClose,
  onSave,
}: WorkoutScheduleEditorModalProps) {
  const { colors, isDark } = useTheme();
  const modalStyles = useModalStyles();
  const { width: windowWidth } = useWindowDimensions();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const modalWidth = Math.min(360, Math.max(300, windowWidth - Spacing.lg * 2));
  const contentWidth = modalWidth - Spacing['2xl'] * 2;
  const dayButtonWidth = Math.floor((contentWidth - Spacing.sm * 2) / 3);

  useEffect(() => {
    if (!visible) return;
    setSelectedDays(normalizeWorkoutScheduleDays(initialDays));
  }, [initialDays, visible]);

  const toggleDay = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    setSelectedDays((current) => (
      current.includes(day)
        ? current.filter((item) => item !== day)
        : normalizeWorkoutScheduleDays([...current, day])
    ));
  };

  const handleSave = async () => {
    if (isSaving) return;
    await onSave(selectedDays);
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Workout Schedule"
      width={modalWidth}
    >
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Choose the days you plan to train each week, or leave blank for no fixed schedule.
      </Text>

      <View style={styles.daysGrid}>
        {WEEKDAY_LABELS.map((label, day) => {
          const selected = selectedDays.includes(day);
          return (
            <Pressable
              key={label}
              onPress={() => toggleDay(day)}
              style={({ pressed }) => [
                styles.dayButton,
                { width: dayButtonWidth },
                {
                  backgroundColor: selected
                    ? colors.accent
                    : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderColor: selected
                    ? colors.accent
                    : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: selected ? colors.white : colors.textPrimary },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={modalStyles.actions}>
        <Pressable
          onPress={onClose}
          disabled={isSaving}
          style={({ pressed }) => [
            modalStyles.cancelButton,
            pressed && modalStyles.buttonPressed,
          ]}
        >
          <Text style={modalStyles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={({ pressed }) => [
            modalStyles.successButton,
            isSaving && styles.disabled,
            pressed && modalStyles.buttonPressed,
          ]}
        >
          <Text style={modalStyles.successButtonText}>Save</Text>
        </Pressable>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  dayButton: {
    height: 42,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 12,
    letterSpacing: 1,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.75,
  },
});
