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
  const allowTldr = message.intent !== 'GENERAL_CHAT';
  const { mainContent, tldr } = !isUser
    ? splitTldrFromContent(message.content, allowTldr)
    : { mainContent: message.content, tldr: null };
  const shouldShowTldr = allowTldr && !isUser && tldr && shouldDisplayTldr(mainContent);

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
const TLDR_MIN_ACCEPTABLE_WORDS = 6;
const TLDR_MAX_WORDS = 24;
const TLDR_MAX_SENTENCES = 2;

function splitTldrFromContent(content: string, allowFallback: boolean) {
  const match = content.match(TLDR_REGEX);
  if (!match || match.index === undefined) {
    return {
      mainContent: content,
      tldr: allowFallback ? buildFallbackTldr(content) : null,
    };
  }

  const mainContent = content.slice(0, match.index).trimEnd();
  let normalized = normalizeTldr(match[2].trim());
  if (normalized && isTldrLowQuality(normalized, mainContent)) {
    normalized = null;
  }
  return {
    mainContent,
    tldr: normalized ?? (allowFallback ? buildFallbackTldr(mainContent) : null),
  };
}

function buildFallbackTldr(content: string) {
  const cleaned = content
    .replace(/\[[^\]]*]\([^)]+\)/g, '')
    .replace(/[`#>*_]/g, '')
    .trim();
  if (!cleaned) {
    return null;
  }

  const lines = cleaned.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const proseLines = lines
    .filter((line) => !/^[-*•]\s+/.test(line))
    .filter((line) => !isSectionHeaderLine(line));
  const diagnosisLine = stripSectionPrefix(proseLines[0] ?? '');
  const evidenceSection = extractSectionText(cleaned, /(Evidence)/i, /(Recommendations|Actionable next steps)/i);
  const recSection = extractSectionText(cleaned, /(Recommendations|Actionable next steps)/i, /$/i);
  const evidenceBullets = extractBulletLines(evidenceSection);
  const recommendationBullets = extractBulletLines(recSection);

  const diagnosisSentence = extractFirstSentence(diagnosisLine);
  const recommendationSentence = extractFirstSentence(recommendationBullets[0] ?? '');
  const evidenceSentence = extractFirstSentence(evidenceBullets[0] ?? '');

  const compact = buildCompactTldr(diagnosisSentence, recommendationSentence, evidenceSentence);
  if (compact) {
    return compact;
  }

  const candidates = [diagnosisSentence, recommendationSentence].filter(Boolean);
  if (candidates.length < 2 && evidenceSentence) {
    candidates.push(evidenceSentence);
  }

  const tldr = clampSentences(candidates, TLDR_MAX_SENTENCES, TLDR_MAX_WORDS);
  if (tldr) {
    return tldr;
  }

  const fallback = clampSentences(
    splitIntoSentences(cleaned),
    TLDR_MAX_SENTENCES,
    TLDR_MAX_WORDS
  );
  return fallback ?? null;
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

function isTldrLowQuality(tldr: string, content: string): boolean {
  const wordCount = countWords(tldr);
  if (wordCount < TLDR_MIN_ACCEPTABLE_WORDS) {
    return true;
  }
  return looksTruncatedEnding(tldr, content);
}

function looksTruncatedEnding(tldr: string, content: string): boolean {
  const trimmed = tldr.trim();
  if (!trimmed) return true;
  if (/[–—-]$/.test(trimmed)) return true;

  const lastWord = trimmed
    .replace(/[^\w]+$/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .pop();

  if (!lastWord || lastWord.length < 4) return false;
  const escaped = escapeRegExp(lastWord);
  const prefixRegex = new RegExp(`\\b${escaped}\\w+`, 'i');
  return prefixRegex.test(content);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function trimToWordCount(text: string, maxWords: number): string {
  if (!text) return '';
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return text.trim().replace(/\.\.\.$/, '').replace(/…$/, '');
  }
  const trimmedWords = words.slice(0, maxWords);
  while (trimmedWords.length > 0 && TRAILING_STOP_WORDS.has(trimmedWords[trimmedWords.length - 1].toLowerCase())) {
    trimmedWords.pop();
  }
  return trimmedWords.join(' ').trim().replace(/\.\.\.$/, '').replace(/…$/, '');
}

function normalizeTldr(text: string): string | null {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return null;
  }
  return clampSentences(splitIntoSentences(cleaned), TLDR_MAX_SENTENCES, TLDR_MAX_WORDS);
}

function clampSentences(sentences: string[], maxSentences: number, maxWords: number): string | null {
  const normalized = dedupeSentences(sentences)
    .slice(0, maxSentences)
    .map((sentence) => ensureSentenceEnding(sentence))
    .filter(Boolean);
  if (normalized.length === 0) {
    return null;
  }

  const result: string[] = [];
  let wordCount = 0;
  for (const sentence of normalized) {
    const sentenceWords = countWords(sentence);
    if (wordCount + sentenceWords <= maxWords) {
      result.push(sentence);
      wordCount += sentenceWords;
      continue;
    }
    if (wordCount === 0) {
      const trimmed = trimToWordCount(sentence, maxWords);
      if (trimmed) {
        result.push(ensureSentenceEnding(trimmed));
      }
    }
    break;
  }

  return result.join(' ').trim() || null;
}

function dedupeSentences(sentences: string[]): string[] {
  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const sentence of sentences) {
    const cleaned = sentence.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(cleaned);
  }
  return deduped;
}

function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return matches ? matches.map((sentence) => sentence.trim()).filter(Boolean) : [];
}

function extractFirstSentence(text: string): string {
  const match = text.match(/(.+?[.!?])(\s|$)/);
  if (match) {
    return match[1].trim();
  }
  return text.trim();
}

const TRAILING_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'due',
  'for',
  'from',
  'if',
  'in',
  'into',
  'of',
  'on',
  'or',
  'so',
  'the',
  'to',
  'with',
  'without',
]);

const DIAGNOSIS_SUBJECT_REGEX = /^(?:the|this)\s+(.+?)\s+(?:is|has|shows|appears)\b/i;
const STALL_KEYWORDS = /\b(stall|plateau|stagnant|flat|no progress)\b/i;

function extractDiagnosisSubject(sentence: string): string | null {
  if (!sentence) return null;
  const match = sentence.match(DIAGNOSIS_SUBJECT_REGEX);
  if (match && match[1]) {
    return match[1].trim();
  }
  const splitMatch = sentence.split(/\s+(?:is|has|shows|appears)\b/i);
  if (splitMatch.length > 1) {
    return splitMatch[0].replace(/^(the|this)\s+/i, '').trim();
  }
  return null;
}

function compactDiagnosis(sentence: string): string | null {
  const cleaned = sentence.trim();
  if (!cleaned) return null;
  const subject = extractDiagnosisSubject(cleaned);
  if (STALL_KEYWORDS.test(cleaned)) {
    if (subject && subject.split(/\s+/).length <= 7) {
      return `${subject} stall risk`;
    }
    return 'Stall risk';
  }
  return compressSentence(cleaned, 10, 90);
}

function compactRecommendation(sentence: string): string | null {
  let cleaned = sentence.trim();
  if (!cleaned) return null;

  cleaned = cleaned
    .replace(/^shift your\s+/i, 'Shift ')
    .replace(/^shift\s+to\s+/i, 'Shift to ')
    .replace(/^increase\s+/i, 'Increase ')
    .replace(/^decrease\s+/i, 'Decrease ')
    .replace(/^consider\s+/i, 'Consider ')
    .replace(/^try\s+/i, 'Try ')
    .replace(/^add\s+/i, 'Add ')
    .replace(/^reduce\s+/i, 'Reduce ')
    .replace(/\bfor the next\s+/i, 'for ')
    .replace(/\bnext\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = cleaned.split(' ');
  const toIndices = tokens
    .map((token, index) => (token.toLowerCase() === 'to' ? index : -1))
    .filter((index) => index >= 0);
  if (toIndices.length >= 2) {
    cleaned = tokens.slice(0, toIndices[1]).join(' ').trim();
  }

  return compressSentence(cleaned, 14, 120);
}

function buildCompactTldr(
  diagnosisSentence: string,
  recommendationSentence: string,
  evidenceSentence: string
): string | null {
  const diagnosis = compactDiagnosis(diagnosisSentence);
  const recommendation = compactRecommendation(recommendationSentence);
  const evidence = compactDiagnosis(evidenceSentence);

  if (diagnosis && recommendation) {
    const combined = `${diagnosis.replace(/\.$/, '')}; ${recommendation}`;
    return ensureSentenceEnding(combined);
  }

  return diagnosis || recommendation || evidence || null;
}

function ensureSentenceEnding(text: string): string {
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function isSectionHeaderLine(line: string): boolean {
  if (!line) return true;
  if (/^[A-Z\s]{6,}$/.test(line)) return true;
  return /^(actionable next steps|evidence|recommendations|diagnosis|summary|analysis|notes)\s*:?\s*$/i.test(line);
}

function stripSectionPrefix(text: string): string {
  return text.replace(/^(diagnosis|evidence|recommendations|actionable next steps)\s*:\s*/i, '').trim();
}

function extractSectionText(content: string, startRegex: RegExp, endRegex: RegExp): string {
  const startMatch = content.match(startRegex);
  if (!startMatch || startMatch.index === undefined) {
    return '';
  }
  const startIndex = startMatch.index + startMatch[0].length;
  const remainder = content.slice(startIndex);
  const endMatch = remainder.match(endRegex);
  const endIndex = endMatch && endMatch.index !== undefined ? endMatch.index : remainder.length;
  return remainder.slice(0, endIndex).trim();
}

function extractBulletLines(sectionText: string): string[] {
  if (!sectionText) return [];
  const normalized = sectionText.replace(/\s-\s+/g, '\n- ');
  return normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*•]\s+/.test(line))
    .map((line) => line.replace(/^[-*•]\s+/, '').trim())
    .filter(Boolean);
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
