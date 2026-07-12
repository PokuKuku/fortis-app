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
import {
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowPathIcon,
  CheckIcon,
  InformationCircleIcon,
  MicrophoneIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  SlideInDown,
  SlideOutDown,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { Colors } from '@/constants/Colors';
import { BorderRadius, FontSizes, Spacing } from '@/constants/Sizes';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { VoiceFeatureHelpModal } from '@/src/components/workout/VoiceFeatureHelpModal';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useExercises } from '@/src/hooks/useExercises';
import { createExerciseVoiceFileName, interpretExerciseVoiceAdd } from '@/src/services/exerciseVoiceService';
import { ensureMicrophonePermission, openMicrophoneSettings } from '@/src/services/microphonePermissionService';
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
const TOUR_DIM_BACKGROUND = 'rgba(15, 23, 42, 0.55)';
const TOUR_DIM_BACKGROUND_SUBTLE = 'rgba(15, 23, 42, 0.42)';

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

  return 'Did not get that recording. Try again.';
}

function getVoiceAddInterpretErrorMessage(message?: string | null): string {
  const normalizedMessage = (message || '').toLowerCase();
  if (normalizedMessage.includes('settings')) {
    return 'Microphone access is off. Enable it in Settings to add exercises by voice.';
  }
  if (normalizedMessage.includes('sign in') || normalizedMessage.includes('unauthorized')) {
    return 'Sign in to add exercises by voice.';
  }
  return 'Did not get that recording. Try again.';
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

const VOICE_ACTIVE_AUDIO_MODE = {
  allowsRecordingIOS: true,
  interruptionModeIOS: InterruptionModeIOS.DoNotMix,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
} as const;

const VOICE_IDLE_AUDIO_MODE = {
  allowsRecordingIOS: false,
  interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
  playsInSilentModeIOS: false,
  staysActiveInBackground: false,
  interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
} as const;

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
  const { isTourActive, activeStepId, advanceStep } = useInAppTour();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { exercises } = useExercises();
  const shouldAnchorListenButton = isTourActive && activeStepId === 'add_with_voice';
  const shouldShowVoiceTourTooltip = visible && isTourActive && (
    activeStepId === 'add_with_voice' || activeStepId === 'confirm_add_with_voice'
  );
  const shouldDimVoiceModalContent = shouldShowVoiceTourTooltip && activeStepId === 'confirm_add_with_voice';

  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [meterLevel, setMeterLevel] = useState(0.08);
  const [processingFrame, setProcessingFrame] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [candidates, setCandidates] = useState<VoiceExerciseCandidate[]>([]);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const requestVersionRef = useRef(0);
  const backdropRef = useRef<View>(null);
  const containerRef = useRef<View>(null);
  const listenButtonRef = useRef<View>(null);
  const addButtonRef = useRef<View>(null);
  const [tourTooltipHeight, setTourTooltipHeight] = useState(0);
  const [listenButtonMetrics, setListenButtonMetrics] = useState<{ centerX: number; centerY: number } | null>(null);
  const [addButtonMetrics, setAddButtonMetrics] = useState<{ centerX: number; centerY: number } | null>(null);
  const [containerMetrics, setContainerMetrics] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [addButtonRectInContainer, setAddButtonRectInContainer] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const arrowNudge = useSharedValue(0);

  const searchIndex = useMemo(
    () => buildExerciseSearchIndex([...exercises].sort((a, b) => a.name.localeCompare(b.name))),
    [exercises]
  );

  const accentGradient = colors.accentGradient as unknown as [string, string, ...string[]];
  const maxModalHeight = Math.max(
    scale(320),
    windowHeight - insets.top - Math.max(insets.bottom, scale(24)) - scale(48)
  );
  const tooltipWidth = Math.min(scale(360), windowWidth - scale(32));

  const measureListenButton = useCallback(() => {
    const backdrop = backdropRef.current;
    const listenButton = listenButtonRef.current;
    if (!backdrop || !listenButton) return;

    requestAnimationFrame(() => {
      backdrop.measureInWindow((backdropX, backdropY) => {
        listenButton.measureInWindow((x, y, width, height) => {
          if (width <= 0 || height <= 0) return;
          setListenButtonMetrics({
            centerX: x - backdropX + width / 2,
            centerY: y - backdropY + height / 2,
          });
        });
      });
    });
  }, []);

  const measureAddButton = useCallback(() => {
    const backdrop = backdropRef.current;
    const container = containerRef.current;
    const addButton = addButtonRef.current;
    if (!backdrop || !container || !addButton) return;

    requestAnimationFrame(() => {
      backdrop.measureInWindow((backdropX, backdropY) => {
        container.measureInWindow((containerX, containerY) => {
          addButton.measureInWindow((x, y, width, height) => {
            if (width <= 0 || height <= 0) return;
            setAddButtonMetrics({
              centerX: x - backdropX + width / 2,
              centerY: y - backdropY + height / 2,
            });
            setAddButtonRectInContainer({
              x: x - containerX,
              y: y - containerY,
              width,
              height,
            });
          });
        });
      });
    });
  }, []);

  const measureContainer = useCallback(() => {
    const backdrop = backdropRef.current;
    const container = containerRef.current;
    if (!backdrop || !container) return;

    requestAnimationFrame(() => {
      backdrop.measureInWindow((backdropX, backdropY) => {
        container.measureInWindow((x, y, width, height) => {
          if (width <= 0 || height <= 0) return;
          setContainerMetrics({
            x: x - backdropX,
            y: y - backdropY,
            width,
            height,
          });
        });
      });
    });
  }, []);

  useEffect(() => {
    if (!shouldShowVoiceTourTooltip) return;
    measureListenButton();
    measureAddButton();
    measureContainer();
  }, [measureAddButton, measureContainer, measureListenButton, shouldShowVoiceTourTooltip, phase, candidates.length]);

  const normalizeTutorialText = useCallback((value: string) => (
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  ), []);

  const hasTutorialVoiceMatch = useMemo(() => (
    candidates.some((candidate) => {
      const normalized = normalizeTutorialText(candidate.exerciseQuery);
      return (
        candidate.setCount === 3 &&
        normalized.includes('barbell') &&
        normalized.includes('bench') &&
        normalized.includes('press')
      );
    })
  ), [candidates, normalizeTutorialText]);

  const hasTutorialSelectedMatch = useMemo(() => (
    candidates.some((candidate) => {
      if (!candidate.included || !candidate.selectedMatchId || candidate.setCount !== 3) {
        return false;
      }

      const selectedMatch = candidate.matches.find((entry) => entry.id === candidate.selectedMatchId);
      if (!selectedMatch) {
        return false;
      }

      const normalized = normalizeTutorialText(selectedMatch.name);
      return (
        normalized.includes('barbell') &&
        normalized.includes('bench') &&
        normalized.includes('press')
      );
    })
  ), [candidates, normalizeTutorialText]);

  useEffect(() => {
    if (!visible) return;
    if (!isTourActive) return;
    if (activeStepId !== 'add_with_voice') return;
    if (phase !== 'review') return;
    if (!hasTutorialVoiceMatch) return;
    void advanceStep();
  }, [activeStepId, advanceStep, hasTutorialVoiceMatch, isTourActive, phase, visible]);

  useEffect(() => {
    if (!shouldShowVoiceTourTooltip) {
      cancelAnimation(arrowNudge);
      arrowNudge.value = 0;
      return;
    }

    arrowNudge.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 650,
          easing: Easing.inOut(Easing.cubic),
        }),
        withTiming(0, {
          duration: 650,
          easing: Easing.inOut(Easing.cubic),
        })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(arrowNudge);
      arrowNudge.value = 0;
    };
  }, [arrowNudge, shouldShowVoiceTourTooltip]);

  const tooltipHorizontalInset = scale(16);
  const tooltipAnchorCenterX = containerMetrics
    ? containerMetrics.x + containerMetrics.width / 2
    : listenButtonMetrics?.centerX;
  const tooltipLeft = tooltipAnchorCenterX
    ? Math.min(
        Math.max(tooltipAnchorCenterX - tooltipWidth / 2, tooltipHorizontalInset),
        windowWidth - tooltipWidth - tooltipHorizontalInset
      )
    : tooltipHorizontalInset;
  const effectiveTooltipHeight = Math.max(tourTooltipHeight, scale(120));
  const tooltipSafeTop = insets.top + scale(18);
  const tooltipSafeBottom = windowHeight - Math.max(insets.bottom, scale(18)) - effectiveTooltipHeight;
  const tooltipTopBase = containerMetrics
    ? containerMetrics.y - effectiveTooltipHeight - scale(18)
    : Math.max(insets.top + windowHeight * 0.065, scale(68));
  const tooltipTop = Math.min(Math.max(tooltipSafeTop, tooltipTopBase), tooltipSafeBottom);
  const tooltipTargetMetrics = activeStepId === 'confirm_add_with_voice' ? addButtonMetrics : listenButtonMetrics;
  const buttonCenterXRelative = tooltipTargetMetrics ? tooltipTargetMetrics.centerX - tooltipLeft : tooltipWidth / 2;
  const buttonCenterYRelative = tooltipTargetMetrics ? tooltipTargetMetrics.centerY - tooltipTop : scale(260);
  const horizontalArrowLength = scale(58);
  const horizontalArrowHeadWidth = scale(14);
  const horizontalArrowNudgeDistance = scale(8);
  const verticalArrowNudgeDistance = scale(6);
  const arrowLeft = Math.max(scale(0), buttonCenterXRelative - horizontalArrowLength - horizontalArrowHeadWidth - scale(46));
  const arrowTop = Math.max(effectiveTooltipHeight + scale(8), buttonCenterYRelative - scale(16));
  const verticalArrowHeadHeight = scale(14);
  const verticalArrowHeadTargetTop = buttonCenterYRelative - scale(40);
  const verticalArrowLineHeight = Math.max(
    scale(18),
    Math.min(
      scale(72),
      verticalArrowHeadTargetTop - (effectiveTooltipHeight - scale(64))
    )
  );
  const verticalArrowTop = verticalArrowHeadTargetTop - verticalArrowLineHeight;
  const horizontalArrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowNudge.value * horizontalArrowNudgeDistance }],
  }), [horizontalArrowNudgeDistance]);
  const verticalArrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowNudge.value * verticalArrowNudgeDistance }],
  }), [verticalArrowNudgeDistance]);
  const localTooltipBody = activeStepId === 'confirm_add_with_voice'
    ? 'Tap Add to insert "barbell bench press" into your workout.'
    : 'Tap the button and then say "3 sets of barbell bench press." Tap again to finish the recording.';

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
      await Audio.setAudioModeAsync(VOICE_IDLE_AUDIO_MODE);
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
      const permission = await ensureMicrophonePermission();
      if (!permission.granted) {
        setPhase('review');
        setErrorMessage(
          permission.status === 'denied'
            ? 'Microphone access is off. Enable it in Settings to add exercises by voice.'
            : 'Microphone permission is required to use voice add.'
        );
        return;
      }

      await Audio.setAudioModeAsync(VOICE_ACTIVE_AUDIO_MODE);

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
        setErrorMessage(getVoiceAddInterpretErrorMessage(response.error.message));
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
      setErrorMessage(getVoiceAddInterpretErrorMessage(error instanceof Error ? error.message : null));
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

    const isVoiceAddTutorialStep =
      isTourActive &&
      (activeStepId === 'add_with_voice' || activeStepId === 'confirm_add_with_voice');

    if (isVoiceAddTutorialStep && !hasTutorialSelectedMatch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage('For this tour step, add "3 sets of barbell bench press." Tap Redo and try again.');
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
      <View
        ref={backdropRef}
        style={[
          styles.backdrop,
          shouldShowVoiceTourTooltip && styles.tourBackdropDimmed,
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={shouldShowVoiceTourTooltip ? undefined : onClose}
        />
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
            ref={containerRef}
            style={[
              styles.container,
              themedStyles.container,
              {
                maxHeight: maxModalHeight,
              },
            ]}
            onLayout={() => {
              if (shouldShowVoiceTourTooltip) {
                measureContainer();
              }
            }}
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
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Voice Add explanation"
                  accessibilityHint="Explains how to add exercises by voice"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowHelp(true);
                  }}
                  hitSlop={8}
                  style={[styles.helpButton, themedStyles.headerIconWrap]}
                >
                  <InformationCircleIcon size={18} color={colors.accent} strokeWidth={2} />
                </Pressable>
              </View>

              {transcript.length === 0 && candidates.length === 0 && (
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
                      : 'Try “3 sets of barbell bench press”'}
                  </Text>
                </View>
              )}

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
                                  resizeMode="contain"
                                  fadeDuration={0}
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
            {shouldDimVoiceModalContent && addButtonRectInContainer ? (
              <View pointerEvents="none" style={styles.modalSpotlightLayer}>
                <View
                  style={[
                    styles.modalSpotlightBlock,
                    {
                      left: 0,
                      top: 0,
                      right: 0,
                      height: addButtonRectInContainer.y,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.modalSpotlightBlock,
                    {
                      left: 0,
                      top: addButtonRectInContainer.y + addButtonRectInContainer.height,
                      right: 0,
                      bottom: 0,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.modalSpotlightBlock,
                    {
                      left: 0,
                      top: addButtonRectInContainer.y,
                      width: addButtonRectInContainer.x,
                      height: addButtonRectInContainer.height,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.modalSpotlightBlock,
                    {
                      left: addButtonRectInContainer.x + addButtonRectInContainer.width,
                      top: addButtonRectInContainer.y,
                      right: 0,
                      height: addButtonRectInContainer.height,
                    },
                  ]}
                />
              </View>
            ) : null}

            <View style={styles.controlRow}>
              <View style={styles.sideControlSpacer} />

              <View style={styles.grooveDivider}>
                <View style={styles.grooveLight} />
                <View style={styles.grooveDark} />
              </View>

              <View
                ref={listenButtonRef}
                style={styles.heroButtonContainer}
                onLayout={() => {
                  if (shouldShowVoiceTourTooltip) {
                    measureListenButton();
                  }
                }}
              >
                <View style={styles.heroButtonRing}>
                  <TourAnchor id={TOUR_ANCHOR_IDS.voiceAddListenButton} disabled={!shouldAnchorListenButton}>
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
                          <ArrowPathIcon size={24} color={colors.accentForegroundOnFill} strokeWidth={2.4} />
                        ) : (
                          <MicrophoneIcon size={24} color={colors.accentForegroundOnFill} strokeWidth={2.4} />
                        )}
                      </Pressable>
                    )}
                  </TourAnchor>
                </View>
                <Text style={[styles.heroLabel, { color: colors.textPrimary }]}>{heroLabel}</Text>
              </View>

              <View style={styles.grooveDivider}>
                <View style={styles.grooveLight} />
                <View style={styles.grooveDark} />
              </View>

              <TourAnchor id={TOUR_ANCHOR_IDS.voiceAddConfirmButton} disabled={activeStepId !== 'confirm_add_with_voice'}>
                <View
                  ref={addButtonRef}
                  style={shouldDimVoiceModalContent ? styles.confirmAddButtonFocus : undefined}
                  onLayout={() => {
                    if (shouldShowVoiceTourTooltip) {
                      measureAddButton();
                    }
                  }}
                >
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
              </TourAnchor>
            </View>
          </View>
        </Animated.View>
        {shouldShowVoiceTourTooltip ? (
          <View pointerEvents="box-none" style={styles.tourTooltipLayer}>
            <View
              style={[
                styles.tourTooltipCluster,
                {
                  width: tooltipWidth,
                  left: tooltipLeft,
                  top: tooltipTop,
                },
              ]}
            >
              <View
                onLayout={(event) => {
                  const nextHeight = event.nativeEvent.layout.height;
                  if (nextHeight !== tourTooltipHeight) {
                    setTourTooltipHeight(nextHeight);
                  }
                }}
                style={[
                  styles.tourTooltipCard,
                  {
                    backgroundColor: isDark ? 'rgba(20, 20, 20, 0.96)' : 'rgba(255, 255, 255, 0.98)',
                    borderColor: isDark ? colors.glassBorder : 'rgba(0, 0, 0, 0.08)',
                  },
                ]}
              >
                <Text style={[styles.tourTooltipBody, { color: colors.textPrimary }]}>
                  {localTooltipBody}
                </Text>
              </View>
              <View
                pointerEvents="none"
                style={[
                  styles.tourTooltipArrowWrap,
                  activeStepId === 'confirm_add_with_voice'
                    ? {
                        left: buttonCenterXRelative - scale(1.5),
                        top: verticalArrowTop,
                      }
                    : {
                        left: arrowLeft,
                        top: arrowTop,
                      },
                ]}
              >
                {activeStepId === 'confirm_add_with_voice' ? (
                  <Animated.View style={[styles.tourTooltipVerticalArrow, verticalArrowAnimatedStyle]}>
                    <View style={[styles.tourTooltipVerticalArrowLine, { backgroundColor: Colors.white, height: verticalArrowLineHeight }]} />
                    <View style={[styles.tourTooltipVerticalArrowHead, { borderTopColor: Colors.white }]} />
                  </Animated.View>
                ) : (
                  <Animated.View style={[styles.tourTooltipArrowRow, horizontalArrowAnimatedStyle]}>
                    <View style={[styles.tourTooltipArrowLine, { backgroundColor: colors.accent, width: horizontalArrowLength }]} />
                    <View style={[styles.tourTooltipArrowHead, { borderLeftColor: colors.accent }]} />
                  </Animated.View>
                )}
              </View>
            </View>
          </View>
        ) : null}
        {showHelp ? (
          <VoiceFeatureHelpModal
            title="Voice Add"
            description="Add one or more exercises in a single recording. Set counts are optional."
            examples={['3 sets of barbell bench press', 'Squats, lat pulldowns, and curls']}
            note="Review the matches, choose the exercises you want, then tap Add."
            onClose={() => setShowHelp(false)}
          />
        ) : null}
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
  tourBackdropDimmed: {
    backgroundColor: TOUR_DIM_BACKGROUND,
  },
  tourTooltipLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  tourTooltipCluster: {
    position: 'absolute',
  },
  tourTooltipCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: scale(Spacing.lg),
    paddingTop: scale(Spacing.md),
    paddingBottom: scale(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  tourTooltipArrowWrap: {
    position: 'absolute',
    justifyContent: 'center',
  },
  tourTooltipArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tourTooltipArrowLine: {
    height: scale(3),
    borderRadius: 999,
  },
  tourTooltipArrowHead: {
    marginLeft: scale(-1),
    width: 0,
    height: 0,
    borderTopWidth: scale(10),
    borderBottomWidth: scale(10),
    borderLeftWidth: scale(14),
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  tourTooltipVerticalArrow: {
    alignItems: 'center',
  },
  tourTooltipVerticalArrowLine: {
    width: scale(3),
    borderRadius: 999,
  },
  tourTooltipVerticalArrowHead: {
    marginTop: scale(-1),
    width: 0,
    height: 0,
    borderLeftWidth: scale(10),
    borderRightWidth: scale(10),
    borderTopWidth: scale(14),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tourTooltipBody: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
    fontWeight: '600',
    textAlign: 'center',
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
  modalSpotlightLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  modalSpotlightBlock: {
    position: 'absolute',
    backgroundColor: TOUR_DIM_BACKGROUND_SUBTLE,
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
  helpButton: {
    width: scale(34),
    height: scale(34),
    borderRadius: PILL_RADIUS,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: scale(72),
    height: scale(72),
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
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
  confirmAddButtonFocus: {
    position: 'relative',
    zIndex: 3,
    elevation: 14,
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
