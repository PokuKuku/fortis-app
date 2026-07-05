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
import { EyeIcon, CheckIcon } from 'react-native-heroicons/outline';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, IconSizes } from '@/constants/Sizes';
import { Typography, FontFamily } from '@/constants/Typography';
import { AIClarificationOption, AIConversationMessage } from '@/src/types/ai';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ChatWorkoutTemplateCard } from '@/src/components/ai/ChatWorkoutTemplateCard';
import { useExerciseLookup } from '@/src/hooks/useExerciseLookup';
import { getCachedExerciseImageSource } from '@/src/utils/exerciseImageCache';
import { AIMediaPreviewStrip } from '@/src/components/ai/AIMediaPreviewStrip';
import { TourAnchor } from '@/src/components/tour/TourAnchor';
import { MuscleHeatmap } from '@/src/components/workout/MuscleHeatmap';
import { useWorkoutStore } from '@/src/store/workoutStore';
import type { ExerciseVolumeMeta } from '@/src/utils/workoutVolume';

interface ChatMessageProps {
  message: AIConversationMessage;
  /** Animation delay for staggered entrance */
  delay?: number;
  /** Callback when user taps a clarification option */
  onClarificationSelect?: (option: string | AIClarificationOption) => void;
  onClarificationView?: (option: AIClarificationOption) => void;
  onViewWorkoutTemplate?: (message: AIConversationMessage) => void;
  onAddWorkoutTemplate?: (message: AIConversationMessage) => void;
  onUpdateWorkoutTemplate?: (message: AIConversationMessage) => void;
  onStartWorkoutTemplate?: (message: AIConversationMessage) => void;
  isSavingWorkoutTemplate?: boolean;
  isUpdatingWorkoutTemplate?: boolean;
  isStartingWorkoutTemplate?: boolean;
  isStartWorkoutTemplateDisabled?: boolean;
  startWorkoutTemplateDisabledLabel?: string;
  tourMessageAnchorId?: string;
  tourWorkoutTemplateAnchorId?: string;
}

export function ChatMessage({
  message,
  delay = 0,
  onClarificationSelect,
  onClarificationView,
  onViewWorkoutTemplate,
  onAddWorkoutTemplate,
  onUpdateWorkoutTemplate,
  onStartWorkoutTemplate,
  isSavingWorkoutTemplate = false,
  isUpdatingWorkoutTemplate = false,
  isStartingWorkoutTemplate = false,
  isStartWorkoutTemplateDisabled = false,
  startWorkoutTemplateDisabledLabel,
  tourMessageAnchorId,
  tourWorkoutTemplateAnchorId,
}: ChatMessageProps) {
  const { colors, isDark } = useTheme();
  const bodyType = useWorkoutStore((state) => state.bodyType);
  const isUser = message.role === 'user';
  const allowTldr = message.intent === 'FORTIS_ANALYST';
  const { exercisesById } = useExerciseLookup();
  const { mainContent, tldr } = !isUser
    ? splitTldrFromContent(message.content, allowTldr)
    : { mainContent: message.content, tldr: null };
  const clarificationQuestion = message.clarification?.question?.trim() || null;
  const clarificationOptions = message.clarification?.options ?? [];
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
    clarificationOptionMeta: { color: colors.textTertiary },
    clarificationOptionImageFallback: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    clarificationOptionImageFallbackText: { color: colors.textPrimary },
    clarificationActionButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
    },
    clarificationConfirmButton: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    clarificationActionText: { color: colors.textPrimary },
    clarificationConfirmText: { color: colors.accentForegroundOnFill },
    clarificationCallout: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    clarificationCalloutLabel: { color: colors.textSecondary },
    clarificationCalloutText: { color: colors.textPrimary },
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
      {isUser && message.attachments && message.attachments.length > 0 && (
        <AIMediaPreviewStrip media={message.attachments} />
      )}
      <View style={[styles.content, isUser ? styles.userContent : styles.aiContent]}>
        {isUser ? (
          tourMessageAnchorId ? (
            <TourAnchor id={tourMessageAnchorId}>
              <Text style={[styles.userText, themedStyles.userText]}>{message.content}</Text>
            </TourAnchor>
          ) : <Text style={[styles.userText, themedStyles.userText]}>{message.content}</Text>
        ) : (
          <Markdown style={markdownStyles}>{mainContent}</Markdown>
        )}

        {shouldShowTldr && (
          <View style={[styles.tldrContainer, themedStyles.tldrContainer]}>
            <Text style={[styles.tldrLabel, themedStyles.tldrLabel]}>TLDR</Text>
            <Text style={[styles.tldrText, themedStyles.tldrText]}>{tldr}</Text>
          </View>
        )}

        {!isUser
          && message.workoutTemplate
          && Array.isArray(message.workoutTemplate.exercises)
          && message.workoutTemplate.exercises.length > 0 && (() => {
            const templateCard = (
              <ChatWorkoutTemplateCard
                template={message.workoutTemplate}
                onView={() => onViewWorkoutTemplate?.(message)}
                onAdd={() => onAddWorkoutTemplate?.(message)}
                onUpdate={() => onUpdateWorkoutTemplate?.(message)}
                onStart={() => onStartWorkoutTemplate?.(message)}
                isAdding={isSavingWorkoutTemplate}
                isAdded={Boolean(message.savedWorkoutTemplateId)}
                isUpdating={isUpdatingWorkoutTemplate}
                isUpdateMode={Boolean(message.editableWorkoutTemplateId)}
                isStarting={isStartingWorkoutTemplate}
                isStartDisabled={isStartWorkoutTemplateDisabled}
                startDisabledLabel={startWorkoutTemplateDisabledLabel}
              />
            );

            return tourWorkoutTemplateAnchorId
              ? <TourAnchor id={tourWorkoutTemplateAnchorId}>{templateCard}</TourAnchor>
              : templateCard;
          })()}

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

        {clarificationOptions.length > 0 && (
          <View style={styles.clarificationOptions}>
            <View style={[styles.clarificationCallout, themedStyles.clarificationCallout]}>
              <Text style={[styles.clarificationCalloutText, themedStyles.clarificationCalloutText]}>
                {clarificationQuestion ?? 'I need you to confirm which option you want before I update the workout.'}
              </Text>
            </View>
            {clarificationOptions.map((option, optionIndex) => (
              (() => {
                const optionLabel = typeof option === 'string' ? option : option.label;
                const optionExerciseId = typeof option === 'string' ? undefined : option.exerciseId;
                const optionWorkoutTemplate = typeof option === 'string' ? undefined : option.workoutTemplate;
                const isWorkoutOption = Boolean(optionWorkoutTemplate);
                const optionExercise = optionExerciseId ? exercisesById.get(optionExerciseId) : undefined;
                const optionExerciseImagePath =
                  optionExercise && 'images' in optionExercise && Array.isArray(optionExercise.images)
                    ? optionExercise.images[0]
                    : undefined;
                const imageSource = getCachedExerciseImageSource(optionExerciseImagePath);
                const fallbackCharacter = optionExercise?.name?.charAt(0) ?? optionLabel.charAt(0);
                const workoutHeatmapExercises = optionWorkoutTemplate?.exercises
                  .map((exercise) => exercisesById.get(exercise.exerciseId) ?? exercisesById.get(exercise.exerciseName))
                  .filter((exercise): exercise is ExerciseVolumeMeta => Boolean(exercise));
                const optionContent = (
                  <>
                    <View style={styles.clarificationOptionContent}>
                      <View style={[
                        styles.clarificationOptionImageWrap,
                        isWorkoutOption && styles.clarificationWorkoutHeatmapWrap,
                      ]}>
                        {isWorkoutOption && workoutHeatmapExercises && workoutHeatmapExercises.length > 0 ? (
                          <View style={styles.clarificationWorkoutHeatmap} pointerEvents="none">
                            <MuscleHeatmap
                              exercises={workoutHeatmapExercises}
                              gender={bodyType}
                              scale={0.11}
                              compact
                            />
                          </View>
                        ) : imageSource ? (
                          <Image
                            source={imageSource}
                            style={styles.clarificationOptionImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.clarificationOptionImageFallback,
                              themedStyles.clarificationOptionImageFallback,
                            ]}
                          >
                            <Text
                              style={[
                                styles.clarificationOptionImageFallbackText,
                                themedStyles.clarificationOptionImageFallbackText,
                              ]}
                            >
                              {fallbackCharacter.toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.clarificationOptionCopy}>
                        <Text
                          style={[styles.clarificationOptionText, themedStyles.clarificationOptionText]}
                          numberOfLines={2}
                        >
                          {optionLabel}
                        </Text>
                        {optionExercise ? (
                          <Text
                            style={[styles.clarificationOptionMeta, themedStyles.clarificationOptionMeta]}
                            numberOfLines={1}
                          >
                            {optionExercise.name}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {isWorkoutOption && typeof option !== 'string' ? (
                      <View style={styles.clarificationOptionActions}>
                        <TouchableOpacity
                          style={[styles.clarificationActionButton, themedStyles.clarificationActionButton]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onClarificationView?.(option);
                          }}
                          activeOpacity={0.75}
                          accessibilityLabel={`View option: ${optionLabel}`}
                          accessibilityRole="button"
                        >
                          <EyeIcon color={colors.textPrimary} size={IconSizes.sm} strokeWidth={2.2} />
                          <Text style={[styles.clarificationActionText, themedStyles.clarificationActionText]}>
                            View
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.clarificationActionButton,
                            styles.clarificationConfirmButton,
                            themedStyles.clarificationConfirmButton,
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onClarificationSelect?.(option);
                          }}
                          activeOpacity={0.75}
                          accessibilityLabel={`Confirm option: ${optionLabel}`}
                          accessibilityRole="button"
                        >
                          <CheckIcon color={colors.accentForegroundOnFill} size={IconSizes.sm} strokeWidth={2.4} />
                          <Text style={[styles.clarificationActionText, themedStyles.clarificationConfirmText]}>
                            Confirm
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </>
                );

                if (isWorkoutOption) {
                  return (
                    <View
                      key={`${optionLabel}-${optionIndex}`}
                      style={[styles.clarificationOption, themedStyles.clarificationOption]}
                    >
                      {optionContent}
                    </View>
                  );
                }

                return (
                  <TouchableOpacity
                    key={`${optionLabel}-${optionExerciseId ?? optionIndex}`}
                    style={[styles.clarificationOption, themedStyles.clarificationOption]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onClarificationSelect?.(option);
                    }}
                    activeOpacity={0.7}
                    accessibilityLabel={`Select option: ${optionLabel}`}
                    accessibilityRole="button"
                  >
                    {optionContent}
                  </TouchableOpacity>
                );
              })()
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

  const candidates = [diagnosisSentence, recommendationSentence].filter(Boolean);
  if (candidates.length < 2 && evidenceSentence) {
    candidates.push(evidenceSentence);
  }

  const tldr = clampSentencesByCount(candidates, TLDR_MAX_SENTENCES);
  if (tldr) {
    return cleanTldrEnding(tldr);
  }

  const fallback = clampSentencesByCount(
    splitIntoSentences(cleaned),
    TLDR_MAX_SENTENCES
  );
  return fallback ? cleanTldrEnding(fallback) : null;
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

function normalizeTldr(text: string): string | null {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return null;
  }
  const clamped = clampSentencesByCount(splitIntoSentences(cleaned), TLDR_MAX_SENTENCES);
  return clamped ? cleanTldrEnding(clamped) : null;
}

function clampSentencesByCount(sentences: string[], maxSentences: number): string | null {
  const normalized = dedupeSentences(sentences)
    .slice(0, maxSentences)
    .map((sentence) => ensureSentenceEnding(sentence))
    .filter(Boolean);
  return normalized.length > 0 ? normalized.join(' ').trim() : null;
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

function cleanTldrEnding(text: string): string {
  if (!text) return '';
  let trimmed = text.trim();
  const hadPunctuation = /[.!?]$/.test(trimmed);
  trimmed = trimmed.replace(/[.!?]+$/, '').trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  while (words.length > 0 && TRAILING_STOP_WORDS.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }
  const rebuilt = words.join(' ').trim();
  if (!rebuilt) {
    return hadPunctuation ? text.trim() : ensureSentenceEnding(text.trim());
  }
  return ensureSentenceEnding(rebuilt);
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
    flexShrink: 1,
    minWidth: 0,
  },
  userContent: {},
  aiContent: {},
  userText: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 24,
    flexShrink: 1,
    width: '100%',
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
    flexShrink: 0,
  },
  userIndicatorText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  clarificationOptions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  clarificationCallout: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  clarificationCalloutText: {
    ...Typography.body,
    lineHeight: 20,
  },
  clarificationOption: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: Spacing.sm,
  },
  clarificationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  clarificationOptionImageWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    flexShrink: 0,
  },
  clarificationWorkoutHeatmapWrap: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clarificationWorkoutHeatmap: {
    width: 58,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  clarificationOptionImage: {
    width: '100%',
    height: '100%',
  },
  clarificationOptionImageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clarificationOptionImageFallbackText: {
    ...Typography.body,
    fontFamily: FontFamily.semibold,
    fontWeight: '600',
  },
  clarificationOptionCopy: {
    flex: 1,
    gap: 2,
  },
  clarificationOptionText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  clarificationOptionMeta: {
    ...Typography.caption,
    fontSize: 11,
  },
  clarificationOptionActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginLeft: 64 + Spacing.sm,
  },
  clarificationActionButton: {
    minHeight: 36,
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.sm,
  },
  clarificationConfirmButton: {},
  clarificationActionText: {
    ...Typography.labelSmall,
    fontFamily: FontFamily.semibold,
    fontWeight: '600',
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
