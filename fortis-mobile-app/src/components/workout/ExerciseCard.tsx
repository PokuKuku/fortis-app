import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { EllipsisVerticalIcon, DocumentTextIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { responsiveValue, moderateScale } from '@/src/utils/responsive';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useLastExercisePerformance } from '@/src/hooks/useLastExercisePerformance';
import { SetRow } from './SetRow';
import { ExerciseKebabPopover } from './ExerciseKebabPopover';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  Easing,
} from 'react-native-reanimated';

// Responsive sizing to match SetRow
const SET_BADGE_SIZE = responsiveValue(32, 36, 40);
const INPUT_WIDTH = responsiveValue(40, 44, 48);
const CHECKBOX_SIZE = responsiveValue(28, 30, 32);
const CHECKBOX_MARGIN = responsiveValue(Spacing.xs, Spacing.sm, Spacing.md);
const PREV_MIN_WIDTH = responsiveValue(56, 70, 80);
const CONTENT_PADDING = responsiveValue(Spacing.lg, Spacing.xl, Spacing.xl);
const ROW_GAP = responsiveValue(Spacing.xs, Spacing.sm, Spacing.sm);
const COLUMN_PADDING_RIGHT = responsiveValue(Spacing.xs, Spacing.sm, Spacing.sm);
const REPS_MARGIN = responsiveValue(Spacing.xs, Spacing.sm, Spacing.sm);
const HEADER_TEXT_SIZE = moderateScale(13);
const HEADER_LETTER_SPACING = moderateScale(0.5);
const EXERCISE_NAME_SIZE = moderateScale(FontSizes.base);
const EXERCISE_NAME_LETTER_SPACING = moderateScale(0.5);
const NOTES_TEXT_SIZE = moderateScale(FontSizes.base);
const ADD_SET_TEXT_SIZE = moderateScale(FontSizes.sm);
const ADD_SET_LETTER_SPACING = moderateScale(0.8);
const STICKY_NOTE_TEXT_SIZE = moderateScale(FontSizes.base);

interface ExerciseCardProps {
  exerciseLocalId: string;
  useEditor?: boolean;
  showCheckboxes?: boolean;
  onReplace?: (exerciseLocalId: string) => void;
  onViewDetails?: (exerciseId: string) => void;
  completedSetTint?: 'accent' | 'success';
}

export function ExerciseCard({
  exerciseLocalId,
  useEditor = false,
  showCheckboxes,
  onReplace,
  onViewDetails,
  completedSetTint = 'accent',
}: ExerciseCardProps) {
  const { colors, isDark } = useTheme();

  // Dynamic theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: isDark ? colors.surfaceOverlay : 'rgba(255, 255, 255, 0.85)',
      borderColor: isDark ? colors.borderLight : 'rgba(0, 0, 0, 0.08)',
    },
    exerciseName: { color: colors.textPrimary },
    notesInput: { color: colors.textPrimary },
    headerDivider: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
    },
    headerText: { color: colors.textSecondary },
    addSetLine: { backgroundColor: colors.accentBorder },
    addSetText: { color: colors.accent },
  };

  // Determine if checkboxes should be shown (defaults to !useEditor for backwards compatibility)
  const shouldShowCheckboxes = showCheckboxes ?? !useEditor;
  // Use editor session or active session based on mode
  const session = useWorkoutStore(s => useEditor ? s.editorSession : s.activeSession);
  const removeExercise = useWorkoutStore(s => useEditor ? s.removeEditorExercise : s.removeExercise);
  const updateExerciseNotes = useWorkoutStore(s => useEditor ? s.updateEditorExerciseNotes : s.updateExerciseNotes);
  const addSet = useWorkoutStore(s => useEditor ? s.addEditorSet : s.addSet);
  const stickyNotes = useWorkoutStore(s => s.stickyNotes);
  const setStickyNote = useWorkoutStore(s => s.setStickyNote);
  const weightUnits = useWorkoutStore(s => s.weightUnits);
  const registerWorkoutOverlay = useWorkoutStore(s => s.registerWorkoutOverlay);
  const unregisterWorkoutOverlay = useWorkoutStore(s => s.unregisterWorkoutOverlay);

  const [showKebab, setShowKebab] = useState(false);
  const [showStickyNoteInput, setShowStickyNoteInput] = useState(false);
  const [stickyNoteValue, setStickyNoteValue] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [kebabPosition, setKebabPosition] = useState({ top: 0, left: 0 });
  const kebabRef = useRef<View>(null);
  const stickyNoteInputRef = useRef<TextInput>(null);
  const notesInputRef = useRef<TextInput>(null);
  const isKebabOpenRef = useRef(false);

  const exercise = session?.exercises.find(e => e.localId === exerciseLocalId);
  const stickyNote = exercise ? stickyNotes[exercise.exerciseId] : undefined;
  const weightUnit = exercise ? (weightUnits[exercise.exerciseId] || 'lbs') : 'lbs';

  // Fetch last performance for this exercise from previous sessions
  const performanceContext = useMemo(() => ({
    programWorkoutId: session?.programWorkoutId,
    programId: session?.programId,
    workoutName: session?.name,
  }), [session?.programWorkoutId, session?.programId, session?.name]);

  const { lastPerformance } = useLastExercisePerformance(
    exercise?.exerciseId,
    performanceContext
  );

  useEffect(() => {
    if (showKebab && !isKebabOpenRef.current) {
      registerWorkoutOverlay();
      isKebabOpenRef.current = true;
    } else if (!showKebab && isKebabOpenRef.current) {
      unregisterWorkoutOverlay();
      isKebabOpenRef.current = false;
    }

    return () => {
      if (isKebabOpenRef.current) {
        unregisterWorkoutOverlay();
        isKebabOpenRef.current = false;
      }
    };
  }, [showKebab, registerWorkoutOverlay, unregisterWorkoutOverlay]);

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
      style={[styles.container, themedStyles.container]}
      entering={FadeIn.duration(300).easing(Easing.out(Easing.cubic))
        .delay(50)}
      exiting={FadeOut.duration(250).easing(Easing.in(Easing.cubic))}
    >
      <View style={styles.content}>
        {/* Exercise Header */}
        <View style={styles.header}>
          <Text style={[styles.exerciseName, themedStyles.exerciseName]}>{exercise.exerciseName}</Text>
          <View ref={kebabRef} collapsable={false}>
            <Pressable
              onPress={handleKebabPress}
              style={({ pressed }) => [
                styles.kebabButton,
                pressed && styles.pressed
              ]}
            >
              <EllipsisVerticalIcon size={20} color={colors.textSecondary} strokeWidth={2} />
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
              placeholderTextColor={colors.textTertiary}
              style={[styles.notesInput, themedStyles.notesInput]}
              multiline
            />
          </Animated.View>
        )}

        {/* Sets Table */}
        <View style={styles.setsTable}>
          {/* Header Row */}
          <View style={styles.tableHeader}>
            <Text
              style={[styles.headerText, themedStyles.headerText, styles.setCol]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              allowFontScaling={false}
            >
              Set
            </Text>
            <Text
              style={[styles.headerText, themedStyles.headerText, styles.previousCol]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              allowFontScaling={false}
            >
              Prev
            </Text>
            <Text
              style={[styles.headerText, themedStyles.headerText, styles.weightCol, !shouldShowCheckboxes && styles.flexCol]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              allowFontScaling={false}
            >
              {weightUnit}
            </Text>
            <Text
              style={[styles.headerText, themedStyles.headerText, styles.repsCol, !shouldShowCheckboxes && styles.flexCol]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              allowFontScaling={false}
            >
              Reps
            </Text>
            {shouldShowCheckboxes && <View style={styles.checkCol} />}
          </View>

          {/* Header Divider */}
          <View style={[styles.headerDivider, themedStyles.headerDivider]} />

          {/* Set Rows */}
          {exercise.sets.map((set, index) => (
            <SetRow
              key={set.localId}
              exerciseLocalId={exerciseLocalId}
              setLocalId={set.localId}
              setIndex={index}
              useEditor={useEditor}
              showCheckboxes={shouldShowCheckboxes}
              previousSet={index > 0 ? exercise.sets[index - 1] : undefined}
              lastPerformance={lastPerformance}
              baselinePerformance={exercise.baselinePerformance}
              completedSetTint={completedSetTint}
            />
          ))}
        </View>

        {/* Add Set Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add set"
          accessibilityHint="Adds a set to this exercise"
          onPress={handleAddSet}
          style={({ pressed }) => [
            styles.addSetButton,
            pressed && styles.pressed
          ]}
        >
          <View style={[styles.addSetLine, themedStyles.addSetLine]} />
          <Text style={[styles.addSetText, themedStyles.addSetText]}>+ Add Set</Text>
          <View style={[styles.addSetLine, themedStyles.addSetLine]} />
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
  },
  content: {
    padding: CONTENT_PADDING,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    flex: 1,
    fontSize: EXERCISE_NAME_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: EXERCISE_NAME_LETTER_SPACING,
  },
  kebabButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  notesInput: {
    fontSize: NOTES_TEXT_SIZE,
    fontWeight: '500',
    color: Colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  setsTable: {
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    gap: ROW_GAP,
    paddingBottom: Spacing.sm,
    paddingRight: COLUMN_PADDING_RIGHT,
    paddingLeft: COLUMN_PADDING_RIGHT,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: Spacing.xs,
  },
  headerText: {
    fontSize: HEADER_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: HEADER_LETTER_SPACING,
  },
  setCol: {
    width: SET_BADGE_SIZE,
  },
  previousCol: {
    flex: 1,
    minWidth: PREV_MIN_WIDTH,
  },
  weightCol: {
    width: INPUT_WIDTH,
  },
  repsCol: {
    width: INPUT_WIDTH,
    marginLeft: REPS_MARGIN,
  },
  checkCol: {
    width: CHECKBOX_SIZE,
    marginLeft: CHECKBOX_MARGIN,
  },
  flexCol: {
    flex: 1,
    width: undefined,
    textAlign: 'center',
    marginLeft: 0,
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
    // backgroundColor now applied via themedStyles (colors.accentBorder)
  },
  addSetText: {
    fontSize: ADD_SET_TEXT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    // color now applied via themedStyles (colors.accent)
    textTransform: 'uppercase',
    letterSpacing: ADD_SET_LETTER_SPACING,
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
    fontSize: STICKY_NOTE_TEXT_SIZE,
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
