/**
 * AI Suggestions Utility
 *
 * Generates context-aware follow-up suggestions based on:
 * - Conversation context (clarification options, last intent)
 * - Mutation plan type (program, template, workout)
 * - User's fitness data (days since workout, muscle gaps)
 * - Time context (morning, evening, weekend)
 */

import { AIIntent } from '@/src/types/ai';
import { buildSuggestionContext } from './suggestionContext';
import {
  generateConversationSuggestions,
  generateMutationSuggestions,
  generateFitnessSuggestions,
  generateTimeSuggestions,
  generateDefaultSuggestions,
} from './suggestionGenerators';
import { rankSuggestions } from './suggestionScorer';

/**
 * Get context-aware quick reply suggestions
 * Main entry point for the suggestion system
 */
export function getContextAwareSuggestions(): string[] {
  // Build context from stores
  const ctx = buildSuggestionContext();

  // Generate candidates from all sources
  const candidates = [
    ...generateConversationSuggestions(ctx),
    ...generateMutationSuggestions(ctx),
    ...generateFitnessSuggestions(ctx),
    ...generateTimeSuggestions(ctx),
    ...generateDefaultSuggestions(ctx),
  ];

  // Rank and return top suggestions
  return rankSuggestions(candidates, 4);
}

/**
 * Get contextual quick reply suggestions based on AI response
 * @deprecated Use getContextAwareSuggestions() instead
 * Kept for backward compatibility
 */
export function getQuickReplySuggestions(
  _intent: AIIntent | undefined,
  _hasActionable: boolean
): string[] {
  // Delegate to new context-aware implementation
  return getContextAwareSuggestions();
}
