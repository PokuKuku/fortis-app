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
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { XMarkIcon, SparklesIcon } from 'react-native-heroicons/outline';
import { SparklesIcon as SparklesSolid } from 'react-native-heroicons/solid';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAIStore } from '@/src/store/aiStore';
import { AIIntent, AIImageMimeType } from '@/src/types/ai';
import { ChatMessage } from '@/src/components/ai/ChatMessage';
import { ChatEmptyState } from '@/src/components/ai/ChatEmptyState';
import { ChatInput } from '@/src/components/ai/ChatInput';
import { ChatHeaderLogo } from '@/src/components/ai/ChatHeaderLogo';
import { QuickReplies } from '@/src/components/ai/QuickReplies';
import { getContextAwareSuggestions } from '@/src/utils/aiSuggestions';
import { AIMutationPreviewModal } from '@/src/components/ai/AIMutationPreviewModal';

// Motivational loading messages
const LOADING_MESSAGES = [
  "Analyzing your gains...",
  "Crunching the numbers...",
  "Building something epic...",
  "Consulting the iron gods...",
  "Calculating optimal reps...",
  "Reviewing your progress...",
  "Designing your next PR...",
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

// Intent inference helper
const inferIntentFromMessage = (
  message: string,
  hasImage: boolean
): AIIntent | null => {
  const text = message.toLowerCase().trim();

  // Analysis detection - question patterns and analysis keywords
  const isQuestion =
    text.startsWith('what') ||
    text.startsWith('how') ||
    text.startsWith('when') ||
    text.startsWith('why') ||
    text.startsWith('which') ||
    text.startsWith('show me') ||
    text.startsWith('tell me') ||
    text.endsWith('?');

  const wantsAnalysis =
    text.includes('analyze') ||
    text.includes('analysis') ||
    text.includes('progress') ||
    text.includes('pr ') ||
    text.includes('prs') ||
    text.includes('personal record') ||
    text.includes('stats') ||
    text.includes('statistics') ||
    text.includes('trend') ||
    text.includes('weak') ||
    text.includes('strong') ||
    text.includes('volume') ||
    text.includes('frequency') ||
    text.includes('how many') ||
    text.includes('how much') ||
    text.includes('improve') ||
    text.includes('gains');

  const wantsProgram =
    text.includes('program') ||
    text.includes('split') ||
    text.includes('routine') ||
    text.includes('block') ||
    text.includes('weeks');

  const wantsTemplate =
    text.includes('template') ||
    text.includes('workout') ||
    text.includes('session');

  const wantsCreate =
    text.includes('create') ||
    text.includes('build') ||
    text.includes('make') ||
    text.includes('generate') ||
    text.includes('design');

  // Image-based requests take priority for creation
  if (hasImage && wantsProgram) return 'CREATE_PROGRAM';
  if (hasImage && wantsTemplate) return 'CREATE_TEMPLATE';
  if (hasImage) return null;

  // Analysis takes priority when asking questions (read intent)
  if (wantsAnalysis || (isQuestion && !wantsCreate)) return 'ANALYZE_HISTORY';

  // Creation intents
  if (wantsProgram && wantsCreate) return 'CREATE_PROGRAM';
  if (wantsTemplate && wantsCreate) return 'CREATE_TEMPLATE';

  return null;
};

export default function AIChatScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [inputText, setInputText] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<AIIntent>('CREATE_TEMPLATE');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const shouldAutoScrollRef = useRef(true);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    dragHandleBar: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
    },
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
  const selectedImage = useAIStore((state) => state.selectedImage);
  const setSelectedImage = useAIStore((state) => state.setSelectedImage);
  const clearSelectedImage = useAIStore((state) => state.clearSelectedImage);
  const currentMutationPlan = useAIStore((state) => state.currentMutationPlan);
  const applyCurrentMutationPlan = useAIStore((state) => state.applyCurrentMutationPlan);
  const lastFailedMessage = useAIStore((state) => state.lastFailedMessage);
  const retryLastMessage = useAIStore((state) => state.retryLastMessage);
  const checkRateLimits = useAIStore((state) => state.checkRateLimits);

  const messages = conversation?.messages || [];

  useEffect(() => {
    loadConversation();
    loadPendingActions();
    loadMutationPlan();
    checkRateLimits();
  }, [loadConversation, loadPendingActions, loadMutationPlan, checkRateLimits]);

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

  // Select random loading message when AI starts responding
  useEffect(() => {
    if (isSendingMessage) {
      const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
      setLoadingMessage(LOADING_MESSAGES[randomIndex]);
    }
  }, [isSendingMessage]);

  const handleClose = () => {
    router.back();
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearConversation();
    clearError();
    clearSelectedImage();
    setInputText('');
    setSelectedIntent('CREATE_TEMPLATE');
    setStreamingMessageId(null);
    shouldAutoScrollRef.current = true;
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 50);
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isSendingMessage) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message =
      inputText.trim() || (selectedImage ? 'Create a template from this image' : '');
    const inferredIntent = inferIntentFromMessage(message, Boolean(selectedImage));
    const intentToSend = inferredIntent || selectedIntent;

    if (inferredIntent && inferredIntent !== selectedIntent) {
      setSelectedIntent(inferredIntent);
    }

    setInputText('');
    setStreamingMessageId(null);
    await sendMessage(intentToSend, message);
  };

  const handleQuickAction = (intent: AIIntent, prompt: string) => {
    setSelectedIntent(intent);
    setInputText(prompt);
  };

  const handleImageSelect = (image: {
    uri: string;
    base64: string;
    mimeType: AIImageMimeType;
  }) => {
    setSelectedImage(image);
    setSelectedIntent('CREATE_TEMPLATE');
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
    <SafeAreaView style={[styles.container, themedStyles.container]} edges={['top']}>
      <StainlessSteelPattern />

      {/* Minimal drag handle */}
      <View style={styles.dragHandle}>
        <View style={[styles.dragHandleBar, themedStyles.dragHandleBar]} />
      </View>

      {/* Clean header */}
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

              {/* Quick Replies - context-aware suggestions */}
              {/* Hide when last message has clarification options to prevent duplicates */}
              {!isSendingMessage && messages.length > 0 &&
               !((messages[messages.length - 1]?.clarification?.options?.length ?? 0) > 0) && (
                <QuickReplies
                  suggestions={getContextAwareSuggestions()}
                  onSelect={(suggestion) => {
                    setInputText(suggestion);
                  }}
                  disabled={isSendingMessage}
                />
              )}

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
          onImageSelect={handleImageSelect}
          onImageClear={clearSelectedImage}
          selectedImage={selectedImage}
          disabled={isSendingMessage}
        />
      </KeyboardAvoidingView>

      {/* Mutation Preview Modal */}
      <AIMutationPreviewModal
        visible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={handlePreviewConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dragHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
});
