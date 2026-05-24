import React, { useEffect, useRef } from 'react';
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
  isGeneratingVoiceWorkout: boolean;
  savingWorkoutMessageId: string | null;
  startingWorkoutMessageId: string | null;
  isWorkoutActive: boolean;
  isActive: boolean;
  isUserTurnActive: boolean;
  templateSaveError?: string | null;
  onTalkStart: () => void;
  onTalkEnd: () => void;
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

export function RealtimeVoiceCoachScreen({
  phase,
  error,
  transcriptOverlay: _transcriptOverlay,
  userAudioLevel,
  coachAudioLevel,
  debugStatus,
  voiceWorkoutMessages,
  isGeneratingVoiceWorkout,
  savingWorkoutMessageId,
  startingWorkoutMessageId,
  isWorkoutActive,
  isActive,
  isUserTurnActive,
  templateSaveError,
  onTalkStart,
  onTalkEnd,
  onViewWorkoutTemplate,
  onAddWorkoutTemplate,
  onStartWorkoutTemplate,
}: RealtimeVoiceCoachScreenProps) {
  const { colors, isDark } = useTheme();
  const { height } = useWindowDimensions();
  const voiceCardAnimationsRef = useRef<Record<string, Animated.Value>>({});
  const animatedVoiceCardIdsRef = useRef<Set<string>>(new Set());
  const pendingWorkoutCardAnimation = useRef(new Animated.Value(0)).current;
  const heroMinHeight = Math.max(620, height - 160);
  const talkButtonBottom = Math.max(28, Math.min(44, height * 0.044));
  const visualizerTop = Math.max(168, Math.min(246, height * 0.25));
  const middleSlotBottom = talkButtonBottom + 72;
  const middleSlotFrame = {
    top: visualizerTop + 156 + Spacing.lg,
    bottom: middleSlotBottom,
  };
  const middleSlotHeight = Math.max(96, heroMinHeight - middleSlotFrame.top - middleSlotFrame.bottom);
  const shouldVisualizeUserAudio = isUserTurnActive && phase !== 'coach_speaking';
  const isTalkButtonReady = debugStatus.setupComplete && phase !== 'connecting' && phase !== 'error';
  const clampedUserAudioLevel = Math.max(0, Math.min(1, userAudioLevel));
  const normalizedUserLevel = shouldVisualizeUserAudio && clampedUserAudioLevel > 0.01
    ? Math.max(0.08, clampedUserAudioLevel)
    : 0;
  const displayError = sanitizeVoiceCoachError(error);
  const displayTemplateSaveError = sanitizeVoiceCoachError(templateSaveError);
  const hasVoiceCards = voiceWorkoutMessages.length > 0 || isGeneratingVoiceWorkout;
  const pendingWorkoutCardStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.04)',
    borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
  };

  const getVoiceCardAnimation = (messageId: string): Animated.Value => {
    if (!voiceCardAnimationsRef.current[messageId]) {
      voiceCardAnimationsRef.current[messageId] = new Animated.Value(0);
    }
    return voiceCardAnimationsRef.current[messageId];
  };

  useEffect(() => {
    const currentMessageIds = new Set(voiceWorkoutMessages.map((message) => message.id));
    Object.keys(voiceCardAnimationsRef.current).forEach((messageId) => {
      if (!currentMessageIds.has(messageId)) {
        delete voiceCardAnimationsRef.current[messageId];
        animatedVoiceCardIdsRef.current.delete(messageId);
      }
    });

    voiceWorkoutMessages.forEach((message) => {
      const cardAnimation = getVoiceCardAnimation(message.id);
      if (animatedVoiceCardIdsRef.current.has(message.id)) return;
      animatedVoiceCardIdsRef.current.add(message.id);
      Animated.spring(cardAnimation, {
        toValue: 1,
        friction: 7,
        tension: 115,
        useNativeDriver: true,
      }).start();
    });
  }, [voiceWorkoutMessages]);

  useEffect(() => {
    if (!isGeneratingVoiceWorkout) {
      pendingWorkoutCardAnimation.setValue(0);
      return;
    }

    Animated.spring(pendingWorkoutCardAnimation, {
      toValue: 1,
      friction: 7,
      tension: 115,
      useNativeDriver: true,
    }).start();
  }, [isGeneratingVoiceWorkout, pendingWorkoutCardAnimation]);

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
          testID="voice-middle-content-slot"
          style={[
            styles.betweenSlot,
            middleSlotFrame,
            { height: middleSlotHeight },
            { justifyContent: hasVoiceCards ? 'flex-start' : 'center' },
          ]}
        >
          {displayError ? <Text style={styles.error}>{displayError}</Text> : null}
          {displayTemplateSaveError ? <Text style={styles.error}>{displayTemplateSaveError}</Text> : null}
          {hasVoiceCards ? (
            <ScrollView
              testID="voice-card-scroll"
              style={[styles.voiceCardScroll, { maxHeight: middleSlotHeight }]}
              contentContainerStyle={styles.workoutSection}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {isGeneratingVoiceWorkout ? (
                <Animated.View
                  testID="voice-workout-loading-card"
                  style={[
                    styles.voiceCardShell,
                    {
                      opacity: pendingWorkoutCardAnimation,
                      transform: [
                        {
                          translateY: pendingWorkoutCardAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [14, 0],
                          }),
                        },
                        {
                          scale: pendingWorkoutCardAnimation.interpolate({
                            inputRange: [0, 0.7, 1],
                            outputRange: [0.96, 1.02, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={[styles.pendingWorkoutCard, pendingWorkoutCardStyle]}>
                    <Text style={[styles.pendingWorkoutTitle, { color: colors.textPrimary }]}>
                      Building Workout
                    </Text>
                    <Text style={[styles.pendingWorkoutMeta, { color: colors.textSecondary }]}>
                      Coming up...
                    </Text>
                  </View>
                </Animated.View>
              ) : null}
              {voiceWorkoutMessages.map((message) => {
                const conversationMessage = asConversationMessage(message);
                const cardAnimation = getVoiceCardAnimation(message.id);
                return (
                  <Animated.View
                    key={message.id}
                    testID={`voice-card-shell-${message.id}`}
                    style={[
                      styles.voiceCardShell,
                      {
                        opacity: cardAnimation,
                        transform: [
                          {
                            translateY: cardAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [14, 0],
                            }),
                          },
                          {
                            scale: cardAnimation.interpolate({
                              inputRange: [0, 0.7, 1],
                              outputRange: [0.96, 1.02, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <ChatWorkoutTemplateCard
                      template={message.workoutTemplate}
                      onView={() => onViewWorkoutTemplate(conversationMessage)}
                      onAdd={() => onAddWorkoutTemplate(conversationMessage)}
                      onStart={() => onStartWorkoutTemplate(conversationMessage)}
                      isAdding={savingWorkoutMessageId === message.id}
                      isAdded={Boolean(message.savedWorkoutTemplateId)}
                      isStarting={startingWorkoutMessageId === message.id}
                      isStartDisabled={isWorkoutActive}
                    />
                  </Animated.View>
                );
              })}
            </ScrollView>
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
              opacity: isTalkButtonReady ? 1 : 0.38,
              transform: [{ scale: 1 + normalizedUserLevel * 0.06 }],
            },
          ]}
          onPress={() => {
            // Press-and-hold uses press-in/out; onPress is intentionally inert.
          }}
          onPressIn={() => {
            if (!isTalkButtonReady) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onTalkStart();
          }}
          onPressOut={() => {
            if (!isTalkButtonReady) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onTalkEnd();
          }}
          activeOpacity={0.84}
          accessibilityRole="button"
          accessibilityLabel="Hold to talk to Voice Coach"
          accessibilityState={{ disabled: !isTalkButtonReady }}
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
    left: -Spacing.sm,
    right: -Spacing.sm,
    alignSelf: 'stretch',
    gap: Spacing.sm,
    overflow: 'visible',
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
  voiceCardShell: {
    width: '100%',
  },
  pendingWorkoutCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  pendingWorkoutTitle: {
    ...Typography.h4,
  },
  pendingWorkoutMeta: {
    ...Typography.bodySmall,
  },
  workoutSection: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
});
