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
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { XMarkIcon, SparklesIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useAIStore } from '@/src/store/aiStore';
import { AIIntent, AIImageMimeType } from '@/src/types/ai';
import { ChatMessage } from '@/src/components/ai/ChatMessage';
import { ChatEmptyState } from '@/src/components/ai/ChatEmptyState';
import { ChatInput } from '@/src/components/ai/ChatInput';

// Typing indicator component
function TypingIndicator() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    setTimeout(() => {
      dot2.value = withRepeat(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, 150);
    setTimeout(() => {
      dot3.value = withRepeat(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, 300);
  }, [dot1, dot2, dot3]);

  const dotStyle1 = useAnimatedStyle(() => ({ opacity: 0.3 + dot1.value * 0.7 }));
  const dotStyle2 = useAnimatedStyle(() => ({ opacity: 0.3 + dot2.value * 0.7 }));
  const dotStyle3 = useAnimatedStyle(() => ({ opacity: 0.3 + dot3.value * 0.7 }));

  return (
    <View style={styles.typingIndicator}>
      <Animated.View style={[styles.typingDot, dotStyle1]} />
      <Animated.View style={[styles.typingDot, dotStyle2]} />
      <Animated.View style={[styles.typingDot, dotStyle3]} />
    </View>
  );
}

// Intent inference helper
const inferIntentFromMessage = (
  message: string,
  hasImage: boolean
): AIIntent | null => {
  const text = message.toLowerCase();

  if (text.includes('plateau')) return 'ANALYZE_PLATEAU';
  if (text.includes('overload')) return 'ANALYZE_OVERLOAD';

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

  const wantsLog =
    text.includes('log') ||
    text.includes('record') ||
    text.includes('i did') ||
    text.includes('i completed') ||
    text.includes('just finished');

  if (hasImage && wantsLog) return 'LOG_WORKOUT';
  if (hasImage && wantsProgram) return 'CREATE_PROGRAM';
  if (hasImage && wantsTemplate) return 'CREATE_TEMPLATE';
  if (hasImage) return 'LOG_WORKOUT';

  if (wantsProgram && wantsCreate) return 'CREATE_PROGRAM';
  if (wantsTemplate && wantsCreate) return 'CREATE_TEMPLATE';

  return null;
};

export default function AIChatScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<AIIntent>('QUERY_STATS');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const shouldAutoScrollRef = useRef(true);

  // Store state
  const conversation = useAIStore((state) => state.conversation);
  const isSendingMessage = useAIStore((state) => state.isSendingMessage);
  const error = useAIStore((state) => state.error);
  const sendMessage = useAIStore((state) => state.sendMessage);
  const clearError = useAIStore((state) => state.clearError);
  const clearConversation = useAIStore((state) => state.clearConversation);
  const loadConversation = useAIStore((state) => state.loadConversation);
  const loadPendingActions = useAIStore((state) => state.loadPendingActions);
  const selectedImage = useAIStore((state) => state.selectedImage);
  const setSelectedImage = useAIStore((state) => state.setSelectedImage);
  const clearSelectedImage = useAIStore((state) => state.clearSelectedImage);

  const messages = conversation?.messages || [];

  useEffect(() => {
    loadConversation();
    loadPendingActions();
  }, [loadConversation, loadPendingActions]);

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

  const handleClose = () => {
    router.back();
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearConversation();
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isSendingMessage) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = inputText.trim() || (selectedImage ? 'Log this workout from the image' : '');
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
    setSelectedIntent('LOG_WORKOUT');
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StainlessSteelPattern />

      {/* Minimal drag handle */}
      <View style={styles.dragHandle}>
        <View style={styles.dragHandleBar} />
      </View>

      {/* Clean header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <SparklesIcon color={Colors.success} size={18} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Fortis AI</Text>
            {isSendingMessage && <TypingIndicator />}
          </View>
        </View>
        <View style={styles.headerRight}>
          {messages.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <XMarkIcon color={Colors.textSecondary} size={IconSizes.lg} />
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
                />
              ))}

              {/* Loading indicator */}
              {isSendingMessage && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(150)}
                  style={styles.loadingContainer}
                >
                  <View style={styles.loadingAvatar}>
                    <SparklesIcon color={Colors.success} size={IconSizes.sm} />
                  </View>
                  <ActivityIndicator color={Colors.success} size="small" />
                </Animated.View>
              )}
            </>
          )}

          {/* Error display */}
          {error && (
            <TouchableOpacity
              style={styles.errorContainer}
              onPress={clearError}
              activeOpacity={0.8}
            >
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorHint}>Tap to dismiss</Text>
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
    gap: Spacing.sm,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
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
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.success,
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  loadingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
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
