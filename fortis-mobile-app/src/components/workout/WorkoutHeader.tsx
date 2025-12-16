import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ClockIcon, XMarkIcon, CalendarDaysIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useElapsedTime, formatElapsedTime } from '@/src/hooks/useElapsedTime';
import { formatRestTime } from '@/src/hooks/useRestTimerTick';
import { useWorkoutStore, getRestTimerColor, getRestTimerBackgroundColor } from '@/src/store/workoutStore';
import * as Haptics from 'expo-haptics';

interface WorkoutHeaderProps {
  onCancelPress: () => void;
  onTimerSettingsPress: () => void;
  onRestTimerPress: () => void;
}

export function WorkoutHeader({
  onCancelPress,
  onTimerSettingsPress,
  onRestTimerPress
}: WorkoutHeaderProps) {
  const elapsed = useElapsedTime();
  const activeSession = useWorkoutStore(s => s.activeSession);
  const restTimer = useWorkoutStore(s => s.restTimer);
  const restTimerSettings = useWorkoutStore(s => s.restTimerSettings);

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
    : '#b9bec7';

  const restTimerBgColor = restTimer.isActive
    ? getRestTimerBackgroundColor(restTimer.remainingSeconds, restTimer.totalSeconds)
    : 'rgba(156, 163, 175, 0.2)';

  const handleRestTimerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRestTimerPress();
  };

  // Get program and workout names
  const programName = activeSession?.programName || null;
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
            pressed && styles.pressed
          ]}
        >
          <ClockIcon size={20} color="#b9bec7" strokeWidth={2} />
        </Pressable>

        {/* Cancel Button - Top Right */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onCancelPress();
          }}
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.pressed
          ]}
        >
          <XMarkIcon size={20} color={Colors.error} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Content Row: Left (title/timers/date) and Right (program name) */}
      <View style={styles.contentRow}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          {/* Workout Title */}
          {workoutName && (
            <Text style={styles.workoutName}>{workoutName}</Text>
          )}

          {/* Timers Row */}
          <View style={styles.timersRow}>
            {/* Elapsed Time */}
            <Text style={[
              styles.elapsedTime,
              elapsed >= 3600 && styles.elapsedTimeSmall
            ]}>
              {formatElapsedTime(elapsed)}
            </Text>

            {/* Separator */}
            <Text style={styles.separator}>|</Text>

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

          {/* Date Row */}
          <View style={styles.dateRow}>
            <CalendarDaysIcon size={16} color="#b9bec7" strokeWidth={2} />
            <Text style={styles.dateText}>{today}</Text>
          </View>
        </View>

        {/* Right Column - Program Name */}
        <View style={styles.rightColumn}>
          {programName && (
            <Text style={styles.programName}>{programName}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 0,
    paddingBottom: Spacing.sm,
    backgroundColor: 'transparent',
    gap: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clockButton: {
    backgroundColor: 'rgba(185, 190, 199, 0.2)',
    padding: 8,
    borderRadius: BorderRadius.lg,
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 8,
    borderRadius: BorderRadius.lg,
  },
  pressed: {
    opacity: 0.6,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftColumn: {
    gap: 4,
  },
  timersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elapsedTime: {
    fontSize: 18,
    fontFamily: 'BankGothic',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    minWidth: 45,
  },
  elapsedTimeSmall: {
    fontSize: 16,
  },
  separator: {
    color: '#4a4a4a',
    marginLeft: -2,
    paddingHorizontal: 6,
    fontSize: 16,
  },
  restTimerButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.md,
  },
  restTimerText: {
    fontSize: 18,
    fontFamily: 'BankGothic',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    minWidth: 40,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'BankGothic',
    color: '#b9bec7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  programName: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'right',
    color: Colors.success,
  },
  workoutName: {
    fontSize: 17,
    fontFamily: 'BankGothic',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
