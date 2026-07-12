import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatBubbleBottomCenterTextIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { BorderRadius, IconSizes, Spacing } from '@/constants/Sizes';
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
import type { AIClarificationOption, AIConversationMessage } from '@/src/types/ai';
import type { AIPendingMedia } from '@/src/types/ai';
import { AIMediaPreviewStrip } from '@/src/components/ai/AIMediaPreviewStrip';

interface RealtimeVoiceCoachScreenProps {
  phase: RealtimeCoachPhase;
  error: string | null;
  transcriptOverlay: RealtimeTranscriptOverlay | null;
  userAudioLevel: number;
  coachAudioLevel: number;
  debugStatus: RealtimeCoachDebugStatus;
  voiceWorkoutMessages: VoiceWorkoutMessage[];
  isGeneratingVoiceWorkout: boolean;
  voiceWorkoutGenerationError?: string | null;
  savingWorkoutMessageId: string | null;
  startingWorkoutMessageId: string | null;
  isWorkoutActive: boolean;
  isActive: boolean;
  isUserTurnActive: boolean;
  isCreatorScriptEnabled?: boolean;
  isSpeakingCreatorScript?: boolean;
  creatorScriptError?: string | null;
  templateSaveError?: string | null;
  onTalkStart: () => void;
  onTalkEnd: () => void;
  onSpeakCreatorScript?: (script: string) => Promise<boolean> | boolean;
  onViewWorkoutTemplate: (message: AIConversationMessage) => void;
  onAddWorkoutTemplate: (message: AIConversationMessage) => void;
  onStartWorkoutTemplate: (message: AIConversationMessage) => void;
  onDismissWorkoutTemplate: (messageId: string) => void;
  onSelectWorkoutClarification?: (messageId: string, option: string | AIClarificationOption) => boolean;
  onRetryWorkoutGeneration?: () => boolean;
  interactionMode?: 'push_to_talk' | 'realtime';
  pendingMedia?: AIPendingMedia[];
  onRemovePendingMedia?: (id: string) => void;
  experienceMode?: 'coach' | 'conversation';
  onSendTextPrompt?: (text: string) => boolean;
  onPrepareTextPrompt?: () => void;
}

const CREATOR_SCRIPT_MAX_CHARS = 500;
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const asConversationMessage = (message: VoiceWorkoutMessage): AIConversationMessage => ({
  id: message.id,
  role: 'assistant',
  intent: 'GENERAL_CHAT',
  content: message.text,
  createdAt: new Date().toISOString(),
  workoutTemplate: message.workoutTemplate,
  savedWorkoutTemplateId: message.savedWorkoutTemplateId ?? null,
});

const sanitizeVoiceCoachError = (message: string | null | undefined): string | null => {
  if (!message) return null;
  const trimmed = message.trim();
  if (!trimmed) return null;

  if (
    /voice coach connection failed/i.test(trimmed)
    || /websocket/i.test(trimmed)
    || /_defaultPrevented|_timeStamp|_bubbles|_cancelable|_composed/i.test(trimmed)
    || (/^\{[\s\S]*\}$/.test(trimmed) && /"type"\s*:\s*"error"/i.test(trimmed))
  ) {
    return 'Voice Coach had trouble connecting. Check your connection and try again.';
  }

  return trimmed;
};

const isFriendlyVoiceNotice = (message: string | null): boolean =>
  Boolean(message && (
    /voice coach limit/i.test(message)
    || /try again tomorrow/i.test(message)
    || /quick breather/i.test(message)
    || /trouble connecting/i.test(message)
  ));

export function RealtimeVoiceCoachScreen({
  phase,
  error,
  transcriptOverlay: _transcriptOverlay,
  userAudioLevel,
  coachAudioLevel,
  debugStatus,
  voiceWorkoutMessages,
  isGeneratingVoiceWorkout,
  voiceWorkoutGenerationError = null,
  savingWorkoutMessageId,
  startingWorkoutMessageId,
  isWorkoutActive,
  isActive,
  isUserTurnActive,
  isCreatorScriptEnabled = false,
  isSpeakingCreatorScript = false,
  creatorScriptError = null,
  templateSaveError,
  onTalkStart,
  onTalkEnd,
  onSpeakCreatorScript,
  onViewWorkoutTemplate,
  onAddWorkoutTemplate,
  onStartWorkoutTemplate,
  onDismissWorkoutTemplate,
  onSelectWorkoutClarification,
  onRetryWorkoutGeneration,
  interactionMode = 'push_to_talk',
  pendingMedia = [],
  onRemovePendingMedia,
  experienceMode = 'coach',
  onSendTextPrompt,
  onPrepareTextPrompt,
}: RealtimeVoiceCoachScreenProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [creatorScript, setCreatorScript] = useState('');
  const [isPromptSheetVisible, setPromptSheetVisible] = useState(false);
  const [textPrompt, setTextPrompt] = useState('');
  const { width, height } = useWindowDimensions();
  const promptSheetBottomPadding = Math.max(insets.bottom + Spacing.lg, Spacing['2xl']);
  const promptDismissPanResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_event, gestureState) =>
        gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderRelease: (_event, gestureState) => {
        if (gestureState.dy > 44 || gestureState.vy > 0.45) {
          Keyboard.dismiss();
          setPromptSheetVisible(false);
        }
      },
    }),
    []
  );
  const voiceCardAnimationsRef = useRef<Record<string, Animated.Value>>({});
  const voiceCardDismissAnimationsRef = useRef<Record<string, Animated.Value>>({});
  const animatedVoiceCardIdsRef = useRef<Set<string>>(new Set());
  const [dismissingVoiceCardIds, setDismissingVoiceCardIds] = useState<Set<string>>(() => new Set());
  const pendingWorkoutCardAnimation = useRef(new Animated.Value(0)).current;
  const userAudioScaleAnimation = useRef(new Animated.Value(0)).current;
  const heroMinHeight = Math.max(680, height - 120);
  const viewportScale = Math.max(0.78, Math.min(1, Math.min(width / 390, height / 844)));
  const visualizerHeight = 156 * viewportScale;
  const talkButtonSize = Math.round(96 * viewportScale);
  const talkButtonCoreSize = Math.round(78 * viewportScale);
  const talkButtonBorderWidth = Math.max(4, Math.round(5 * viewportScale));
  const talkButtonBottom = Math.max(20, Math.min(38, height * 0.038));
  const visualizerTop = Math.max(138, Math.min(190, height * 0.2));
  const middleSlotBottom = interactionMode === 'realtime'
    ? talkButtonBottom
    : talkButtonBottom + talkButtonSize + Spacing.md;
  const middleSlotFrame = {
    top: visualizerTop + visualizerHeight + Spacing.md,
    bottom: middleSlotBottom,
  };
  const middleSlotHeight = Math.max(96, heroMinHeight - middleSlotFrame.top - middleSlotFrame.bottom);
  const shouldVisualizeUserAudio = isUserTurnActive && phase !== 'coach_speaking';
  const isTalkButtonReady = (!isActive || debugStatus.setupComplete) && phase !== 'connecting' && phase !== 'error';
  const clampedUserAudioLevel = Math.max(0, Math.min(1, userAudioLevel));
  const normalizedUserLevel = shouldVisualizeUserAudio && clampedUserAudioLevel > 0.01
    ? Math.max(0.08, clampedUserAudioLevel)
    : 0;
  const talkButtonAudioScale = userAudioScaleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.32],
  });
  const talkButtonCoreAudioScale = userAudioScaleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });
  const displayError = sanitizeVoiceCoachError(error);
  const displayTemplateSaveError = sanitizeVoiceCoachError(templateSaveError);
  const shouldShowErrorAsNotice = isFriendlyVoiceNotice(displayError);
  const hasVoiceCards = voiceWorkoutMessages.length > 0 || isGeneratingVoiceWorkout || Boolean(voiceWorkoutGenerationError);
  const cardHorizontalInset = width < 380 ? 0 : Spacing.xs;
  const pendingWorkoutCardStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.04)',
    borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
  };
  const creatorScriptPanelStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.04)',
    borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
  };
  const creatorScriptInputStyle = {
    backgroundColor: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.62)',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    color: colors.textPrimary,
  };
  const creatorScriptTop = Math.max(8, visualizerTop - 118);

  const getVoiceCardAnimation = (messageId: string): Animated.Value => {
    if (!voiceCardAnimationsRef.current[messageId]) {
      voiceCardAnimationsRef.current[messageId] = new Animated.Value(0);
    }
    return voiceCardAnimationsRef.current[messageId];
  };

  const getVoiceCardDismissAnimation = (messageId: string): Animated.Value => {
    if (!voiceCardDismissAnimationsRef.current[messageId]) {
      voiceCardDismissAnimationsRef.current[messageId] = new Animated.Value(1);
    }
    return voiceCardDismissAnimationsRef.current[messageId];
  };

  useEffect(() => {
    Animated.timing(userAudioScaleAnimation, {
      toValue: normalizedUserLevel,
      duration: normalizedUserLevel > 0 ? 85 : 140,
      easing: normalizedUserLevel > 0 ? Easing.out(Easing.quad) : Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [normalizedUserLevel, userAudioScaleAnimation]);

  useEffect(() => {
    const currentMessageIds = new Set(voiceWorkoutMessages.map((message) => message.id));
    Object.keys(voiceCardAnimationsRef.current).forEach((messageId) => {
      if (!currentMessageIds.has(messageId)) {
        delete voiceCardAnimationsRef.current[messageId];
        animatedVoiceCardIdsRef.current.delete(messageId);
      }
    });
    Object.keys(voiceCardDismissAnimationsRef.current).forEach((messageId) => {
      if (!currentMessageIds.has(messageId)) {
        delete voiceCardDismissAnimationsRef.current[messageId];
      }
    });
    setDismissingVoiceCardIds((current) => {
      const next = new Set(Array.from(current).filter((messageId) => currentMessageIds.has(messageId)));
      return next.size === current.size ? current : next;
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

  const handleSpeakCreatorScript = () => {
    if (!onSpeakCreatorScript || isSpeakingCreatorScript) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void onSpeakCreatorScript(creatorScript);
  };

  const submitTextPrompt = () => {
    const trimmed = textPrompt.trim();
    if (!trimmed || !onSendTextPrompt?.(trimmed)) return;
    setTextPrompt('');
    setPromptSheetVisible(false);
  };

  const openTextPrompt = () => {
    onPrepareTextPrompt?.();
    setPromptSheetVisible(true);
  };

  const handleDismissVoiceCard = useCallback((messageId: string) => {
    if (dismissingVoiceCardIds.has(messageId)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDismissingVoiceCardIds((current) => new Set(current).add(messageId));

    const dismissAnimation = getVoiceCardDismissAnimation(messageId);
    Animated.sequence([
      Animated.timing(dismissAnimation, {
        toValue: 1.035,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(dismissAnimation, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      setDismissingVoiceCardIds((current) => {
        const next = new Set(current);
        next.delete(messageId);
        return next;
      });
      dismissAnimation.setValue(1);

      if (finished) {
        onDismissWorkoutTemplate(messageId);
      }
    });
  }, [dismissingVoiceCardIds, onDismissWorkoutTemplate]);

  return (
    <View style={[styles.container, styles.content]}>
      <View style={styles.hero}>
        <View style={styles.pendingMedia}>
          <AIMediaPreviewStrip media={pendingMedia} onRemove={onRemovePendingMedia} />
        </View>
        {isCreatorScriptEnabled ? (
          <View
            testID="creator-script-controls"
            style={[
              styles.creatorScriptPanel,
              creatorScriptPanelStyle,
              { top: creatorScriptTop },
            ]}
          >
            <TextInput
              testID="creator-script-input"
              value={creatorScript}
              onChangeText={(next) => setCreatorScript(next.slice(0, CREATOR_SCRIPT_MAX_CHARS))}
              placeholder="Type roast script"
              placeholderTextColor={colors.textTertiary}
              style={[styles.creatorScriptInput, creatorScriptInputStyle]}
              multiline
              maxLength={CREATOR_SCRIPT_MAX_CHARS}
              returnKeyType="done"
            />
            <View style={styles.creatorScriptFooter}>
              <Text style={[styles.creatorScriptCount, { color: colors.textTertiary }]}>
                {creatorScript.length}/{CREATOR_SCRIPT_MAX_CHARS}
              </Text>
              <TouchableOpacity
                testID="creator-script-speak-button"
                style={[
                  styles.creatorScriptButton,
                  {
                    backgroundColor: colors.accent,
                    opacity: isSpeakingCreatorScript ? 0.56 : 1,
                  },
                ]}
                onPress={handleSpeakCreatorScript}
                disabled={isSpeakingCreatorScript}
                activeOpacity={0.82}
              >
                <Text style={[styles.creatorScriptButtonText, { color: colors.accentForegroundOnFill }]}>
                  {isSpeakingCreatorScript ? 'Speaking' : 'Speak'}
                </Text>
              </TouchableOpacity>
            </View>
            {creatorScriptError ? (
              <Text style={styles.creatorScriptError}>{creatorScriptError}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.visualizerAnchor, { top: visualizerTop }]}>
          <DumbbellVoiceVisualizer
            phase={phase}
            coachAudioLevel={coachAudioLevel}
            scale={viewportScale}
          />
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
          {displayError ? (
            <Text style={[
              shouldShowErrorAsNotice ? styles.notice : styles.error,
              shouldShowErrorAsNotice ? { color: colors.textSecondary } : null,
            ]}>
              {displayError}
            </Text>
          ) : null}
          {displayTemplateSaveError ? <Text style={styles.error}>{displayTemplateSaveError}</Text> : null}
          {hasVoiceCards ? (
            <ScrollView
              testID="voice-card-scroll"
              style={[styles.voiceCardScroll, { maxHeight: middleSlotHeight }]}
              contentContainerStyle={[
                styles.workoutSection,
                {
                  paddingHorizontal: cardHorizontalInset,
                  paddingBottom: Math.max(Spacing.xl, Math.round(Spacing['2xl'] * viewportScale)),
                },
              ]}
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
              {!isGeneratingVoiceWorkout && voiceWorkoutGenerationError ? (
                <View testID="voice-workout-error-card" style={[styles.pendingWorkoutCard, pendingWorkoutCardStyle]}>
                  <Text style={[styles.pendingWorkoutTitle, { color: colors.textPrimary }]}>Workout paused</Text>
                  <Text style={[styles.pendingWorkoutMeta, { color: colors.textSecondary }]}>
                    {voiceWorkoutGenerationError}
                  </Text>
                  <Pressable
                    testID="voice-workout-retry-button"
                    accessibilityRole="button"
                    onPress={onRetryWorkoutGeneration}
                    style={[styles.workoutRetryButton, { backgroundColor: colors.accent }]}
                  >
                    <Text style={[styles.workoutRetryButtonText, { color: colors.accentForegroundOnFill }]}>Try again</Text>
                  </Pressable>
                </View>
              ) : null}
              {voiceWorkoutMessages.map((message) => {
                const conversationMessage = asConversationMessage(message);
                const cardAnimation = getVoiceCardAnimation(message.id);
                const dismissAnimation = getVoiceCardDismissAnimation(message.id);
                const isDismissing = dismissingVoiceCardIds.has(message.id);
                const clarificationOptions = message.clarification?.options ?? [];
                return (
                  <Animated.View
                    key={message.id}
                    testID={`voice-card-shell-${message.id}`}
                    style={[
                      styles.voiceCardShell,
                      {
                        opacity: Animated.multiply(
                          cardAnimation,
                          dismissAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                            extrapolate: 'clamp',
                          })
                        ),
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
                          {
                            scale: dismissAnimation.interpolate({
                              inputRange: [0, 1, 1.035],
                              outputRange: [0.94, 1, 1.035],
                              extrapolate: 'clamp',
                            }),
                          },
                          {
                            translateY: dismissAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-8, 0],
                              extrapolate: 'clamp',
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
                      displayScale={viewportScale}
                    />
                    {message.clarification && clarificationOptions.length > 0 ? (
                      <View
                        style={[
                          styles.clarificationPanel,
                          {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)',
                            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                          },
                        ]}
                      >
                        <Text style={[styles.clarificationQuestion, { color: colors.textPrimary }]}>
                          {message.clarification.question}
                        </Text>
                        <View style={styles.clarificationOptionList}>
                          {clarificationOptions.map((option, optionIndex) => {
                            const label = typeof option === 'string' ? option : option.label;
                            return (
                              <TouchableOpacity
                                key={`${message.id}-${label}-${optionIndex}`}
                                style={[
                                  styles.clarificationOptionButton,
                                  {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.075)' : 'rgba(0,0,0,0.035)',
                                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                                  },
                                ]}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  onSelectWorkoutClarification?.(message.id, option);
                                }}
                                activeOpacity={0.72}
                                accessibilityRole="button"
                                accessibilityLabel={`Select option: ${label}`}
                              >
                                <Text style={[styles.clarificationOptionText, { color: colors.textPrimary }]}>
                                  {label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    ) : null}
                    <TouchableOpacity
                      testID={`voice-card-dismiss-${message.id}`}
                      style={[
                        styles.voiceCardDismissButton,
                        {
                          backgroundColor: isDark ? 'rgba(0,0,0,0.34)' : 'rgba(255,255,255,0.72)',
                          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                        },
                      ]}
                      onPress={() => {
                        handleDismissVoiceCard(message.id);
                      }}
                      disabled={isDismissing}
                      activeOpacity={0.74}
                      accessibilityRole="button"
                      accessibilityLabel="Close workout preview"
                      accessibilityState={{ disabled: isDismissing }}
                    >
                      <XMarkIcon size={Math.max(16, Math.round(IconSizes.sm * viewportScale))} color={colors.textSecondary} strokeWidth={2.2} />
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          ) : null}
        </View>

        {experienceMode === 'conversation' ? (
          <TouchableOpacity
            testID="conversation-text-prompt-button"
            accessibilityRole="button"
            accessibilityLabel="Type a prompt"
            style={[
              styles.promptButton,
              {
                bottom: talkButtonBottom + (interactionMode === 'push_to_talk' ? talkButtonSize / 2 - 24 : 0),
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
              },
            ]}
            onPress={openTextPrompt}
          >
            <ChatBubbleBottomCenterTextIcon size={IconSizes.md} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : null}

        {interactionMode === 'push_to_talk' && <AnimatedTouchableOpacity
          style={[
            styles.talkButtonRing,
            {
              width: talkButtonSize,
              height: talkButtonSize,
              borderRadius: talkButtonSize / 2,
              borderWidth: talkButtonBorderWidth,
              borderColor: colors.accent,
              bottom: talkButtonBottom,
              opacity: isTalkButtonReady ? 1 : 0.38,
              transform: [{ scale: talkButtonAudioScale }],
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
          <Animated.View
            style={[
              styles.talkButtonCore,
              {
                width: talkButtonCoreSize,
                height: talkButtonCoreSize,
                borderRadius: talkButtonCoreSize / 2,
                backgroundColor: colors.accentLight,
                transform: [{ scale: talkButtonCoreAudioScale }],
              },
            ]}
          />
        </AnimatedTouchableOpacity>}
      </View>
      <Modal
        visible={isPromptSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPromptSheetVisible(false)}
      >
        <Pressable style={styles.promptBackdrop} onPress={() => setPromptSheetVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.promptKeyboard}>
            <Pressable
              style={[
                styles.promptSheet,
                { paddingBottom: promptSheetBottomPadding },
                {
                  backgroundColor: isDark ? '#222222' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                },
              ]}
            >
              <View style={styles.promptHandleHitArea} {...promptDismissPanResponder.panHandlers}>
                <View style={[styles.promptHandle, { backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]} />
              </View>
              <Text style={[styles.promptTitle, { color: colors.textPrimary }]}>Ask Conversation Coach</Text>
              <TextInput
                testID="conversation-text-prompt-input"
                value={textPrompt}
                onChangeText={setTextPrompt}
                placeholder="Type a prompt or session-only instruction"
                placeholderTextColor={colors.textTertiary}
                multiline
                autoFocus
                style={[
                  styles.promptInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                  },
                ]}
              />
              <Pressable
                testID="conversation-text-prompt-submit"
                disabled={!textPrompt.trim()}
                onPress={submitTextPrompt}
                style={[styles.promptSubmit, { backgroundColor: colors.accent, opacity: textPrompt.trim() ? 1 : 0.45 }]}
              >
                <Text style={[styles.promptSubmitText, { color: colors.accentForegroundOnFill }]}>Send</Text>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: 0,
  },
  hero: {
    flex: 1,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  pendingMedia: {
    position: 'absolute',
    top: Spacing.xs,
    left: -Spacing.lg,
    right: -Spacing.lg,
    zIndex: 4,
  },
  visualizerAnchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorScriptPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    gap: Spacing.xs,
    zIndex: 2,
  },
  creatorScriptInput: {
    ...Typography.bodySmall,
    minHeight: 52,
    maxHeight: 76,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    textAlignVertical: 'top',
  },
  creatorScriptFooter: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  creatorScriptCount: {
    ...Typography.caption,
  },
  creatorScriptButton: {
    minWidth: 86,
    minHeight: 34,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  creatorScriptButtonText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  creatorScriptError: {
    ...Typography.caption,
    color: Colors.error,
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
  notice: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  talkButtonRing: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  talkButtonCore: {
  },
  promptButton: {
    position: 'absolute',
    right: 0,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptBackdrop: { flex: 1, justifyContent: 'flex-end' },
  promptKeyboard: { width: '100%' },
  promptSheet: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  promptHandleHitArea: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptHandle: {
    width: 42,
    height: 4,
    borderRadius: BorderRadius.full,
  },
  promptTitle: { ...Typography.h4, textAlign: 'center', marginTop: -Spacing.xs },
  promptInput: {
    minHeight: 120,
    maxHeight: 260,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    textAlignVertical: 'top',
    ...Typography.bodySmall,
  },
  promptSubmit: {
    minHeight: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptSubmitText: { ...Typography.bodySmall, fontWeight: '700' },
  voiceCardScroll: {
    width: '100%',
    flex: 1,
  },
  voiceCardShell: {
    width: '100%',
    position: 'relative',
  },
  clarificationPanel: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  clarificationQuestion: {
    ...Typography.bodySmall,
    fontWeight: '700',
    lineHeight: 20,
  },
  clarificationOptionList: {
    gap: Spacing.xs,
  },
  clarificationOptionButton: {
    minHeight: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  clarificationOptionText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    textAlign: 'center',
  },
  voiceCardDismissButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.sm,
    zIndex: 3,
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  workoutRetryButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  workoutRetryButtonText: {
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  workoutSection: {
    gap: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
});
