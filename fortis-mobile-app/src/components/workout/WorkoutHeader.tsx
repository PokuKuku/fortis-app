import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ClockIcon, XMarkIcon, CalendarDaysIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useElapsedTime, formatElapsedTime } from '@/src/hooks/useElapsedTime';
import { formatRestTime } from '@/src/hooks/useRestTimerTick';
import { useWorkoutStore, getRestTimerColor, getRestTimerBackgroundColor } from '@/src/store/workoutStore';
import { MuscleHeatmap } from './MuscleHeatmap';
import * as Haptics from 'expo-haptics';

// Weighted muscle data for the heatmap
interface MuscleWeightData {
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  weight: number;
}

interface WorkoutHeaderProps {
  onCancelPress: () => void;
  onTimerSettingsPress: () => void;
  onRestTimerPress: () => void;
  muscleWeights?: MuscleWeightData[];
}

export function WorkoutHeader({
  onCancelPress,
  onTimerSettingsPress,
  onRestTimerPress,
  muscleWeights,
}: WorkoutHeaderProps) {
  const { colors, isDark } = useTheme();
  const elapsed = useElapsedTime();
  const activeSession = useWorkoutStore(s => s.activeSession);
  const restTimer = useWorkoutStore(s => s.restTimer);
  const restTimerSettings = useWorkoutStore(s => s.restTimerSettings);

  // Dynamic theme-aware styles
  const themedStyles = {
    clockButton: {
      backgroundColor: isDark ? 'rgba(163, 163, 163, 0.2)' : 'rgba(0, 0, 0, 0.06)',
    },
    cancelButton: {
      backgroundColor: isDark ? colors.errorOverlay : 'rgba(239, 68, 68, 0.1)',
    },
    elapsedTime: { color: colors.textPrimary },
    separator: { color: colors.textTertiary },
    dateText: { color: colors.textSecondary },
    workoutName: { color: colors.textPrimary },
  };

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Display configured duration when idle, countdown when active
  const displaySeconds = restTimer.isActive
    ? restTimer.remainingSeconds
    : restTimerSettings.normalSeconds;

  const restTimerColor = restTimer.isActive
    ? getRestTimerColor(restTimer.remainingSeconds, restTimer.totalSeconds)
    : colors.textSecondary;

  const restTimerBgColor = restTimer.isActive
    ? getRestTimerBackgroundColor(restTimer.remainingSeconds, restTimer.totalSeconds)
    : 'rgba(156, 163, 175, 0.2)';

  const handleRestTimerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRestTimerPress();
  };

  // Get workout name
  const workoutName = activeSession?.name || null;

  return (
    <View style={styles.container}>
      {/* Top Row: Clock Button and Cancel Button */}
      <View style={styles.topRow}>
        {/* Timer Settings Button - Top Left */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onTimerSettingsPress();
          }}
          style={({ pressed }) => [
            styles.clockButton,
            themedStyles.clockButton,
            pressed && styles.pressed
          ]}
        >
          <ClockIcon size={20} color={colors.textSecondary} strokeWidth={2} />
        </Pressable>

        {/* Cancel Button - Top Right */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onCancelPress();
          }}
          style={({ pressed }) => [
            styles.cancelButton,
            themedStyles.cancelButton,
            pressed && styles.pressed
          ]}
        >
          <XMarkIcon size={20} color={colors.error} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Content Row: Left (title/timers) and Right (program name) */}
      <View style={styles.contentRow}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          {/* Workout Title */}
          {workoutName && (
            <Text style={[styles.workoutName, themedStyles.workoutName]}>{workoutName}</Text>
          )}

          {/* Timers Row */}
          <View style={styles.timersRow}>
            {/* Elapsed Time */}
            <Text style={[
              styles.elapsedTime,
              themedStyles.elapsedTime,
              elapsed >= 3600 && styles.elapsedTimeSmall
            ]}>
              {formatElapsedTime(elapsed)}
            </Text>

            {/* Separator */}
            <Text style={[styles.separator, themedStyles.separator]}>|</Text>

            {/* Rest Timer Button */}
            <Pressable
              onPress={handleRestTimerPress}
              style={[
                styles.restTimerButton,
                { backgroundColor: restTimerBgColor }
              ]}
            >
              <Text style={[styles.restTimerText, { color: restTimerColor }]}>
                {formatRestTime(displaySeconds)}
              </Text>
            </Pressable>
          </View>

        </View>

        {/* Right Column - Heatmap and Program Name */}
        <View style={styles.rightColumn}>
          <MuscleHeatmap
            muscleWeights={muscleWeights || []}
            scale={0.18}
            compact
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 0,
    paddingBottom: Spacing.md,
    backgroundColor: 'transparent',
    gap: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clockButton: {
    backgroundColor: 'rgba(163, 163, 163, 0.2)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  cancelButton: {
    backgroundColor: Colors.errorOverlay,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftColumn: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  timersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elapsedTime: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
    minWidth: 45,
  },
  elapsedTimeSmall: {
    fontSize: FontSizes.sm,
  },
  separator: {
    color: Colors.textTertiary,
    marginLeft: -2,
    paddingHorizontal: 6,
    fontSize: FontSizes.base,
  },
  restTimerButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  restTimerText: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
    textAlign: 'center',
    minWidth: 40,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
  },
  workoutName: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
