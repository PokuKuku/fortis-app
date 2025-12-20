/**
 * AI Chat Screen
 *
 * Fullscreen chat interface for AI conversations.
 * Displays conversation history and allows sending messages.
 * Uses native route animations for smooth bottom sheet experience.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
} from 'react-native-reanimated';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  CameraIcon,
  PhotoIcon,
} from 'react-native-heroicons/outline';
import { DumbbellIcon } from '@/src/components/icons/DumbbellIcon';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { useAIStore } from '@/src/store/aiStore';
import { AIIntent, AIConversationMessage, AIImageMimeType } from '@/src/types/ai';

// Quick action suggestions
const QUICK_ACTIONS = [
  {
    intent: 'QUERY_STATS' as AIIntent,
    icon: ArrowTrendingUpIcon,
    label: 'Check my stats',
    prompt: "What's my best bench press?",
  },
  {
    intent: 'ANALYZE_PLATEAU' as AIIntent,
    icon: QuestionMarkCircleIcon,
    label: 'Analyze plateau',
    prompt: 'Why has my progress stalled?',
  },
  {
    intent: 'CREATE_TEMPLATE' as AIIntent,
    icon: DumbbellIcon,
    label: 'Create workout',
    prompt: 'Create a push day workout',
  },
  {
    intent: 'CREATE_PROGRAM' as AIIntent,
    icon: ChatBubbleLeftRightIcon,
    label: 'Create program',
    prompt: 'Build me a 4-day program',
  },
];

export default function AIChatScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<AIIntent>('QUERY_STATS');
  const scrollViewRef = useRef<ScrollView>(null);

  const conversation = useAIStore((state) => state.conversation);
  const isSendingMessage = useAIStore((state) => state.isSendingMessage);
  const currentMutationPlan = useAIStore((state) => state.currentMutationPlan);
  const error = useAIStore((state) => state.error);
  const sendMessage = useAIStore((state) => state.sendMessage);
  const clearError = useAIStore((state) => state.clearError);
  const clearConversation = useAIStore((state) => state.clearConversation);
  const selectedImage = useAIStore((state) => state.selectedImage);
  const setSelectedImage = useAIStore((state) => state.setSelectedImage);
  const clearSelectedImage = useAIStore((state) => state.clearSelectedImage);

  const messages = conversation?.messages || [];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleClose = () => {
    router.back();
  };

  const handleSend = async () => {
    // Allow send if there's text OR an image attached
    if ((!inputText.trim() && !selectedImage) || isSendingMessage) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    const message = inputText.trim() || (selectedImage ? 'Log this workout from the image' : '');
    setInputText('');

    await sendMessage(selectedIntent, message);
  };

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    setSelectedIntent(action.intent);
    setInputText(action.prompt);
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);

    // Show options for camera or gallery
    Alert.alert(
      'Add Image',
      'Choose an image source',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Camera access is required to take photos.');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.8,
              base64: true,
              exif: false,
            });

            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              if (asset.base64) {
                const mimeType = (asset.mimeType || 'image/jpeg') as AIImageMimeType;
                setSelectedImage({
                  uri: asset.uri,
                  base64: asset.base64,
                  mimeType,
                });
                // Auto-switch to LOG_WORKOUT intent when image is added
                setSelectedIntent('LOG_WORKOUT');
              }
            }
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Photo library access is required to select images.');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
              base64: true,
              exif: false,
            });

            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              if (asset.base64) {
                const mimeType = (asset.mimeType || 'image/jpeg') as AIImageMimeType;
                setSelectedImage({
                  uri: asset.uri,
                  base64: asset.base64,
                  mimeType,
                });
                // Auto-switch to LOG_WORKOUT intent when image is added
                setSelectedIntent('LOG_WORKOUT');
              }
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderMessage = (message: AIConversationMessage, index: number) => {
    const isUser = message.role === 'user';

    return (
      <Animated.View
        key={message.id}
        entering={FadeIn.duration(200)}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <SparklesIcon color={Colors.success} size={IconSizes.sm} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {/* Show image thumbnail if present */}
          {message.image && (
            <Image
              source={{ uri: message.image.uri }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          <Text
            style={[
              styles.messageText,
              isUser && styles.userMessageText,
            ]}
          >
            {message.content}
          </Text>
          {message.intent && (
            <Text style={styles.intentTag}>{message.intent}</Text>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StainlessSteelPattern />

      {/* Drag handle for visual indication of bottom sheet */}
      <View style={styles.dragHandleContainer}>
        <View style={styles.dragHandle} />
      </View>

      {/* Header with "Fortis Analyst" title */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIcon}>
            <SparklesIcon color={Colors.success} size={IconSizes.md} />
          </View>
          <View>
            <Text style={styles.fortisText}>Fortis</Text>
            <Text style={styles.headerSubtitle}>
              {isSendingMessage ? 'Thinking...' : 'Ask me anything'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearConversation}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <XMarkIcon color={Colors.textSecondary} size={IconSizes.lg} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages and Input */}
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
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <SparklesIcon color={Colors.success} size={32} />
              </View>
              <Text style={styles.emptyTitle}>
                How can I help you train?
              </Text>
              <Text style={styles.emptySubtitle}>
                Ask about your stats, create programs, or analyze your
                progress.
              </Text>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                {QUICK_ACTIONS.map((action) => (
                  <TouchableOpacity
                    key={action.intent}
                    style={styles.quickAction}
                    onPress={() => handleQuickAction(action)}
                  >
                    <action.icon
                      color={Colors.textSecondary}
                      size={IconSizes.md}
                    />
                    <Text style={styles.quickActionText}>
                      {action.label}
                    </Text>
                    <ChevronRightIcon
                      color={Colors.textTertiary}
                      size={IconSizes.sm}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map(renderMessage)
          )}

          {isSendingMessage && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.success} size="small" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}

          {error && (
            <TouchableOpacity
              style={styles.errorContainer}
              onPress={clearError}
            >
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorDismiss}>Tap to dismiss</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          {/* Image preview */}
          {selectedImage && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={styles.imagePreviewContainer}
            >
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={clearSelectedImage}
              >
                <XMarkIcon color={Colors.white} size={IconSizes.sm} />
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={styles.inputWrapper}>
            {/* Camera button */}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={pickImage}
              disabled={isSendingMessage}
            >
              <CameraIcon
                color={isSendingMessage ? Colors.textTertiary : Colors.textSecondary}
                size={IconSizes.md}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder={selectedImage ? "Describe the workout (optional)..." : "Ask about your training..."}
              placeholderTextColor={Colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              editable={!isSendingMessage}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                ((!inputText.trim() && !selectedImage) || isSendingMessage) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={(!inputText.trim() && !selectedImage) || isSendingMessage}
            >
              <PaperAirplaneIcon
                color={
                  (inputText.trim() || selectedImage) && !isSendingMessage
                    ? Colors.white
                    : Colors.textTertiary
                }
                size={IconSizes.md}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHint}>
            Intent: {selectedIntent.replace('_', ' ')}{selectedImage ? ' (with image)' : ''}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fortisText: {
    fontFamily: 'BankGothicBT-Medium',
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  clearButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  clearButtonText: {
    ...Typography.label,
    color: Colors.textSecondary,
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
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing['4xl'],
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: Spacing['2xl'],
  },
  quickActions: {
    width: '100%',
    gap: Spacing.sm,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  quickActionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  userBubble: {
    backgroundColor: Colors.success,
    borderBottomRightRadius: BorderRadius.xs,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomLeftRadius: BorderRadius.xs,
  },
  messageText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  userMessageText: {
    color: Colors.white,
  },
  intentTag: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    fontSize: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
  },
  errorDismiss: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: Colors.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    maxHeight: 100,
    paddingVertical: Spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
    textTransform: 'capitalize',
  },
  messageImage: {
    width: '100%',
    height: 150,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  imagePreviewContainer: {
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
});
