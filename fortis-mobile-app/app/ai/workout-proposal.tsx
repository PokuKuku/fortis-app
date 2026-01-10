import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography, FontFamily } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAIStore } from '@/src/store/aiStore';
import { useProgramsStore } from '@/src/store/programsStore';
import { useAnalytics } from '@/src/services/analyticsService';
import * as ExerciseService from '@/src/services/exerciseService';
import { PRIMARY_MUSCLES, EQUIPMENT_TYPES } from '@/src/constants/exerciseOptions';
import { ACTIVE_MUSCLE_KEYS, getMuscleDisplayName, normalizeMuscle, type MuscleKey } from '@/src/utils/muscleTaxonomy';
import { AIMutationExercisePickerModal } from '@/src/components/ai/AIMutationExercisePickerModal';
import {
  buildTemplateExercisesFromProposal,
  resolveExerciseQuery,
  ProposalExerciseResolution,
} from '@/src/utils/workoutProposal';
import type { WorkoutProposalSet, WorkoutProposalV1 } from '@/src/types/ai';
import type { Exercise, ExerciseWithSource } from '@/src/types/exercise';

const formatSetSummary = (set: WorkoutProposalSet) => {
  const parts: string[] = [];
  parts.push(`${set.sets} set${set.sets === 1 ? '' : 's'}`);
  if (set.reps_min || set.reps_max) {
    const min = set.reps_min ?? set.reps_max;
    const max = set.reps_max ?? set.reps_min;
    parts.push(min === max ? `${min} reps` : `${min}-${max} reps`);
  }
  if (set.rir !== undefined) parts.push(`RIR ${set.rir}`);
  if (set.rest_sec !== undefined) parts.push(`${set.rest_sec}s rest`);
  if (set.kind) parts.push(set.kind);
  return parts.join(' / ');
};

const parseOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function WorkoutProposalScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { trackAIWorkoutReviewOpened, trackAIWorkoutExerciseResolved, trackAIWorkoutCreated, trackAIWorkoutEditedBeforeCreate } =
    useAnalytics();
  const { messageId, mode } = useLocalSearchParams<{
    messageId?: string;
    mode?: 'review' | 'edit';
  }>();
  const normalizedMessageId = Array.isArray(messageId) ? messageId[0] : messageId;
  const normalizedMode = Array.isArray(mode) ? mode[0] : mode;

  const conversation = useAIStore((state) => state.conversation);
  const loadConversation = useAIStore((state) => state.loadConversation);
  const createWorkoutTemplate = useProgramsStore((state) => state.createWorkoutTemplate);

  const proposalMessage = conversation?.messages.find((msg) => msg.id === normalizedMessageId);
  const proposal = proposalMessage?.workoutProposal;
  const [proposalDraft, setProposalDraft] = useState<WorkoutProposalV1 | null>(null);
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseWithSource[]>([]);
  const [exerciseLoading, setExerciseLoading] = useState(true);
  const [exerciseError, setExerciseError] = useState<string | null>(null);
  const [manualResolutions, setManualResolutions] = useState<Record<number, ExerciseWithSource>>({});
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [customIndex, setCustomIndex] = useState<number | null>(null);
  const [customName, setCustomName] = useState('');
  const [customPrimary, setCustomPrimary] = useState('');
  const [customEquipment, setCustomEquipment] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(normalizedMode === 'edit');
  const [hasEdits, setHasEdits] = useState(normalizedMode === 'edit');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const hasTrackedReview = useRef(false);

  useEffect(() => {
    if (!conversation) {
      loadConversation();
    }
  }, [conversation, loadConversation]);

  useEffect(() => {
    if (proposal) {
      setProposalDraft(JSON.parse(JSON.stringify(proposal)));
    }
  }, [proposal]);

  useEffect(() => {
    if (!proposalDraft || hasTrackedReview.current) return;
    trackAIWorkoutReviewOpened({
      exerciseCount: proposalDraft.exercises.length,
      durationMinutes: proposalDraft.duration_minutes,
    });
    hasTrackedReview.current = true;
  }, [proposalDraft, trackAIWorkoutReviewOpened]);

  useEffect(() => {
    if (normalizedMode === 'edit') {
      setIsEditing(true);
    }
  }, [normalizedMode]);

  const loadExercises = useCallback(async () => {
    try {
      setExerciseLoading(true);
      const data = await ExerciseService.getAllExercises({ includeVariants: true });
      setExerciseLibrary(data);
      setExerciseError(null);
    } catch (error) {
      setExerciseError(error instanceof Error ? error.message : 'Failed to load exercises');
    } finally {
      setExerciseLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExercises();
    const subscription = DeviceEventEmitter.addListener('customExerciseUpsert', () => {
      ExerciseService.invalidateCustomCache();
      loadExercises();
    });
    return () => {
      subscription.remove();
    };
  }, [loadExercises]);

  const baseResolutions = useMemo<ProposalExerciseResolution[]>(() => {
    if (!proposalDraft || exerciseLibrary.length === 0) return [];
    return proposalDraft.exercises.map((exercise) =>
      resolveExerciseQuery(exercise.exercise_query, exerciseLibrary)
    );
  }, [proposalDraft, exerciseLibrary]);

  const resolvedExercises = useMemo<ProposalExerciseResolution[]>(() => {
    if (!proposalDraft) return [];
    return baseResolutions.map((resolution, index) => {
      const manual = manualResolutions[index];
      if (manual) {
        return {
          query: resolution.query,
          status: 'resolved',
          exercise: manual,
        };
      }
      return resolution;
    });
  }, [baseResolutions, manualResolutions, proposalDraft]);

  const canCreate = Boolean(
    proposalDraft &&
      resolvedExercises.length === proposalDraft.exercises.length &&
      resolvedExercises.every((resolution) => resolution.status === 'resolved') &&
      !isCreating
  );

  const handleSelectExercise = useCallback(
    (exerciseId: string, exerciseName: string) => {
      if (pickerIndex === null) return;
      const selected =
        exerciseLibrary.find((exercise) => exercise.id === exerciseId) ||
        ({
          id: exerciseId,
          name: exerciseName,
          primaryMuscles: [],
          secondaryMuscles: [],
          equipment: '',
          category: 'Strength',
          instructions: [],
          images: [],
          source: 'local',
        } as ExerciseWithSource);
      setManualResolutions((prev) => ({ ...prev, [pickerIndex]: selected }));
      setHasEdits(true);
      trackAIWorkoutExerciseResolved({
        exerciseIndex: pickerIndex,
        isCustom: Boolean(selected.isCustom),
      });
      setPickerIndex(null);
    },
    [pickerIndex, exerciseLibrary, trackAIWorkoutExerciseResolved]
  );

  const handlePickCandidate = useCallback(
    (exercise: ExerciseWithSource, index: number) => {
      setManualResolutions((prev) => ({ ...prev, [index]: exercise }));
      setHasEdits(true);
      trackAIWorkoutExerciseResolved({
        exerciseIndex: index,
        isCustom: Boolean(exercise.isCustom),
      });
    },
    [trackAIWorkoutExerciseResolved]
  );

  const openCustomExerciseModal = useCallback(
    (index: number) => {
      if (!proposalDraft) return;
      const target = proposalDraft.exercises[index];
      const defaultName = target.exercise_query;
      const targetMuscle = target.target_muscles?.[0];
      let muscle = '';
      if (targetMuscle) {
        const normalized = normalizeMuscle(targetMuscle);
        muscle = normalized && ACTIVE_MUSCLE_KEYS.includes(normalized) ? normalized : '';
      }
      setCustomName(defaultName);
      setCustomPrimary(muscle);
      setCustomEquipment('');
      setCustomError(null);
      setCustomIndex(index);
    },
    [proposalDraft]
  );

  const handleCreateCustomExercise = useCallback(async () => {
    if (customIndex === null) return;
    if (!customName.trim()) {
      setCustomError('Name is required');
      return;
    }
    if (!customPrimary) {
      setCustomError('Primary muscle is required');
      return;
    }

    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      primaryMuscles: [customPrimary],
      secondaryMuscles: [],
      equipment: customEquipment || 'Bodyweight',
      category: 'Strength',
      instructions: [],
      images: [],
      basedOnExerciseId: null,
    };

    try {
      await ExerciseService.saveCustomExercise(newExercise);
      const exerciseWithSource: ExerciseWithSource = { ...newExercise, source: 'custom', isCustom: true };
      setExerciseLibrary((prev) => [exerciseWithSource, ...prev]);
      setManualResolutions((prev) => ({ ...prev, [customIndex]: exerciseWithSource }));
      setHasEdits(true);
      trackAIWorkoutExerciseResolved({ exerciseIndex: customIndex, isCustom: true });
      DeviceEventEmitter.emit('customExerciseUpsert', newExercise);
      setCustomIndex(null);
      setCustomName('');
      setCustomPrimary('');
      setCustomEquipment('');
      setCustomError(null);
    } catch (error) {
      setCustomError(error instanceof Error ? error.message : 'Unable to save custom exercise');
    }
  }, [customIndex, customName, customPrimary, customEquipment, trackAIWorkoutExerciseResolved]);

  const updateProposalField = useCallback((field: keyof WorkoutProposalV1, value: string) => {
    setProposalDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
    setHasEdits(true);
  }, []);

  const updateExerciseNotes = useCallback((index: number, value: string) => {
    setProposalDraft((prev) => {
      if (!prev) return prev;
      const nextExercises = prev.exercises.map((exercise, idx) =>
        idx === index ? { ...exercise, notes: value } : exercise
      );
      return { ...prev, exercises: nextExercises };
    });
    setHasEdits(true);
  }, []);

  const updateSetField = useCallback(
    (exerciseIndex: number, setIndex: number, field: keyof WorkoutProposalSet, value: string) => {
      setProposalDraft((prev) => {
        if (!prev) return prev;
        const nextExercises = prev.exercises.map((exercise, idx) => {
          if (idx !== exerciseIndex) return exercise;
          const nextSets = exercise.sets.map((set, sIdx) => {
            if (sIdx !== setIndex) return set;
            const parsedValue = parseOptionalNumber(value);
            const nextValue =
              field === 'sets'
                ? Math.min(
                    8,
                    Math.max(
                      1,
                      Number.isFinite(parsedValue ?? NaN) ? (parsedValue as number) : set.sets
                    )
                  )
                : parsedValue;
            return { ...set, [field]: nextValue };
          });
          return { ...exercise, sets: nextSets };
        });
        return { ...prev, exercises: nextExercises };
      });
      setHasEdits(true);
    },
    []
  );

  const handleCreateWorkout = useCallback(async () => {
    if (!proposalDraft || !canCreate) return;
    setIsCreating(true);
    setCreateError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);

    try {
      const exercises = buildTemplateExercisesFromProposal(proposalDraft, resolvedExercises);
      const hasCustomExercise = resolvedExercises.some((resolution) => resolution.exercise?.isCustom);
      const createdId = await createWorkoutTemplate(proposalDraft.title.trim(), exercises, {
        description: proposalDraft.summary,
        isAiCreated: true,
      });

      if (!createdId) {
        setCreateError('Unable to create workout template.');
        setIsCreating(false);
        return;
      }

      trackAIWorkoutCreated({
        exerciseCount: proposalDraft.exercises.length,
        isCustomExercise: hasCustomExercise,
      });
      if (hasEdits) {
        trackAIWorkoutEditedBeforeCreate({ exerciseCount: proposalDraft.exercises.length });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      router.replace({
        pathname: '/(tabs)/index',
        params: {
          highlightWorkoutId: createdId,
        },
      });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Unable to create workout.');
      setIsCreating(false);
    }
  }, [
    proposalDraft,
    canCreate,
    resolvedExercises,
    createWorkoutTemplate,
    trackAIWorkoutCreated,
    trackAIWorkoutEditedBeforeCreate,
    hasEdits,
    router,
  ]);

  const themedStyles = {
    container: { backgroundColor: colors.background },
    header: {
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    metaText: { color: colors.textTertiary },
    infoLabel: { color: colors.textSecondary },
    card: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    setRow: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    textInput: {
      color: colors.textPrimary,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.1)',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    },
    chip: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
    },
    chipText: { color: colors.textSecondary },
    chipActive: {
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentOverlay,
    },
    chipActiveText: { color: colors.accent },
    resolveButton: {
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentOverlay,
    },
    resolveButtonText: { color: colors.accent },
    errorText: { color: Colors.error },
    actionBar: {
      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.75)',
    },
    secondaryButton: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
  };

  if (!proposalDraft) {
    return (
      <View style={[styles.container, themedStyles.container]}>
        <StainlessSteelPattern />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={[styles.header, themedStyles.header]}>
            <Text style={[styles.headerTitle, themedStyles.title]}>Workout proposal</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <XMarkIcon color={colors.textSecondary} size={IconSizes.md} />
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <ExclamationTriangleIcon color={colors.textTertiary} size={32} />
            <Text style={[styles.emptyStateTitle, themedStyles.title]}>
              Proposal not available
            </Text>
            <Text style={[styles.emptyStateBody, themedStyles.subtitle]}>
              Return to chat to request a new workout proposal.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.header, themedStyles.header]}>
          <Text style={[styles.headerTitle, themedStyles.title]}>Workout proposal</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.editButton, themedStyles.secondaryButton]}
              onPress={() => {
                setIsEditing((prev) => !prev);
                if (!isEditing) setHasEdits(true);
              }}
            >
              {isEditing ? (
                <CheckIcon color={colors.textPrimary} size={IconSizes.sm} />
              ) : (
                <PencilIcon color={colors.textPrimary} size={IconSizes.sm} />
              )}
              <Text style={[styles.editButtonText, themedStyles.title]}>
                {isEditing ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <XMarkIcon color={colors.textSecondary} size={IconSizes.md} />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.card, themedStyles.card]}>
              <Text style={[styles.sectionLabel, themedStyles.infoLabel]}>Overview</Text>
              {isEditing ? (
                <>
                  <TextInput
                    style={[styles.titleInput, themedStyles.textInput]}
                    value={proposalDraft.title}
                    onChangeText={(value) => updateProposalField('title', value)}
                    placeholder="Workout title"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <TextInput
                    style={[styles.summaryInput, themedStyles.textInput]}
                    value={proposalDraft.summary ?? ''}
                    onChangeText={(value) => updateProposalField('summary', value)}
                    placeholder="Workout summary"
                    placeholderTextColor={colors.textTertiary}
                    multiline
                  />
                </>
              ) : (
                <>
                  <Text style={[styles.titleText, themedStyles.title]}>{proposalDraft.title}</Text>
                  {proposalDraft.summary ? (
                    <Text style={[styles.summaryText, themedStyles.subtitle]}>
                      {proposalDraft.summary}
                    </Text>
                  ) : null}
                </>
              )}

              <View style={styles.metaRow}>
                <Text style={[styles.metaText, themedStyles.metaText]}>
                  {proposalDraft.exercises.length} exercises
                </Text>
                {proposalDraft.duration_minutes ? (
                  <Text style={[styles.metaText, themedStyles.metaText]}>
                    {proposalDraft.duration_minutes} min
                  </Text>
                ) : null}
                {proposalDraft.days_per_week ? (
                  <Text style={[styles.metaText, themedStyles.metaText]}>
                    {proposalDraft.days_per_week} days/week
                  </Text>
                ) : null}
              </View>

              {proposalDraft.goal_tags && proposalDraft.goal_tags.length > 0 && (
                <View style={styles.chipRow}>
                  {proposalDraft.goal_tags.map((tag) => (
                    <View key={tag} style={[styles.chip, themedStyles.chip]}>
                      <Text style={[styles.chipText, themedStyles.chipText]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {exerciseLoading && (
              <View style={styles.loadingState}>
                <ActivityIndicator color={colors.accent} />
                <Text style={[styles.loadingText, themedStyles.subtitle]}>
                  Loading exercise library...
                </Text>
              </View>
            )}

            {!exerciseLoading && exerciseError && (
              <View style={styles.loadingState}>
                <Text style={[styles.errorText, themedStyles.errorText]}>{exerciseError}</Text>
                <TouchableOpacity
                  style={[styles.resolveButton, themedStyles.resolveButton]}
                  onPress={loadExercises}
                >
                  <Text style={[styles.resolveButtonText, themedStyles.resolveButtonText]}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {proposalDraft.exercises.map((exercise, index) => {
              const resolution = resolvedExercises[index];
              const resolvedExercise = resolution?.exercise;
              const displayName = resolvedExercise?.name ?? exercise.exercise_query;
              const equipment = resolvedExercise?.equipment;
              const primaryMuscle = resolvedExercise?.primaryMuscles?.[0];
              const isResolved = resolution?.status === 'resolved';

              return (
                <View key={`${exercise.exercise_query}-${index}`} style={[styles.card, themedStyles.card]}>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseHeaderText}>
                      <Text style={[styles.exerciseName, themedStyles.title]}>{displayName}</Text>
                      {!isResolved && (
                        <Text style={[styles.exerciseStatus, themedStyles.errorText]}>
                          Needs review
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[styles.resolveButton, themedStyles.resolveButton]}
                      onPress={() => setPickerIndex(index)}
                    >
                      <Text style={[styles.resolveButtonText, themedStyles.resolveButtonText]}>
                        {isResolved ? 'Change' : 'Resolve'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {isResolved && (equipment || primaryMuscle) && (
                    <Text style={[styles.exerciseMeta, themedStyles.subtitle]}>
                      {[equipment, primaryMuscle].filter(Boolean).join(' / ')}
                    </Text>
                  )}

                  {resolution?.status === 'ambiguous' && resolution.candidates && (
                    <View style={styles.candidateRow}>
                      {resolution.candidates.slice(0, 3).map((candidate) => (
                        <TouchableOpacity
                          key={candidate.id}
                          style={[styles.chip, themedStyles.chip]}
                          onPress={() => handlePickCandidate(candidate, index)}
                        >
                          <Text style={[styles.chipText, themedStyles.chipText]}>
                            {candidate.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {resolution?.status === 'missing' && (
                    <TouchableOpacity
                      style={[styles.customExerciseButton, themedStyles.resolveButton]}
                      onPress={() => openCustomExerciseModal(index)}
                    >
                      <PlusIcon color={colors.accent} size={IconSizes.sm} />
                      <Text style={[styles.resolveButtonText, themedStyles.resolveButtonText]}>
                        Create custom exercise
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.setList}>
                    {exercise.sets.map((set, setIndex) => (
                      <View
                        key={`${exercise.exercise_query}-${setIndex}`}
                        style={[styles.setRow, themedStyles.setRow]}
                      >
                        {isEditing ? (
                          <>
                            <View style={styles.setField}>
                              <Text style={[styles.setLabel, themedStyles.metaText]}>Sets</Text>
                              <TextInput
                                style={[styles.setInput, themedStyles.textInput]}
                                value={set.sets?.toString() ?? ''}
                                onChangeText={(value) =>
                                  updateSetField(index, setIndex, 'sets', value)
                                }
                                keyboardType="numeric"
                              />
                            </View>
                            <View style={styles.setField}>
                              <Text style={[styles.setLabel, themedStyles.metaText]}>Reps min</Text>
                              <TextInput
                                style={[styles.setInput, themedStyles.textInput]}
                                value={set.reps_min?.toString() ?? ''}
                                onChangeText={(value) =>
                                  updateSetField(index, setIndex, 'reps_min', value)
                                }
                                keyboardType="numeric"
                              />
                            </View>
                            <View style={styles.setField}>
                              <Text style={[styles.setLabel, themedStyles.metaText]}>Reps max</Text>
                              <TextInput
                                style={[styles.setInput, themedStyles.textInput]}
                                value={set.reps_max?.toString() ?? ''}
                                onChangeText={(value) =>
                                  updateSetField(index, setIndex, 'reps_max', value)
                                }
                                keyboardType="numeric"
                              />
                            </View>
                            <View style={styles.setField}>
                              <Text style={[styles.setLabel, themedStyles.metaText]}>Rest</Text>
                              <TextInput
                                style={[styles.setInput, themedStyles.textInput]}
                                value={set.rest_sec?.toString() ?? ''}
                                onChangeText={(value) =>
                                  updateSetField(index, setIndex, 'rest_sec', value)
                                }
                                keyboardType="numeric"
                              />
                            </View>
                          </>
                        ) : (
                          <Text style={[styles.setText, themedStyles.subtitle]}>
                            {formatSetSummary(set)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>

                  {isEditing ? (
                    <TextInput
                      style={[styles.notesInput, themedStyles.textInput]}
                      value={exercise.notes ?? ''}
                      onChangeText={(value) => updateExerciseNotes(index, value)}
                      placeholder="Notes (optional)"
                      placeholderTextColor={colors.textTertiary}
                      multiline
                    />
                  ) : exercise.notes ? (
                    <Text style={[styles.notesText, themedStyles.subtitle]}>{exercise.notes}</Text>
                  ) : null}
                </View>
              );
            })}

            {(proposalDraft.progression_rule || proposalDraft.safety_notes) && (
              <View style={[styles.card, themedStyles.card]}>
                {proposalDraft.progression_rule && (
                  <>
                    <Text style={[styles.sectionLabel, themedStyles.infoLabel]}>Progression</Text>
                    {isEditing ? (
                      <TextInput
                        style={[styles.notesInput, themedStyles.textInput]}
                        value={proposalDraft.progression_rule}
                        onChangeText={(value) => updateProposalField('progression_rule', value)}
                        multiline
                      />
                    ) : (
                      <Text style={[styles.summaryText, themedStyles.subtitle]}>
                        {proposalDraft.progression_rule}
                      </Text>
                    )}
                  </>
                )}
                {proposalDraft.safety_notes && (
                  <>
                    <Text style={[styles.sectionLabel, themedStyles.infoLabel]}>Safety notes</Text>
                    {isEditing ? (
                      <TextInput
                        style={[styles.notesInput, themedStyles.textInput]}
                        value={proposalDraft.safety_notes}
                        onChangeText={(value) => updateProposalField('safety_notes', value)}
                        multiline
                      />
                    ) : (
                      <Text style={[styles.summaryText, themedStyles.subtitle]}>
                        {proposalDraft.safety_notes}
                      </Text>
                    )}
                  </>
                )}
              </View>
            )}
          </ScrollView>

          <View style={[styles.actionBar, themedStyles.actionBar]}>
            {createError && (
              <Text style={[styles.createError, themedStyles.errorText]}>{createError}</Text>
            )}
            <GlassButton
              style={styles.createButton}
              onPress={handleCreateWorkout}
              disabled={!canCreate}
            >
              <View style={styles.createButtonContent}>
                <CheckIcon color={Colors.white} size={IconSizes.sm} strokeWidth={2.5} />
                <Text style={styles.createButtonText}>
                  {isCreating ? 'Creating...' : 'Create workout'}
                </Text>
              </View>
            </GlassButton>
            {!canCreate && (
              <Text style={[styles.metaText, themedStyles.metaText]}>
                Resolve all exercises before creating
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <AIMutationExercisePickerModal
        visible={pickerIndex !== null}
        onClose={() => setPickerIndex(null)}
        onSelect={handleSelectExercise}
        exercises={exerciseLibrary}
        loadingOverride={exerciseLoading}
        errorOverride={exerciseError ? new Error(exerciseError) : null}
        onRefreshOverride={loadExercises}
      />

      <Modal
        transparent
        visible={customIndex !== null}
        animationType="fade"
        onRequestClose={() => setCustomIndex(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setCustomIndex(null)}
          />
          <View style={[styles.modalCard, themedStyles.card]}>
            <Text style={[styles.modalTitle, themedStyles.title]}>Custom exercise</Text>
            <TextInput
              style={[styles.modalInput, themedStyles.textInput]}
              value={customName}
              onChangeText={setCustomName}
              placeholder="Exercise name"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={[styles.sectionLabel, themedStyles.infoLabel]}>Primary muscle</Text>
            <View style={styles.chipRow}>
              {PRIMARY_MUSCLES.map((muscle) => (
                <TouchableOpacity
                  key={muscle}
                  style={[
                    styles.chip,
                    themedStyles.chip,
                    customPrimary === muscle && themedStyles.chipActive,
                  ]}
                  onPress={() => setCustomPrimary(muscle)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      themedStyles.chipText,
                      customPrimary === muscle && themedStyles.chipActiveText,
                    ]}
                  >
                    {getMuscleDisplayName(muscle as MuscleKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.sectionLabel, themedStyles.infoLabel]}>Equipment</Text>
            <View style={styles.chipRow}>
              {EQUIPMENT_TYPES.map((equipment) => (
                <TouchableOpacity
                  key={equipment}
                  style={[
                    styles.chip,
                    themedStyles.chip,
                    customEquipment === equipment && themedStyles.chipActive,
                  ]}
                  onPress={() =>
                    setCustomEquipment((prev) => (prev === equipment ? '' : equipment))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      themedStyles.chipText,
                      customEquipment === equipment && themedStyles.chipActiveText,
                    ]}
                  >
                    {equipment}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {customError && (
              <Text style={[styles.customError, themedStyles.errorText]}>{customError}</Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.secondaryButton, themedStyles.secondaryButton]}
                onPress={() => setCustomIndex(null)}
              >
                <Text style={[styles.editButtonText, themedStyles.title]}>Cancel</Text>
              </TouchableOpacity>
              <GlassButton style={styles.primaryModalButton} onPress={handleCreateCustomExercise}>
                <View style={styles.createButtonContent}>
                  <CheckIcon color={Colors.white} size={IconSizes.sm} strokeWidth={2.5} />
                  <Text style={styles.createButtonText}>Save</Text>
                </View>
              </GlassButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...Typography.h4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  editButtonText: {
    ...Typography.bodySmall,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 140,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionLabel: {
    ...Typography.labelSmall,
    fontFamily: FontFamily.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  titleText: {
    ...Typography.h4,
  },
  summaryText: {
    ...Typography.bodySmall,
    lineHeight: 20,
  },
  titleInput: {
    ...Typography.h4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  summaryInput: {
    ...Typography.bodySmall,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 80,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaText: {
    ...Typography.caption,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    ...Typography.caption,
  },
  loadingState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    ...Typography.bodySmall,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  exerciseHeaderText: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    ...Typography.body,
  },
  exerciseStatus: {
    ...Typography.caption,
  },
  exerciseMeta: {
    ...Typography.caption,
  },
  resolveButton: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  resolveButtonText: {
    ...Typography.caption,
    fontFamily: FontFamily.semibold,
  },
  customExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  candidateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  setList: {
    gap: Spacing.sm,
  },
  setRow: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  setText: {
    ...Typography.bodySmall,
  },
  setField: {
    flex: 1,
    gap: 4,
  },
  setLabel: {
    ...Typography.caption,
  },
  setInput: {
    ...Typography.bodySmall,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  notesInput: {
    ...Typography.bodySmall,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 64,
  },
  notesText: {
    ...Typography.bodySmall,
  },
  actionBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  createButton: {
    height: 44,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  createButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
  createError: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyStateTitle: {
    ...Typography.h5,
  },
  emptyStateBody: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayHeavy,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: {
    ...Typography.h4,
  },
  modalInput: {
    ...Typography.bodySmall,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  primaryModalButton: {
    flex: 1,
    height: 40,
    borderRadius: BorderRadius.full,
  },
  secondaryButton: {
    flex: 1,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customError: {
    ...Typography.caption,
  },
});
