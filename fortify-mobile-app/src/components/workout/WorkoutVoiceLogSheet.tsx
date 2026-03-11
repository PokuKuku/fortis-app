import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
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
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { Colors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';
import { createVoiceLogFileName, interpretWorkoutVoiceLog } from '@/src/services/workoutVoiceService';
import { useWorkoutStore } from '@/src/store/workoutStore';
import type { WorkoutVoiceInterpretation } from '@/src/types/workoutVoice';
import { moderateScale, scale } from '@/src/utils/responsive';

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

const MIME_BY_EXTENSION: Record<string, string> = {
  m4a: 'audio/m4a',
  mp4: 'audio/mp4',
  caf: 'audio/x-caf',
  wav: 'audio/wav',
  webm: 'audio/webm',
};

const getMimeTypeFromUri = (uri: string | null) => {
  if (!uri) return 'audio/m4a';
  const extension = uri.split('.').pop()?.toLowerCase() ?? 'm4a';
  return MIME_BY_EXTENSION[extension] || 'audio/m4a';
};

const getMissingFieldsLabel = (interpretation: WorkoutVoiceInterpretation | null) => {
  if (!interpretation || interpretation.missingFields.length === 0) return null;
  if (interpretation.missingFields.length === 1) {
    return `I still need ${interpretation.missingFields[0]}.`;
  }
  const allButLast = interpretation.missingFields.slice(0, -1).join(', ');
  const last = interpretation.missingFields[interpretation.missingFields.length - 1];
  return `I still need ${allButLast}, and ${last}.`;
};

const SET_TYPE_LABELS = {
  normal: 'Normal',
  warmup: 'Warm-up',
  dropset: 'Drop Set',
  failure: 'Failure',
} as const;

const getInferenceCopy = (interpretation: WorkoutVoiceInterpretation) => {
  const parts: string[] = [];

  if (interpretation.inferredSets) {
    parts.push('Set count was inferred.');
  }
  if (interpretation.inferredWeightUnit) {
    parts.push(`Weight unit defaulted to ${interpretation.weightUnit}.`);
  }
  if (interpretation.inferredSetType) {
    parts.push(`Set type defaulted to ${SET_TYPE_LABELS[interpretation.setType].toLowerCase()}.`);
  }

  return parts.join(' ');
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

export function WorkoutVoiceLogSheet({
  visible,
  exerciseLocalId,
  onClose,
}: WorkoutVoiceLogSheetProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
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
  const recordingRef = useRef<Audio.Recording | null>(null);
  const overlayOpenRef = useRef(false);
  const autoStartedExerciseRef = useRef<string | null>(null);
  const requestVersionRef = useRef(0);

  const exercise = useMemo(
    () => session?.exercises.find((entry) => entry.localId === exerciseLocalId) ?? null,
    [exerciseLocalId, session?.exercises]
  );
  const defaultWeightUnit = exercise ? (weightUnits[exercise.exerciseId] || 'lbs') : 'lbs';
  const accentGradient = colors.accentGradient as unknown as [string, string, ...string[]];

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
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
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
      autoStartedExerciseRef.current = null;
      resetSheet();
      void discardRecording();
    }
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
    if (!exercise) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setErrorMessage(null);
    setInterpretation(null);

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage('Microphone access is required for voice logging.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      recording.setProgressUpdateInterval(70);
      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording) return;
        const metering = typeof status.metering === 'number' ? status.metering : -60;
        const normalized = Math.max(0.08, Math.min(1, (metering + 60) / 60));
        setMeterLevel(normalized);
      });
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setPhase('listening');
    } catch (error) {
      await discardRecording();
      setErrorMessage(error instanceof Error ? error.message : 'Unable to start recording.');
    }
  };

  useEffect(() => {
    if (!visible || !exerciseLocalId || !exercise) {
      return;
    }
    if (autoStartedExerciseRef.current === exerciseLocalId) {
      return;
    }
    if (phase !== 'idle' || errorMessage || interpretation || recordingRef.current) {
      return;
    }

    autoStartedExerciseRef.current = exerciseLocalId;
    void startListening();
  }, [errorMessage, exercise, exerciseLocalId, interpretation, phase, visible]);

  const stopListening = async () => {
    const recording = recordingRef.current;
    if (!recording || !exercise) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('processing');
    setErrorMessage(null);
    setMeterLevel(0.12);
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;

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
        setErrorMessage(response.error?.message || 'Unable to interpret that workout entry.');
        setPhase('idle');
        return;
      }

      setInterpretation(response.interpretation);
      setPhase('review');
    } catch (error) {
      await discardRecording();
      if (requestVersion !== requestVersionRef.current) {
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Unable to process that recording.');
      setPhase('idle');
    }
  };

  const handleApply = () => {
    if (!exerciseLocalId || !interpretation) return;

    const result = applyVoiceLog(exerciseLocalId, interpretation);
    if (!result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage('Unable to apply that voice entry. Please try again.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const summaryBadges = interpretation
    ? [
        `${interpretation.sets ?? '—'} set${interpretation.sets === 1 ? '' : 's'}`,
        `${interpretation.weight ?? '—'} ${interpretation.weightUnit ?? defaultWeightUnit}`,
        `${interpretation.reps ?? '—'} reps`,
        SET_TYPE_LABELS[interpretation.setType],
      ]
    : [];
  const canApply = !!(
    interpretation
    && interpretation.sets
    && interpretation.weight !== null
    && interpretation.reps !== null
    && interpretation.weightUnit
    && interpretation.missingFields.length === 0
  );
  const applyEnabled = canApply && phase === 'review';
  const missingLabel = getMissingFieldsLabel(interpretation);

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
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          entering={SlideInDown.duration(320).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(240).easing(Easing.in(Easing.cubic))}
        >
          <Pressable
            style={[
              styles.container,
              themedStyles.container,
              { marginBottom: Math.max(insets.bottom, scale(24)) },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <StainlessSteelPattern />

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

                {(interpretation.inferredSets || interpretation.inferredWeightUnit || interpretation.inferredSetType) && (
                  <Text style={[styles.inferenceText, { color: colors.textSecondary }]}>
                    {getInferenceCopy(interpretation)}
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
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: scale(Spacing.lg),
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
    gap: scale(Spacing.md),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
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
