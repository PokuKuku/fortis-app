/**
 * AI Suggestions Utility
 *
 * Generates contextual follow-up suggestions based on the AI response intent
 * and whether there's actionable content (workout/program to save).
 */

import { AIIntent } from '@/src/types/ai';

/**
 * Get contextual quick reply suggestions based on AI response
 */
export function getQuickReplySuggestions(
  intent: AIIntent | undefined,
  hasActionable: boolean
): string[] {
  // When there's a saveable workout/program, suggest modifications
  if (hasActionable) {
    return [
      "Make it harder",
      "Add more exercises",
      "Simplify it",
    ];
  }

  // Intent-based suggestions
  switch (intent) {
    case 'QUERY_STATS':
      return [
        "Compare to last month",
        "Show all my PRs",
        "What should I focus on?",
      ];

    case 'ANALYZE_PLATEAU':
      return [
        "Create a deload week",
        "Switch up my routine",
        "Add accessory work",
      ];

    case 'ANALYZE_OVERLOAD':
      return [
        "Show recovery tips",
        "Reduce my volume",
        "When should I deload?",
      ];

    case 'CREATE_TEMPLATE':
      return [
        "Add a superset",
        "Make it more intense",
        "Add warm-up sets",
      ];

    case 'CREATE_PROGRAM':
      return [
        "Add a rest day",
        "Make it 3 days/week",
        "Focus more on legs",
      ];

    case 'LOG_WORKOUT':
      return [
        "Show my progress",
        "Compare to last week",
        "What's next?",
      ];

    case 'UPDATE_GOALS':
      return [
        "Show my current goals",
        "Track my progress",
        "Adjust my targets",
      ];

    default:
      return [
        "Tell me more",
        "Create a workout",
        "Show my stats",
      ];
  }
}
