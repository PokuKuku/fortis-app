import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  TextInput,
  ScrollView,
  Image,
  InteractionManager,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon, CheckIcon, MicrophoneIcon, ArrowPathIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius, Sizes } from '@/constants/Sizes';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import * as Haptics from 'expo-haptics';
import Animated, { SlideInDown, SlideOutDown, Easing } from 'react-native-reanimated';
import { Exercise } from '@/src/types/exercise';
import { useExercises } from '@/src/hooks/useExercises';
import { buildExerciseSearchIndex, searchExercises } from '@/src/utils/exerciseSearch';
import {
  getCachedExerciseImageSource,
  prefetchExerciseImagesFromExercises,
} from '@/src/utils/exerciseImageCache';
import { ensureMicrophonePermission, openMicrophoneSettings } from '@/src/services/microphonePermissionService';
import { createExerciseVoiceFileName, interpretExerciseVoiceAdd } from '@/src/services/exerciseVoiceService';
import type { ExerciseVoiceEntry } from '@/src/types/exerciseVoice';

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  suspended?: boolean;
  replaceMode?: boolean;
  exerciseLocalIdToReplace?: string;
  replaceExerciseIdToAllow?: string | null;
  onReplaceExerciseCallback?: (exerciseId: string, exerciseName: string) => void;
  // Callback mode for template creation (doesn't use workoutStore)
  onAddExercisesCallback?: (exercises: Array<{ id: string; name: string; initialSetCount?: number | null }>) => void;
  existingExerciseIds?: string[];
  showRestTimerBanner?: boolean;
  onDismissRestTimerBanner?: () => void;
  onOpenExerciseDetails?: (exerciseId: string) => void;
}

const EXERCISE_PREVIEW_SIZE = 36;
const EXERCISE_ROW_BORDER_WIDTH = 1;
const EXERCISE_ROW_PADDING_Y = Spacing.lg;
const EXERCISE_ROW_MARGIN_BOTTOM = Spacing.sm;
const EXERCISE_ROW_HEIGHT = EXERCISE_PREVIEW_SIZE
  + (EXERCISE_ROW_PADDING_Y * 2)
  + (EXERCISE_ROW_BORDER_WIDTH * 2)
  + EXERCISE_ROW_MARGIN_BOTTOM;
const VOICE_WAVE_BAR_COUNT = 16;
const MIN_WAVE_HEIGHT = 8;
const MAX_WAVE_HEIGHT = 30;

type SelectedExerciseDraft = {
  id: string;
  name: string;
  initialSetCount?: number | null;
  source: 'manual' | 'voice';
  sourceKey?: string;
};

type VoicePhase = 'hidden' | 'listening' | 'processing' | 'review';

type VoiceExerciseCandidate = {
  key: string;
  exerciseQuery: string;
  setCount: number | null;
  confidence: ExerciseVoiceEntry['confidence'];
  matches: Exercise[];
  selectedMatchId: string | null;
  included: boolean;
};

const MIME_BY_EXTENSION: Record<string, string> = {
  m4a: 'audio/m4a',
  mp4: 'audio/mp4',
  caf: 'audio/x-caf',
  wav: 'audio/wav',
  webm: 'audio/webm',
};

const VOICE_RECORDING_OPTIONS: Audio.RecordingOptions = {
  ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
  ios: {
    ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
    numberOfChannels: 1,
    bitRate: 96000,
  },
  android: {
    ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
    numberOfChannels: 1,
    bitRate: 96000,
  },
};

export function AddExerciseModal({
  visible,
  onClose,
  suspended = false,
  replaceMode = false,
  exerciseLocalIdToReplace,
  replaceExerciseIdToAllow,
  onReplaceExerciseCallback,
  onAddExercisesCallback,
  existingExerciseIds: externalExistingIds,
  showRestTimerBanner = false,
  onDismissRestTimerBanner,
  onOpenExerciseDetails,
}: AddExerciseModalProps) {
  const { colors, isDark } = useTheme();

  // Dynamic theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: colors.background,
    },
    title: { color: colors.textPrimary },
    searchContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    searchInput: { color: colors.textPrimary },
    exerciseItem: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
    exerciseName: { color: colors.textPrimary },
    exerciseNameSelected: { color: colors.accent },
    exercisePreview: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    exercisePreviewPlaceholder: { color: colors.accent },
    iconContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    iconContainerSelected: {
      backgroundColor: colors.accentOverlayMedium,
    },
    addButtonContainer: {
      backgroundColor: colors.background,
    },
    chip: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
    },
    chipText: { color: colors.accent },
    exerciseItemSelected: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
    },
    restTimerBanner: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
    },
    restTimerBannerText: { color: colors.accent },
  };

  const addExercises = useWorkoutStore(s => s.addExercises);
  const replaceExercise = useWorkoutStore(s => s.replaceExercise);
  const activeSession = useWorkoutStore(s => s.activeSession);

  // Use centralized exercise service
  const { exercises: allExercises, loading } = useExercises();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<SelectedExerciseDraft[]>([]);
  const [voicePhase, setVoicePhase] = useState<VoicePhase>('hidden');
  const [voiceMeterLevel, setVoiceMeterLevel] = useState(0.08);
  const [voiceProcessingFrame, setVoiceProcessingFrame] = useState(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceCandidates, setVoiceCandidates] = useState<VoiceExerciseCandidate[]>([]);
  const isProcessing = useRef(false);
  const voiceRecordingRef = useRef<Audio.Recording | null>(null);
  const voiceRequestVersionRef = useRef(0);
  const isVoiceStartingRef = useRef(false);
  const isVoiceStoppingRef = useRef(false);
  const listRef = useRef<FlatList<Exercise>>(null);
  const lastScrollOffset = useRef(0);
  const isRestoringScroll = useRef(false);
  const pendingScrollRestore = useRef(false);
  const restoreAttempts = useRef(0);
  const wasLoading = useRef(false);
  const contentReady = useRef(false);
  const filteredExercisesRef = useRef<Exercise[]>([]);
  const restoreTargetOffset = useRef(0);
  const restoreTargetIndex = useRef(0);
  const firstVisibleIndex = useRef(0);
  const isModalVisible = visible && !suspended;

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setSelectedExercises([]);
      setVoicePhase('hidden');
      setVoiceMeterLevel(0.08);
      setVoiceProcessingFrame(0);
      setVoiceError(null);
      setVoiceTranscript('');
      setVoiceCandidates([]);
      isProcessing.current = false;
    }
  }, [visible]);

  // Get IDs of exercises already in the workout (use external prop if provided)
  const existingExerciseIds = useMemo(
    () => externalExistingIds || activeSession?.exercises.map(e => e.exerciseId) || [],
    [externalExistingIds, activeSession]
  );

  const sortedExercises = useMemo(
    () => [...allExercises].sort((a, b) => a.name.localeCompare(b.name)),
    [allExercises]
  );

  const searchIndex = useMemo(
    () => buildExerciseSearchIndex(sortedExercises),
    [sortedExercises]
  );

  // Filter exercises based on search and exclude existing exercises
  const filteredExercises = useMemo(() => {
    // Get the exerciseId of the exercise being replaced (if in replace mode)
    const replacingExerciseId = replaceMode && exerciseLocalIdToReplace
      ? (
          replaceExerciseIdToAllow
          ?? activeSession?.exercises.find(e => e.localId === exerciseLocalIdToReplace)?.exerciseId
        )
      : null;

    return searchExercises(searchQuery, searchIndex)
      .filter((ex) => {
        const isExisting = existingExerciseIds.includes(ex.id);
        // Allow the exercise being replaced, filter out all other existing exercises
        if (isExisting && ex.id !== replacingExerciseId) return false;
        return true;
      });
  }, [
    searchQuery,
    searchIndex,
    existingExerciseIds,
    replaceMode,
    exerciseLocalIdToReplace,
    replaceExerciseIdToAllow,
    activeSession,
  ]);

  useEffect(() => {
    filteredExercisesRef.current = filteredExercises;
  }, [filteredExercises]);

  const getMimeTypeFromUri = useCallback((uri: string | null) => {
    if (!uri) return 'audio/m4a';
    const extension = uri.split('.').pop()?.toLowerCase() ?? 'm4a';
    return MIME_BY_EXTENSION[extension] || 'audio/m4a';
  }, []);

  const syncVoiceSelections = useCallback((candidates: VoiceExerciseCandidate[]) => {
    setSelectedExercises((prev) => {
      const manualSelections = prev.filter((selection) => selection.source === 'manual');
      const voiceSelections: SelectedExerciseDraft[] = [];
      candidates.forEach((candidate) => {
        if (!candidate.included || !candidate.selectedMatchId) return;
        const selectedMatch = candidate.matches.find((match) => match.id === candidate.selectedMatchId);
        if (!selectedMatch) return;
        voiceSelections.push({
          id: selectedMatch.id,
          name: selectedMatch.name,
          initialSetCount: candidate.setCount,
          source: 'voice',
          sourceKey: candidate.key,
        });
      });

      const merged = new Map<string, SelectedExerciseDraft>();
      [...manualSelections, ...voiceSelections].forEach((selection) => {
        merged.set(selection.id, selection);
      });
      return Array.from(merged.values());
    });
  }, []);

  const clearVoiceState = useCallback(async () => {
    voiceRequestVersionRef.current += 1;
    const recording = voiceRecordingRef.current;
    voiceRecordingRef.current = null;
    if (recording) {
      try {
        const status = await recording.getStatusAsync();
        if (status.isRecording || status.canRecord) {
          await recording.stopAndUnloadAsync();
        }
      } catch {
        // Ignore cleanup failures.
      }
      recording.setOnRecordingStatusUpdate(null);
    }
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch {
      // Ignore cleanup failures.
    }
    setVoicePhase('hidden');
    setVoiceMeterLevel(0.08);
    setVoiceProcessingFrame(0);
    setVoiceError(null);
    setVoiceTranscript('');
    setVoiceCandidates([]);
    setSelectedExercises((prev) => prev.filter((selection) => selection.source !== 'voice'));
  }, []);

  useEffect(() => {
    return () => {
      void clearVoiceState();
    };
  }, [clearVoiceState]);

  useEffect(() => {
    if (voicePhase !== 'processing') {
      setVoiceProcessingFrame(0);
      return undefined;
    }
    const interval = setInterval(() => {
      setVoiceProcessingFrame((prev) => (prev + 1) % VOICE_WAVE_BAR_COUNT);
    }, 120);
    return () => clearInterval(interval);
  }, [voicePhase]);

  const buildVoiceCandidates = useCallback((entries: ExerciseVoiceEntry[]) => {
    const seenQueries = new Set<string>();
    const built: VoiceExerciseCandidate[] = [];
    entries.forEach((entry, index) => {
      const query = entry.exerciseQuery.trim();
      if (!query) return;
      const key = `${query.toLowerCase()}-${index}`;
      if (seenQueries.has(key)) return;
      seenQueries.add(key);

      const matches = searchExercises(query, searchIndex)
        .filter((exercise) => !existingExerciseIds.includes(exercise.id))
        .slice(0, 3) as Exercise[];

      built.push({
        key,
        exerciseQuery: query,
        setCount: entry.setCount,
        confidence: entry.confidence,
        matches,
        selectedMatchId: matches[0]?.id ?? null,
        included: matches.length > 0,
      });
    });
    return built;
  }, [existingExerciseIds, searchIndex]);

  const startVoiceCapture = useCallback(async () => {
    if (replaceMode || isVoiceStartingRef.current || isVoiceStoppingRef.current) return;
    isVoiceStartingRef.current = true;
    setVoiceError(null);

    try {
      const permission = await ensureMicrophonePermission();
      if (!permission.granted) {
        setVoicePhase('review');
        setVoiceError(
          permission.status === 'denied'
            ? 'Microphone access is off. Enable it in Settings to add exercises by voice.'
            : 'Microphone permission is required to use voice add.'
        );
        return;
      }

      await clearVoiceState();
      setVoicePhase('listening');
      setVoiceMeterLevel(0.08);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        VOICE_RECORDING_OPTIONS,
        (status) => {
          if (!status.isRecording) return;
          const meter = typeof status.metering === 'number'
            ? Math.min(1, Math.max(0.08, (status.metering + 60) / 60))
            : 0.2;
          setVoiceMeterLevel(meter);
        },
        80
      );
      voiceRecordingRef.current = recording;
      await recording.setProgressUpdateInterval(80);
    } catch (error) {
      setVoicePhase('review');
      setVoiceError(error instanceof Error ? error.message : 'Voice recording could not start.');
    } finally {
      isVoiceStartingRef.current = false;
    }
  }, [clearVoiceState, replaceMode]);

  const stopVoiceCapture = useCallback(async () => {
    if (isVoiceStoppingRef.current) return;
    const recording = voiceRecordingRef.current;
    if (!recording) return;
    isVoiceStoppingRef.current = true;
    const requestVersion = ++voiceRequestVersionRef.current;

    try {
      setVoicePhase('processing');
      setVoiceError(null);
      await recording.stopAndUnloadAsync();
      voiceRecordingRef.current = null;
      recording.setOnRecordingStatusUpdate(null);

      const uri = recording.getURI();
      if (!uri) {
        throw new Error('No recording was captured.');
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await interpretExerciseVoiceAdd({
        audioBase64: base64,
        mimeType: getMimeTypeFromUri(uri),
        fileName: createExerciseVoiceFileName(uri.split('.').pop() || 'm4a'),
      });

      if (requestVersion !== voiceRequestVersionRef.current) return;

      if (response.type === 'error') {
        setVoicePhase('review');
        setVoiceError(response.error.message);
        setVoiceCandidates([]);
        setVoiceTranscript('');
        return;
      }

      const candidates = buildVoiceCandidates(response.interpretation.entries);
      setVoiceTranscript(response.interpretation.transcript);
      setVoiceCandidates(candidates);
      syncVoiceSelections(candidates);
      setVoicePhase('review');
      setVoiceError(candidates.length === 0 ? 'I could not match those exercises. Try speaking the exercise names again.' : null);
    } catch (error) {
      if (requestVersion !== voiceRequestVersionRef.current) return;
      setVoicePhase('review');
      setVoiceError(error instanceof Error ? error.message : 'Unable to process that recording.');
      setVoiceCandidates([]);
    } finally {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
      } catch {
        // Ignore cleanup failures.
      }
      isVoiceStoppingRef.current = false;
    }
  }, [buildVoiceCandidates, getMimeTypeFromUri, syncVoiceSelections]);

  const updateVoiceCandidate = useCallback((candidateKey: string, updater: (candidate: VoiceExerciseCandidate) => VoiceExerciseCandidate | null) => {
    setVoiceCandidates((prev) => {
      const next = prev
        .map((candidate) => candidate.key === candidateKey ? updater(candidate) : candidate)
        .filter((candidate): candidate is VoiceExerciseCandidate => candidate !== null);
      syncVoiceSelections(next);
      return next;
    });
  }, [syncVoiceSelections]);

  const removeVoiceCandidate = useCallback((candidateKey: string) => {
    updateVoiceCandidate(candidateKey, () => null);
  }, [updateVoiceCandidate]);

  const toggleVoiceCandidateIncluded = useCallback((candidateKey: string) => {
    updateVoiceCandidate(candidateKey, (candidate) => ({
      ...candidate,
      included: !candidate.included && Boolean(candidate.selectedMatchId),
    }));
  }, [updateVoiceCandidate]);

  const selectVoiceCandidateMatch = useCallback((candidateKey: string, exerciseId: string) => {
    updateVoiceCandidate(candidateKey, (candidate) => ({
      ...candidate,
      selectedMatchId: exerciseId,
      included: true,
    }));
  }, [updateVoiceCandidate]);

  useEffect(() => {
    if (!isModalVisible) return;
    prefetchExerciseImagesFromExercises(filteredExercises, 0, 12);
  }, [isModalVisible, filteredExercises]);

  // Toggle exercise selection (different behavior in replace mode)
  const toggleExercise = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (replaceMode) {
      // Guard against rapid clicks in replace mode
      if (isProcessing.current) return;
      isProcessing.current = true;

      // In replace mode, immediately replace and close
      const exercise = allExercises.find(ex => ex.id === exerciseId);
      if (exercise) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (onReplaceExerciseCallback) {
          onReplaceExerciseCallback(exerciseId, exercise.name);
        } else if (exerciseLocalIdToReplace) {
          replaceExercise(exerciseLocalIdToReplace, exerciseId, exercise.name);
        } else {
          isProcessing.current = false;
          return;
        }
        onClose();
      } else {
        isProcessing.current = false;
      }
    } else {
      // Normal mode: toggle selection
      setSelectedExercises(prev =>
        prev.some(selection => selection.id === exerciseId)
          ? prev.filter(selection => selection.id !== exerciseId)
          : [
              ...prev,
              {
                id: exerciseId,
                name: allExercises.find(ex => ex.id === exerciseId)?.name || '',
                source: 'manual',
              },
            ]
      );
    }
  };

  // Remove exercise from selection
  const removeFromSelection = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExercises(prev => prev.filter(selection => selection.id !== exerciseId));
    setVoiceCandidates(prev => {
      const next = prev.map((candidate) =>
        candidate.selectedMatchId === exerciseId
          ? { ...candidate, included: false }
          : candidate
      );
      return next;
    });
  };

  // Add all selected exercises in one atomic operation
  const handleAddExercises = () => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Build array of exercises to add
    const exercisesToAdd = selectedExercises
      .map((selection) => ({
        id: selection.id,
        name: selection.name,
        initialSetCount: selection.initialSetCount ?? undefined,
      }));

    // Use callback if provided (template mode), otherwise use store action
    if (exercisesToAdd.length > 0) {
      if (onAddExercisesCallback) {
        onAddExercisesCallback(exercisesToAdd);
      } else {
        addExercises(exercisesToAdd);
      }
    }

    onClose();
  };

  // Get exercise name by ID
  const getExerciseName = (exerciseId: string) => {
    return selectedExercises.find((selection) => selection.id === exerciseId)?.name
      || allExercises.find(ex => ex.id === exerciseId)?.name
      || '';
  };

  // Check if exercise is selected
  const isSelected = (exerciseId: string) => selectedExercises.some((selection) => selection.id === exerciseId);

  const handleExercisePress = (exerciseId: string) => {
    if (onOpenExerciseDetails) {
      if (lastScrollOffset.current > 0 || firstVisibleIndex.current > 0) {
        restoreTargetOffset.current = lastScrollOffset.current;
        restoreTargetIndex.current = firstVisibleIndex.current > 0
          ? firstVisibleIndex.current
          : Math.floor(lastScrollOffset.current / EXERCISE_ROW_HEIGHT);
        pendingScrollRestore.current = true;
        restoreAttempts.current = 0;
      }
      onOpenExerciseDetails(exerciseId);
      return;
    }
    toggleExercise(exerciseId);
  };

  const handleListScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (isRestoringScroll.current) return;
    const nextOffset = event.nativeEvent.contentOffset.y;
    if (pendingScrollRestore.current && (restoreTargetOffset.current > 0 || restoreTargetIndex.current > 0)) {
      if (nextOffset === 0) return;
      if (restoreTargetOffset.current > 0
        && (Math.abs(nextOffset - restoreTargetOffset.current) <= 4 || nextOffset > restoreTargetOffset.current)) {
        pendingScrollRestore.current = false;
        lastScrollOffset.current = nextOffset;
        return;
      }
      if (restoreTargetOffset.current <= 0) {
        pendingScrollRestore.current = false;
        lastScrollOffset.current = nextOffset;
        return;
      }
      return;
    }
    lastScrollOffset.current = nextOffset;
  };

  const attemptScrollRestore = useCallback(() => {
    if (!pendingScrollRestore.current) return;
    if (!isModalVisible) return;
    if (loading || filteredExercises.length === 0) return;
    if (!contentReady.current) return;
    if (restoreAttempts.current >= 5) {
      pendingScrollRestore.current = false;
      return;
    }

    restoreAttempts.current += 1;
    isRestoringScroll.current = true;
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        if (restoreTargetIndex.current > 0) {
          listRef.current?.scrollToIndex({
            index: Math.min(restoreTargetIndex.current, filteredExercises.length - 1),
            viewPosition: 0,
            animated: false,
          });
        } else if (restoreTargetOffset.current > 0) {
          listRef.current?.scrollToOffset({
            offset: restoreTargetOffset.current,
            animated: false,
          });
        }
        requestAnimationFrame(() => {
          isRestoringScroll.current = false;
          if (pendingScrollRestore.current) {
            setTimeout(() => {
              attemptScrollRestore();
            }, 120);
          }
        });
      });
    });
    return () => task.cancel?.();
  }, [filteredExercises.length, isModalVisible, loading]);

  useEffect(() => {
    if (!isModalVisible) {
      isRestoringScroll.current = false;
      contentReady.current = false;
      return;
    }
    attemptScrollRestore();
  }, [isModalVisible, loading, filteredExercises.length, attemptScrollRestore]);

  useEffect(() => {
    if (!isModalVisible) {
      wasLoading.current = loading;
      return;
    }

    if (!wasLoading.current && loading && lastScrollOffset.current > 0) {
      restoreTargetOffset.current = lastScrollOffset.current;
      restoreTargetIndex.current = firstVisibleIndex.current > 0
        ? firstVisibleIndex.current
        : Math.floor(lastScrollOffset.current / EXERCISE_ROW_HEIGHT);
      pendingScrollRestore.current = true;
      restoreAttempts.current = 0;
    }

    wasLoading.current = loading;
  }, [loading, isModalVisible]);

  const handleContentSizeChange = (_width: number, height: number) => {
    if (!isModalVisible) return;
    if (height > 0) {
      contentReady.current = true;
      attemptScrollRestore();
    }
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index?: number | null }> }) => {
    if (pendingScrollRestore.current || isRestoringScroll.current) return;
    const firstIndex = viewableItems.find(item => typeof item.index === 'number')?.index;
    if (typeof firstIndex === 'number') {
      firstVisibleIndex.current = firstIndex;
      prefetchExerciseImagesFromExercises(filteredExercisesRef.current, firstIndex + 1, 8);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 10 }).current;

  const renderExercise = ({ item }: { item: Exercise }) => {
    const selected = isSelected(item.id);
    const imageSource = getCachedExerciseImageSource(item.images[0]);
    return (
      <Pressable
        onPress={() => handleExercisePress(item.id)}
        style={({ pressed }) => [
          styles.exerciseItem,
          themedStyles.exerciseItem,
          selected && themedStyles.exerciseItemSelected,
          pressed && styles.exerciseItemPressed,
        ]}
      >
        <View style={styles.exerciseContent}>
          <View style={[styles.exercisePreview, themedStyles.exercisePreview]}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.exercisePreviewImage}
                resizeMode="cover"
                fadeDuration={100}
              />
            ) : (
              <Text style={[styles.exercisePreviewPlaceholder, themedStyles.exercisePreviewPlaceholder]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.exerciseName,
              themedStyles.exerciseName,
              selected && themedStyles.exerciseNameSelected,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </View>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            toggleExercise(item.id);
          }}
          style={[styles.iconContainer, themedStyles.iconContainer, selected && themedStyles.iconContainerSelected]}
          hitSlop={8}
        >
          {selected ? (
            <CheckIcon size={18} color={colors.accent} strokeWidth={2} />
          ) : (
            <PlusIcon size={18} color={colors.textSecondary} strokeWidth={2} />
          )}
        </Pressable>
      </Pressable>
    );
  };

  if (!isModalVisible) return null;

  return (
    <Modal
      transparent
      visible={isModalVisible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Animated.View
          entering={SlideInDown.duration(420).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(320).easing(Easing.in(Easing.cubic))}
          style={[styles.container, themedStyles.container]}
        >
          <StainlessSteelPattern />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, themedStyles.title]}>Exercises</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
            >
              <XMarkIcon size={24} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Rest timer banner */}
          {showRestTimerBanner && (
            <View style={[styles.restTimerBanner, themedStyles.restTimerBanner]}>
              <Text style={[styles.restTimerBannerText, themedStyles.restTimerBannerText]}>
                Time's up - rest complete.
              </Text>
              {onDismissRestTimerBanner && (
                <Pressable onPress={onDismissRestTimerBanner} hitSlop={8}>
                  <XMarkIcon size={16} color={colors.accent} strokeWidth={2} />
                </Pressable>
              )}
            </View>
          )}

          {/* Selected Exercises Chips (only in add mode) */}
          {!replaceMode && selectedExercises.length > 0 && (
            <View style={styles.selectedSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedScrollContent}
              >
                {selectedExercises.map(selection => (
                  <View key={`${selection.source}-${selection.sourceKey ?? selection.id}`} style={[styles.chip, themedStyles.chip]}>
                    <Text style={[styles.chipText, themedStyles.chipText]} numberOfLines={1}>
                      {selection.name}{selection.initialSetCount ? ` • ${selection.initialSetCount} sets` : ''}
                    </Text>
                    <Pressable
                      onPress={() => removeFromSelection(selection.id)}
                      hitSlop={8}
                    >
                      <XMarkIcon size={14} color={colors.textSecondary} strokeWidth={2} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Search Input */}
          <View style={[styles.searchContainer, themedStyles.searchContainer]}>
            <MagnifyingGlassIcon size={18} color={colors.textSecondary} strokeWidth={2} />
            <TextInput
              style={[styles.searchInput, themedStyles.searchInput]}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8} style={styles.searchActionIcon}>
                <XMarkIcon size={16} color={colors.textSecondary} strokeWidth={2} />
              </Pressable>
            )}
          </View>

          {!replaceMode && voicePhase !== 'hidden' && (
            <View style={[styles.voicePanel, themedStyles.exerciseItem]}>
              <View style={styles.voiceHeader}>
                <View>
                  <Text style={[styles.voiceTitle, themedStyles.title]}>Voice Add</Text>
                  <Text style={[styles.voiceSubtitle, themedStyles.searchInput]}>
                    {voicePhase === 'listening'
                      ? 'Listening... tap stop when you finish'
                      : voicePhase === 'processing'
                      ? 'Finding exercises from your recording...'
                      : 'Review the detected exercises before adding them'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => { void clearVoiceState(); }}
                  hitSlop={8}
                  style={styles.voiceCloseButton}
                >
                  <XMarkIcon size={16} color={colors.textSecondary} strokeWidth={2} />
                </Pressable>
              </View>

              <View style={[styles.voiceWaveTrack, themedStyles.searchContainer]}>
                {Array.from({ length: VOICE_WAVE_BAR_COUNT }, (_, index) => {
                  const isProcessing = voicePhase === 'processing';
                  const baseHeight = isProcessing
                    ? MIN_WAVE_HEIGHT + ((voiceProcessingFrame + index) % 6) * 3
                    : MIN_WAVE_HEIGHT + Math.max(0, voiceMeterLevel * MAX_WAVE_HEIGHT - index % 3);
                  return (
                    <View
                      key={`voice-wave-${index}`}
                      style={[
                        styles.voiceWaveBar,
                        {
                          height: Math.min(MAX_WAVE_HEIGHT, Math.max(MIN_WAVE_HEIGHT, baseHeight)),
                          backgroundColor: colors.accent,
                          opacity: isProcessing ? (index === voiceProcessingFrame ? 1 : 0.55) : 0.95,
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {voiceTranscript.length > 0 && (
                <Text style={[styles.voiceTranscript, themedStyles.exerciseName]}>
                  “{voiceTranscript}”
                </Text>
              )}

              {voiceError && (
                <View style={styles.voiceErrorWrap}>
                  <Text style={[styles.voiceErrorTitle, { color: colors.error }]}>Could not use that recording</Text>
                  <Text style={[styles.voiceErrorText, { color: colors.textSecondary }]}>{voiceError}</Text>
                  {voiceError.includes('Settings') && (
                    <Pressable onPress={() => { void openMicrophoneSettings(); }} style={styles.voiceSettingsButton}>
                      <Text style={[styles.voiceSettingsButtonText, { color: colors.accent }]}>Open Settings</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {voiceCandidates.length > 0 && (
                <View style={styles.voiceCandidateList}>
                  {voiceCandidates.map((candidate) => (
                    <View key={candidate.key} style={[styles.voiceCandidateCard, themedStyles.exerciseItem]}>
                      <View style={styles.voiceCandidateHeader}>
                        <View style={styles.voiceCandidateCopy}>
                          <Text style={[styles.voiceCandidateQuery, themedStyles.exerciseName]}>
                            {candidate.exerciseQuery}
                          </Text>
                          <Text style={[styles.voiceCandidateMeta, { color: colors.textSecondary }]}>
                            {candidate.setCount ? `${candidate.setCount} sets` : 'Default set count'} • {candidate.confidence}
                          </Text>
                        </View>
                        <View style={styles.voiceCandidateActions}>
                          <Pressable
                            onPress={() => toggleVoiceCandidateIncluded(candidate.key)}
                            style={[
                              styles.voiceCandidateIcon,
                              candidate.included && styles.voiceCandidateIconActive,
                              candidate.included && { backgroundColor: colors.accentOverlayMedium, borderColor: colors.accentBorder },
                            ]}
                          >
                            <CheckIcon
                              size={16}
                              color={candidate.included ? colors.accent : colors.textSecondary}
                              strokeWidth={2.2}
                            />
                          </Pressable>
                          <Pressable
                            onPress={() => removeVoiceCandidate(candidate.key)}
                            style={styles.voiceCandidateIcon}
                          >
                            <XMarkIcon size={16} color={colors.textSecondary} strokeWidth={2} />
                          </Pressable>
                        </View>
                      </View>
                      {candidate.matches.length > 0 ? (
                        <View style={styles.voiceMatchesRow}>
                          {candidate.matches.map((match) => {
                            const selected = candidate.selectedMatchId === match.id;
                            return (
                              <Pressable
                                key={`${candidate.key}-${match.id}`}
                                onPress={() => selectVoiceCandidateMatch(candidate.key, match.id)}
                                style={[
                                  styles.voiceMatchChip,
                                  themedStyles.chip,
                                  selected && { backgroundColor: colors.accentOverlayMedium, borderColor: colors.accentBorder },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.voiceMatchChipText,
                                    { color: selected ? colors.accent : colors.textSecondary },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {match.name}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : (
                        <Text style={[styles.voiceNoMatchText, { color: colors.textSecondary }]}>
                          No strong matches found.
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.voiceFooter}>
                {voicePhase === 'listening' ? (
                  <GlassButton style={styles.voiceActionButton} onPress={() => { void stopVoiceCapture(); }}>
                    <Text style={[styles.addButtonText, { color: colors.accentForegroundOnFill }]}>Stop</Text>
                  </GlassButton>
                ) : (
                  <GlassButton style={styles.voiceActionButton} onPress={() => { void startVoiceCapture(); }}>
                    <ArrowPathIcon size={18} color={colors.accentForegroundOnFill} strokeWidth={2} />
                    <Text style={[styles.addButtonText, { color: colors.accentForegroundOnFill }]}>Redo</Text>
                  </GlassButton>
                )}
              </View>
            </View>
          )}

          {/* Exercise List */}
          <FlatList
            ref={listRef}
            data={filteredExercises}
            renderItem={renderExercise}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            onScroll={handleListScroll}
            onScrollEndDrag={handleListScroll}
            onMomentumScrollEnd={handleListScroll}
            onContentSizeChange={handleContentSizeChange}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_data, index) => ({
              length: EXERCISE_ROW_HEIGHT,
              offset: EXERCISE_ROW_HEIGHT * index,
              index,
            })}
          />

          {/* Add Button (only in add mode) */}
          {!replaceMode && selectedExercises.length > 0 && (
            <View style={[styles.addButtonContainer, themedStyles.addButtonContainer]}>
              <GlassButton style={styles.addButton} onPress={handleAddExercises}>
                <Text style={[styles.addButtonText, { color: colors.accentForegroundOnFill }]}>
                  Add {selectedExercises.length} Exercise{selectedExercises.length > 1 ? 's' : ''}
                </Text>
              </GlassButton>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    height: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    zIndex: 1,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  selectedSection: {
    paddingBottom: Spacing.md,
    zIndex: 1,
  },
  selectedScrollContent: {
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.sm,
  },
  restTimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    zIndex: 1,
  },
  restTimerBannerText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    flexShrink: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    // backgroundColor and borderColor now applied via themedStyles.chip
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    maxWidth: 180,
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    // color now applied via themedStyles.chipText
    flexShrink: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    height: Sizes.minTouchTarget,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    letterSpacing: 0.5,
    color: Colors.textPrimary,
    height: Sizes.minTouchTarget,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  searchActionIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePanel: {
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
    zIndex: 1,
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  voiceTitle: {
    fontSize: FontSizes.lg,
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  voiceSubtitle: {
    marginTop: Spacing.xs,
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * 1.4,
  },
  voiceCloseButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  voiceWaveTrack: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    minHeight: 72,
    marginBottom: Spacing.xs,
  },
  voiceWaveBar: {
    width: 8,
    borderRadius: 999,
  },
  voiceTranscript: {
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * 1.4,
  },
  voiceErrorWrap: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    gap: Spacing.xs,
  },
  voiceErrorTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  voiceErrorText: {
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * 1.45,
  },
  voiceSettingsButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  voiceSettingsButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  voiceCandidateList: {
    gap: Spacing.sm,
  },
  voiceCandidateCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: 0,
  },
  voiceCandidateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  voiceCandidateCopy: {
    flex: 1,
    gap: 2,
  },
  voiceCandidateQuery: {
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  voiceCandidateMeta: {
    fontSize: FontSizes.sm,
  },
  voiceCandidateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  voiceCandidateIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  voiceCandidateIconActive: {},
  voiceMatchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  voiceMatchChip: {
    maxWidth: '100%',
  },
  voiceMatchChipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  voiceNoMatchText: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.sm,
  },
  voiceFooter: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  voiceActionButton: {
    minWidth: 140,
    height: 46,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 120,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: EXERCISE_ROW_PADDING_Y,
    paddingHorizontal: Spacing.md,
    marginBottom: EXERCISE_ROW_MARGIN_BOTTOM,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: EXERCISE_ROW_BORDER_WIDTH,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.xl,
  },
  exerciseItemSelected: {
    // backgroundColor and borderColor now applied via themedStyles.exerciseItemSelected
  },
  exerciseItemPressed: {
    opacity: 0.7,
  },
  exerciseContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginRight: Spacing.md,
  },
  exercisePreview: {
    width: EXERCISE_PREVIEW_SIZE,
    height: EXERCISE_PREVIEW_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  exercisePreviewImage: {
    width: '100%',
    height: '100%',
  },
  exercisePreviewPlaceholder: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  exerciseName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  exerciseNameSelected: {
    // color now applied via themedStyles (colors.accent)
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainerSelected: {
    // backgroundColor now applied via themedStyles.iconContainerSelected
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    backgroundColor: Colors.background,
    zIndex: 2,
  },
  addButton: {
    height: 48,
    borderRadius: BorderRadius.xl,
  },
  addButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
});
