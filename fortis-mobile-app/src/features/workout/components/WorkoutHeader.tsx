/**
 * WorkoutHeader Component
 *
 * Sticky header for the workout logger with:
 * - Workout elapsed timer
 * - Rest timer display with color interpolation
 * - Date display
 * - Timer settings and cancel buttons
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Clock, X, Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useWorkoutStore, getRestTimerColor } from '../../../store/workoutStore';

interface WorkoutHeaderProps {
  onTimerSettingsPress: () => void;
  onCancelPress: () => void;
  onRestTimerPress: () => void;
}

export function WorkoutHeader({
  onTimerSettingsPress,
  onCancelPress,
  onRestTimerPress,
}: WorkoutHeaderProps) {
  const insets = useSafeAreaInsets();
  const [elapsedTime, setElapsedTime] = useState(0);

  const {
    workoutStartTime,
    restTimer,
    tickRestTimer,
  } = useWorkoutStore();

  // Update elapsed time every second
  useEffect(() => {
    if (!workoutStartTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [workoutStartTime]);

  // Update rest timer every second
  useEffect(() => {
    if (!restTimer.isActive) return;

    const interval = setInterval(() => {
      tickRestTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isActive, tickRestTimer]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (): string => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const restTimerColor = getRestTimerColor(
    restTimer.remainingSeconds,
    restTimer.totalSeconds
  );

  const restTimerBgColor = restTimer.isActive
    ? `${restTimerColor}20`
    : 'rgba(185, 190, 199, 0.2)';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Timer Settings Button - Top Left */}
      <Pressable
        style={styles.timerButton}
        onPress={onTimerSettingsPress}
        hitSlop={8}
      >
        <Clock size={20} color="#b9bec7" strokeWidth={2.5} />
      </Pressable>

      {/* Cancel Button - Top Right */}
      <Pressable
        style={styles.cancelButton}
        onPress={onCancelPress}
        hitSlop={8}
      >
        <X size={20} color="#ef4444" strokeWidth={2.5} />
      </Pressable>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Left Side - Timers */}
        <View style={styles.leftSide}>
          {/* Workout Timer & Rest Timer Row */}
          <View style={styles.timersRow}>
            {/* Elapsed Time */}
            <Text style={[
              styles.elapsedTime,
              elapsedTime >= 3600 && styles.elapsedTimeSmall,
            ]}>
              {formatTime(elapsedTime)}
            </Text>

            {/* Separator */}
            <Text style={styles.separator}>|</Text>

            {/* Rest Timer Display */}
            <Pressable
              style={[
                styles.restTimerButton,
                { backgroundColor: restTimerBgColor },
              ]}
              onPress={onRestTimerPress}
            >
              <Text style={[styles.restTimerText, { color: restTimerColor }]}>
                {formatTime(restTimer.remainingSeconds)}
              </Text>
            </Pressable>
          </View>

          {/* Date Row */}
          <View style={styles.dateRow}>
            <Calendar size={16} color="#b9bec7" />
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#222222',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  timerButton: {
    position: 'absolute',
    top: 8,
    left: 16,
    backgroundColor: 'rgba(185, 190, 199, 0.2)',
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  cancelButton: {
    position: 'absolute',
    top: 8,
    right: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  content: {
    marginTop: 48,
  },
  leftSide: {
    gap: 4,
  },
  timersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  elapsedTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    minWidth: 50,
    fontVariant: ['tabular-nums'],
  },
  elapsedTimeSmall: {
    fontSize: 14,
  },
  separator: {
    fontSize: 16,
    color: '#4a4a4a',
    marginHorizontal: 4,
  },
  restTimerButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  restTimerText: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#b9bec7',
  },
});
