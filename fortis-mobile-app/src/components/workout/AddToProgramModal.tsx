import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { PlusIcon, XMarkIcon, CheckIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '../../../components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '../../../constants/Sizes';

export interface ProgramWorkoutSlot {
  id: string;
  name: string;
  dayNumber: number;
}

interface AddToProgramModalProps {
  visible: boolean;
  workoutName: string;
  programName: string;
  existingWorkouts: ProgramWorkoutSlot[];
  isAtLimit: boolean;
  onSelectPosition: (position: number) => void;
  onCancel: () => void;
}

/**
 * Modal for selecting where to add a workout within a program.
 * Appears after dragging a workout card onto a program card.
 */
export function AddToProgramModal({
  visible,
  workoutName,
  programName,
  existingWorkouts,
  isAtLimit,
  onSelectPosition,
  onCancel,
}: AddToProgramModalProps) {
  const { colors, isDark } = useTheme();
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;

  // Theme-aware styles
  const themedStyles = {
    modal: { backgroundColor: isDark ? '#222222' : '#FFFFFF' },
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    closeButton: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' },
    sectionLabel: { color: colors.textSecondary },
    positionOption: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    positionBadge: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
    positionBadgeText: { color: colors.textPrimary },
    positionName: { color: colors.textPrimary },
    positionHint: { color: colors.textSecondary },
    cancelButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
    },
    cancelButtonText: { color: colors.textSecondary },
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, modalOpacity, modalScale]);

  const handleSelectPosition = (position: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectPosition(position);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  // Sort workouts by day number
  const sortedWorkouts = [...existingWorkouts].sort((a, b) => a.dayNumber - b.dayNumber);
  const nextDayNumber = sortedWorkouts.length > 0
    ? sortedWorkouts[sortedWorkouts.length - 1].dayNumber + 1
    : 1;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleCancel}
        />
        <Animated.View
          style={[
            styles.modal,
            themedStyles.modal,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          <StainlessSteelPattern />
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.title, themedStyles.title]}>Add to Program</Text>
                <Text style={[styles.subtitle, themedStyles.subtitle]} numberOfLines={1}>
                  Adding "{workoutName}" to {programName}
                </Text>
              </View>
              <TouchableOpacity style={[styles.closeButton, themedStyles.closeButton]} onPress={handleCancel}>
                <XMarkIcon color={colors.textSecondary} size={20} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Position Selection */}
            <Text style={[styles.sectionLabel, themedStyles.sectionLabel]}>Select Position</Text>

            <ScrollView
              style={styles.positionList}
              showsVerticalScrollIndicator={false}
              bounces={existingWorkouts.length > 4}
            >
              {/* Existing workout slots */}
              {sortedWorkouts.map((workout, index) => (
                <TouchableOpacity
                  key={workout.id}
                  style={[styles.positionOption, themedStyles.positionOption]}
                  onPress={() => handleSelectPosition(workout.dayNumber)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.positionBadge, themedStyles.positionBadge]}>
                    <Text style={[styles.positionBadgeText, themedStyles.positionBadgeText]}>Day {workout.dayNumber}</Text>
                  </View>
                  <View style={styles.positionInfo}>
                    <Text style={[styles.positionName, themedStyles.positionName]} numberOfLines={1}>
                      Replace: {workout.name}
                    </Text>
                    <Text style={[styles.positionHint, themedStyles.positionHint]}>
                      Insert before this workout
                    </Text>
                  </View>
                  <CheckIcon color={colors.textSecondary} size={18} strokeWidth={2} />
                </TouchableOpacity>
              ))}

              {/* Add as new day option - hidden when at 7 workout limit */}
              {!isAtLimit && (
                <TouchableOpacity
                  style={[styles.positionOption, styles.addNewOption]}
                  onPress={() => handleSelectPosition(nextDayNumber)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.positionBadge, styles.addNewBadge]}>
                    <PlusIcon color={Colors.success} size={14} strokeWidth={2.5} />
                  </View>
                  <View style={styles.positionInfo}>
                    <Text style={[styles.positionName, styles.addNewText]}>
                      Add as Day {nextDayNumber}
                    </Text>
                    <Text style={[styles.positionHint, themedStyles.positionHint]}>
                      Add at the end of the program
                    </Text>
                  </View>
                  <CheckIcon color={Colors.success} size={18} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* Cancel Button */}
            <TouchableOpacity style={[styles.cancelButton, themedStyles.cancelButton]} onPress={handleCancel}>
              <Text style={[styles.cancelButtonText, themedStyles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayHeavy,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#222222',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  modalContent: {
    padding: Spacing.xl,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  positionList: {
    maxHeight: 280,
    marginBottom: Spacing.lg,
  },
  positionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  addNewOption: {
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  positionBadge: {
    minWidth: 48,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  positionBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  positionInfo: {
    flex: 1,
    gap: 2,
  },
  positionName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addNewText: {
    color: Colors.success,
  },
  positionHint: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cancelButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
