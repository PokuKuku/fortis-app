import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ChatWorkoutTemplateCard } from '@/src/components/ai/ChatWorkoutTemplateCard';
import { DumbbellVoiceVisualizer } from '@/src/components/ai/DumbbellVoiceVisualizer';
import {
  type RealtimeCoachDebugStatus,
  type RealtimeCoachPhase,
  type RealtimeTranscriptOverlay,
  type VoiceWorkoutMessage,
} from '@/src/types/realtimeCoach';
import type { AIConversationMessage } from '@/src/types/ai';

interface RealtimeVoiceCoachScreenProps {
  phase: RealtimeCoachPhase;
  error: string | null;
  transcriptOverlay: RealtimeTranscriptOverlay | null;
  userAudioLevel: number;
  coachAudioLevel: number;
  debugStatus: RealtimeCoachDebugStatus;
  voiceWorkoutMessages: VoiceWorkoutMessage[];
  savingWorkoutMessageId: string | null;
  startingWorkoutMessageId: string | null;
  isWorkoutActive: boolean;
  isActive: boolean;
  templateSaveError?: string | null;
  onStart: () => void;
  onStop: () => void;
  onViewWorkoutTemplate: (message: AIConversationMessage) => void;
  onAddWorkoutTemplate: (message: AIConversationMessage) => void;
  onStartWorkoutTemplate: (message: AIConversationMessage) => void;
}

const asConversationMessage = (message: VoiceWorkoutMessage): AIConversationMessage => ({
  id: message.id,
  role: 'assistant',
  intent: 'GENERAL_CHAT',
  content: message.text,
  createdAt: new Date().toISOString(),
  workoutTemplate: message.workoutTemplate,
  savedWorkoutTemplateId: message.savedWorkoutTemplateId ?? null,
});

function withOpacity(color: string, opacity: number): string {
  if (!color.startsWith('#')) return color;
  const hex = color.replace('#', '');
  if (hex.length !== 6) return color;

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

const sanitizeVoiceCoachError = (message: string | null | undefined): string | null => {
  if (!message) return null;
  const trimmed = message.trim();
  if (!trimmed) return null;
  return trimmed;
};

const TYPEWRITER_INTERVAL_MS = 18;
const MAX_TRANSCRIPT_WINDOW_CHARS = 72;

const formatTranscriptText = (text: string): string => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  const hasUppercaseLetter = /[A-Z]/.test(normalized);
  const cased = hasUppercaseLetter
    ? normalized
    : normalized
        .replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`)
        .replace(/\bi\b/g, 'I')
        .replace(/\bi(['’]m|['’]ve|['’]ll|['’]d)\b/g, (_, suffix: string) => `I${suffix}`);

  return cased;
};

const getFreshTranscriptWindow = (text: string): string => {
  if (text.length <= MAX_TRANSCRIPT_WINDOW_CHARS) return text;

  const words = text.split(' ');
  const windowWords: string[] = [];

  for (let index = words.length - 1; index >= 0; index -= 1) {
    const candidate = [words[index], ...windowWords].join(' ');
    if (candidate.length > MAX_TRANSCRIPT_WINDOW_CHARS && windowWords.length > 0) {
      break;
    }
    windowWords.unshift(words[index]);
  }

  return windowWords.join(' ') || text.slice(-MAX_TRANSCRIPT_WINDOW_CHARS).trim();
};

export function RealtimeVoiceCoachScreen({
  phase,
  error,
  transcriptOverlay,
  userAudioLevel,
  coachAudioLevel,
  debugStatus,
  voiceWorkoutMessages,
  savingWorkoutMessageId,
  startingWorkoutMessageId,
  isWorkoutActive,
  isActive,
  templateSaveError,
  onStart,
  onStop,
  onViewWorkoutTemplate,
  onAddWorkoutTemplate,
  onStartWorkoutTemplate,
}: RealtimeVoiceCoachScreenProps) {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const [visibleTranscript, setVisibleTranscript] = useState<RealtimeTranscriptOverlay | null>(transcriptOverlay);
  const [displayedTranscriptText, setDisplayedTranscriptText] = useState('');
  const transcriptOpacity = useRef(new Animated.Value(transcriptOverlay ? 1 : 0)).current;
  const typewriterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typewriterTextRef = useRef('');
  const heroMinHeight = Math.max(620, height - 160);
  const talkButtonBottom = Math.max(28, Math.min(44, height * 0.044));
  const visualizerTop = Math.max(168, Math.min(246, height * 0.25));
  const middleSlotFrame = {
    top: visualizerTop + 156 + Spacing.lg,
    bottom: talkButtonBottom + 120,
  };
  const transcriptColor = visibleTranscript?.speaker === 'coach'
    ? colors.accent
    : colors.textPrimary;
  const shouldVisualizeUserAudio = isActive && phase !== 'coach_speaking';
  const clampedUserAudioLevel = Math.max(0, Math.min(1, userAudioLevel));
  const normalizedUserLevel = shouldVisualizeUserAudio && clampedUserAudioLevel > 0.01
    ? Math.max(0.08, clampedUserAudioLevel)
    : 0;
  const displayError = sanitizeVoiceCoachError(error);
  const displayTemplateSaveError = sanitizeVoiceCoachError(templateSaveError);
  const hasVoiceCards = voiceWorkoutMessages.length > 0;
  const hasMiddleContent = Boolean(visibleTranscript || displayError || displayTemplateSaveError || hasVoiceCards);
  const shouldShowDebugStatus = !hasMiddleContent && (
    isActive
    || phase === 'error'
    || debugStatus.microphoneChunksSent > 0
    || debugStatus.serverMessagesReceived > 0
    || Boolean(debugStatus.lastSocketClose)
  );
  const debugText = [
    `phase:${phase}`,
    `ws:${debugStatus.socketOpened ? 'open' : 'no'}`,
    `setup:${debugStatus.setupComplete ? 'yes' : 'no'}`,
    `rec:${debugStatus.recordingStarted ? 'yes' : 'no'}`,
    typeof debugStatus.recordingChange === 'boolean' ? `nativeRec:${debugStatus.recordingChange ? 'yes' : 'no'}` : null,
    `mic:${debugStatus.microphoneChunksSent}`,
    debugStatus.lastMicrophoneChunkBytes ? `bytes:${debugStatus.lastMicrophoneChunkBytes}` : null,
    debugStatus.micWatchdogTriggered ? 'micWatch:yes' : null,
    debugStatus.nativeAudioFallback ? `native:${debugStatus.nativeAudioFallback}` : null,
    debugStatus.audioInterruption ? `interrupt:${debugStatus.audioInterruption}` : null,
    `srv:${debugStatus.serverMessagesReceived}`,
    debugStatus.lastServerMessageType ? `last:${debugStatus.lastServerMessageType}` : null,
    `in:${clampedUserAudioLevel.toFixed(2)}`,
    `out:${Math.max(0, Math.min(1, coachAudioLevel)).toFixed(2)}`,
    debugStatus.lastSocketClose ? `close:${debugStatus.lastSocketClose}` : null,
  ].filter(Boolean).join(' ');

  useEffect(() => () => {
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
      typewriterTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!transcriptOverlay) {
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
        typewriterTimeoutRef.current = null;
      }
      typewriterTextRef.current = '';
      setDisplayedTranscriptText('');
      return;
    }

    const targetText = getFreshTranscriptWindow(formatTranscriptText(transcriptOverlay.text));
    const existingText = typewriterTextRef.current;
    const shouldContinue = targetText.startsWith(existingText) && existingText.length > 0;
    const startingText = shouldContinue ? existingText : '';
    typewriterTextRef.current = startingText;
    setDisplayedTranscriptText(startingText);

    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
      typewriterTimeoutRef.current = null;
    }

    const step = () => {
      const current = typewriterTextRef.current;
      if (current.length >= targetText.length) {
        typewriterTimeoutRef.current = null;
        return;
      }

      const next = targetText.slice(0, current.length + 1);
      typewriterTextRef.current = next;
      setDisplayedTranscriptText(next);
      typewriterTimeoutRef.current = setTimeout(step, TYPEWRITER_INTERVAL_MS);
    };

    typewriterTimeoutRef.current = setTimeout(step, TYPEWRITER_INTERVAL_MS);
  }, [transcriptOverlay]);

  useEffect(() => {
    if (transcriptOverlay) {
      setVisibleTranscript(transcriptOverlay);
      Animated.timing(transcriptOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(transcriptOpacity, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setVisibleTranscript(null);
      }
    });
  }, [transcriptOpacity, transcriptOverlay]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { minHeight: heroMinHeight }]}>
        <View style={[styles.visualizerAnchor, { top: visualizerTop }]}>
          <DumbbellVoiceVisualizer phase={phase} coachAudioLevel={coachAudioLevel} />
        </View>

        <View
          style={[
            styles.betweenSlot,
            middleSlotFrame,
            { justifyContent: hasVoiceCards ? 'flex-start' : 'center' },
          ]}
        >
          {visibleTranscript ? (
            <View style={styles.transcriptSlot} pointerEvents="none">
              <Animated.Text
                allowFontScaling={false}
                numberOfLines={2}
                ellipsizeMode="clip"
                style={[styles.transcript, { color: transcriptColor, opacity: transcriptOpacity }]}
              >
                {displayedTranscriptText}
              </Animated.Text>
            </View>
          ) : null}
          {displayError ? <Text style={styles.error}>{displayError}</Text> : null}
          {displayTemplateSaveError ? <Text style={styles.error}>{displayTemplateSaveError}</Text> : null}
          {voiceWorkoutMessages.length > 0 ? (
            <ScrollView
              style={styles.voiceCardScroll}
              contentContainerStyle={styles.workoutSection}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {voiceWorkoutMessages.map((message) => {
                const conversationMessage = asConversationMessage(message);
                return (
                  <ChatWorkoutTemplateCard
                    key={message.id}
                    template={message.workoutTemplate}
                    onView={() => onViewWorkoutTemplate(conversationMessage)}
                    onAdd={() => onAddWorkoutTemplate(conversationMessage)}
                    onStart={() => onStartWorkoutTemplate(conversationMessage)}
                    isAdding={savingWorkoutMessageId === message.id}
                    isAdded={Boolean(message.savedWorkoutTemplateId)}
                    isStarting={startingWorkoutMessageId === message.id}
                    isStartDisabled={isWorkoutActive}
                  />
                );
              })}
            </ScrollView>
          ) : null}
          {shouldShowDebugStatus ? (
            <Text style={[styles.debugText, { color: colors.textTertiary }]}>
              {debugText}
            </Text>
          ) : null}
        </View>

        {[0, 1, 2].map((index) => (
          <View
            key={`user-audio-ring-${index}`}
            pointerEvents="none"
            style={[
              styles.userAudioRing,
              {
                bottom: talkButtonBottom - 8 - index * 6,
                width: 112 + index * 18 + normalizedUserLevel * (34 + index * 8),
                height: 112 + index * 18 + normalizedUserLevel * (34 + index * 8),
                borderColor: withOpacity(colors.accent, Math.max(0, (0.3 - index * 0.07) * normalizedUserLevel)),
                opacity: normalizedUserLevel > 0 ? 1 : 0,
              },
            ]}
          />
        ))}

        <TouchableOpacity
          style={[
            styles.talkButtonRing,
            {
              borderColor: colors.accent,
              bottom: talkButtonBottom,
              transform: [{ scale: 1 + normalizedUserLevel * 0.06 }],
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (isActive) {
              onStop();
            } else {
              onStart();
            }
          }}
          activeOpacity={0.84}
          accessibilityRole="button"
          accessibilityLabel={isActive ? 'Stop Voice Coach' : 'Start Voice Coach'}
        >
          <View
            style={[
              styles.talkButtonCore,
              {
                backgroundColor: colors.accentLight,
                transform: [{ scale: 1 + normalizedUserLevel * 0.1 }],
              },
            ]}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.xl,
  },
  hero: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  visualizerAnchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  betweenSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    alignSelf: 'stretch',
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  transcript: {
    ...Typography.h4,
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: Spacing.md,
    textTransform: 'none',
    maxHeight: 60,
    overflow: 'hidden',
  },
  transcriptSlot: {
    minHeight: 60,
    justifyContent: 'center',
    width: '100%',
  },
  error: {
    ...Typography.bodySmall,
    color: Colors.error,
    textAlign: 'center',
  },
  debugText: {
    ...Typography.caption,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Spacing.sm,
  },
  talkButtonRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAudioRing: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  talkButtonCore: {
    width: 78,
    height: 78,
    borderRadius: BorderRadius.full,
  },
  voiceCardScroll: {
    width: '100%',
    flex: 1,
  },
  workoutSection: {
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
});
