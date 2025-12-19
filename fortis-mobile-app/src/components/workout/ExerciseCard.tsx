import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { EllipsisVerticalIcon, DocumentTextIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useLastExercisePerformance } from '@/src/hooks/useLastExercisePerformance';
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
  const weightUnits = useWorkoutStore(s => s.weightUnits);

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
  const weightUnit = exercise ? (weightUnits[exercise.exerciseId] || 'lbs') : 'lbs';

  // Fetch last performance for this exercise from previous sessions
  const { lastPerformance } = useLastExercisePerformance(exercise?.exerciseId);

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
              <EllipsisVerticalIcon size={20} color={Colors.textSecondary} strokeWidth={2} />
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
            <DocumentTextIcon size={14} color="#60a5fa" strokeWidth={2} style={styles.stickyNoteIcon} />
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
                <XMarkIcon size={14} color="#60a5fa" strokeWidth={2} />
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
            <Text style={[styles.headerText, styles.previousCol]}>Prev</Text>
            <Text style={[styles.headerText, styles.weightCol]}>{weightUnit}</Text>
            <Text style={[styles.headerText, styles.repsCol]}>Reps</Text>
            <View style={styles.checkCol} />
          </View>

          {/* Header Divider */}
          <View style={styles.headerDivider} />

          {/* Set Rows */}
          {exercise.sets.map((set, index) => (
            <SetRow
              key={set.localId}
              exerciseLocalId={exerciseLocalId}
              setLocalId={set.localId}
              setIndex={index}
              previousSet={index > 0 ? exercise.sets[index - 1] : undefined}
              lastPerformance={lastPerformance}
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
    backgroundColor: Colors.surfaceOverlay,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    overflow: 'visible', // Allow popover to overflow
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    flex: 1,
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicMediumBT',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kebabButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  pressed: {
    opacity: 0.7,
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
    overflow: 'visible',
  },
  tableHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: Spacing.xs,
  },
  headerText: {
    fontSize: 13,
    fontFamily: 'BankGothicMediumBT',
    color: Colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setCol: {
    width: 40,
  },
  previousCol: {
    width: 56,
  },
  weightCol: {
    width: 40,
  },
  repsCol: {
    width: 44,
    marginLeft: Spacing.sm,
  },
  checkCol: {
    width: 32,
    marginLeft: Spacing.md,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  addSetLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.successBorder,
  },
  addSetText: {
    fontSize: FontSizes.sm,
    fontFamily: 'BankGothicMediumBT',
    color: Colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
