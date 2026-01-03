/**
 * AI Chat Screen
 *
 * Premium ChatGPT-style interface with:
 * - Smooth streaming text animations
 * - Clean, minimal design
 * - Full-width centered messages
 * - Refined input experience
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
import { useAnalytics } from '@/src/services/analyticsService';
import { AIIntent } from '@/src/types/ai';
import { ChatMessage } from '@/src/components/ai/ChatMessage';
import { ChatEmptyState } from '@/src/components/ai/ChatEmptyState';
import { ChatInput } from '@/src/components/ai/ChatInput';
import { ChatHeaderLogo } from '@/src/components/ai/ChatHeaderLogo';
import { AIMutationPreviewModal } from '@/src/components/ai/AIMutationPreviewModal';

// Helpful app tips shown while waiting for AI responses
const LOADING_MESSAGES = [
  "Tip: Long-press a weight or reps cell to fill the remaining sets.",
  "Tip: Long-press the checkmark to complete the remaining sets.",
  "Tip: Long-press the Start button to reconfigure what it launches.",
  "Tip: Configure the Start button to quick-start a favorite workout or program.",
  "Tip: Ask AI for a weekly training summary or recent PRs.",
  "Tip: Use AI chat to spot volume trends and muscle balance.",
];

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

// Intent inference helper - simplified to only support ANALYZE_HISTORY
const inferIntentFromMessage = (message: string): AIIntent => {
  // All messages use ANALYZE_HISTORY intent
  // CREATE_PROGRAM and CREATE_TEMPLATE intents are temporarily disabled
  return 'ANALYZE_HISTORY';
};

export default function AIChatScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { trackAIChatOpened } = useAnalytics();
  const isNavigating = useRef(false);
  const [inputText, setInputText] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
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
  const loadMutationPlan = useAIStore((state) => state.loadMutationPlan);
  const loadPendingActions = useAIStore((state) => state.loadPendingActions);
  const currentMutationPlan = useAIStore((state) => state.currentMutationPlan);
  const applyCurrentMutationPlan = useAIStore((state) => state.applyCurrentMutationPlan);
  const lastFailedMessage = useAIStore((state) => state.lastFailedMessage);
  const retryLastMessage = useAIStore((state) => state.retryLastMessage);
  const checkRateLimits = useAIStore((state) => state.checkRateLimits);
  const rateLimitStatus = useAIStore((state) => state.rateLimitStatus);

  const messages = conversation?.messages || [];

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
    loadPendingActions();
    loadMutationPlan();
    checkRateLimits();
    trackAIChatOpened();
  }, [loadConversation, loadPendingActions, loadMutationPlan, checkRateLimits, trackAIChatOpened]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 50);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && shouldAutoScrollRef.current) {
      scrollToBottom(true);
    }
  }, [messages.length, scrollToBottom]);

  // Track streaming state for latest AI message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !streamingMessageId) {
        setStreamingMessageId(lastMessage.id);
      }
    }
  }, [messages, streamingMessageId]);

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
    isNavigating.current = true;
    router.back();
    setTimeout(() => { isNavigating.current = false; }, 500);
  }, [router]);

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
    setInputText('');
    setStreamingMessageId(null);
    shouldAutoScrollRef.current = true;
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 50);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isSendingMessage) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = inputText.trim();
    const intent = inferIntentFromMessage(message);

    setInputText('');
    setStreamingMessageId(null);
    await sendMessage(intent, message);
  };

  const handleQuickAction = (_intent: AIIntent, prompt: string) => {
    // Intent is always ANALYZE_HISTORY now, but we keep the parameter
    // for interface compatibility with ChatEmptyState
    setInputText(prompt);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;
    shouldAutoScrollRef.current =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - paddingToBottom;
  };

  const handleStreamComplete = useCallback(() => {
    setStreamingMessageId(null);
  }, []);

  // Save action - directly apply the mutation plan
  const handleSaveAction = useCallback(async () => {
    const success = await applyCurrentMutationPlan();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [applyCurrentMutationPlan]);

  // Customize action - open preview modal
  const handleCustomizeAction = useCallback(() => {
    setShowPreviewModal(true);
  }, []);

  // Preview modal confirm
  const handlePreviewConfirm = useCallback(async () => {
    const success = await applyCurrentMutationPlan();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowPreviewModal(false);
    }
  }, [applyCurrentMutationPlan]);

  // Retry failed message
  const handleRetry = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStreamingMessageId(null);
    await retryLastMessage();
  }, [retryLastMessage]);

  return (
    <View style={[styles.container, themedStyles.container]}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <GestureDetector gesture={panGesture}>
          <View style={[styles.header, themedStyles.header]}>
            <View style={styles.headerLeft}>
              <ChatHeaderLogo isLoading={isSendingMessage} />
            </View>
            <View style={styles.headerRight}>
              {messages.length > 0 && (
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
          {messages.length === 0 ? (
            <ChatEmptyState onQuickAction={handleQuickAction} />
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={false}
                  isAILoading={isSendingMessage && message.role === 'assistant'}
                  onSaveAction={handleSaveAction}
                  onCustomizeAction={handleCustomizeAction}
                  onClarificationSelect={(option) => {
                    setInputText(option);
                  }}
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
        </ScrollView>

        {/* Input */}
        <ChatInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          disabled={isSendingMessage}
        />
      </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Mutation Preview Modal */}
      <AIMutationPreviewModal
        visible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={handlePreviewConfirm}
      />
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
    marginLeft: Spacing.sm,
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
