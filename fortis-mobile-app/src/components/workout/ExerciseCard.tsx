import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { SetRow } from './SetRow';
import * as Haptics from 'expo-haptics';

interface ExerciseCardProps {
  exerciseLocalId: string;
}

export function ExerciseCard({ exerciseLocalId }: ExerciseCardProps) {
  const activeSession = useWorkoutStore(s => s.activeSession);
  const removeExercise = useWorkoutStore(s => s.removeExercise);
  const updateExerciseNotes = useWorkoutStore(s => s.updateExerciseNotes);
  const addSet = useWorkoutStore(s => s.addSet);

  const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);

  if (!exercise) return null;

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeExercise(exerciseLocalId);
  };

  const handleAddSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addSet(exerciseLocalId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Exercise Header */}
        <View style={styles.header}>
          <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
          <Pressable
            onPress={handleRemove}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed
            ]}
          >
            <Trash2 size={20} color={Colors.textSecondary} strokeWidth={2} />
          </Pressable>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
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
  deleteButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  notesInput: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  setsTable: {
    gap: Spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  headerText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  setCol: {
    width: 40,
  },
  previousCol: {
    width: 65,
  },
  weightCol: {
    width: 70,
  },
  repsCol: {
    width: 70,
  },
  checkCol: {
    flex: 1,
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
