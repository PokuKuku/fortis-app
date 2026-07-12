import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BaseModal, useModalStyles } from '@/src/components/ui/BaseModal';
import { useTheme } from '@/src/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import {
  normalizeWorkoutScheduleDays,
  WEEKDAY_LABELS,
} from '@/src/utils/workoutSchedule';

const DAY_GRID_ROWS: Array<Array<number | null>> = [
  [0, 1, 2],
  [3, 4, 5],
  [null, 6, null],
];

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
  const wasVisibleRef = useRef(false);
  const modalWidth = Math.min(360, Math.max(300, windowWidth - Spacing.lg * 2));

  useEffect(() => {
    const didOpen = visible && !wasVisibleRef.current;
    wasVisibleRef.current = visible;
    if (didOpen) {
      setSelectedDays(normalizeWorkoutScheduleDays(initialDays));
    }
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
      showCloseButton={false}
    >
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Choose the days you plan to train each week, or leave blank for no fixed schedule.
      </Text>

      <View style={styles.daysGrid}>
        {DAY_GRID_ROWS.map((row, rowIndex) => (
          <View key={`day-row-${rowIndex}`} style={styles.dayRow}>
            {row.map((day, columnIndex) => {
              if (day === null) {
                return <View key={`empty-${rowIndex}-${columnIndex}`} style={styles.dayCell} />;
              }

              const label = WEEKDAY_LABELS[day];
              const selected = selectedDays.includes(day);
              return (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityLabel={`${label} workout day`}
                  accessibilityState={{ selected }}
                  onPress={() => toggleDay(day)}
                  style={({ pressed }) => [
                    styles.dayCell,
                    styles.dayButton,
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
                      { color: selected ? colors.accentForegroundOnFill : colors.textPrimary },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
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
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  dayRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dayCell: {
    flex: 1,
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
