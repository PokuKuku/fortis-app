/**
 * AI Chat Screen
 *
 * Premium ChatGPT-style interface with:
 * - Clean, minimal design
 * - Full-width centered messages
 * - Refined input experience
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePostHog } from 'posthog-react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated as RNAnimated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, runOnJS } from 'react-native-reanimated';
import { XMarkIcon, SparklesIcon, ExclamationTriangleIcon } from 'react-native-heroicons/outline';
import { SparklesIcon as SparklesSolid } from 'react-native-heroicons/solid';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAIStore } from '@/src/store/aiStore';
import { AIIntent, AIConversationMessage, AIPendingMedia } from '@/src/types/ai';
import { ChatMessage } from '@/src/components/ai/ChatMessage';
import { ChatEmptyState } from '@/src/components/ai/ChatEmptyState';
import { ChatInput } from '@/src/components/ai/ChatInput';
import { AIWorkoutPreviewModal } from '@/src/components/ai/AIWorkoutPreviewModal';
import { CustomScenarioSheet } from '@/src/components/ai/CustomScenarioSheet';
import { RealtimeVoiceCoachScreen } from '@/src/components/ai/RealtimeVoiceCoachScreen';
import { requestAIDataSharingConsent } from '@/src/services/aiConsentService';
import { useAIWorkoutTemplateActions } from '@/src/hooks/useAIWorkoutTemplateActions';
import { useRealtimeCoachPreferences } from '@/src/hooks/useRealtimeCoachPreferences';
import { useRealtimeCoach } from '@/src/hooks/useRealtimeCoach';
import { useAuth } from '@/src/contexts/AuthContext';
import type { AIVoiceMode, RealtimeCoachPreferences, RealtimeVoiceInteractionMode } from '@/src/types/realtimeCoach';
import { isCreatorVoiceScriptsEnabled } from '@/src/utils/realtimeCoach';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useProFeatureGate } from '@/src/components/superwall/useProFeatureGate';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { shouldPromptForFeatureAccess } from '@/src/utils/aiChatTour';
import { AIMediaPreviewStrip } from '@/src/components/ai/AIMediaPreviewStrip';
import { VoiceSettingsPopover } from '@/src/components/ai/VoiceSettingsPopover';
import { flattenAIMediaImages, pickAIMediaFromLibrary } from '@/src/services/aiMediaService';
import { setLastAICoachMode } from '@/src/services/aiCoachModePreferenceService';
import { TOUR_ANCHOR_IDS } from '@/src/constants/inAppTour';
import { TourAnchor } from '@/src/components/tour/TourAnchor';

// Helpful app tips shown while waiting for AI responses
const LOADING_MESSAGES = [
  "Tip: Long-press a weight or reps cell to fill the remaining sets.",
  "Tip: Tap the ↓↓ button on the keyboard to fill remaining sets.",
  "Tip: Long-press the checkmark to complete the remaining sets.",
  "Tip: Long-press the Start button to reconfigure what it launches.",
  "Tip: Configure the Start button to quick-start a favorite workout or program.",
  "Tip: Drag a workout card onto a program card to add it.",
  "Tip: Ask AI for a weekly training summary or recent PRs.",
  "Tip: Use AI chat to spot volume trends and muscle balance.",
];

const COACHING_QUESTION_REGEX =
  /\b(how do i|how to|what('?s| is) the proper way to|show me how to|teach me how to|tips for|form for)\b/i;
const WORKOUT_GENERATION_REGEX =
  /\b(?:(make|create|build|generate|design|craft|write|plan)\b[\s\S]{0,80}|\b(give me|need|want|show me)\b[\s\S]{0,40}|\b(full body|upper body|lower body|push|pull|legs?|chest|back|shoulders|arms|glutes|hamstrings|quads|core)\b[\s\S]{0,40})\b(workouts?|routines?|sessions?|templates?)\b/i;
const WORKOUT_EDIT_REGEX =
  /\b(?:replace\s+.+\s+with\s+.+|swap\s+.+\s+for\s+.+|switch\s+.+\s+to\s+.+|add\s+.+|include\s+.+|insert\s+.+|put in\s+.+|put\s+.+|bring in\s+.+|remove\s+.+|take out\s+.+|exclude\s+.+|drop\s+.+|delete\s+.+|without\s+.+|skip\s+.+)\b/i;
const WORKOUT_RESIZE_REGEXES = [
  /\b(?:make|change|set|turn|have|keep|give)\b[\s\S]{0,50}\b(?:it|this|that|workout|routine|session|template)\b[\s\S]{0,50}\b(?:\d{1,2}|three|four|five|six|seven|eight|nine|ten)\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b/i,
  /\b(?:it|this|that|workout|routine|session|template)\b[\s\S]{0,50}\b(?:have|be|to)\b[\s\S]{0,30}\b(?:\d{1,2}|three|four|five|six|seven|eight|nine|ten)\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b/i,
  /\b(?:only|just)\s+(?:\d{1,2}|three|four|five|six|seven|eight|nine|ten)\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b/i,
];
const CURRENT_WORKOUT_REFERENCE_REGEX =
  /\b(?:it|this|that|current|existing)\s+(?:workout|routine|session|template)\b/i;

// Animated sparkles for loading indicator
function AnimatedLoadingSparkles() {
  const { colors } = useTheme();
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;
  const loopRef = useRef<RNAnimated.CompositeAnimation | null>(null);

  useEffect(() => {
    loopRef.current = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loopRef.current.start();

    return () => {
      loopRef.current?.stop();
    };
  }, [fadeAnim]);

  const outlineOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.loadingIconWrapper}>
      <RNAnimated.View style={[styles.loadingIconAbsolute, { opacity: fadeAnim }]}>
        <SparklesSolid color={colors.accent} size={IconSizes.md} />
      </RNAnimated.View>
      <RNAnimated.View style={[styles.loadingIconAbsolute, { opacity: outlineOpacity }]}>
        <SparklesIcon color={colors.accent} size={IconSizes.md} />
      </RNAnimated.View>
    </View>
  );
}

// Detailed analyst formatting is reserved for the explicit Ask Fortify action on insights.
const inferIntentFromMessage = (_message: string): AIIntent => 'GENERAL_CHAT';

const shouldAttachWorkoutDraft = (message: string): boolean => {
  const normalized = message.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  if (COACHING_QUESTION_REGEX.test(normalized)) {
    return false;
  }

  // A request for a new workout must not be interpreted as an edit of the last card.
  if (WORKOUT_GENERATION_REGEX.test(normalized) && !CURRENT_WORKOUT_REFERENCE_REGEX.test(normalized)) {
    return false;
  }

  return WORKOUT_EDIT_REGEX.test(normalized)
    || WORKOUT_RESIZE_REGEXES.some((regex) => regex.test(normalized));
};

const getLastIntent = (messages: AIConversationMessage[]): AIIntent | null => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const intent = messages[i]?.intent;
    if (intent) {
      return intent;
    }
  }
  return null;
};

const shouldContinueVisualCoaching = (
  inferredIntent: AIIntent,
  lastIntent: AIIntent | null
): boolean => inferredIntent === 'GENERAL_CHAT' && lastIntent === 'VISUAL_COACHING';

export default function AIChatScreen() {
  const router = useRouter();
  const { mode: requestedMode } = useLocalSearchParams<{ mode?: string }>();
  const posthog = usePostHog();
  const { colors, isDark } = useTheme();
  const { profile, user } = useAuth();
  const { runProFeature } = useProFeatureGate();
  const { isTourActive, activeStepId, advanceStep } = useInAppTour();
  const isNavigating = useRef(false);
  const stopVoiceCoachRef = useRef<() => void>(() => undefined);
  const appliedRequestedModeRef = useRef<string | null>(null);
  const hasSelectedTourVoiceModeRef = useRef(false);
  const pendingWorkoutPreviewRestoreRef = useRef<{ mode: AIVoiceMode; messageId: string } | null>(null);
  const isScreenFocused = useIsFocused();
  const [inputText, setInputText] = useState('');
  const [tourBackWorkoutMessages, setTourBackWorkoutMessages] = useState<AIConversationMessage[] | null>(null);
  const [mode, setMode] = useState<AIVoiceMode>(
    requestedMode === 'chat' ? 'chat' : 'voice'
  );
  const [isScenarioSheetVisible, setScenarioSheetVisible] = useState(false);
  const [pendingChatMedia, setPendingChatMedia] = useState<AIPendingMedia[]>([]);
  const [pendingVoiceMedia, setPendingVoiceMedia] = useState<AIPendingMedia[]>([]);
  const [isPickingVoiceMedia, setIsPickingVoiceMedia] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const scrollViewRef = useRef<ScrollView>(null);
  const shouldAutoScrollRef = useRef(true);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    header: {
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    },
    clearText: { color: colors.textTertiary },
    loadingText: { color: colors.textSecondary },
    errorHint: { color: colors.textTertiary },
  };

  // Store state
  const conversation = useAIStore((state) => state.conversation);
  const isSendingMessage = useAIStore((state) => state.isSendingMessage);
  const error = useAIStore((state) => state.error);
  const sendMessage = useAIStore((state) => state.sendMessage);
  const clearError = useAIStore((state) => state.clearError);
  const clearConversation = useAIStore((state) => state.clearConversation);
  const loadConversation = useAIStore((state) => state.loadConversation);
  const lastFailedMessage = useAIStore((state) => state.lastFailedMessage);
  const retryLastMessage = useAIStore((state) => state.retryLastMessage);
  const checkRateLimits = useAIStore((state) => state.checkRateLimits);
  const rateLimitStatus = useAIStore((state) => state.rateLimitStatus);
  const markWorkoutTemplateSaved = useAIStore((state) => state.markWorkoutTemplateSaved);

  const messages = conversation?.messages || [];
  const isTourBackWorkoutStep = isTourActive && activeStepId === 'ai_text_chat_overview';
  const isTourWorkoutResultStep = isTourActive && activeStepId === 'ai_text_chat_result';
  const isTourVoiceTransitionStep = isTourActive && activeStepId === 'ai_voice_chat_open';
  const shouldShowTourWorkoutDemo = isTourWorkoutResultStep || isTourVoiceTransitionStep;
  const displayedMessages = shouldShowTourWorkoutDemo && tourBackWorkoutMessages
    ? tourBackWorkoutMessages
    : isTourBackWorkoutStep
      ? []
      : messages;
  const currentWorkoutTemplateDraft = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.workoutTemplate) {
        return messages[i].workoutTemplate;
      }
    }
    return undefined;
  }, [messages]);
  const {
    preferences: realtimePreferences,
    isLoaded: areRealtimePreferencesLoaded,
    updatePreferences: updateRealtimePreferences,
  } = useRealtimeCoachPreferences();
  const interactionMode = realtimePreferences.interactionMode ?? 'push_to_talk';
  const realtimePreferencesSignature = JSON.stringify(realtimePreferences);
  const activeVoicePreferencesSignatureRef = useRef<string | null>(null);
  const {
    phase: voicePhase,
    error: voiceError,
    transcriptOverlay,
    userAudioLevel,
    coachAudioLevel,
    debugStatus,
    voiceWorkoutMessages,
    isGeneratingVoiceWorkout,
    isSpeakingCreatorScript,
    creatorScriptError,
    isActive: isVoiceActive,
    isUserTurnActive,
    start: startVoiceCoach,
    stop: stopVoiceCoach,
    beginUserTurn,
    endUserTurn,
    speakCreatorScript,
    markVoiceWorkoutSaved,
    dismissVoiceWorkoutMessage,
    sendVisualContext,
    sendTextPrompt,
  } = useRealtimeCoach({
    preferences: realtimePreferences,
    currentWorkoutTemplateDraft,
    interactionMode,
    onVisualContextConsumed: () => setPendingVoiceMedia([]),
  });

  // The tour changes modes while this screen remains mounted. Honor that explicit
  // route request without changing the user's saved preferred mode.
  useEffect(() => {
    if (requestedMode !== 'chat' && requestedMode !== 'voice') return;
    if (appliedRequestedModeRef.current === requestedMode) return;
    appliedRequestedModeRef.current = requestedMode;
    if (requestedMode === mode) return;

    stopVoiceCoach();
    setMode(requestedMode);
  }, [mode, requestedMode, stopVoiceCoach]);

  const isCreatorScriptEnabled = isCreatorVoiceScriptsEnabled(profile?.email ?? user?.email ?? null);
  const voiceConversationMessages = useMemo<AIConversationMessage[]>(() => (
    voiceWorkoutMessages.map((message) => ({
      id: message.id,
      role: 'assistant',
      intent: 'GENERAL_CHAT',
      content: message.text,
      createdAt: new Date().toISOString(),
      workoutTemplate: message.workoutTemplate,
      savedWorkoutTemplateId: message.savedWorkoutTemplateId ?? null,
    }))
  ), [voiceWorkoutMessages]);
  const markDisplayedWorkoutTemplateSaved = useCallback(async (messageId: string, templateId: string) => {
    if (messageId === 'tour-back-workout-response') {
      setTourBackWorkoutMessages((current) => current?.map((message) => (
        message.id === messageId ? { ...message, savedWorkoutTemplateId: templateId } : message
      )) ?? null);
      return;
    }

    await markWorkoutTemplateSaved(messageId, templateId);
  }, [markWorkoutTemplateSaved]);

  const chatWorkoutActions = useAIWorkoutTemplateActions({
    messages: displayedMessages,
    conversationId: conversation?.id ?? null,
    markWorkoutTemplateSaved: markDisplayedWorkoutTemplateSaved,
    saveWorkoutPlacement: PAYWALL_PLACEMENTS.workoutLimit,
    useProvidedExerciseIds: (message) => message.id === 'tour-back-workout-response',
  });
  const voiceWorkoutActions = useAIWorkoutTemplateActions({
    messages: voiceConversationMessages,
    conversationId: conversation?.id ?? null,
    onWorkoutTemplateSaved: markVoiceWorkoutSaved,
    saveWorkoutPlacement: PAYWALL_PLACEMENTS.voiceWorkoutCreate,
  });
  const activeWorkoutActions = mode === 'voice' ? voiceWorkoutActions : chatWorkoutActions;

  useEffect(() => {
    if (!isScreenFocused) {
      return;
    }

    const pendingPreview = pendingWorkoutPreviewRestoreRef.current;
    if (!pendingPreview) {
      return;
    }

    const workoutActions = pendingPreview.mode === 'voice'
      ? voiceWorkoutActions
      : chatWorkoutActions;
    workoutActions.setPreviewMessageId(pendingPreview.messageId);
    pendingWorkoutPreviewRestoreRef.current = null;
  }, [chatWorkoutActions.setPreviewMessageId, isScreenFocused, voiceWorkoutActions.setPreviewMessageId]);

  const handleOpenAIWorkoutExerciseDetails = useCallback((exerciseId: string) => {
    const previewMessage = activeWorkoutActions.previewMessage;
    if (!previewMessage) {
      return;
    }

    pendingWorkoutPreviewRestoreRef.current = { mode, messageId: previewMessage.id };
    activeWorkoutActions.setPreviewMessageId(null);
    requestAnimationFrame(() => {
      router.push(`/exercise/${exerciseId}?source=ai-workout-preview`);
    });
  }, [activeWorkoutActions, mode, router]);

  const handleRealtimePreferencesChange = useCallback(async (nextPreferences: RealtimeCoachPreferences) => {
    if (isVoiceActive) {
      stopVoiceCoach();
    }
    await updateRealtimePreferences(nextPreferences);
  }, [isVoiceActive, stopVoiceCoach, updateRealtimePreferences]);

  const handleExperienceModeChange = useCallback((experienceMode: 'coach' | 'conversation') => {
    void handleRealtimePreferencesChange({ ...realtimePreferences, experienceMode });
  }, [handleRealtimePreferencesChange, realtimePreferences]);

  // Calculate remaining requests (most restrictive limit) for inline warning
  const remaining = rateLimitStatus
    ? Math.min(
        rateLimitStatus.maxPerDay - rateLimitStatus.actionsThisDay,
        rateLimitStatus.maxPerWeek - rateLimitStatus.actionsThisWeek,
        rateLimitStatus.maxPerMonth - rateLimitStatus.actionsThisMonth
      )
    : null;
  const showRateLimitWarning = remaining !== null && (remaining === 3 || remaining === 1);

  useEffect(() => {
    loadConversation();
    checkRateLimits();
  }, [
    loadConversation,
    checkRateLimits,
  ]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 50);
  }, []);

  useEffect(() => {
    if (displayedMessages.length > 0 && shouldAutoScrollRef.current) {
      scrollToBottom(true);
    }
  }, [displayedMessages.length, scrollToBottom]);

  // Cycle through loading messages every 5 seconds while AI is responding
  useEffect(() => {
    if (isSendingMessage) {
      // Set initial message immediately
      const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
      setLoadingMessage(LOADING_MESSAGES[randomIndex]);

      // Pick a random new message every 5 seconds
      const interval = setInterval(() => {
        setLoadingMessage((prev) => {
          // Pick a random message that's different from the current one
          let newIndex: number;
          do {
            newIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
          } while (LOADING_MESSAGES[newIndex] === prev && LOADING_MESSAGES.length > 1);
          return LOADING_MESSAGES[newIndex];
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isSendingMessage]);

  const handleClose = useCallback(() => {
    if (isNavigating.current) return;
    stopVoiceCoach();
    isNavigating.current = true;
    router.back();
    setTimeout(() => { isNavigating.current = false; }, 500);
  }, [router, stopVoiceCoach]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetX([-15, 15])
    .onEnd((event) => {
      const shouldDismiss = event.translationY > 120 || event.velocityY > 1200;
      if (shouldDismiss) {
        runOnJS(handleClose)();
      }
    });

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearConversation();
    clearError();
    chatWorkoutActions.setTemplateSaveError(null);
    chatWorkoutActions.setPreviewMessageId(null);
    setInputText('');
    setPendingChatMedia([]);
    shouldAutoScrollRef.current = true;
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 50);
  };

  const handleTourBackWorkoutPress = useCallback(() => {
    if (!isTourBackWorkoutStep) return;

    const createdAt = new Date().toISOString();
    setTourBackWorkoutMessages([
      {
        id: 'tour-back-workout-request',
        role: 'user',
        content: 'Make me a back workout',
        intent: 'GENERAL_CHAT',
        createdAt,
      },
      {
        id: 'tour-back-workout-response',
        role: 'assistant',
        content: 'Here is a balanced back workout built for strength and muscle growth.',
        intent: 'GENERAL_CHAT',
        createdAt,
        workoutTemplate: {
          name: 'Back Workout',
          description: 'A complete back session with horizontal and vertical pulling.',
          focus: 'Back',
          estimatedDurationMinutes: 50,
          exercises: [
            { exerciseId: '72f240eb-44d7-437d-b610-d53e23aad520', exerciseName: 'Barbell Bent Over Row', sets: 4, reps: '8 to 10', restSeconds: 120 },
            { exerciseId: 'd4e6ab99-5b62-4ff0-9595-0263c247198f', exerciseName: 'Cable Pulldown', sets: 3, reps: '10 to 12', restSeconds: 90 },
            { exerciseId: '92d98b61-2fcc-4696-9c60-a038b5bf716e', exerciseName: 'Cable Seated Row', sets: 3, reps: '10 to 12', restSeconds: 90 },
            { exerciseId: '46ce10d3-2a2d-477a-89bd-92f6a260f419', exerciseName: 'Cable Lateral Pulldown With V Bar', sets: 3, reps: '12 to 15', restSeconds: 60 },
          ],
        },
      },
    ]);
    void advanceStep();
  }, [advanceStep, isTourBackWorkoutStep]);

  const submitMessage = useCallback(async (rawMessage: string) => {
    const message = rawMessage.trim() || (pendingChatMedia.length > 0 ? 'I’d like coaching feedback on this.' : '');
    if (!message || isSendingMessage) return;

    await runProFeature(
      {
        placement: PAYWALL_PLACEMENTS.aiChat,
        params: {
          source: 'ai_chat',
          action: 'send_message',
          messageLength: message.length,
        },
      },
      async () => {
        if (!shouldPromptForFeatureAccess(isTourActive)) return;
        const allowed = await requestAIDataSharingConsent();
        if (!allowed) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const inferredIntent = inferIntentFromMessage(message);
        const lastIntent = getLastIntent(messages);
        const intent: AIIntent = pendingChatMedia.length > 0
          ? 'VISUAL_COACHING'
          : shouldContinueVisualCoaching(inferredIntent, lastIntent)
            ? 'VISUAL_COACHING'
            : inferredIntent;
        const requestContext = currentWorkoutTemplateDraft && shouldAttachWorkoutDraft(message)
          ? { currentWorkoutTemplateDraft }
          : undefined;

        posthog.capture('ai_message_sent', {
          intent,
          message_length: message.length,
          has_attachments: pendingChatMedia.length > 0,
          conversation_length: messages.length,
        });
        chatWorkoutActions.setTemplateSaveError(null);
        setInputText('');
        const attachments = pendingChatMedia.map(({ id, uri, kind, label }) => ({ id, uri, kind, label }));
        const response = await sendMessage(
          intent,
          message,
          requestContext,
          flattenAIMediaImages(pendingChatMedia),
          attachments
        );
        if (response.type !== 'error') {
          setPendingChatMedia([]);
        }
      },
    );
  }, [chatWorkoutActions, currentWorkoutTemplateDraft, isSendingMessage, isTourActive, messages, pendingChatMedia, posthog, runProFeature, sendMessage]);

  const pickMedia = useCallback(async (target: 'chat' | 'voice') => {
    const shouldRestartVoice = target === 'voice' && interactionMode === 'realtime' && isVoiceActive;
    if (target === 'voice') setIsPickingVoiceMedia(true);
    if (shouldRestartVoice) {
      stopVoiceCoach();
    }
    try {
      const selected = await pickAIMediaFromLibrary();
      if (selected.length > 0) {
        if (target === 'chat') setPendingChatMedia(selected);
        else setPendingVoiceMedia(selected);
      }
    } catch (pickerError) {
      Alert.alert('Unable to add media', pickerError instanceof Error ? pickerError.message : 'Try again.');
    } finally {
      if (target === 'voice') setIsPickingVoiceMedia(false);
    }
  }, [interactionMode, isVoiceActive, stopVoiceCoach]);

  useEffect(() => {
    if (!isVoiceActive || !debugStatus.setupComplete || pendingVoiceMedia.length === 0) return;
    sendVisualContext(flattenAIMediaImages(pendingVoiceMedia));
  }, [debugStatus.setupComplete, isVoiceActive, pendingVoiceMedia, sendVisualContext]);

  const handleInteractionModeChange = useCallback((nextMode: RealtimeVoiceInteractionMode) => {
    if (nextMode === interactionMode) return;
    const shouldRestart = isVoiceActive;
    if (shouldRestart) {
      stopVoiceCoach();
    }
    void updateRealtimePreferences((current) => ({
      ...current,
      interactionMode: nextMode,
    }));
  }, [interactionMode, isVoiceActive, stopVoiceCoach, updateRealtimePreferences]);

  const handleSend = useCallback(async () => {
    await submitMessage(inputText);
  }, [inputText, submitMessage]);

  const handleQuickAction = (_intent: AIIntent, prompt: string) => {
    void submitMessage(prompt);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    shouldAutoScrollRef.current =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - paddingToBottom;
  };

  // Retry failed message
  const handleRetry = useCallback(async () => {
    await runProFeature(
      {
        placement: PAYWALL_PLACEMENTS.aiChat,
        params: {
          source: 'ai_chat',
          action: 'retry_message',
        },
      },
      async () => {
        if (!shouldPromptForFeatureAccess(isTourActive)) return;
        const allowed = await requestAIDataSharingConsent();
        if (!allowed) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await retryLastMessage();
      },
    );
  }, [isTourActive, retryLastMessage, runProFeature]);

  const handleStartVoiceCoach = useCallback(async () => (
    runProFeature(
      {
        placement: PAYWALL_PLACEMENTS.aiVoiceCoach,
        params: {
          source: 'ai_chat',
          action: 'start_voice_coach',
        },
      },
      async () => {
        if (!shouldPromptForFeatureAccess(isTourActive)) return false;
        const allowed = await requestAIDataSharingConsent();
        if (!allowed) return false;
        await startVoiceCoach();
      },
    )
  ), [isTourActive, runProFeature, startVoiceCoach]);

  useEffect(() => {
    if (!areRealtimePreferencesLoaded) return;

    const previousSignature = activeVoicePreferencesSignatureRef.current;
    activeVoicePreferencesSignatureRef.current = realtimePreferencesSignature;
    if (previousSignature === null || previousSignature === realtimePreferencesSignature) {
      return;
    }

    if (isVoiceActive) {
      stopVoiceCoach();
    }
  }, [
    areRealtimePreferencesLoaded,
    isVoiceActive,
    realtimePreferencesSignature,
    stopVoiceCoach,
  ]);

  const handleBeginVoiceTurn = useCallback(async () => (
    runProFeature(
      {
        placement: PAYWALL_PLACEMENTS.aiVoiceCoach,
        params: {
          source: 'ai_chat',
          action: 'start_voice_coach',
        },
      },
      async () => {
        if (!shouldPromptForFeatureAccess(isTourActive)) return false;
        const allowed = await requestAIDataSharingConsent();
        if (!allowed) return false;
        await beginUserTurn();
      },
    )
  ), [beginUserTurn, isTourActive, runProFeature]);

  useEffect(() => {
    stopVoiceCoachRef.current = stopVoiceCoach;
  }, [stopVoiceCoach]);

  useEffect(() => () => {
    stopVoiceCoachRef.current();
  }, []);

  useEffect(() => {
    if (mode !== 'voice') {
      stopVoiceCoach();
    }
  }, [mode, stopVoiceCoach]);

  useEffect(() => {
    if (activeStepId !== 'ai_voice_chat_open') {
      hasSelectedTourVoiceModeRef.current = false;
      return;
    }

    if (isTourActive && !hasSelectedTourVoiceModeRef.current && mode !== 'chat') {
      stopVoiceCoach();
      setMode('chat');
      return;
    }

    if (!isTourActive || !hasSelectedTourVoiceModeRef.current || mode !== 'voice') return;
    void advanceStep();
  }, [activeStepId, advanceStep, isTourActive, mode, stopVoiceCoach]);

  const handleModeChange = useCallback((nextMode: AIVoiceMode) => {
    if (nextMode === mode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (nextMode === 'voice' && isTourActive && activeStepId === 'ai_voice_chat_open') {
      hasSelectedTourVoiceModeRef.current = true;
    }
    if (nextMode === 'chat') {
      void runProFeature(
        {
          placement: PAYWALL_PLACEMENTS.aiChat,
          params: {
            source: 'ai_chat',
            action: 'switch_to_chat',
          },
        },
        () => {
          stopVoiceCoach();
          setMode(nextMode);
          void setLastAICoachMode(nextMode);
        },
      );
      return;
    }
    setMode(nextMode);
    void setLastAICoachMode(nextMode);
  }, [activeStepId, isTourActive, mode, runProFeature, stopVoiceCoach]);

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <GestureDetector gesture={panGesture}>
          <View style={[styles.header, themedStyles.header]}>
            <View style={styles.headerLeft}>
              {mode === 'voice' && (
                <VoiceSettingsPopover
                  interactionMode={interactionMode}
                  experienceMode={realtimePreferences.experienceMode ?? 'coach'}
                  onInteractionModeChange={handleInteractionModeChange}
                  onExperienceModeChange={handleExperienceModeChange}
                  onOpenCoachingStyle={() => setScenarioSheetVisible(true)}
                  onAddMedia={() => { void pickMedia('voice'); }}
                />
              )}
            </View>
            <View style={[styles.modeSwitch, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            }]}>
              {(['voice', 'chat'] as const).map((item) => {
                const selected = mode === item;
                const isTourVoiceModeTarget = item === 'voice'
                  && isTourActive
                  && activeStepId === 'ai_voice_chat_open';
                const modeOption = (
                  <TouchableOpacity
                    style={[
                      styles.modeOption,
                      selected && { backgroundColor: colors.accent },
                    ]}
                    onPress={() => handleModeChange(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.modeOptionText,
                      { color: selected ? colors.accentForegroundOnFill : colors.textSecondary },
                    ]}>
                      {item === 'chat' ? 'Chat' : 'Voice'}
                    </Text>
                  </TouchableOpacity>
                );
                return (
                  isTourVoiceModeTarget
                    ? (
                      <TourAnchor key={item} id={TOUR_ANCHOR_IDS.aiChatVoiceMode}>
                        {modeOption}
                      </TourAnchor>
                    )
                    : <React.Fragment key={item}>{modeOption}</React.Fragment>
                );
              })}
            </View>
            <View style={styles.headerRight}>
              {mode === 'chat' && messages.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.clearText, themedStyles.clearText]}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <XMarkIcon color={colors.textSecondary} size={IconSizes.lg} />
              </TouchableOpacity>
            </View>
          </View>
        </GestureDetector>

        {/* Messages */}
        {mode === 'voice' ? (
          <RealtimeVoiceCoachScreen
            phase={voicePhase}
            error={voiceError}
            transcriptOverlay={transcriptOverlay}
            userAudioLevel={userAudioLevel}
            coachAudioLevel={coachAudioLevel}
            debugStatus={debugStatus}
            voiceWorkoutMessages={voiceWorkoutMessages}
            isGeneratingVoiceWorkout={isGeneratingVoiceWorkout}
            savingWorkoutMessageId={voiceWorkoutActions.savingWorkoutMessageId}
            startingWorkoutMessageId={voiceWorkoutActions.startingWorkoutMessageId}
            isWorkoutActive={voiceWorkoutActions.isWorkoutActive}
            isActive={isVoiceActive}
            isUserTurnActive={isUserTurnActive}
            isCreatorScriptEnabled={isCreatorScriptEnabled}
            isSpeakingCreatorScript={isSpeakingCreatorScript}
            creatorScriptError={creatorScriptError}
            templateSaveError={voiceWorkoutActions.templateSaveError}
            onTalkStart={() => {
              if (isVoiceActive) {
                void beginUserTurn();
                return;
              }
              void handleBeginVoiceTurn();
            }}
            onTalkEnd={endUserTurn}
            onSpeakCreatorScript={speakCreatorScript}
            onViewWorkoutTemplate={voiceWorkoutActions.handleViewWorkoutTemplate}
            onAddWorkoutTemplate={voiceWorkoutActions.handleAddWorkoutTemplate}
            onStartWorkoutTemplate={voiceWorkoutActions.handleStartWorkoutTemplate}
            onDismissWorkoutTemplate={dismissVoiceWorkoutMessage}
            interactionMode={interactionMode}
            pendingMedia={pendingVoiceMedia}
            onRemovePendingMedia={(id) => setPendingVoiceMedia((current) => current.filter((item) => item.id !== id))}
            experienceMode={realtimePreferences.experienceMode ?? 'coach'}
            onSendTextPrompt={sendTextPrompt}
          />
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
            keyboardVerticalOffset={0}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => {
                if (shouldAutoScrollRef.current) {
                  scrollToBottom(false);
                }
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {displayedMessages.length === 0 && !isSendingMessage ? (
                <ChatEmptyState
                  onQuickAction={handleQuickAction}
                  isTourBackWorkoutStep={isTourBackWorkoutStep}
                  onTourBackWorkoutPress={handleTourBackWorkoutPress}
                />
              ) : (
                <>
                  {displayedMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isSavingWorkoutTemplate={chatWorkoutActions.savingWorkoutMessageId === message.id}
                      isStartingWorkoutTemplate={chatWorkoutActions.startingWorkoutMessageId === message.id}
                      onClarificationSelect={(option) => {
                        const prompt = typeof option === 'string' ? option : option.label;
                        void submitMessage(prompt);
                      }}
                      onViewWorkoutTemplate={chatWorkoutActions.handleViewWorkoutTemplate}
                      onAddWorkoutTemplate={chatWorkoutActions.handleAddWorkoutTemplate}
                      onStartWorkoutTemplate={chatWorkoutActions.handleStartWorkoutTemplate}
                      isStartWorkoutTemplateDisabled={
                        chatWorkoutActions.isWorkoutActive
                        || (isTourWorkoutResultStep && message.id === 'tour-back-workout-response')
                      }
                      startWorkoutTemplateDisabledLabel={
                        isTourWorkoutResultStep && message.id === 'tour-back-workout-response'
                          ? 'Start'
                          : undefined
                      }
                      tourMessageAnchorId={
                        isTourWorkoutResultStep && message.id === 'tour-back-workout-request'
                          ? TOUR_ANCHOR_IDS.aiChatBackWorkoutPrompt
                          : undefined
                      }
                      tourWorkoutTemplateAnchorId={
                        isTourWorkoutResultStep && message.id === 'tour-back-workout-response'
                          ? TOUR_ANCHOR_IDS.aiChatWorkoutTemplate
                          : undefined
                      }
                    />
                  ))}


                  {/* Loading indicator */}
                  {isSendingMessage && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                      style={styles.loadingContainer}
                    >
                      <AnimatedLoadingSparkles />
                      <Text style={[styles.loadingText, themedStyles.loadingText]}>{loadingMessage}</Text>
                    </Animated.View>
                  )}
                </>
              )}

              {/* Rate limit warning - only shown when approaching limit */}
              {showRateLimitWarning && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.rateLimitWarning}
                >
                  <ExclamationTriangleIcon size={16} color={Colors.warning} />
                  <Text style={styles.rateLimitWarningText}>
                    {remaining} AI request{remaining !== 1 ? 's' : ''} remaining today
                  </Text>
                </Animated.View>
              )}

              {/* Error display */}
              {error && (
                <TouchableOpacity
                  style={styles.errorContainer}
                  onPress={lastFailedMessage ? handleRetry : clearError}
                  activeOpacity={0.8}
                  accessibilityLabel={lastFailedMessage ? "Retry failed message" : "Dismiss error"}
                  accessibilityRole="button"
                >
                  <Text style={styles.errorText}>{error}</Text>
                  <Text style={[styles.errorHint, themedStyles.errorHint]}>
                    {lastFailedMessage ? 'Tap to retry' : 'Tap to dismiss'}
                  </Text>
                </TouchableOpacity>
              )}

              {chatWorkoutActions.templateSaveError && (
                <TouchableOpacity
                  style={styles.errorContainer}
                  onPress={() => chatWorkoutActions.setTemplateSaveError(null)}
                  activeOpacity={0.8}
                  accessibilityLabel="Dismiss workout save error"
                  accessibilityRole="button"
                >
                  <Text style={styles.errorText}>{chatWorkoutActions.templateSaveError}</Text>
                  <Text style={[styles.errorHint, themedStyles.errorHint]}>Tap to dismiss</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* Input */}
            <AIMediaPreviewStrip
              media={pendingChatMedia}
              onRemove={(id) => setPendingChatMedia((current) => current.filter((item) => item.id !== id))}
            />
            <ChatInput
              value={inputText}
              onChangeText={setInputText}
              onSend={handleSend}
              disabled={isSendingMessage}
              suppressVoicePermissionPrompt={isTourActive}
              hasAttachments={pendingChatMedia.length > 0}
              onAddMedia={() => { void pickMedia('chat'); }}
            />
          </KeyboardAvoidingView>
        )}

      <AIWorkoutPreviewModal
        visible={Boolean(activeWorkoutActions.previewMessage?.workoutTemplate)}
        template={activeWorkoutActions.previewMessage?.workoutTemplate ?? null}
        onClose={() => activeWorkoutActions.setPreviewMessageId(null)}
        onStart={() => {
          if (activeWorkoutActions.previewMessage) {
            void activeWorkoutActions.handleStartWorkoutTemplate(activeWorkoutActions.previewMessage);
          }
        }}
        onAdd={() => {
          if (activeWorkoutActions.previewMessage) {
            void activeWorkoutActions.handleAddWorkoutTemplate(activeWorkoutActions.previewMessage);
          }
        }}
        isStarting={activeWorkoutActions.previewMessage?.id === activeWorkoutActions.startingWorkoutMessageId}
        isAdding={activeWorkoutActions.previewMessage?.id === activeWorkoutActions.savingWorkoutMessageId}
        isAdded={Boolean(activeWorkoutActions.previewMessage?.savedWorkoutTemplateId)}
        isStartDisabled={
          activeWorkoutActions.isWorkoutActive
          || activeWorkoutActions.previewMessage?.id === 'tour-back-workout-response'
        }
        startDisabledLabel={
          activeWorkoutActions.previewMessage?.id === 'tour-back-workout-response'
            ? 'Start'
            : undefined
        }
        disableExerciseDetails={isTourActive}
        onOpenExerciseDetails={handleOpenAIWorkoutExerciseDetails}
      />
      <CustomScenarioSheet
        visible={isScenarioSheetVisible}
        preferences={realtimePreferences}
        onChange={handleRealtimePreferencesChange}
        onClose={() => setScenarioSheetVisible(false)}
      />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modeSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    padding: 3,
    gap: 2,
  },
  modeOption: {
    minWidth: 58,
    minHeight: 30,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  modeOptionText: {
    ...Typography.bodySmall,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  clearButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  clearText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  scenarioHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.72,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: Spacing.lg,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    alignSelf: 'stretch',
  },
  loadingIconWrapper: {
    width: IconSizes.md,
    height: IconSizes.md,
    position: 'relative',
  },
  loadingIconAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  errorContainer: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    padding: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
  },
  errorHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  rateLimitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  rateLimitWarningText: {
    ...Typography.caption,
    color: Colors.warning,
  },
});
