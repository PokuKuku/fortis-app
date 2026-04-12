import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
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
  MicrophoneIcon,
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
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getMicrophonePermissionStatus } from '@/src/services/microphonePermissionService';
import { createVoiceLogFileName, interpretWorkoutVoiceLog } from '@/src/services/workoutVoiceService';
import { useWorkoutStore } from '@/src/store/workoutStore';
import type { WorkoutVoiceInterpretation } from '@/src/types/workoutVoice';
import { moderateScale, scale } from '@/src/utils/responsive';
import { createWorkoutVoiceLogPlan } from '@/src/utils/workoutVoiceLog';

type VoiceSheetPhase = 'idle' | 'listening' | 'processing' | 'review';

interface WorkoutVoiceLogSheetProps {
  visible: boolean;
  exerciseLocalId: string | null;
  onClose: () => void;
}

const PANEL_WIDTH = scale(420);
const WAVE_BAR_COUNT = 18;
const MIN_BAR_HEIGHT = scale(10);
const MAX_BAR_HEIGHT = scale(48);
const HEADER_ICON_SIZE = scale(18);
const PILL_RADIUS = scale(999);
const CONTROL_HEIGHT = scale(44);
const HERO_BUTTON_SIZE = scale(66);
const GROOVE_HEIGHT = scale(34);
const GROOVE_WIDTH = scale(2);
const GROOVE_MARGIN = scale(Spacing.xs);
const LOCAL_TOOLTIP_WIDTH = scale(320);
const LOCAL_TOOLTIP_HEIGHT_ESTIMATE = scale(118);
const LOCAL_TOOLTIP_TOP_OFFSET = scale(26);
const LOCAL_ARROW_SIZE = scale(14);
const LOCAL_ARROW_STEM = scale(36);
const LOCAL_HORIZONTAL_ARROW_LENGTH = scale(38);
const LOCAL_ARROW_BOB_DISTANCE = scale(8);
const TOUR_DIM_BACKGROUND = 'rgba(15, 23, 42, 0.55)';
const MIDNIGHT_ARROW = '#1e293b';

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

const VOICE_ACTIVE_AUDIO_MODE = {
  allowsRecordingIOS: true,
  interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
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

const getMimeTypeFromUri = (uri: string | null) => {
  if (!uri) return 'audio/m4a';
  const extension = uri.split('.').pop()?.toLowerCase() ?? 'm4a';
  return MIME_BY_EXTENSION[extension] || 'audio/m4a';
};

const getMissingFieldsLabel = (missingFields: string[]) => {
  if (missingFields.length === 0) return null;
  if (missingFields.length === 1) {
    return `I still need ${missingFields[0]}.`;
  }
  const allButLast = missingFields.slice(0, -1).join(', ');
  const last = missingFields[missingFields.length - 1];
  return `I still need ${allButLast}, and ${last}.`;
};

const SET_TYPE_LABELS = {
  normal: 'Normal',
  warmup: 'Warm-up',
  dropset: 'Drop Set',
  failure: 'Failure',
} as const;

const getInferenceCopy = (
  interpretation: WorkoutVoiceInterpretation,
  options?: {
    inferredSetsFromExercise?: boolean;
    reusedWeightFromExisting?: boolean;
    reusedRepsFromExisting?: boolean;
  }
) => {
  const parts: string[] = [];

  if (interpretation.inferredSets || options?.inferredSetsFromExercise) {
    parts.push('Set count was inferred.');
  }
  if (interpretation.inferredWeightUnit) {
    parts.push(`Weight unit defaulted to ${interpretation.weightUnit}.`);
  }
  if (interpretation.inferredSetType) {
    parts.push(`Set type defaulted to ${SET_TYPE_LABELS[interpretation.setType].toLowerCase()}.`);
  }
  if (options?.reusedWeightFromExisting) {
    parts.push('Weight was reused from your current set entries.');
  }
  if (options?.reusedRepsFromExisting) {
    parts.push('Reps were reused from your current set entries.');
  }

  return parts.join(' ');
};

function getVoiceLogInterpretErrorMessage(message?: string | null): string {
  const normalizedMessage = (message || '').toLowerCase();
  if (normalizedMessage.includes('settings')) {
    return 'Microphone access is off. Enable it in Settings to use voice logging.';
  }
  if (normalizedMessage.includes('sign in') || normalizedMessage.includes('unauthorized')) {
    return 'Sign in to use voice logging.';
  }
  return 'Did not get that recording. Try again.';
}

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

export function WorkoutVoiceLogSheet({
  visible,
  exerciseLocalId,
  onClose,
}: WorkoutVoiceLogSheetProps) {
  const { colors, isDark } = useTheme();
  const { isTourActive, activeStepId, advanceStep } = useInAppTour();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const session = useWorkoutStore((state) => state.activeSession);
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const registerWorkoutOverlay = useWorkoutStore((state) => state.registerWorkoutOverlay);
  const unregisterWorkoutOverlay = useWorkoutStore((state) => state.unregisterWorkoutOverlay);
  const applyVoiceLog = useWorkoutStore((state) => state.applyVoiceLog);

  const [phase, setPhase] = useState<VoiceSheetPhase>('idle');
  const [meterLevel, setMeterLevel] = useState(0.08);
  const [processingFrame, setProcessingFrame] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<WorkoutVoiceInterpretation | null>(null);
  const [containerLayout, setContainerLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [localTooltipHeight, setLocalTooltipHeight] = useState(0);
  const [heroButtonLayout, setHeroButtonLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [applyButtonLayout, setApplyButtonLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const shellRef = useRef<View>(null);
  const heroButtonRef = useRef<View>(null);
  const applyButtonRef = useRef<View>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const overlayOpenRef = useRef(false);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const requestVersionRef = useRef(0);
  const localArrowAnim = useSharedValue(0);

  const exercise = useMemo(
    () => session?.exercises.find((entry) => entry.localId === exerciseLocalId) ?? null,
    [exerciseLocalId, session?.exercises]
  );
  const defaultWeightUnit = exercise ? (weightUnits[exercise.exerciseId] || 'lbs') : 'lbs';
  const voiceLogPlan = useMemo(() => (
    exercise && interpretation
      ? createWorkoutVoiceLogPlan(exercise, interpretation, defaultWeightUnit)
      : null
  ), [defaultWeightUnit, exercise, interpretation]);
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
    heroShadow: {
      shadowColor: colors.accentShadow,
    },
  };

  useEffect(() => {
    if (visible && !overlayOpenRef.current) {
      registerWorkoutOverlay();
      overlayOpenRef.current = true;
    } else if (!visible && overlayOpenRef.current) {
      unregisterWorkoutOverlay();
      overlayOpenRef.current = false;
    }

    return () => {
      if (overlayOpenRef.current) {
        unregisterWorkoutOverlay();
        overlayOpenRef.current = false;
      }
    };
  }, [registerWorkoutOverlay, unregisterWorkoutOverlay, visible]);

  const resetSheet = () => {
    requestVersionRef.current += 1;
    setPhase('idle');
    setMeterLevel(0.08);
    setErrorMessage(null);
    setInterpretation(null);
  };

  const restoreAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync(VOICE_IDLE_AUDIO_MODE);
    } catch {
      // Ignore cleanup failures.
    }
  };

  const discardRecording = async () => {
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
  };

  useEffect(() => {
    if (!visible) {
      resetSheet();
      void discardRecording();
      return;
    }
    resetSheet();
  }, [visible]);

  useEffect(() => {
    return () => {
      void discardRecording();
    };
  }, []);

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

  const startListening = async () => {
    if (!exercise || isStartingRef.current || phase === 'processing') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setErrorMessage(null);
    setInterpretation(null);
    setMeterLevel(0.08);
    isStartingRef.current = true;

    try {
      await discardRecording();
      const permission = await getMicrophonePermissionStatus();
      if (!permission.granted) {
        setErrorMessage('Microphone access is off. Enable it in Settings to use voice logging.');
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
      const message = error instanceof Error ? error.message : 'Unable to start recording.';
      const normalizedMessage = message.toLowerCase();
      if (
        Platform.OS === 'ios'
        && (
          normalizedMessage.includes('recorder not prepared')
          || normalizedMessage.includes('not ready to record')
          || normalizedMessage.includes('audio converter')
        )
      ) {
        setErrorMessage('Voice recording is not supported in the iOS Simulator. Test this on a physical iPhone.');
      } else {
        setErrorMessage(message);
      }
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopListening = async () => {
    const recording = recordingRef.current;
    if (!recording || !exercise || isStoppingRef.current || isStartingRef.current) return;

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
      const response = await interpretWorkoutVoiceLog({
        audioBase64,
        mimeType: getMimeTypeFromUri(uri),
        fileName: createVoiceLogFileName(uri.split('.').pop() || 'm4a'),
        exerciseName: exercise.exerciseName,
        defaultWeightUnit,
      });

      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      if (response.type === 'error' || !response.interpretation) {
        setErrorMessage(getVoiceLogInterpretErrorMessage(response.error?.message));
        setPhase('idle');
        return;
      }

      setInterpretation(response.interpretation);
      setPhase('review');
      void Haptics.selectionAsync();
    } catch (error) {
      await discardRecording();
      if (requestVersion !== requestVersionRef.current) {
        return;
      }
      setErrorMessage(getVoiceLogInterpretErrorMessage(error instanceof Error ? error.message : null));
      setPhase('idle');
    } finally {
      isStoppingRef.current = false;
    }
  };

  const handleApply = () => {
    if (!exerciseLocalId || !interpretation) return;

    const isVoiceLogTutorialStep =
      isTourActive && (activeStepId === 'log_with_voice' || activeStepId === 'confirm_voice_log');

    const isTutorialVoiceLogMatch = (
      interpretation.sets === 3
      && interpretation.weight === 225
      && interpretation.reps === 5
      && interpretation.setType === 'normal'
      && voiceLogPlan?.canApply
    );

    if (isVoiceLogTutorialStep && !isTutorialVoiceLogMatch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage('For this tour step, say "3 sets of 225 for 5 reps." Tap Retry and try again.');
      return;
    }

    const result = applyVoiceLog(exerciseLocalId, interpretation);
    if (!result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage('Unable to apply that voice entry. Please try again.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
    if (isTourActive && activeStepId === 'confirm_voice_log') {
      setTimeout(() => {
        advanceStep();
      }, 150);
    }
  };

  const summaryBadges = interpretation
    ? [
        `${voiceLogPlan?.targetSetCount ?? interpretation.sets ?? '—'} set${(voiceLogPlan?.targetSetCount ?? interpretation.sets) === 1 ? '' : 's'}`,
        voiceLogPlan?.uniformWeight.isUniform && voiceLogPlan.uniformWeight.value !== null
          ? `${voiceLogPlan.uniformWeight.value} ${voiceLogPlan.uniformWeightUnit.value ?? defaultWeightUnit}`
          : voiceLogPlan?.inferredFields.weightFromExisting
          ? 'Existing weight'
          : `${interpretation.weight ?? '—'} ${interpretation.weightUnit ?? defaultWeightUnit}`,
        voiceLogPlan?.uniformReps.isUniform && voiceLogPlan.uniformReps.value !== null
          ? `${voiceLogPlan.uniformReps.value} reps`
          : voiceLogPlan?.inferredFields.repsFromExisting
          ? 'Existing reps'
          : `${interpretation.reps ?? '—'} reps`,
        SET_TYPE_LABELS[interpretation.setType],
      ]
    : [];
  const canApply = !!(
    interpretation
    && voiceLogPlan?.canApply
  );
  const isTutorialVoiceLogMatch = !!(
    interpretation
    && interpretation.sets === 3
    && interpretation.weight === 225
    && interpretation.reps === 5
    && interpretation.setType === 'normal'
      && voiceLogPlan?.canApply
  );
  const applyEnabled = canApply && phase === 'review';
  const missingLabel = getMissingFieldsLabel(voiceLogPlan?.unresolvedFields ?? interpretation?.missingFields ?? []);
  const localTooltipStepId =
    activeStepId === 'log_with_voice' || activeStepId === 'confirm_voice_log'
      ? activeStepId
      : null;
  const shouldShowLocalTooltip = visible && isTourActive && !!localTooltipStepId;
  const isRecordVoiceTooltipStep = localTooltipStepId === 'log_with_voice';
  const localTooltipTarget = localTooltipStepId === 'confirm_voice_log' ? applyButtonLayout : heroButtonLayout;
  const localTooltipBody = localTooltipStepId === 'confirm_voice_log'
    ? 'Tap Apply to log those sets to this exercise.'
    : 'Tap the button and say "3 sets of 225 for 5 reps." Tap again to finish the recording.';

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setContainerLayout({ x, y, width, height });
  };

  const measureHeroButton = (fallbackLayout?: { x: number; y: number; width: number; height: number }) => {
    const shell = shellRef.current;
    const heroButton = heroButtonRef.current;
    if (!shell || !heroButton) {
      if (fallbackLayout) {
        setHeroButtonLayout(fallbackLayout);
      }
      return;
    }

    requestAnimationFrame(() => {
      shell.measureInWindow((shellX, shellY) => {
        heroButton.measureInWindow((x, y, width, height) => {
          if (width <= 0 || height <= 0) return;
          setHeroButtonLayout({
            x: x - shellX,
            y: y - shellY,
            width,
            height,
          });
        });
      });
    });
  };

  const handleHeroButtonLayout = (event: LayoutChangeEvent) => {
    measureHeroButton(event.nativeEvent.layout);
  };

  const measureApplyButton = (fallbackLayout?: { x: number; y: number; width: number; height: number }) => {
    const shell = shellRef.current;
    const applyButton = applyButtonRef.current;
    if (!shell || !applyButton) {
      if (fallbackLayout) {
        setApplyButtonLayout(fallbackLayout);
      }
      return;
    }

    requestAnimationFrame(() => {
      shell.measureInWindow((shellX, shellY) => {
        applyButton.measureInWindow((x, y, width, height) => {
          if (width <= 0 || height <= 0) return;
          setApplyButtonLayout({
            x: x - shellX,
            y: y - shellY,
            width,
            height,
          });
        });
      });
    });
  };

  const handleApplyButtonLayout = (event: LayoutChangeEvent) => {
    measureApplyButton(event.nativeEvent.layout);
  };

  useEffect(() => {
    if (!shouldShowLocalTooltip) return;

    requestAnimationFrame(() => {
      measureHeroButton(heroButtonLayout ?? undefined);
      measureApplyButton(applyButtonLayout ?? undefined);
    });
  }, [
    errorMessage,
    interpretation,
    phase,
    shouldShowLocalTooltip,
  ]);

  const localTooltipWidth = useMemo(() => {
    if (!containerLayout) return LOCAL_TOOLTIP_WIDTH;
    return Math.min(LOCAL_TOOLTIP_WIDTH, Math.max(scale(220), containerLayout.width - scale(24)));
  }, [containerLayout]);

  const localTooltipLeft = useMemo(() => {
    if (!containerLayout) {
      return Math.max(scale(12), (windowWidth - localTooltipWidth) / 2);
    }
    return Math.max(scale(12), containerLayout.x + ((containerLayout.width - localTooltipWidth) / 2));
  }, [containerLayout, localTooltipWidth, windowWidth]);

  const localTooltipTop = useMemo(() => {
    const effectiveTooltipHeight = Math.max(localTooltipHeight, LOCAL_TOOLTIP_HEIGHT_ESTIMATE);
    if (isRecordVoiceTooltipStep) {
      return -effectiveTooltipHeight - scale(18);
    }
    if (localTooltipStepId === 'confirm_voice_log') {
      return -effectiveTooltipHeight - scale(18);
    }
    if (!containerLayout || !localTooltipTarget) {
      return LOCAL_TOOLTIP_TOP_OFFSET;
    }

    const maxTop = Math.max(scale(16), localTooltipTarget.y - effectiveTooltipHeight - scale(12));
    return Math.min(LOCAL_TOOLTIP_TOP_OFFSET, maxTop);
  }, [containerLayout, isRecordVoiceTooltipStep, localTooltipHeight, localTooltipStepId, localTooltipTarget]);

  const localArrowLeft = useMemo(() => {
    if (!localTooltipTarget) return scale(150);
    if (isRecordVoiceTooltipStep) {
      return localTooltipTarget.x - LOCAL_HORIZONTAL_ARROW_LENGTH - scale(22);
    }
    return localTooltipTarget.x + (localTooltipTarget.width / 2) - (LOCAL_ARROW_SIZE / 2);
  }, [isRecordVoiceTooltipStep, localTooltipTarget]);

  const localArrowTop = useMemo(() => {
    if (!localTooltipTarget) return scale(160);
    if (isRecordVoiceTooltipStep) {
      return localTooltipTarget.y + (localTooltipTarget.height / 2) - scale(12);
    }
    return Math.max(
      localTooltipTop + Math.max(localTooltipHeight, LOCAL_TOOLTIP_HEIGHT_ESTIMATE) + scale(8),
      localTooltipTarget.y - LOCAL_ARROW_STEM - scale(20)
    );
  }, [isRecordVoiceTooltipStep, localTooltipHeight, localTooltipTarget, localTooltipTop]);

  useEffect(() => {
    if (!shouldShowLocalTooltip) {
      cancelAnimation(localArrowAnim);
      localArrowAnim.value = 0;
      return;
    }

    localArrowAnim.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
        }),
        withTiming(0, {
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
        })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(localArrowAnim);
    };
  }, [localArrowAnim, shouldShowLocalTooltip]);

  const localHorizontalArrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: localArrowAnim.value * LOCAL_ARROW_BOB_DISTANCE }],
  }));

  const localVerticalArrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: localArrowAnim.value * (LOCAL_ARROW_BOB_DISTANCE * 0.7) }],
  }));

  useEffect(() => {
    if (
      !visible ||
      !isTourActive ||
      activeStepId !== 'log_with_voice' ||
      phase !== 'review' ||
      !isTutorialVoiceLogMatch
    ) {
      return;
    }

    advanceStep();
  }, [activeStepId, advanceStep, isTourActive, isTutorialVoiceLogMatch, phase, visible]);

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
    ? 'Retry'
    : 'Listen';

  if (!visible || !exercise) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={[
          styles.backdrop,
          shouldShowLocalTooltip && styles.guidedBackdrop,
        ]}
        onPress={shouldShowLocalTooltip ? undefined : onClose}
      >
        <Animated.View
          ref={shellRef}
          style={[
            styles.shell,
            {
              marginBottom: Math.max(insets.bottom, scale(24)),
            },
          ]}
          entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(300).easing(Easing.in(Easing.cubic))}
        >
          <Pressable
            style={[
              styles.container,
              themedStyles.container,
              {
                maxHeight: maxModalHeight,
              },
            ]}
            onLayout={handleContainerLayout}
            onPress={(event) => event.stopPropagation()}
          >
            <StainlessSteelPattern />
            <View style={styles.contentSection}>
              <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                style={styles.contentScroll}
                contentContainerStyle={styles.contentScrollInner}
              >
                <View style={styles.header}>
                  <View style={styles.headerTitleWrap}>
                    <View style={[styles.headerIconWrap, themedStyles.headerIconWrap]}>
                      <MicrophoneIcon size={HEADER_ICON_SIZE} color={colors.accent} strokeWidth={2.2} />
                    </View>
                    <View style={styles.headerCopy}>
                      <Text style={[styles.title, { color: colors.textPrimary }]}>Voice Log</Text>
                      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {exercise.exerciseName}
                      </Text>
                    </View>
                  </View>
                </View>

                {!interpretation && (
                  <View style={[styles.waveformTrack, themedStyles.waveformTrack]}>
                    <View style={styles.waveform}>
                      {waveformHeights.map((height, index) => (
                        <VoiceWaveBar
                          key={`wave-${index}`}
                          height={height}
                          color={colors.accent}
                        />
                      ))}
                    </View>
                    <Text style={[styles.waveformCaption, { color: colors.textSecondary }]}>
                      {phase === 'processing'
                        ? 'Transcribing and interpreting...'
                        : phase === 'listening'
                        ? 'Listening... tap stop when you finish'
                        : 'Say something like “3 sets of 225 for 5 reps”'}
                    </Text>
                  </View>
                )}

                {errorMessage && (
                  <View style={[styles.messageCard, themedStyles.card]}>
                    <Text style={[styles.messageTitle, { color: Colors.error }]}>Could not use that recording</Text>
                    <Text style={[styles.messageBody, { color: colors.textSecondary }]}>{errorMessage}</Text>
                  </View>
                )}

                {interpretation && (
                  <View style={[styles.transcriptCard, themedStyles.card]}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Transcript</Text>
                    <Text style={[styles.transcriptText, { color: colors.textPrimary }]}>
                      “{interpretation.transcript}”
                    </Text>

                    <View style={styles.badges}>
                      {summaryBadges.map((badge) => (
                        <View key={badge} style={[styles.badge, themedStyles.card]}>
                          <Text style={[styles.badgeText, { color: colors.textPrimary }]}>{badge}</Text>
                        </View>
                      ))}
                    </View>

                    {(
                      interpretation.inferredSets
                      || interpretation.inferredWeightUnit
                      || interpretation.inferredSetType
                      || voiceLogPlan?.inferredFields.sets
                      || voiceLogPlan?.inferredFields.weightFromExisting
                      || voiceLogPlan?.inferredFields.repsFromExisting
                    ) && (
                      <Text style={[styles.inferenceText, { color: colors.textSecondary }]}>
                        {getInferenceCopy(interpretation, {
                          inferredSetsFromExercise: voiceLogPlan?.inferredFields.sets,
                          reusedWeightFromExisting: voiceLogPlan?.inferredFields.weightFromExisting,
                          reusedRepsFromExisting: voiceLogPlan?.inferredFields.repsFromExisting,
                        })}
                      </Text>
                    )}

                    {missingLabel && (
                      <Text style={[styles.missingText, { color: Colors.warning }]}>
                        {missingLabel}
                      </Text>
                    )}

                    {canApply && (
                      <Text style={[styles.confirmHint, { color: colors.textSecondary }]}>
                        Apply will add the sets to this exercise.
                      </Text>
                    )}
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

              <View
                style={styles.heroButtonContainer}
                onLayout={handleHeroButtonLayout}
              >
                <View ref={heroButtonRef} style={styles.heroButtonRing}>
                  {phase === 'listening' ? (
                    <Pressable
                      onPress={stopListening}
                      style={({ pressed }) => [
                        styles.heroButton,
                        themedStyles.heroShadow,
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
                  ) : hasRetryState ? (
                    <Pressable
                      onPress={startListening}
                      style={({ pressed }) => [
                        styles.heroButton,
                        themedStyles.heroShadow,
                        pressed && styles.heroPressed,
                      ]}
                    >
                      <LinearGradient
                        colors={accentGradient}
                        start={{ x: 0, y: 0.15 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <ArrowPathIcon size={24} color={Colors.white} strokeWidth={2.4} />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={startListening}
                      disabled={phase === 'processing'}
                      style={({ pressed }) => [
                        styles.heroButton,
                        themedStyles.heroShadow,
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
                      <MicrophoneIcon size={24} color={Colors.white} strokeWidth={2.4} />
                    </Pressable>
                  )}
                </View>
                <Text style={[styles.heroLabel, { color: colors.textPrimary }]}>{heroLabel}</Text>
              </View>

              <View style={styles.grooveDivider}>
                <View style={styles.grooveLight} />
                <View style={styles.grooveDark} />
              </View>

              <View ref={applyButtonRef} onLayout={handleApplyButtonLayout}>
                <Pressable
                  onPress={handleApply}
                  disabled={!applyEnabled}
                  style={({ pressed }) => [
                    styles.sideControl,
                    themedStyles.sideControl,
                    !applyEnabled && styles.disabledButton,
                    pressed && applyEnabled && themedStyles.sideControlPressed,
                  ]}
                >
                  <CheckIcon size={18} color={applyEnabled ? colors.accent : colors.textTertiary} strokeWidth={2.1} />
                  <Text
                    style={[
                      styles.sideControlText,
                      { color: applyEnabled ? colors.accent : colors.textTertiary },
                    ]}
                  >
                    Apply
                  </Text>
                </Pressable>
              </View>
            </View>

          </Pressable>

          {shouldShowLocalTooltip && (
            <View pointerEvents="box-none" style={styles.localTooltipLayer}>
              <View
                style={[
                  styles.localTooltipCard,
                  {
                    top: localTooltipTop,
                    left: localTooltipLeft,
                    width: localTooltipWidth,
                  },
                ]}
                onLayout={(event) => {
                  const nextHeight = event.nativeEvent.layout.height;
                  if (nextHeight !== localTooltipHeight) {
                    setLocalTooltipHeight(nextHeight);
                  }
                }}
              >
                <Text style={[styles.localTooltipBody, { color: colors.textPrimary }]}>
                  {localTooltipBody}
                </Text>
              </View>

              {localTooltipTarget ? (
                isRecordVoiceTooltipStep ? (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.localHorizontalArrowWrap,
                      {
                        top: localArrowTop,
                        left: localArrowLeft,
                      },
                      localHorizontalArrowAnimatedStyle,
                    ]}
                  >
                    <View style={styles.localHorizontalArrowLine} />
                    <View style={styles.localHorizontalArrowHead} />
                  </Animated.View>
                ) : (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.localArrowWrap,
                      {
                        top: localArrowTop,
                        left: localArrowLeft,
                      },
                      localVerticalArrowAnimatedStyle,
                    ]}
                  >
                    <View style={styles.localArrowStem} />
                    <View style={styles.localArrowHead} />
                  </Animated.View>
                )
              ) : null}
            </View>
          )}
        </Animated.View>
      </Pressable>
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
  },
  guidedBackdrop: {
    backgroundColor: TOUR_DIM_BACKGROUND,
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
  localTooltipLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  localTooltipCard: {
    position: 'absolute',
    width: LOCAL_TOOLTIP_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: scale(16),
    paddingHorizontal: scale(Spacing.md),
    paddingVertical: scale(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  localTooltipBody: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
    fontWeight: '600',
    textAlign: 'center',
  },
  localArrowWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  localHorizontalArrowWrap: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  localHorizontalArrowLine: {
    width: LOCAL_HORIZONTAL_ARROW_LENGTH,
    height: scale(3),
    borderRadius: scale(999),
    backgroundColor: MIDNIGHT_ARROW,
  },
  localHorizontalArrowHead: {
    marginLeft: scale(-1),
    width: 0,
    height: 0,
    borderTopWidth: LOCAL_ARROW_SIZE,
    borderBottomWidth: LOCAL_ARROW_SIZE,
    borderLeftWidth: LOCAL_ARROW_SIZE * 1.2,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: MIDNIGHT_ARROW,
  },
  localArrowStem: {
    width: scale(3),
    height: LOCAL_ARROW_STEM,
    borderRadius: scale(999),
    backgroundColor: MIDNIGHT_ARROW,
  },
  localArrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: LOCAL_ARROW_SIZE,
    borderRightWidth: LOCAL_ARROW_SIZE,
    borderTopWidth: LOCAL_ARROW_SIZE * 1.2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: MIDNIGHT_ARROW,
    marginTop: scale(-1),
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
  contentScrollInner: {
    gap: scale(Spacing.md),
    paddingBottom: scale(Spacing.xs),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(Spacing.md),
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
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: moderateScale(13),
    marginTop: scale(2),
    fontWeight: '600',
  },
  waveformTrack: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5,
    paddingHorizontal: scale(Spacing.md),
    paddingVertical: scale(Spacing.lg),
    gap: scale(Spacing.md),
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: scale(3),
    minHeight: MAX_BAR_HEIGHT + scale(4),
  },
  waveBar: {
    width: scale(7),
    minHeight: MIN_BAR_HEIGHT,
    borderRadius: scale(999),
  },
  waveformCaption: {
    fontSize: moderateScale(13),
    textAlign: 'center',
    fontWeight: '600',
  },
  transcriptCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: scale(Spacing.md),
    gap: scale(Spacing.sm),
  },
  messageCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: scale(Spacing.md),
    gap: scale(Spacing.xs),
  },
  messageTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  messageBody: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: moderateScale(12),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'BankGothicBT-Medium',
  },
  transcriptText: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(Spacing.sm),
  },
  badge: {
    borderRadius: PILL_RADIUS,
    borderWidth: 1,
    paddingHorizontal: scale(Spacing.md),
    paddingVertical: scale(Spacing.xs),
  },
  badgeText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  inferenceText: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    fontWeight: '500',
  },
  missingText: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
    fontWeight: '700',
  },
  confirmHint: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    fontWeight: '700',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grooveDivider: {
    width: GROOVE_WIDTH,
    height: GROOVE_HEIGHT,
    marginHorizontal: GROOVE_MARGIN,
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
  sideControl: {
    width: scale(92),
    height: CONTROL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: scale(4),
    paddingHorizontal: scale(Spacing.sm),
  },
  sideControlSpacer: {
    width: scale(92),
    height: CONTROL_HEIGHT,
  },
  sideControlText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
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
    width: HERO_BUTTON_SIZE,
    height: HERO_BUTTON_SIZE,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  heroLabel: {
    marginTop: scale(6),
    fontSize: moderateScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  controlPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  disabledButton: {
    opacity: 0.45,
  },
});
