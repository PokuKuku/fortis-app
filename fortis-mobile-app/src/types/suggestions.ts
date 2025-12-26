/**
 * Suggestion Types
 *
 * Type definitions for context-aware quick reply suggestions.
 */

import { AIIntent } from './ai';

/**
 * Context gathered for suggestion generation
 */
export interface SuggestionContext {
  // Conversation context
  conversation: {
    lastIntent?: AIIntent;
    lastAssistantContent?: string;
    messageCount: number;
    clarificationOptions?: string[];
  };

  // Mutation plan context
  mutationPlan: {
    exists: boolean;
    type?: 'program' | 'template' | 'workout' | 'goals';
    intent?: AIIntent;
  };

  // Fitness data context
  fitness: {
    daysSinceLastWorkout: number | null;
    recentMuscleGroups: string[];
    hasActiveWorkout: boolean;
    templateCount: number;
    programCount: number;
  };

  // Time context
  time: {
    hour: number;
    isMorning: boolean; // 5-11
    isEvening: boolean; // 18-22
    isWeekend: boolean;
  };
}

/**
 * A scored suggestion candidate
 */
export interface SuggestionCandidate {
  text: string;
  score: number;
  source: 'conversation' | 'mutation' | 'fitness' | 'time' | 'default';
}
