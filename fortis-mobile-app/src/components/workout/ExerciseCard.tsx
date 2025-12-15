import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { MoreVertical, StickyNote, X } from 'lucide-react-native';
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
  const stickyNotes = useWorkoutStore(s => s.stickyNotes);
  const setStickyNote = useWorkoutStore(s => s.setStickyNote);

  const [showKebab, setShowKebab] = useState(false);
  const [showStickyNoteInput, setShowStickyNoteInput] = useState(false);
  const [stickyNoteValue, setStickyNoteValue] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [kebabPosition, setKebabPosition] = useState({ top: 0, left: 0 });
  const kebabRef = useRef<View>(null);
  const stickyNoteInputRef = useRef<TextInput>(null);
  const notesInputRef = useRef<TextInput>(null);

  const exercise = activeSession?.exercises.find(e => e.localId === exerciseLocalId);
  const stickyNote = exercise ? stickyNotes[exercise.exerciseId] : undefined;

  if (!exercise) return null;

  const handleKebabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    kebabRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setKebabPosition({
        top: pageY + height + 4,
        left: pageX + width - 170, // Align popover's right edge with button's right edge
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

  const handleOpenStickyNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStickyNoteValue(stickyNote || '');
    setShowStickyNoteInput(true);
    // Focus the input after state update
    setTimeout(() => stickyNoteInputRef.current?.focus(), 100);
  };

  const handleStickyNoteBlur = () => {
    const trimmed = stickyNoteValue.trim();
    if (trimmed !== (stickyNote || '')) {
      setStickyNote(exercise.exerciseId, trimmed);
    }
    if (!trimmed) {
      setShowStickyNoteInput(false);
    }
  };

  const handleRemoveStickyNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStickyNote(exercise.exerciseId, '');
    setStickyNoteValue('');
    setShowStickyNoteInput(false);
  };

  const handleOpenNotes = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowNotesInput(true);
    setTimeout(() => notesInputRef.current?.focus(), 100);
  };

  const handleNotesBlur = () => {
    if (!exercise.notes) {
      setShowNotesInput(false);
    }
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

        {/* Sticky Note - Inline Editable */}
        {(stickyNote || showStickyNoteInput) && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.stickyNoteBanner}
          >
            <StickyNote size={14} color="#60a5fa" strokeWidth={2} style={styles.stickyNoteIcon} />
            <TextInput
              ref={stickyNoteInputRef}
              value={showStickyNoteInput ? stickyNoteValue : stickyNote}
              onChangeText={setStickyNoteValue}
              onFocus={() => {
                setStickyNoteValue(stickyNote || '');
                setShowStickyNoteInput(true);
              }}
              onBlur={handleStickyNoteBlur}
              placeholder="Add a persistent note..."
              placeholderTextColor="rgba(96, 165, 250, 0.5)"
              style={styles.stickyNoteInput}
              multiline
            />
            {(stickyNote || stickyNoteValue) && (
              <Pressable
                onPress={handleRemoveStickyNote}
                style={({ pressed }) => [
                  styles.removeStickyNoteButton,
                  pressed && styles.pressed,
                ]}
              >
                <X size={14} color="#60a5fa" strokeWidth={2.5} />
              </Pressable>
            )}
          </Animated.View>
        )}

        {/* Notes Input - Only show when has content or triggered from kebab */}
        {(exercise.notes || showNotesInput) && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
          >
            <TextInput
              ref={notesInputRef}
              value={exercise.notes || ''}
              onChangeText={(text) => updateExerciseNotes(exerciseLocalId, text)}
              onBlur={handleNotesBlur}
              placeholder="Add notes..."
              placeholderTextColor={Colors.textTertiary}
              style={styles.notesInput}
              multiline
            />
          </Animated.View>
        )}

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
          <View style={styles.addSetLine} />
          <Text style={styles.addSetText}>+ Add Set</Text>
          <View style={styles.addSetLine} />
        </Pressable>
      </View>

      {/* Kebab Popover */}
      <ExerciseKebabPopover
        visible={showKebab}
        onClose={() => setShowKebab(false)}
        onDelete={handleDelete}
        onReplace={handleReplace}
        onViewDetails={handleViewDetails}
        onStickyNote={handleOpenStickyNote}
        hasStickyNote={!!stickyNote}
        onAddNote={handleOpenNotes}
        hasNote={!!exercise.notes}
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
    fontSize: 19,
    fontFamily: 'BankGothic',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  setCol: {
    width: 36,
  },
  previousCol: {
    width: 80,
  },
  weightCol: {
    width: 52,
  },
  repsCol: {
    width: 52,
    marginLeft: Spacing.md,
  },
  checkCol: {
    width: 36,
    marginLeft: Spacing.lg,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  addSetLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
  addSetText: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothic',
    color: Colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stickyNoteBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  stickyNoteIcon: {
    marginTop: 3,
  },
  stickyNoteInput: {
    flex: 1,
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: '#60a5fa',
    padding: 0,
    margin: 0,
  },
  removeStickyNoteButton: {
    padding: 2,
    marginTop: 1,
  },
});
