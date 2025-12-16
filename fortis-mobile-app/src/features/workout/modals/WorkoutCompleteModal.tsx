/**
 * WorkoutCompleteModal
 *
 * Celebration screen shown after finishing a workout.
 * Displays summary stats.
 */
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { XMarkIcon, TrophyIcon } from 'react-native-heroicons/outline';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { WorkoutSummary } from '../../../types/workout';

interface WorkoutCompleteModalProps {
  visible: boolean;
  summary: WorkoutSummary | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function WorkoutCompleteModal({
  visible,
  summary,
  onClose,
  onConfirm,
}: WorkoutCompleteModalProps) {
  React.useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!summary) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Workout Complete!</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <XMarkIcon size={20} color="#ef4444" strokeWidth={2} />
            </Pressable>
          </View>

          {/* Celebration */}
          <View style={styles.celebration}>
            <TrophyIcon size={48} color="#22c55e" />
            <Text style={styles.celebrationText}>Great work! You crushed it!</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Exercises</Text>
              <Text style={styles.statValue}>{summary.totalExercises}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Sets</Text>
              <Text style={styles.statValue}>{summary.totalSets}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>
                {formatDuration(summary.durationSeconds)}
              </Text>
            </View>
            {summary.totalVolume > 0 && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Volume</Text>
                <Text style={styles.statValue}>
                  {summary.totalVolume.toLocaleString()} lbs
                </Text>
              </View>
            )}
          </View>

          {/* Button */}
          <Pressable style={styles.doneButton} onPress={onConfirm}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#222222',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#2a2a2a',
    padding: 4,
    borderRadius: 8,
  },
  celebration: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  celebrationText: {
    fontSize: 18,
    color: '#22c55e',
    fontWeight: '500',
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: '#b9bec7',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  doneButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
