import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Clock, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useElapsedTime, formatElapsedTime } from '@/hooks/useElapsedTime';
import { formatRestTime } from '@/hooks/useRestTimerTick';
import { useWorkoutStore, getRestTimerColor } from '@/store/workoutStore';
import { LinearGradient } from 'expo-linear-gradient';
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

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const restTimerColor = restTimer.isActive
    ? getRestTimerColor(restTimer.remainingSeconds, restTimer.totalSeconds)
    : Colors.textSecondary;

  const handleRestTimerPress = () => {
    if (restTimer.isActive || restTimer.remainingSeconds > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRestTimerPress();
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Row: Timer Settings | Date | Cancel */}
      <View style={styles.topRow}>
        {/* Timer Settings Button */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onTimerSettingsPress();
          }}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed
          ]}
        >
          <Clock size={20} color={Colors.textSecondary} />
        </Pressable>

        {/* Date */}
        <Text style={styles.dateText}>{today}</Text>

        {/* Cancel Button */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onCancelPress();
          }}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed
          ]}
        >
          <X size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Workout Name */}
      {activeSession && (
        <View style={styles.nameContainer}>
          <Text style={styles.workoutName} numberOfLines={1}>
            {activeSession.name}
          </Text>
        </View>
      )}

      {/* Bottom Row: Elapsed Time | Rest Timer */}
      <View style={styles.bottomRow}>
        {/* Elapsed Time */}
        <View style={styles.timerBadge}>
          <Text style={styles.timerLabel}>Elapsed</Text>
          <Text style={styles.timerValue}>{formatElapsedTime(elapsed)}</Text>
        </View>

        {/* Rest Timer (Clickable) */}
        <Pressable
          onPress={handleRestTimerPress}
          disabled={!restTimer.isActive && restTimer.remainingSeconds === 0}
          style={({ pressed }) => [
            styles.restTimerBadge,
            (restTimer.isActive || restTimer.remainingSeconds > 0) && styles.restTimerActive,
            pressed && styles.pressed
          ]}
        >
          <LinearGradient
            colors={
              restTimer.isActive
                ? [restTimerColor, restTimerColor]
                : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.05)']
            }
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={[
            styles.timerLabel,
            restTimer.isActive && styles.restTimerActiveText
          ]}>
            Rest
          </Text>
          <Text style={[
            styles.timerValue,
            restTimer.isActive && styles.restTimerActiveText
          ]}>
            {formatRestTime(restTimer.remainingSeconds)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  dateText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  nameContainer: {
    alignItems: 'center',
  },
  workoutName: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timerBadge: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  restTimerBadge: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  restTimerActive: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  timerLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  restTimerActiveText: {
    color: Colors.background, // Dark text on colored background
  },
});
