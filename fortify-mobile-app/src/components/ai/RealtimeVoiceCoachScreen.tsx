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
  type RealtimeCoachPhase,
  type RealtimeTranscriptOverlay,
  type VoiceWorkoutMessage,
} from '@/src/types/realtimeCoach';
import type { AIConversationMessage } from '@/src/types/ai';

interface RealtimeVoiceCoachScreenProps {
  phase: RealtimeCoachPhase;
  error: string | null;
  transcriptOverlay: RealtimeTranscriptOverlay | null;
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

const TECHNICAL_ERROR_PATTERNS = [
  /cannot read property/i,
  /undefined/i,
  /native module/i,
  /ExpoTwoWayAudio/i,
  /TypeError/i,
  /ReferenceError/i,
  /Unhandled/i,
  /stack/i,
];

const sanitizeVoiceCoachError = (message: string | null | undefined): string | null => {
  if (!message) return null;
  const trimmed = message.trim();
  if (!trimmed) return null;

  if (TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return 'Voice Coach could not start. Try again in a moment.';
  }

  return trimmed;
};

export function RealtimeVoiceCoachScreen({
  phase,
  error,
  transcriptOverlay,
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
  const transcriptOpacity = useRef(new Animated.Value(transcriptOverlay ? 1 : 0)).current;
  const heroMinHeight = Math.max(500, Math.min(650, height - 230));
  const heroLift = Math.max(76, Math.min(118, height * 0.12));
  const talkButtonBottom = Math.max(28, Math.min(44, height * 0.044));
  const transcriptColor = visibleTranscript?.speaker === 'coach'
    ? colors.accent
    : colors.textPrimary;
  const displayError = sanitizeVoiceCoachError(error);
  const displayTemplateSaveError = sanitizeVoiceCoachError(templateSaveError);

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
      <View style={[styles.hero, { minHeight: heroMinHeight, paddingBottom: heroLift }]}>
        <DumbbellVoiceVisualizer phase={phase} />
        <View style={styles.transcriptSlot} pointerEvents="none">
          {visibleTranscript ? (
            <Animated.Text style={[styles.transcript, { color: transcriptColor, opacity: transcriptOpacity }]}>
              {visibleTranscript.text}
            </Animated.Text>
          ) : null}
        </View>
        {displayError ? <Text style={styles.error}>{displayError}</Text> : null}
        {displayTemplateSaveError ? <Text style={styles.error}>{displayTemplateSaveError}</Text> : null}

        <TouchableOpacity
          style={[
            styles.talkButtonRing,
            {
              borderColor: isActive ? Colors.error : colors.accent,
              bottom: talkButtonBottom,
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
              { backgroundColor: isActive ? Colors.error : colors.accentLight },
            ]}
          />
        </TouchableOpacity>
      </View>

      {voiceWorkoutMessages.length > 0 ? (
        <View style={styles.workoutSection}>
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
        </View>
      ) : null}
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingTop: 0,
  },
  transcript: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  transcriptSlot: {
    minHeight: 56,
    justifyContent: 'center',
    width: '100%',
  },
  error: {
    ...Typography.bodySmall,
    color: Colors.error,
    textAlign: 'center',
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
  talkButtonCore: {
    width: 78,
    height: 78,
    borderRadius: BorderRadius.full,
  },
  workoutSection: {
    gap: Spacing.md,
  },
});
