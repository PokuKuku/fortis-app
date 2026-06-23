import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { responsiveValue, moderateScale } from '@/src/utils/responsive';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { AccentShadowCard } from '@/src/components/ui/AccentShadowCard';
import { useLastExercisePerformance } from '@/src/hooks/useLastExercisePerformance';
import { SetRow } from './SetRow';
import { ExerciseKebabPopover } from './ExerciseKebabPopover';
import { ExerciseTargetSheet } from './ExerciseTargetSheet';
import { buildRepRangeProgressionSuggestion, parseRepRange } from '@/src/utils/workoutProgression';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  Easing,
  LinearTransition,
  SlideOutLeft,
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
  deferStickyNoteSave?: boolean;
  showCheckboxes?: boolean;
  onReplace?: (exerciseLocalId: string) => void;
  onViewDetails?: (exerciseId: string) => void;
  onVoiceLog?: (exerciseLocalId: string) => void;
  onMoveUp?: (exerciseLocalId: string) => void;
  onMoveDown?: (exerciseLocalId: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  completedSetTint?: 'accent' | 'success';
  shouldAnchorVoiceButton?: boolean;
  shouldAnchorSetTarget?: boolean;
}

export function ExerciseCard({
  exerciseLocalId,
  useEditor = false,
  deferStickyNoteSave = false,
  showCheckboxes,
  onReplace,
  onViewDetails,
  onVoiceLog,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  completedSetTint = 'accent',
  shouldAnchorVoiceButton = false,
  shouldAnchorSetTarget = false,
}: ExerciseCardProps) {
  const { colors, isDark } = useTheme();
  const { isTourActive, activeStepId } = useInAppTour();

  // Dynamic theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: isDark ? colors.surfaceOverlay : 'rgba(255, 255, 255, 0.85)',
      borderColor: isDark ? colors.borderLight : 'rgba(0, 0, 0, 0.08)',
    },
    voiceButton: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
    },
    exerciseName: { color: colors.textPrimary },
    targetSummary: { color: colors.accent },
    notesInput: { color: colors.textPrimary },
    headerDivider: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
    },
    headerText: { color: colors.textSecondary },
    addSetLine: { backgroundColor: colors.accentBorder },
    addSetText: { color: colors.accent },
    reorderButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    reorderButtonPressed: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
    },
  };

  // Determine if checkboxes should be shown (defaults to !useEditor for backwards compatibility)
  const shouldShowCheckboxes = showCheckboxes ?? !useEditor;
  // Use editor session or active session based on mode
  const session = useWorkoutStore(s => useEditor ? s.editorSession : s.activeSession);
  const removeExercise = useWorkoutStore(s => useEditor ? s.removeEditorExercise : s.removeExercise);
  const updateExerciseNotes = useWorkoutStore(s => useEditor ? s.updateEditorExerciseNotes : s.updateExerciseNotes);
  const updateExerciseTarget = useWorkoutStore(s => useEditor ? s.updateEditorExerciseTarget : s.updateExerciseTarget);
  const updateEditorSet = useWorkoutStore(s => s.updateEditorSet);
  const toggleWeightUnit = useWorkoutStore(s => s.toggleWeightUnit);
  const addSet = useWorkoutStore(s => useEditor ? s.addEditorSet : s.addSet);
  const stickyNotes = useWorkoutStore(s => s.stickyNotes);
  const editorStickyNotesDraft = useWorkoutStore(s => s.editorStickyNotesDraft);
  const setStickyNote = useWorkoutStore(s => s.setStickyNote);
  const setEditorStickyNoteDraft = useWorkoutStore(s => s.setEditorStickyNoteDraft);
  const weightUnits = useWorkoutStore(s => s.weightUnits);
  const registerWorkoutOverlay = useWorkoutStore(s => s.registerWorkoutOverlay);
  const unregisterWorkoutOverlay = useWorkoutStore(s => s.unregisterWorkoutOverlay);

  const [showKebab, setShowKebab] = useState(false);
  const [showStickyNoteInput, setShowStickyNoteInput] = useState(false);
  const [showTargetSheet, setShowTargetSheet] = useState(false);
  const [stickyNoteValue, setStickyNoteValue] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [kebabPosition, setKebabPosition] = useState({ top: 0, left: 0 });
  const kebabRef = useRef<View>(null);
  const stickyNoteInputRef = useRef<TextInput>(null);
  const notesInputRef = useRef<TextInput>(null);
  const isKebabOpenRef = useRef(false);
  const stickyNoteValueRef = useRef('');
  const stickyNoteFromStoreRef = useRef('');
  const stickyNoteEditingRef = useRef(false);
  const shouldDeferStickyNoteSave = useEditor && deferStickyNoteSave;

  const exercise = session?.exercises.find(e => e.localId === exerciseLocalId);
  const stickyNote = exercise
    ? (
      shouldDeferStickyNoteSave
        ? (editorStickyNotesDraft[exercise.exerciseId] ?? stickyNotes[exercise.exerciseId])
        : stickyNotes[exercise.exerciseId]
    )
    : undefined;
  const weightUnit = exercise ? (weightUnits[exercise.exerciseId] || 'lbs') : 'lbs';
  const exerciseId = exercise?.exerciseId;
  const targetRange = parseRepRange(exercise?.targetReps);
  const targetSummary = exercise && targetRange
    ? `${exercise.sets.length} ${exercise.sets.length === 1 ? 'set' : 'sets'} x ${targetRange.min} - ${targetRange.max} reps`
    : null;

  useEffect(() => {
    stickyNoteValueRef.current = stickyNoteValue;
  }, [stickyNoteValue]);

  useEffect(() => {
    stickyNoteFromStoreRef.current = stickyNote || '';
  }, [stickyNote]);

  useEffect(() => {
    return () => {
      if (!stickyNoteEditingRef.current || !exerciseId) return;
      const trimmed = stickyNoteValueRef.current.trim();
      if (trimmed !== stickyNoteFromStoreRef.current) {
        if (shouldDeferStickyNoteSave) {
          setEditorStickyNoteDraft(exerciseId, trimmed);
        } else {
          void setStickyNote(exerciseId, trimmed);
        }
      }
    };
  }, [exerciseId, setStickyNote, setEditorStickyNoteDraft, shouldDeferStickyNoteSave]);

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
  const progressionSuggestion = useMemo(() => {
    if (!exercise || !lastPerformance) return null;
    return buildRepRangeProgressionSuggestion(
      exercise.targetReps,
      exercise.sets,
      lastPerformance.sets
    );
  }, [exercise, lastPerformance]);

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

  const handleVoiceLog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onVoiceLog?.(exerciseLocalId);
  };

  const handleMoveUp = () => {
    if (!canMoveUp) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMoveUp?.(exerciseLocalId);
  };

  const handleMoveDown = () => {
    if (!canMoveDown) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMoveDown?.(exerciseLocalId);
  };

  const handleOpenStickyNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStickyNoteValue(stickyNote || '');
    stickyNoteEditingRef.current = true;
    setShowStickyNoteInput(true);
    // Focus the input after state update
    setTimeout(() => stickyNoteInputRef.current?.focus(), 100);
  };

  const handleStickyNoteBlur = () => {
    const trimmed = stickyNoteValue.trim();
    stickyNoteEditingRef.current = false;
    if (trimmed !== (stickyNote || '')) {
      if (shouldDeferStickyNoteSave) {
        setEditorStickyNoteDraft(exercise.exerciseId, trimmed);
      } else {
        void setStickyNote(exercise.exerciseId, trimmed);
      }
    }
    if (!trimmed) {
      setShowStickyNoteInput(false);
    }
  };

  const handleRemoveStickyNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stickyNoteEditingRef.current = false;
    if (shouldDeferStickyNoteSave) {
      setEditorStickyNoteDraft(exercise.exerciseId, '');
    } else {
      void setStickyNote(exercise.exerciseId, '');
    }
    setStickyNoteValue('');
    setShowStickyNoteInput(false);
  };

  const handleOpenNotes = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowNotesInput(true);
    setTimeout(() => notesInputRef.current?.focus(), 100);
  };

  const handleOpenTargetSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTargetSheet(true);
  };

  const handleSaveTarget = (target: { sets: number; minReps: number; maxReps: number; startingWeight?: number | null }) => {
    updateExerciseTarget(exerciseLocalId, target);
    if (useEditor && target.startingWeight !== undefined) {
      const updatedExercise = useWorkoutStore.getState().editorSession?.exercises
        .find((item) => item.localId === exerciseLocalId);
      updatedExercise?.sets.forEach((set) => {
        updateEditorSet(exerciseLocalId, set.localId, { weight: target.startingWeight });
      });
    }
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

  const shouldAnchorVoiceLog = isTourActive && activeStepId === 'open_voice_log' && shouldAnchorVoiceButton;
  const isSetTargetTourStep = isTourActive && activeStepId === 'set_target' && shouldAnchorSetTarget;
  const renderVoiceButton = () => (
    <Pressable
      onPress={handleVoiceLog}
      style={({ pressed }) => [
        styles.voiceButton,
        themedStyles.voiceButton,
        pressed && styles.pressed,
      ]}
    >
      <MicrophoneIcon size={18} color={colors.accent} strokeWidth={2.1} />
    </Pressable>
  );

  return (
    <AccentShadowCard
      radius={BorderRadius['2xl']}
      pressable={false}
      style={styles.cardShadowFrame}
    >
      <Animated.View
        style={[styles.container, themedStyles.container]}
        layout={LinearTransition.duration(250).easing(Easing.inOut(Easing.cubic))}
        entering={FadeIn.duration(300).easing(Easing.out(Easing.cubic))
          .delay(50)}
        exiting={SlideOutLeft.duration(220).easing(Easing.inOut(Easing.cubic))}
      >
      <View style={styles.content}>
        {/* Exercise Header */}
        <View style={styles.header}>
          <View style={styles.exerciseTitleGroup}>
            <Text style={[styles.exerciseName, themedStyles.exerciseName]}>
              {exercise.exerciseName}
            </Text>
            {targetSummary && (
              isSetTargetTourStep ? (
                <TourAnchor id={TOUR_ANCHOR_IDS.setTarget}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit target for ${exercise.exerciseName}`}
                    accessibilityHint="Opens set and rep target controls"
                    onPress={handleOpenTargetSheet}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    style={({ pressed }) => pressed && styles.targetSummaryPressed}
                  >
                    <Text style={[styles.targetSummary, themedStyles.targetSummary]} numberOfLines={2}>
                      {targetSummary}
                    </Text>
                  </Pressable>
                </TourAnchor>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit target for ${exercise.exerciseName}`}
                  accessibilityHint="Opens set and rep target controls"
                  onPress={handleOpenTargetSheet}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  style={({ pressed }) => pressed && styles.targetSummaryPressed}
                >
                  <Text style={[styles.targetSummary, themedStyles.targetSummary]} numberOfLines={2}>
                    {targetSummary}
                  </Text>
                </Pressable>
              )
            )}
          </View>
          <View style={styles.headerActions}>
            {useEditor && onMoveUp && onMoveDown && (
              <View style={styles.reorderActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Move ${exercise.exerciseName} up`}
                  onPress={handleMoveUp}
                  disabled={!canMoveUp}
                  style={({ pressed }) => [
                    styles.reorderButton,
                    themedStyles.reorderButton,
                    !canMoveUp && styles.reorderButtonDisabled,
                    pressed && canMoveUp && themedStyles.reorderButtonPressed,
                  ]}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <ChevronUpIcon size={16} color={colors.textSecondary} strokeWidth={2} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Move ${exercise.exerciseName} down`}
                  onPress={handleMoveDown}
                  disabled={!canMoveDown}
                  style={({ pressed }) => [
                    styles.reorderButton,
                    themedStyles.reorderButton,
                    !canMoveDown && styles.reorderButtonDisabled,
                    pressed && canMoveDown && themedStyles.reorderButtonPressed,
                  ]}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <ChevronDownIcon size={16} color={colors.textSecondary} strokeWidth={2} />
                </Pressable>
              </View>
            )}

            {!useEditor && onVoiceLog && (
              shouldAnchorVoiceLog
                ? (
                  <TourAnchor id={TOUR_ANCHOR_IDS.voiceLog}>
                    {renderVoiceButton()}
                  </TourAnchor>
                )
                : renderVoiceButton()
            )}

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
                stickyNoteEditingRef.current = true;
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
              suggestedPerformance={progressionSuggestion}
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
        onEditTarget={handleOpenTargetSheet}
        hasStickyNote={!!stickyNote}
        onAddNote={handleOpenNotes}
        hasNote={!!exercise.notes}
        position={kebabPosition}
      />
      <ExerciseTargetSheet
        visible={showTargetSheet}
        exercise={exercise}
        onClose={() => setShowTargetSheet(false)}
        onSave={handleSaveTarget}
        editorMode={useEditor}
        weightUnit={weightUnit}
        onToggleWeightUnit={() => {
          if (exercise) void toggleWeightUnit(exercise.exerciseId);
        }}
      />
      </Animated.View>
    </AccentShadowCard>
  );
}

const styles = StyleSheet.create({
  cardShadowFrame: {
    marginBottom: Spacing.xl,
  },
  container: {
    backgroundColor: Colors.surfaceOverlay,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    overflow: 'visible', // Allow popover to overflow
  },
  content: {
    padding: CONTENT_PADDING,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  exerciseName: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: EXERCISE_NAME_SIZE,
    lineHeight: Math.round(EXERCISE_NAME_SIZE * 1.35),
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: EXERCISE_NAME_LETTER_SPACING,
  },
  exerciseTitleGroup: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: 4,
  },
  targetSummary: {
    fontSize: moderateScale(FontSizes.sm),
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  targetSummaryPressed: {
    opacity: 0.65,
  },
  kebabButton: {
    padding: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  reorderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginRight: Spacing.xs,
  },
  reorderButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  reorderButtonDisabled: {
    opacity: 0.4,
  },
  voiceButton: {
    width: responsiveValue(34, 36, 38),
    height: responsiveValue(34, 36, 38),
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
