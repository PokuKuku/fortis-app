import type { AIConversationMessage } from '@/src/types/ai';
import { shouldGenerateWorkoutFromVoice } from '@/src/utils/realtimeCoach';

export type AIPendingArtifactKind = 'workout' | 'program' | null;

const PROGRAM_NOUN_PATTERN =
  String.raw`(?:program|weekly training plan|multi[- ]day plan|training split|workout split|\d\s*[- ]?day plan)`;
const PROGRAM_REQUEST_REGEX = new RegExp(
  String.raw`\b(?:make|create|build|generate|design|write|plan|give me|need|want|put together|turn)\b[\s\S]{0,120}\b${PROGRAM_NOUN_PATTERN}\b|\b${PROGRAM_NOUN_PATTERN}\b[\s\S]{0,80}\b(?:make|create|build|generate|design|want|need)\b|\b(?:make|create|build|generate|design|give me|want|need|put together)\b[\s\S]{0,120}\bsplit\b`,
  'i'
);
const PROGRAM_OFFER_REGEX = new RegExp(
  String.raw`\b(?:want|would you like|should i|can i|i can|let me)\b[\s\S]{0,140}\b(?:build|make|create|design|put together)?\b[\s\S]{0,40}\b${PROGRAM_NOUN_PATTERN}\b|\b(?:build|make|create|design|put together)\b[\s\S]{0,100}\b${PROGRAM_NOUN_PATTERN}\b`,
  'i'
);
const WORKOUT_OFFER_REGEX =
  /\b(?:want|would you like|should i|can i|i can|let me)\b[\s\S]{0,140}\b(?:build|make|create|design|put together)?\b[\s\S]{0,40}\b(?:workout|routine|session|template)\b|\b(?:build|make|create|design|put together)\b[\s\S]{0,100}\b(?:workout|routine|session|template)\b/i;
const CONTEXTUAL_CONFIRMATION_REGEX =
  /^(?:yes|yeah|yep|sure|okay|ok|do it|build it|make it|create it|build me one|make me one|create one|put it together|that sounds good)[.!\s]*$/i;
const CONTEXTUAL_CHANGE_REGEX =
  /\b(?:build|make|create|change|turn|convert|switch|update|revise|adjust|modify|redo|regenerate)\b[\s\S]{0,40}\b(?:it|this|that|one)\b/i;

export function inferPendingAIArtifact(
  message: string,
  messages: AIConversationMessage[],
  hasCurrentWorkoutDraft = false
): AIPendingArtifactKind {
  const normalized = message.trim();
  if (!normalized) return null;

  // Program requests take precedence because phrases such as "workout split"
  // also contain the single-workout vocabulary.
  if (PROGRAM_REQUEST_REGEX.test(normalized)) {
    return 'program';
  }

  if (shouldGenerateWorkoutFromVoice(normalized, hasCurrentWorkoutDraft)) {
    return 'workout';
  }

  const isContextualRequest = CONTEXTUAL_CONFIRMATION_REGEX.test(normalized)
    || CONTEXTUAL_CHANGE_REGEX.test(normalized);
  if (!isContextualRequest) return null;

  const recentAssistantMessages = messages
    .slice(-6)
    .filter((entry) => entry.role === 'assistant')
    .reverse();

  for (const entry of recentAssistantMessages) {
    if (PROGRAM_OFFER_REGEX.test(entry.content)) return 'program';
    if (WORKOUT_OFFER_REGEX.test(entry.content)) return 'workout';
  }

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const entry = messages[index];
    if (entry?.programTemplate) return 'program';
    if (entry?.workoutTemplate) return 'workout';
  }

  return null;
}
