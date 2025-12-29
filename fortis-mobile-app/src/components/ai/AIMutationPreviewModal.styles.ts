import { StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Spacing, BorderRadius } from '../../../constants/Sizes';
import { Typography } from '../../../constants/Typography';
import { ThemeColors } from '@/src/contexts/ThemeContext';

/**
 * Dynamic theme-aware styles for AI Mutation Preview Modal
 * Call this in component body with useTheme() values
 */
export const getThemedStyles = (colors: ThemeColors, isDark: boolean) => ({
  // Text colors
  headerTitle: { color: colors.textPrimary },
  summaryTitle: { color: colors.accent },
  summaryExplanation: { color: colors.textSecondary },
  sectionTitle: { color: colors.textSecondary },
  mutationDescription: { color: colors.textPrimary },
  mutationMeta: { color: colors.textTertiary },
  inputLabel: { color: colors.textSecondary },
  metaInput: {
    color: colors.textPrimary,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  workoutNameInput: {
    color: colors.textPrimary,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  workoutDayLabel: { color: colors.textTertiary },
  workoutDayInput: {
    color: colors.textPrimary,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  },
  exerciseFieldLabel: { color: colors.textTertiary },
  exerciseFieldInput: {
    color: colors.textPrimary,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  setInput: {
    color: colors.textPrimary,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  },
  programExerciseName: { color: colors.textPrimary },
  exerciseName: { color: colors.textPrimary },
  rejectButtonText: { color: colors.textSecondary },
  confirmPromptTitle: { color: colors.textPrimary },
  confirmPromptBody: { color: colors.textSecondary },
  diffHint: { color: colors.accent },
  setText: { color: colors.textSecondary },
  setHeaderText: { color: colors.textTertiary },
  addSetText: { color: colors.textSecondary },
  addExerciseText: { color: colors.accent },
  newExerciseJustification: { color: colors.textPrimary },
  newExerciseExplanationText: { color: colors.textSecondary },
  pickerTitle: { color: colors.textPrimary },
  searchInput: {
    color: colors.textPrimary,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  },
  exerciseOptionText: { color: colors.textPrimary },
  noResultsText: { color: colors.textTertiary },
  loadingText: { color: colors.textSecondary },
  statsBadgeText: { color: colors.accent },
  exerciseCountText: { color: colors.textSecondary },

  // Glass backgrounds - invert for light mode
  modalContainer: {
    backgroundColor: colors.background,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  },
  header: {
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  headerIconGlow: {
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.12)',
  },
  summary: {
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.06)' : 'rgba(34, 197, 94, 0.04)',
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  statsBadge: {
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.1)',
    borderColor: isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.2)',
  },
  programMetaCard: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.025)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  workoutCard: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.025)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  workoutAccentBar: {
    backgroundColor: colors.accent,
  },
  workoutHeaderBg: {
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.06)' : 'rgba(34, 197, 94, 0.04)',
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  },
  programExerciseCard: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  },
  exerciseCard: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  exerciseHeader: {
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.06)',
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  setTableHeader: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  },
  setRow: {
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  },
  addSetButton: {
    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  },
  addExerciseButton: {
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.06)',
    borderColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.25)',
  },
  mutationItem: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  },
  rejectButton: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    shadowColor: isDark ? '#000' : 'rgba(0, 0, 0, 0.1)',
  },
  actions: {
    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.02)',
    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  },
  pickerHeader: {
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  searchContainer: {
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  newExerciseExplanation: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  },
  dragHandle: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)',
  },
  exerciseOptionHover: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  },
});

export const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayHeavy,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
    height: '90%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: Spacing.sm,
  },
  headerIconContainer: {
    position: 'relative',
  },
  headerIconGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    top: -4,
    left: -4,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 36, // Match headerIcon width for centered title
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  statsBadgeText: {
    ...Typography.label,
    color: Colors.success,
  },
  summaryTitle: {
    ...Typography.h5,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  summaryExplanation: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  mutationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  mutationIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutationContent: {
    flex: 1,
  },
  mutationDescription: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  mutationMeta: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  newExercise: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    padding: Spacing.md,
  },
  newExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  newExerciseTitle: {
    ...Typography.label,
    color: Colors.warning,
  },
  newExerciseJustification: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  newExerciseExplanation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  newExerciseExplanationText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  // Cancel button - refined glass secondary style
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    // Layered glass effect
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BorderRadius.xl,
    // Double border technique for depth
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    minWidth: 120,
    minHeight: 54,
    // Subtle shadow for lift
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  rejectButtonText: {
    ...Typography.button,
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  // Create button - enhanced prominence
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    minHeight: 54,
    // Enhanced shadow for prominence
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  confirmButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Icon container for the confirm button
  confirmButtonIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPrompt: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.35)',
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  confirmPromptTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  confirmPromptBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Editable workout styles
  editableContainer: {
    gap: Spacing.lg,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    // backgroundColor uses colors.accentOverlay via inline styles
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: Spacing.sm,
  },
  exerciseNameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exerciseName: {
    ...Typography.label,
    color: Colors.textPrimary,
    flex: 1,
  },
  deleteExerciseButton: {
    padding: Spacing.xs,
  },
  setTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  setHeaderText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  setColumn: {
    width: 36,
    textAlign: 'center',
  },
  repsColumn: {
    flex: 1,
    textAlign: 'center',
  },
  weightColumn: {
    flex: 1.5,
    textAlign: 'center',
  },
  deleteColumn: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  setText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  setInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    textAlign: 'center',
    marginHorizontal: Spacing.xs,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  addSetText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    // backgroundColor uses colors.accentOverlay via inline styles
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    // borderColor uses colors.accentBorder via inline styles
    borderColor: 'rgba(34, 197, 94, 0.2)',
    borderStyle: 'dashed',
    paddingVertical: Spacing.md,
  },
  addExerciseText: {
    ...Typography.button,
    // color uses colors.accent via inline styles
    color: Colors.success,
  },

  // Program draft styles
  programDraftContainer: {
    gap: Spacing.lg,
  },
  programMetaCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  metaInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  metaTextarea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaField: {
    flex: 1,
    gap: Spacing.xs,
  },
  workoutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  workoutAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  workoutHeaderContainer: {
    padding: Spacing.md,
    paddingLeft: Spacing.lg,
    borderBottomWidth: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  workoutExercisesContainer: {
    padding: Spacing.md,
    paddingLeft: Spacing.lg,
    gap: Spacing.md,
  },
  workoutNameInput: {
    flex: 1,
    ...Typography.label,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  workoutDayContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  workoutDayLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  workoutDayInput: {
    width: 44,
    ...Typography.label,
    color: Colors.textPrimary,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
  },
  diffHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: -Spacing.xs,
  },
  exerciseList: {
    gap: Spacing.sm,
  },
  programExerciseCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  programExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  programExerciseNameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginLeft: -Spacing.sm,
  },
  programExerciseName: {
    ...Typography.label,
    color: Colors.textPrimary,
    flex: 1,
  },
  invalidExerciseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  invalidExerciseText: {
    ...Typography.caption,
    color: Colors.warning,
  },
  exerciseFieldRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  exerciseField: {
    flex: 1,
    gap: Spacing.xs,
  },
  exerciseFieldLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  exerciseFieldInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  newExerciseInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  newExerciseInlineText: {
    ...Typography.caption,
    color: Colors.warning,
  },
  newExerciseNotes: {
    gap: Spacing.xs,
  },

  // Exercise Picker Modal styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayHeavy,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  pickerContainer: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '70%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  pickerTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  exercisePickerList: {
    flex: 1,
  },
  exercisePickerContent: {
    padding: Spacing.sm,
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  exerciseOptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  noResultsText: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  loadingState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  errorBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    ...Typography.body,
    color: Colors.error,
  },
  errorBannerHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
});
