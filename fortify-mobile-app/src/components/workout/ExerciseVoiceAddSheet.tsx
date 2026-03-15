import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowPathIcon,
  CheckIcon,
  MicrophoneIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { Colors } from '@/constants/Colors';
import { BorderRadius, FontSizes, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useExercises } from '@/src/hooks/useExercises';
import { createExerciseVoiceFileName, interpretExerciseVoiceAdd } from '@/src/services/exerciseVoiceService';
import { getMicrophonePermissionStatus, openMicrophoneSettings } from '@/src/services/microphonePermissionService';
import type { Exercise } from '@/src/types/exercise';
import type { ExerciseVoiceEntry } from '@/src/types/exerciseVoice';
import { getCachedExerciseImageSource } from '@/src/utils/exerciseImageCache';
import { buildExerciseSearchIndex, searchExercises } from '@/src/utils/exerciseSearch';
import { moderateScale, scale } from '@/src/utils/responsive';

type VoicePhase = 'idle' | 'listening' | 'processing' | 'review';

type VoiceExerciseCandidate = {
  key: string;
  exerciseQuery: string;
  setCount: number | null;
  confidence: ExerciseVoiceEntry['confidence'];
  matches: Exercise[];
  selectedMatchId: string | null;
  included: boolean;
};

type ExerciseAddPayload = {
  id: string;
  name: string;
  initialSetCount?: number | null;
};

interface ExerciseVoiceAddSheetProps {
  visible: boolean;
  existingExerciseIds: string[];
  onClose: () => void;
  onAddExercises: (exercises: ExerciseAddPayload[]) => void;
}

const PANEL_WIDTH = scale(420);
const WAVE_BAR_COUNT = 18;
const MIN_BAR_HEIGHT = scale(10);
const MAX_BAR_HEIGHT = scale(42);
const HEADER_ICON_SIZE = scale(18);
const PILL_RADIUS = scale(999);

const MIME_BY_EXTENSION: Record<string, string> = {
  m4a: 'audio/m4a',
  mp4: 'audio/mp4',
  caf: 'audio/x-caf',
  wav: 'audio/wav',
  webm: 'audio/webm',
};

function getVoiceAddStartErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Voice add could not start.';
  const normalizedMessage = message.toLowerCase();

  if (
    Platform.OS === 'ios'
    && (
      normalizedMessage.includes('recorder not prepared')
      || normalizedMessage.includes('not ready to record')
      || normalizedMessage.includes('audio converter')
    )
  ) {
    return 'Voice recording is not supported in the iOS Simulator. Test this on a physical iPhone.';
  }

  if (
    normalizedMessage.includes('currently in the background')
    || normalizedMessage.includes('audio session could not be activated')
    || normalizedMessage.includes('could not activate')
  ) {
    return 'Voice add could not start. Close any permission prompt and try again.';
  }

  return 'Voice add could not start. Please try again.';
}

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

function VoiceWaveBar({
  height,
  color,
}: {
  height: number;
  color: string;
}) {
  const animatedHeight = useSharedValue(height);

  useEffect(() => {
    animatedHeight.value = withTiming(height, {
      duration: 120,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedHeight, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return <Animated.View style={[styles.waveBar, { backgroundColor: color }, animatedStyle]} />;
}

const getMimeTypeFromUri = (uri: string | null) => {
  if (!uri) return 'audio/m4a';
  const extension = uri.split('.').pop()?.toLowerCase() ?? 'm4a';
  return MIME_BY_EXTENSION[extension] || 'audio/m4a';
};

const formatExerciseQueryLabel = (value: string) => (
  value
    .trim()
    .split(/\s+/)
    .map((word) => (word ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}` : word))
    .join(' ')
);

export function ExerciseVoiceAddSheet({
  visible,
  existingExerciseIds,
  onClose,
  onAddExercises,
}: ExerciseVoiceAddSheetProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { exercises } = useExercises();

  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [meterLevel, setMeterLevel] = useState(0.08);
  const [processingFrame, setProcessingFrame] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [candidates, setCandidates] = useState<VoiceExerciseCandidate[]>([]);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const requestVersionRef = useRef(0);

  const searchIndex = useMemo(
    () => buildExerciseSearchIndex([...exercises].sort((a, b) => a.name.localeCompare(b.name))),
    [exercises]
  );

  const accentGradient = colors.accentGradient as unknown as [string, string, ...string[]];
  const maxModalHeight = Math.max(
    scale(320),
    windowHeight - insets.top - Math.max(insets.bottom, scale(24)) - scale(48)
  );

  const themedStyles = {
    container: {
      backgroundColor: colors.background,
      borderColor: isDark ? colors.borderLight : 'rgba(0, 0, 0, 0.08)',
    },
    headerIconWrap: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
    },
    waveformTrack: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    card: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.035)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    sideControl: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    sideControlPressed: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    chip: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accentBorder,
    },
    chipSelected: {
      backgroundColor: colors.accentOverlayMedium,
      borderColor: colors.accentBorder,
    },
  };

  const buildCandidates = useCallback((entries: ExerciseVoiceEntry[]) => {
    const seenQueries = new Set<string>();
    const built: VoiceExerciseCandidate[] = [];

    entries.forEach((entry, index) => {
      const query = entry.exerciseQuery.trim();
      if (!query) return;

      const dedupeKey = query.toLowerCase();
      if (seenQueries.has(dedupeKey)) return;
      seenQueries.add(dedupeKey);

      const matches = searchExercises(query, searchIndex)
        .filter((exercise) => !existingExerciseIds.includes(exercise.id))
        .slice(0, 3) as Exercise[];

      built.push({
        key: `${dedupeKey}-${index}`,
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

  const restoreAudioMode = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch {
      // Ignore cleanup failures.
    }
  }, []);

  const discardRecording = useCallback(async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;

    if (!recording) {
      await restoreAudioMode();
      return;
    }

    try {
      const status = await recording.getStatusAsync();
      if (status.isRecording || status.canRecord) {
        await recording.stopAndUnloadAsync();
      }
    } catch {
      // Ignore cleanup failures.
    }

    recording.setOnRecordingStatusUpdate(null);
    await restoreAudioMode();
  }, [restoreAudioMode]);

  const resetSheet = useCallback(() => {
    requestVersionRef.current += 1;
    setPhase('idle');
    setMeterLevel(0.08);
    setProcessingFrame(0);
    setErrorMessage(null);
    setTranscript('');
    setCandidates([]);
  }, []);

  useEffect(() => {
    if (!visible) {
      resetSheet();
      void discardRecording();
      return;
    }
    resetSheet();
  }, [discardRecording, resetSheet, visible]);

  useEffect(() => {
    return () => {
      void discardRecording();
    };
  }, [discardRecording]);

  useEffect(() => {
    if (phase !== 'processing') {
      setProcessingFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setProcessingFrame((frame) => frame + 1);
    }, 90);

    return () => clearInterval(interval);
  }, [phase]);

  const startListening = useCallback(async () => {
    if (isStartingRef.current || phase === 'processing') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setErrorMessage(null);
    setTranscript('');
    setCandidates([]);
    setMeterLevel(0.08);
    isStartingRef.current = true;

    try {
      await discardRecording();
      const permission = await getMicrophonePermissionStatus();
      if (!permission.granted) {
        setPhase('review');
        setErrorMessage(
          permission.status === 'denied'
            ? 'Microphone access is off. Enable it in Settings to add exercises by voice.'
            : 'Microphone permission is required to use voice add.'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        VOICE_RECORDING_OPTIONS,
        (status) => {
          if (!status.isRecording) return;
          const metering = typeof status.metering === 'number' ? status.metering : -60;
          const normalized = Math.max(0.08, Math.min(1, (metering + 60) / 60));
          setMeterLevel(normalized);
        },
        70
      );

      if (!visible) {
        recordingRef.current = recording;
        await discardRecording();
        return;
      }

      recordingRef.current = recording;
      setPhase('listening');
    } catch (error) {
      await discardRecording();
      setPhase('review');
      setErrorMessage(getVoiceAddStartErrorMessage(error));
    } finally {
      isStartingRef.current = false;
    }
  }, [discardRecording, phase, visible]);

  const stopListening = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording || isStoppingRef.current || isStartingRef.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('processing');
    setErrorMessage(null);
    setMeterLevel(0.12);
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    isStoppingRef.current = true;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recording.setOnRecordingStatusUpdate(null);
      recordingRef.current = null;
      await restoreAudioMode();

      if (!uri) {
        throw new Error('Recording failed to save.');
      }

      const audioBase64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const response = await interpretExerciseVoiceAdd({
        audioBase64,
        mimeType: getMimeTypeFromUri(uri),
        fileName: createExerciseVoiceFileName(uri.split('.').pop() || 'm4a'),
      });

      if (requestVersion !== requestVersionRef.current) return;

      if (response.type === 'error') {
        setErrorMessage(response.error.message || 'Unable to interpret that exercise request.');
        setPhase('review');
        return;
      }

      const nextCandidates = buildCandidates(response.interpretation.entries);
      setTranscript(response.interpretation.transcript);
      setCandidates(nextCandidates);
      setErrorMessage(nextCandidates.length === 0 ? 'I could not match those exercises. Try speaking the names again.' : null);
      setPhase('review');
    } catch (error) {
      await discardRecording();
      if (requestVersion !== requestVersionRef.current) return;
      setErrorMessage(error instanceof Error ? error.message : 'Unable to process that recording.');
      setPhase('review');
    } finally {
      isStoppingRef.current = false;
    }
  }, [buildCandidates, discardRecording, restoreAudioMode]);

  const updateCandidate = useCallback((
    candidateKey: string,
    updater: (candidate: VoiceExerciseCandidate) => VoiceExerciseCandidate | null,
  ) => {
    setCandidates((prev) => {
      const next: VoiceExerciseCandidate[] = [];
      prev.forEach((candidate) => {
        const updated = candidate.key === candidateKey ? updater(candidate) : candidate;
        if (updated) {
          next.push(updated);
        }
      });
      return next;
    });
  }, []);

  const selectCandidateMatch = useCallback((candidateKey: string, exerciseId: string) => {
    updateCandidate(candidateKey, (candidate) => ({
      ...candidate,
      selectedMatchId: exerciseId,
      included: true,
    }));
  }, [updateCandidate]);

  const toggleCandidateIncluded = useCallback((candidateKey: string) => {
    updateCandidate(candidateKey, (candidate) => ({
      ...candidate,
      included: !candidate.included && Boolean(candidate.selectedMatchId),
    }));
  }, [updateCandidate]);

  const removeCandidate = useCallback((candidateKey: string) => {
    updateCandidate(candidateKey, () => null);
  }, [updateCandidate]);

  const canApply = candidates.some((candidate) => candidate.included && candidate.selectedMatchId);

  const waveformHeights = useMemo(() => (
    Array.from({ length: WAVE_BAR_COUNT }, (_, index) => {
      const center = (WAVE_BAR_COUNT - 1) / 2;
      const distance = Math.abs(index - center) / Math.max(center, 1);
      const weight = 1 - (distance * 0.8);
      const pulse = 0.18 + (((index % 4) + 1) * 0.06);

      let level: number;
      if (phase === 'listening') {
        level = Math.min(1, meterLevel * (weight + pulse));
      } else if (phase === 'processing') {
        const sweep = (processingFrame * 0.55) - (index * 0.42);
        const animatedPulse = (Math.sin(sweep) + 1) / 2;
        level = 0.22 + (animatedPulse * 0.5) + (weight * 0.12);
      } else {
        level = 0.14 + (weight * 0.16);
      }

      return MIN_BAR_HEIGHT + ((MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) * level);
    })
  ), [meterLevel, phase, processingFrame]);

  const hasRetryState = phase === 'review' || !!errorMessage;
  const heroLabel = phase === 'listening'
    ? 'Stop'
    : hasRetryState
    ? 'Redo'
    : 'Listen';

  const handleApply = () => {
    const payload: ExerciseAddPayload[] = [];
    candidates.forEach((candidate) => {
      if (!candidate.included || !candidate.selectedMatchId) return;
      const match = candidate.matches.find((entry) => entry.id === candidate.selectedMatchId);
      if (!match) return;
      payload.push({
        id: match.id,
        name: match.name,
        initialSetCount: candidate.setCount,
      });
    });

    const deduped = new Map<string, ExerciseAddPayload>();
    payload.forEach((entry) => {
      deduped.set(entry.id, entry);
    });

    const exercisesToAdd = Array.from(deduped.values());
    if (exercisesToAdd.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage('Select at least one detected exercise before adding.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAddExercises(exercisesToAdd);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <Animated.View
          style={[
            styles.shell,
            {
              marginBottom: Math.max(insets.bottom + scale(20), scale(72)),
            },
          ]}
          entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(300).easing(Easing.in(Easing.cubic))}
        >
          <View
            style={[
              styles.container,
              themedStyles.container,
              {
                maxHeight: maxModalHeight,
              },
            ]}
          >
            <StainlessSteelPattern />

            <View style={styles.contentSection}>
              <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                style={styles.contentScroll}
                contentContainerStyle={styles.content}
              >
              <View style={styles.header}>
                <View style={styles.headerTitleWrap}>
                  <View style={[styles.headerIconWrap, themedStyles.headerIconWrap]}>
                    <MicrophoneIcon size={HEADER_ICON_SIZE} color={colors.accent} strokeWidth={2.2} />
                  </View>
                  <View style={styles.headerCopy}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Voice Add</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                      Say one or more exercise names with optional set counts.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.waveformTrack, themedStyles.waveformTrack]}>
                <View style={styles.waveform}>
                  {waveformHeights.map((height, index) => (
                    <VoiceWaveBar key={`wave-${index}`} height={height} color={colors.accent} />
                  ))}
                </View>
                <Text style={[styles.waveformCaption, { color: colors.textSecondary }]}>
                  {phase === 'processing'
                    ? 'Transcribing and finding exercises...'
                    : phase === 'listening'
                    ? 'Listening... tap stop when you finish'
                    : 'Try “3 sets of barbell bench press and squats for 3 sets”'}
                </Text>
              </View>

              {transcript.length > 0 && (
                <View style={[styles.messageCard, themedStyles.card]}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Transcript</Text>
                  <Text style={[styles.transcriptText, { color: colors.textPrimary }]}>“{transcript}”</Text>
                </View>
              )}

              {errorMessage && (
                <View style={[styles.messageCard, themedStyles.card]}>
                  <Text style={[styles.messageTitle, { color: Colors.error }]}>Could not use that recording</Text>
                  <Text style={[styles.messageBody, { color: colors.textSecondary }]}>{errorMessage}</Text>
                  {errorMessage.includes('Settings') && (
                    <Pressable onPress={() => { void openMicrophoneSettings(); }} style={styles.inlineLink}>
                      <Text style={[styles.inlineLinkText, { color: colors.accent }]}>Open Settings</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {candidates.length > 0 && (
                <View style={styles.candidateList}>
                  {candidates.map((candidate) => (
                    <View key={candidate.key} style={[styles.candidateCard, themedStyles.card]}>
                      <View style={styles.candidateHeader}>
                        <View style={styles.candidateCopy}>
                          <Text style={[styles.candidateTitle, { color: colors.textPrimary }]}>
                            {formatExerciseQueryLabel(candidate.exerciseQuery)}
                          </Text>
                          <Text style={[styles.candidateMeta, { color: colors.textSecondary }]}>
                            {candidate.setCount ? `${candidate.setCount} sets` : 'Default set count'} • {candidate.confidence}
                          </Text>
                        </View>
                        <View style={styles.candidateActions}>
                          <Pressable
                            onPress={() => toggleCandidateIncluded(candidate.key)}
                            style={[
                              styles.candidateIconButton,
                              themedStyles.sideControl,
                              candidate.included && themedStyles.chipSelected,
                            ]}
                          >
                            <CheckIcon
                              size={16}
                              color={candidate.included ? colors.accent : colors.textSecondary}
                              strokeWidth={2.2}
                            />
                          </Pressable>
                          <Pressable
                            onPress={() => removeCandidate(candidate.key)}
                            style={[styles.candidateIconButton, themedStyles.sideControl]}
                          >
                            <XMarkIcon size={16} color={colors.textSecondary} strokeWidth={2.2} />
                          </Pressable>
                        </View>
                      </View>

                      {candidate.selectedMatchId && (() => {
                        const selectedMatch = candidate.matches.find((match) => match.id === candidate.selectedMatchId);
                        if (!selectedMatch) return null;
                        const previewSource = getCachedExerciseImageSource(selectedMatch.images?.[0]);

                        return (
                          <View style={[styles.selectedMatchPreview, themedStyles.card]}>
                            <View style={styles.selectedMatchPreviewMedia}>
                              {previewSource ? (
                                <Image
                                  source={previewSource}
                                  style={styles.selectedMatchPreviewImage}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View style={[styles.selectedMatchPreviewFallback, themedStyles.chip]}>
                                  <MicrophoneIcon size={18} color={colors.accent} strokeWidth={2} />
                                </View>
                              )}
                            </View>
                            <View style={styles.selectedMatchPreviewCopy}>
                              <Text
                                style={[styles.selectedMatchPreviewTitle, { color: colors.textPrimary }]}
                                numberOfLines={2}
                              >
                                {selectedMatch.name}
                              </Text>
                              <Text style={[styles.selectedMatchPreviewMeta, { color: colors.textSecondary }]}>
                                Selected match
                              </Text>
                            </View>
                          </View>
                        );
                      })()}

                      {candidate.matches.length > 0 ? (
                        <View style={styles.matchesRow}>
                          {candidate.matches.map((match) => {
                            const selected = candidate.selectedMatchId === match.id;
                            return (
                              <Pressable
                                key={`${candidate.key}-${match.id}`}
                                onPress={() => selectCandidateMatch(candidate.key, match.id)}
                                style={[
                                  styles.matchChip,
                                  themedStyles.chip,
                                  selected && themedStyles.chipSelected,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.matchChipText,
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
                        <Text style={[styles.noMatchText, { color: colors.textSecondary }]}>
                          No strong matches found.
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
              </ScrollView>
            </View>

            <View style={styles.controlRow}>
              <View style={styles.sideControlSpacer} />

              <View style={styles.grooveDivider}>
                <View style={styles.grooveLight} />
                <View style={styles.grooveDark} />
              </View>

              <View style={styles.heroButtonContainer}>
                <View style={styles.heroButtonRing}>
                  {phase === 'listening' ? (
                    <Pressable
                      onPress={stopListening}
                      style={({ pressed }) => [
                        styles.heroButton,
                        pressed && styles.heroPressed,
                      ]}
                    >
                      <LinearGradient
                        colors={['#f97316', '#dc2626']}
                        start={{ x: 0, y: 0.2 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <MicrophoneIcon size={24} color={Colors.white} strokeWidth={2.4} />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={startListening}
                      disabled={phase === 'processing'}
                      style={({ pressed }) => [
                        styles.heroButton,
                        phase === 'processing' && styles.disabledButton,
                        pressed && phase !== 'processing' && styles.heroPressed,
                      ]}
                    >
                      <LinearGradient
                        colors={accentGradient}
                        start={{ x: 0, y: 0.15 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      {hasRetryState ? (
                        <ArrowPathIcon size={24} color={Colors.white} strokeWidth={2.4} />
                      ) : (
                        <MicrophoneIcon size={24} color={Colors.white} strokeWidth={2.4} />
                      )}
                    </Pressable>
                  )}
                </View>
                <Text style={[styles.heroLabel, { color: colors.textPrimary }]}>{heroLabel}</Text>
              </View>

              <View style={styles.grooveDivider}>
                <View style={styles.grooveLight} />
                <View style={styles.grooveDark} />
              </View>

              <Pressable
                onPress={handleApply}
                disabled={!canApply}
                style={({ pressed }) => [
                  styles.sideControl,
                  themedStyles.sideControl,
                  !canApply && styles.disabledButton,
                  pressed && canApply && themedStyles.sideControlPressed,
                ]}
              >
                <CheckIcon size={18} color={canApply ? colors.accent : colors.textTertiary} strokeWidth={2.1} />
                <Text
                  style={[
                    styles.sideControlText,
                    { color: canApply ? colors.accent : colors.textTertiary },
                  ]}
                >
                  Add
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: scale(Spacing.lg),
    paddingBottom: scale(4),
  },
  shell: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: PANEL_WIDTH,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    paddingHorizontal: scale(Spacing.lg),
    paddingTop: scale(Spacing.lg),
    paddingBottom: scale(Spacing.lg),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  contentSection: {
    flexShrink: 1,
    minHeight: 0,
    marginBottom: scale(Spacing.md),
  },
  contentScroll: {
    flexShrink: 1,
    minHeight: 0,
  },
  content: {
    gap: scale(Spacing.md),
    paddingBottom: scale(Spacing.xs),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.md),
    flex: 1,
  },
  headerIconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: PILL_RADIUS,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(18),
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subtitle: {
    marginTop: scale(2),
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
  },
  waveformTrack: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: scale(Spacing.lg),
    paddingVertical: scale(Spacing.lg),
    gap: scale(Spacing.sm),
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
    minHeight: MAX_BAR_HEIGHT,
  },
  waveBar: {
    width: scale(7),
    borderRadius: 999,
  },
  waveformCaption: {
    textAlign: 'center',
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
  },
  messageCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: scale(Spacing.md),
    gap: scale(Spacing.xs),
  },
  sectionLabel: {
    fontSize: moderateScale(12),
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  transcriptText: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22),
    fontWeight: '600',
  },
  messageTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  messageBody: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  inlineLink: {
    alignSelf: 'flex-start',
    marginTop: scale(Spacing.xs),
  },
  inlineLinkText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  candidateList: {
    gap: scale(Spacing.sm),
  },
  candidateCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: scale(Spacing.md),
    gap: scale(Spacing.sm),
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: scale(Spacing.md),
  },
  candidateCopy: {
    flex: 1,
    gap: scale(2),
  },
  candidateTitle: {
    fontSize: moderateScale(16),
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  candidateMeta: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  candidateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.sm),
  },
  candidateIconButton: {
    width: scale(30),
    height: scale(30),
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  selectedMatchPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.sm),
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: scale(Spacing.sm),
  },
  selectedMatchPreviewMedia: {
    width: scale(56),
    height: scale(56),
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    flexShrink: 0,
  },
  selectedMatchPreviewImage: {
    width: '100%',
    height: '100%',
  },
  selectedMatchPreviewFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  selectedMatchPreviewCopy: {
    flex: 1,
    gap: scale(2),
  },
  selectedMatchPreviewTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    lineHeight: moderateScale(18),
  },
  selectedMatchPreviewMeta: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
  },
  matchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(Spacing.sm),
  },
  matchChip: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: scale(Spacing.md),
    paddingVertical: scale(Spacing.sm),
    maxWidth: '100%',
  },
  matchChipText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  noMatchText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideControlSpacer: {
    width: scale(92),
    height: scale(50),
  },
  grooveDivider: {
    width: scale(2),
    height: scale(34),
    marginHorizontal: scale(Spacing.xs),
    borderRadius: 1,
    overflow: 'hidden',
  },
  grooveLight: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    position: 'absolute',
    left: 0,
  },
  grooveDark: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'absolute',
    right: 0,
  },
  heroButtonContainer: {
    width: scale(94),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonRing: {
    padding: scale(3),
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    borderRightColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomColor: 'rgba(0, 0, 0, 0.25)',
  },
  heroButton: {
    width: scale(66),
    height: scale(66),
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  heroPressed: {
    transform: [{ scale: 0.96 }],
  },
  heroLabel: {
    marginTop: scale(6),
    fontSize: moderateScale(13),
    fontFamily: 'BankGothicBT-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sideControl: {
    width: scale(92),
    height: scale(44),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
    paddingHorizontal: scale(Spacing.sm),
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: BorderRadius.sm,
  },
  sideControlText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
});
