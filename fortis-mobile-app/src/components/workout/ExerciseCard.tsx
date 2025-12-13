import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/store/workoutStore';
import { LinearGradient } from 'expo-linear-gradient';
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
      {/* Glass morphism gradient background */}
      <LinearGradient
        colors={['#454545', '#303030']}
        style={StyleSheet.absoluteFillObject}
      />

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
            <Text style={[styles.headerText, styles.rpeCol]}>RPE</Text>
            <View style={styles.checkCol} />
          </View>

          {/* Set Rows - Phase 3 will implement full SetRow component */}
          {exercise.sets.map((set, index) => (
            <View key={set.localId} style={styles.setRowPlaceholder}>
              <Text style={styles.placeholderText}>
                Set {index + 1} • Phase 3 will implement full SetRow component
              </Text>
            </View>
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
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: Spacing.md,
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
    color: Colors.success,
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
    width: 60,
  },
  repsCol: {
    width: 55,
  },
  rpeCol: {
    width: 50,
  },
  checkCol: {
    flex: 1,
  },
  setRowPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  placeholderText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
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
