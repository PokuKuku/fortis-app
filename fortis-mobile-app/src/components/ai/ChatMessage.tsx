/**
 * ChatMessage Component
 *
 * ChatGPT-style message display with:
 * - Full-width centered layout
 * - Markdown rendering for AI responses
 * - Animated sparkles icon when loading
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import ReAnimated, { FadeIn } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography, FontFamily } from '@/constants/Typography';
import { AIConversationMessage } from '@/src/types/ai';
import { useTheme } from '@/src/contexts/ThemeContext';

interface ChatMessageProps {
  message: AIConversationMessage;
  /** Animation delay for staggered entrance */
  delay?: number;
  /** Callback when user taps a clarification option */
  onClarificationSelect?: (option: string) => void;
}

export function ChatMessage({
  message,
  delay = 0,
  onClarificationSelect,
}: ChatMessageProps) {
  const { colors, isDark } = useTheme();
  const isUser = message.role === 'user';
  const { mainContent, tldr } = !isUser
    ? splitTldrFromContent(message.content)
    : { mainContent: message.content, tldr: null };
  const shouldShowTldr = !isUser && tldr && shouldDisplayTldr(mainContent);

  // Dynamic theme-aware styles
  const themedStyles = {
    userContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
    },
    userText: { color: colors.textPrimary },
    timestamp: { color: colors.textTertiary },
    userIndicatorText: { color: colors.textTertiary },
    clarificationOption: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
    },
    clarificationOptionText: { color: colors.textSecondary },
    tldrContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    tldrLabel: { color: colors.textSecondary },
    tldrText: { color: colors.textPrimary },
  };

  const markdownStyles = {
    body: {
      ...Typography.body,
      color: colors.textPrimary,
      lineHeight: 24,
    },
    heading1: {
      ...Typography.h3,
      color: colors.textPrimary,
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    heading2: {
      ...Typography.h4,
      color: colors.textPrimary,
      marginTop: Spacing.md,
      marginBottom: Spacing.xs,
    },
    heading3: {
      ...Typography.h5,
      color: colors.textPrimary,
      marginTop: Spacing.md,
      marginBottom: Spacing.xs,
    },
    strong: {
      fontFamily: FontFamily.semibold,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    em: {
      fontStyle: 'italic' as const,
      color: colors.textPrimary,
    },
    link: {
      color: Colors.info,
      textDecorationLine: 'underline' as const,
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      paddingLeft: Spacing.md,
      marginVertical: Spacing.sm,
      backgroundColor: colors.accentOverlay,
      borderRadius: BorderRadius.sm,
      paddingVertical: Spacing.sm,
    },
    code_inline: {
      fontFamily: FontFamily.mono,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      color: colors.accent,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
    },
    code_block: {
      fontFamily: FontFamily.mono,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      color: colors.textPrimary,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      fontSize: 13,
      lineHeight: 20,
      marginVertical: Spacing.sm,
    },
    fence: {
      fontFamily: FontFamily.mono,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      color: colors.textPrimary,
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
      color: colors.accent,
      fontSize: 8,
      lineHeight: 24,
      marginRight: Spacing.sm,
    },
    ordered_list_icon: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 24,
      marginRight: Spacing.sm,
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: Spacing.lg,
    },
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.sm,
      marginVertical: Spacing.sm,
    },
    thead: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
    },
    th: {
      ...Typography.labelSmall,
      color: colors.textSecondary,
      padding: Spacing.sm,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    td: {
      ...Typography.bodySmall,
      color: colors.textPrimary,
      padding: Spacing.sm,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
  };

  return (
    <ReAnimated.View
      entering={FadeIn.duration(300).delay(delay)}
      style={[styles.container, isUser ? [styles.userContainer, themedStyles.userContainer] : styles.aiContainer]}
    >
      <View style={[styles.content, isUser ? styles.userContent : styles.aiContent]}>
        {message.image && (
          <Image
            source={{ uri: message.image.uri }}
            style={styles.messageImage}
            resizeMode="cover"
            accessibilityLabel="Attached image"
            accessibilityRole="image"
          />
        )}

        {isUser ? (
          <Text style={[styles.userText, themedStyles.userText]}>{message.content}</Text>
        ) : (
          <Markdown style={markdownStyles}>{mainContent}</Markdown>
        )}

        {shouldShowTldr && (
          <View style={[styles.tldrContainer, themedStyles.tldrContainer]}>
            <Text style={[styles.tldrLabel, themedStyles.tldrLabel]}>TLDR</Text>
            <Text style={[styles.tldrText, themedStyles.tldrText]}>{tldr}</Text>
          </View>
        )}

        {!isUser && mainContent.length > 0 && (
          <Text style={[styles.timestamp, themedStyles.timestamp]}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </Text>
        )}

        {isUser && (
          <Text style={[styles.timestamp, themedStyles.timestamp]}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </Text>
        )}

        {message.clarification?.options && message.clarification.options.length > 0 && (
          <View style={styles.clarificationOptions}>
            {message.clarification.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.clarificationOption, themedStyles.clarificationOption]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onClarificationSelect?.(option);
                }}
                activeOpacity={0.7}
                accessibilityLabel={`Select option: ${option}`}
                accessibilityRole="button"
              >
                <Text style={[styles.clarificationOptionText, themedStyles.clarificationOptionText]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {isUser && (
        <View style={styles.userIndicator}>
          <Text style={[styles.userIndicatorText, themedStyles.userIndicatorText]}>You</Text>
        </View>
      )}
    </ReAnimated.View>
  );
}

const TLDR_REGEX = /(^|\n)TLDR:\s*([^\n\r]+)\s*$/i;
const TLDR_MIN_WORDS = 40;

function splitTldrFromContent(content: string) {
  const match = content.match(TLDR_REGEX);
  if (!match || match.index === undefined) {
    return { mainContent: content, tldr: buildFallbackTldr(content) };
  }

  return {
    mainContent: content.slice(0, match.index).trimEnd(),
    tldr: match[2].trim(),
  };
}

function buildFallbackTldr(content: string) {
  const cleaned = content.replace(/[`#>*_]/g, '').trim();
  if (!cleaned) {
    return null;
  }

  const lines = cleaned.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] ?? cleaned;
  const noBullet = firstLine.replace(/^[-*•]\s+/, '').trim();
  if (!noBullet) {
    return null;
  }

  if (noBullet.length <= 200) {
    return noBullet;
  }

  return `${noBullet.slice(0, 197).trimEnd()}...`;
}

function shouldDisplayTldr(content: string): boolean {
  if (!content) return false;
  const cleaned = content
    .replace(/[`#>*_]/g, ' ')
    .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/https?:\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return false;
  return cleaned.split(' ').length >= TLDR_MIN_WORDS;
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
  tldrContainer: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  tldrLabel: {
    ...Typography.labelSmall,
    fontFamily: FontFamily.semibold,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  tldrText: {
    ...Typography.bodySmall,
  },
});
