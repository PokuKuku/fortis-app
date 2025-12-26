/**
 * ChatMessage Component
 *
 * ChatGPT-style message display with:
 * - Full-width centered layout
 * - Markdown rendering for AI responses
 * - Copy button for AI messages
 * - Animated sparkles icon when loading
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import ReAnimated, { FadeIn } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';
import * as Haptics from 'expo-haptics';

// Clipboard helper - uses Share as fallback for Expo Go
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Try expo-clipboard first (works in dev client builds)
    const Clipboard = await import('expo-clipboard').catch(() => null);
    if (Clipboard?.setStringAsync) {
      await Clipboard.setStringAsync(text);
      return true;
    }
  } catch {
    // Fallback for Expo Go - use Share
  }

  // Fallback: use Share API
  try {
    await Share.share({ message: text });
    return true;
  } catch {
    return false;
  }
};
import {
  DocumentDuplicateIcon,
  CheckIcon,
  PencilIcon,
} from 'react-native-heroicons/outline';
import { GlassButton } from '@/components/GlassButton';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography, FontFamily } from '@/constants/Typography';
import { AIConversationMessage } from '@/src/types/ai';
import { StreamingText } from './StreamingText';

interface ChatMessageProps {
  message: AIConversationMessage;
  /** Whether this message should stream (for new AI messages) */
  isStreaming?: boolean;
  /** Whether the AI is currently loading/generating */
  isAILoading?: boolean;
  /** Callback when streaming completes */
  onStreamComplete?: () => void;
  /** Animation delay for staggered entrance */
  delay?: number;
  /** Callback when user taps Save button (for actionable messages) */
  onSaveAction?: () => void;
  /** Callback when user taps Customize button (for actionable messages) */
  onCustomizeAction?: () => void;
}

export function ChatMessage({
  message,
  isStreaming = false,
  isAILoading = false,
  onStreamComplete,
  delay = 0,
  onSaveAction,
  onCustomizeAction,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [message.content]);

  // Markdown styles matching the design system
  const markdownStyles = {
    body: {
      ...Typography.body,
      color: Colors.textPrimary,
      lineHeight: 24,
    },
    heading1: {
      ...Typography.h3,
      color: Colors.textPrimary,
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    heading2: {
      ...Typography.h4,
      color: Colors.textPrimary,
      marginTop: Spacing.md,
      marginBottom: Spacing.xs,
    },
    heading3: {
      ...Typography.h5,
      color: Colors.textPrimary,
      marginTop: Spacing.md,
      marginBottom: Spacing.xs,
    },
    strong: {
      fontFamily: FontFamily.semibold,
      fontWeight: '600' as const,
      color: Colors.textPrimary,
    },
    em: {
      fontStyle: 'italic' as const,
      color: Colors.textPrimary,
    },
    link: {
      color: Colors.info,
      textDecorationLine: 'underline' as const,
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: Colors.success,
      paddingLeft: Spacing.md,
      marginVertical: Spacing.sm,
      backgroundColor: 'rgba(34, 197, 94, 0.08)',
      borderRadius: BorderRadius.sm,
      paddingVertical: Spacing.sm,
    },
    code_inline: {
      fontFamily: FontFamily.mono,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      color: Colors.success,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
    },
    code_block: {
      fontFamily: FontFamily.mono,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      color: Colors.textPrimary,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      fontSize: 13,
      lineHeight: 20,
      marginVertical: Spacing.sm,
    },
    fence: {
      fontFamily: FontFamily.mono,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      color: Colors.textPrimary,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      fontSize: 13,
      lineHeight: 20,
      marginVertical: Spacing.sm,
    },
    bullet_list: {
      marginVertical: Spacing.xs,
    },
    ordered_list: {
      marginVertical: Spacing.xs,
    },
    list_item: {
      marginVertical: 2,
    },
    bullet_list_icon: {
      color: Colors.success,
      fontSize: 8,
      lineHeight: 24,
      marginRight: Spacing.sm,
    },
    ordered_list_icon: {
      color: Colors.textSecondary,
      fontSize: 14,
      lineHeight: 24,
      marginRight: Spacing.sm,
    },
    hr: {
      backgroundColor: Colors.border,
      height: 1,
      marginVertical: Spacing.lg,
    },
    table: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: BorderRadius.sm,
      marginVertical: Spacing.sm,
    },
    thead: {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
    th: {
      ...Typography.labelSmall,
      color: Colors.textSecondary,
      padding: Spacing.sm,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: Colors.border,
    },
    td: {
      ...Typography.bodySmall,
      color: Colors.textPrimary,
      padding: Spacing.sm,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: Colors.border,
    },
  };

  return (
    <ReAnimated.View
      entering={FadeIn.duration(300).delay(delay)}
      style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}
    >

      {/* Message Content */}
      <View style={[styles.content, isUser ? styles.userContent : styles.aiContent]}>
        {/* Image attachment if present */}
        {message.image && (
          <Image
            source={{ uri: message.image.uri }}
            style={styles.messageImage}
            resizeMode="cover"
            accessibilityLabel="Attached image"
            accessibilityRole="image"
          />
        )}

        {/* Message text */}
        {isUser ? (
          <Text style={styles.userText}>{message.content}</Text>
        ) : isStreaming ? (
          <StreamingText
            text={message.content}
            speed={10}
            streaming={true}
            onComplete={onStreamComplete}
            style={markdownStyles.body}
            showCursor={true}
          />
        ) : (
          <Markdown style={markdownStyles}>{message.content}</Markdown>
        )}

        {/* Copy button and timestamp for AI messages */}
        {!isUser && !isStreaming && message.content.length > 0 && (
          <View style={styles.messageFooter}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopy}
              activeOpacity={0.7}
              accessibilityLabel={copied ? "Copied to clipboard" : "Copy message"}
              accessibilityRole="button"
            >
              {copied ? (
                <CheckIcon color={Colors.success} size={IconSizes.sm} />
              ) : (
                <DocumentDuplicateIcon color={Colors.textTertiary} size={IconSizes.sm} />
              )}
              <Text style={[styles.copyText, copied && styles.copyTextSuccess]}>
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.timestamp}>
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </Text>
          </View>
        )}

        {/* Timestamp for user messages */}
        {isUser && (
          <Text style={styles.timestamp}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </Text>
        )}

        {/* Action buttons for actionable messages (workouts/programs) */}
        {!isUser && !isStreaming && message.mutationPlanId && onSaveAction && onCustomizeAction && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.customizeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCustomizeAction();
              }}
              activeOpacity={0.7}
              accessibilityLabel="Customize workout"
              accessibilityHint="Review and edit before saving"
              accessibilityRole="button"
            >
              <PencilIcon color={Colors.textPrimary} size={IconSizes.sm} />
              <Text style={styles.customizeButtonText}>Customize</Text>
            </TouchableOpacity>
            <GlassButton
              style={styles.saveButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSaveAction();
              }}
              accessibilityLabel="Save workout"
              accessibilityRole="button"
            >
              <CheckIcon color={Colors.white} size={IconSizes.sm} />
              <Text style={styles.saveButtonText}>Save</Text>
            </GlassButton>
          </View>
        )}

        {/* Clarification options */}
        {message.clarification?.options && message.clarification.options.length > 0 && (
          <View style={styles.clarificationOptions}>
            {message.clarification.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.clarificationOption}
                activeOpacity={0.7}
                accessibilityLabel={`Select option: ${option}`}
                accessibilityRole="button"
              >
                <Text style={styles.clarificationOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* User indicator */}
      {isUser && (
        <View style={styles.userIndicator}>
          <Text style={styles.userIndicatorText}>You</Text>
        </View>
      )}
    </ReAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%',
  },
  userContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  aiContainer: {
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  userContent: {},
  aiContent: {},
  userText: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  messageImage: {
    width: '100%',
    maxWidth: 280,
    height: 180,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  copyText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  copyTextSuccess: {
    color: Colors.success,
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontSize: 11,
    marginTop: Spacing.xs,
  },
  userIndicator: {
    marginLeft: Spacing.sm,
    paddingTop: 2,
  },
  userIndicatorText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  customizeButtonText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  saveButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
  clarificationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  clarificationOption: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  clarificationOptionText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});

export default ChatMessage;
