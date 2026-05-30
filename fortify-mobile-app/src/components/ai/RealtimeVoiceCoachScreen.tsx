import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Cog6ToothIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { BorderRadius, IconSizes, Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ChatWorkoutTemplateCard } from '@/src/components/ai/ChatWorkoutTemplateCard';
import { CustomScenarioSheet } from '@/src/components/ai/CustomScenarioSheet';
import { DumbbellVoiceVisualizer } from '@/src/components/ai/DumbbellVoiceVisualizer';
import {
  type RealtimeCoachPreferences,
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
  preferences: RealtimeCoachPreferences;
  isCreatorScriptEnabled?: boolean;
  isSpeakingCreatorScript?: boolean;
  creatorScriptError?: string | null;
  templateSaveError?: string | null;
  onPreferencesChange: (preferences: RealtimeCoachPreferences) => void;
  onTalkStart: () => void;
  onTalkEnd: () => void;
  onSpeakCreatorScript?: (script: string) => Promise<boolean> | boolean;
  onViewWorkoutTemplate: (message: AIConversationMessage) => void;
  onAddWorkoutTemplate: (message: AIConversationMessage) => void;
  onStartWorkoutTemplate: (message: AIConversationMessage) => void;
}

const CREATOR_SCRIPT_MAX_CHARS = 500;

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
  savingWorkoutMessageId,
  startingWorkoutMessageId,
  isWorkoutActive,
  isActive,
  isUserTurnActive,
  preferences,
  isCreatorScriptEnabled = false,
  isSpeakingCreatorScript = false,
  creatorScriptError = null,
  templateSaveError,
  onPreferencesChange,
  onTalkStart,
  onTalkEnd,
  onSpeakCreatorScript,
  onViewWorkoutTemplate,
  onAddWorkoutTemplate,
  onStartWorkoutTemplate,
}: RealtimeVoiceCoachScreenProps) {
  const { colors, isDark } = useTheme();
  const [creatorScript, setCreatorScript] = useState('');
  const [isScenarioSheetVisible, setScenarioSheetVisible] = useState(false);
  const { width, height } = useWindowDimensions();
  const voiceCardAnimationsRef = useRef<Record<string, Animated.Value>>({});
  const animatedVoiceCardIdsRef = useRef<Set<string>>(new Set());
  const pendingWorkoutCardAnimation = useRef(new Animated.Value(0)).current;
  const heroMinHeight = Math.max(680, height - 120);
  const viewportScale = Math.max(0.78, Math.min(1, Math.min(width / 390, height / 844)));
  const visualizerHeight = 156 * viewportScale;
  const talkButtonSize = Math.round(96 * viewportScale);
  const talkButtonCoreSize = Math.round(78 * viewportScale);
  const talkButtonBorderWidth = Math.max(4, Math.round(5 * viewportScale));
  const talkButtonBottom = Math.max(20, Math.min(38, height * 0.038));
  const visualizerTop = Math.max(138, Math.min(190, height * 0.2));
  const middleSlotBottom = talkButtonBottom + talkButtonSize + Spacing.md;
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
  const displayError = sanitizeVoiceCoachError(error);
  const displayTemplateSaveError = sanitizeVoiceCoachError(templateSaveError);
  const shouldShowErrorAsNotice = isFriendlyVoiceNotice(displayError);
  const hasVoiceCards = voiceWorkoutMessages.length > 0 || isGeneratingVoiceWorkout;
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

  const handleSpeakCreatorScript = () => {
    if (!onSpeakCreatorScript || isSpeakingCreatorScript) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void onSpeakCreatorScript(creatorScript);
  };

  return (
    <View style={[styles.container, styles.content]}>
      <View style={styles.hero}>
        <TouchableOpacity
          testID="custom-scenario-gear"
          style={[
            styles.scenarioGearButton,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.035)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setScenarioSheetVisible(true);
          }}
          activeOpacity={0.72}
          accessibilityRole="button"
          accessibilityLabel="Open custom voice scenarios"
        >
          <Cog6ToothIcon color={colors.textSecondary} size={IconSizes.md} strokeWidth={1.8} />
        </TouchableOpacity>

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
                      displayScale={viewportScale}
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
                width: talkButtonSize + 16 + index * 18 * viewportScale + normalizedUserLevel * (34 + index * 8) * viewportScale,
                height: talkButtonSize + 16 + index * 18 * viewportScale + normalizedUserLevel * (34 + index * 8) * viewportScale,
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
              width: talkButtonSize,
              height: talkButtonSize,
              borderRadius: talkButtonSize / 2,
              borderWidth: talkButtonBorderWidth,
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
                width: talkButtonCoreSize,
                height: talkButtonCoreSize,
                borderRadius: talkButtonCoreSize / 2,
                backgroundColor: colors.accentLight,
                transform: [{ scale: 1 + normalizedUserLevel * 0.1 }],
              },
            ]}
          />
        </TouchableOpacity>
      </View>

      <CustomScenarioSheet
        visible={isScenarioSheetVisible}
        preferences={preferences}
        onChange={onPreferencesChange}
        onClose={() => setScenarioSheetVisible(false)}
      />
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
  scenarioGearButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: 0,
    zIndex: 4,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.72,
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
  userAudioRing: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  talkButtonCore: {
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
});
