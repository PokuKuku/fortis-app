import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { SetRow } from './SetRow';
import { ExerciseKebabPopover } from './ExerciseKebabPopover';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  Easing,
} from 'react-native-reanimated';

interface ExerciseCardProps {
  exerciseLocalId: string;
  onReplace?: (exerciseLocalId: string) => void;
  onViewDetails?: (exerciseId: string) => void;
}

export function ExerciseCard({
  exerciseLocalId,
  onReplace,
  onViewDetails,
}: ExerciseCardProps) {
  const activeSession = useWorkoutStore(s => s.activeSession);
  const removeExercise = useWorkoutStore(s => s.removeExercise);
  const updateExerciseNotes = useWorkoutStore(s => s.updateExerciseNotes);
  const addSet = useWorkoutStore(s => s.addSet);

  const [showKebab, setShowKebab] = useState(false);
  const [kebabPosition, setKebabPosition] = useState({ top: 0, left: 0 });
  const kebabRef = useRef<View>(null);

  const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);

  if (!exercise) return null;

  const handleKebabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    kebabRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setKebabPosition({
        top: pageY + height + 4,
        left: pageX - 130, // Position popover to the left of the button
      });
      setShowKebab(true);
    });
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeExercise(exerciseLocalId);
  };

  const handleReplace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReplace?.(exerciseLocalId);
  };

  const handleViewDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewDetails?.(exercise.exerciseId);
  };

  const handleAddSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addSet(exerciseLocalId);
  };

  return (
    <Animated.View
      style={styles.container}
      entering={FadeIn.duration(300).easing(Easing.out(Easing.cubic))
        .delay(50)}
      exiting={FadeOut.duration(250).easing(Easing.in(Easing.cubic))}
      layout={Layout.duration(300).easing(Easing.inOut(Easing.cubic))}
    >
      <View style={styles.content}>
        {/* Exercise Header */}
        <View style={styles.header}>
          <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
          <View ref={kebabRef} collapsable={false}>
            <Pressable
              onPress={handleKebabPress}
              style={({ pressed }) => [
                styles.kebabButton,
                pressed && styles.pressed
              ]}
            >
              <MoreVertical size={20} color={Colors.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        {/* Notes Input */}
        <TextInput
          value={exercise.notes || ''}
          onChangeText={(text) => updateExerciseNotes(exerciseLocalId, text)}
          placeholder="Add notes..."
          placeholderTextColor={Colors.textTertiary}
          style={styles.notesInput}
        />

        {/* Sets Table */}
        <View style={styles.setsTable}>
          {/* Header Row */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.setCol]}>Set</Text>
            <Text style={[styles.headerText, styles.previousCol]}>Previous</Text>
            <Text style={[styles.headerText, styles.weightCol]}>lbs</Text>
            <Text style={[styles.headerText, styles.repsCol]}>Reps</Text>
            <View style={styles.checkCol} />
          </View>

          {/* Set Rows */}
          {exercise.sets.map((set, index) => (
            <SetRow
              key={set.localId}
              exerciseLocalId={exerciseLocalId}
              setLocalId={set.localId}
              setIndex={index}
              previousSet={index > 0 ? exercise.sets[index - 1] : undefined}
            />
          ))}
        </View>

        {/* Add Set Button */}
        <Pressable
          onPress={handleAddSet}
          style={({ pressed }) => [
            styles.addSetButton,
            pressed && styles.pressed
          ]}
        >
          <Text style={styles.addSetText}>+ Add Set</Text>
        </Pressable>
      </View>

      {/* Kebab Popover */}
      <ExerciseKebabPopover
        visible={showKebab}
        onClose={() => setShowKebab(false)}
        onDelete={handleDelete}
        onReplace={handleReplace}
        onViewDetails={handleViewDetails}
        position={kebabPosition}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'visible', // Allow popover to overflow
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  kebabButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  notesInput: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  setsTable: {
    gap: Spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
    paddingRight: Spacing.xs,
  },
  headerText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  setCol: {
    width: 32,
  },
  previousCol: {
    width: 65,
  },
  weightCol: {
    width: 60,
  },
  repsCol: {
    width: 60,
  },
  checkCol: {
    width: 32,
    marginLeft: Spacing.md,
  },
  addSetButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  addSetText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.success,
  },
});
