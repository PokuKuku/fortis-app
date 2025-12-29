/**
 * AI Suggestions Utility
 *
 * Generates context-aware follow-up suggestions based on:
 * - Conversation context (clarification options, last intent)
 * - Mutation plan type (program, template, workout)
 * - User's fitness data (days since workout, muscle gaps)
 * - Time context (morning, evening, weekend)
 */

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
