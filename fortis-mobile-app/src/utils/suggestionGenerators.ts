/**
 * Suggestion Generators
 *
 * Each generator returns scored suggestion candidates based on specific context.
 */

import { SuggestionContext, SuggestionCandidate } from '../types/suggestions';

/**
 * Generate suggestions based on conversation context
 * Prioritizes clarification options if AI asked a question
 */
export function generateConversationSuggestions(
  ctx: SuggestionContext
): SuggestionCandidate[] {
  const suggestions: SuggestionCandidate[] = [];

  // If AI asked clarification, surface those options
  if (ctx.conversation.clarificationOptions?.length) {
    for (const option of ctx.conversation.clarificationOptions) {
      suggestions.push({
        text: option,
        score: 0.95,
        source: 'conversation',
      });
    }
  }

  return suggestions;
}

/**
 * Generate suggestions based on mutation plan type
 * Offers type-specific modification suggestions
 */
export function generateMutationSuggestions(
  ctx: SuggestionContext
): SuggestionCandidate[] {
  if (!ctx.mutationPlan.exists) return [];

  const suggestions: SuggestionCandidate[] = [];

  switch (ctx.mutationPlan.type) {
    case 'program':
      suggestions.push(
        { text: 'Add a rest day', score: 0.85, source: 'mutation' },
        { text: 'Make it 4 days/week', score: 0.8, source: 'mutation' },
        { text: 'Focus on hypertrophy', score: 0.75, source: 'mutation' },
        { text: 'Make it more challenging', score: 0.7, source: 'mutation' }
      );
      break;

    case 'template':
      suggestions.push(
        { text: 'Add a superset', score: 0.85, source: 'mutation' },
        { text: 'Include warm-up sets', score: 0.8, source: 'mutation' },
        { text: 'Make it shorter', score: 0.75, source: 'mutation' },
        { text: 'Add more volume', score: 0.7, source: 'mutation' }
      );
      break;

    case 'workout':
      suggestions.push(
        { text: 'Adjust the weights', score: 0.85, source: 'mutation' },
        { text: 'Add another set', score: 0.8, source: 'mutation' },
        { text: 'Remove an exercise', score: 0.75, source: 'mutation' }
      );
      break;

    case 'goals':
      suggestions.push(
        { text: 'Make it more ambitious', score: 0.85, source: 'mutation' },
        { text: 'Add a strength goal', score: 0.8, source: 'mutation' },
        { text: 'Set a deadline', score: 0.75, source: 'mutation' }
      );
      break;

    default:
      // Generic mutation suggestions
      suggestions.push(
        { text: 'Make it harder', score: 0.8, source: 'mutation' },
        { text: 'Simplify it', score: 0.75, source: 'mutation' },
        { text: 'Add more exercises', score: 0.7, source: 'mutation' }
      );
  }

  return suggestions;
}

/**
 * Generate suggestions based on fitness data
 * Considers workout frequency, muscle gaps, and user's library
 */
export function generateFitnessSuggestions(
  ctx: SuggestionContext
): SuggestionCandidate[] {
  const suggestions: SuggestionCandidate[] = [];

  // Long rest period - encourage return with specific action
  if (ctx.fitness.daysSinceLastWorkout !== null) {
    if (ctx.fitness.daysSinceLastWorkout >= 5) {
      suggestions.push({
        text: 'Create a quick full-body workout',
        score: 0.85,
        source: 'fitness',
      });
    } else if (ctx.fitness.daysSinceLastWorkout >= 3) {
      suggestions.push({
        text: 'Suggest a workout for today',
        score: 0.7,
        source: 'fitness',
      });
    }
  }

  // Suggest training neglected muscle groups
  const coreMuscleGroups = ['legs', 'back', 'chest', 'shoulders'];
  const neglectedGroups = coreMuscleGroups.filter(
    (g) => !ctx.fitness.recentMuscleGroups.includes(g)
  );

  if (neglectedGroups.length > 0) {
    const group = neglectedGroups[0];
    const capitalizedGroup = group.charAt(0).toUpperCase() + group.slice(1);
    suggestions.push({
      text: `Create a ${capitalizedGroup.toLowerCase()} workout`,
      score: 0.65,
      source: 'fitness',
    });
  }

  // No templates yet - onboarding suggestion
  if (ctx.fitness.templateCount === 0) {
    suggestions.push({
      text: 'Help me create my first template',
      score: 0.75,
      source: 'fitness',
    });
  }

  // No programs yet
  if (ctx.fitness.programCount === 0 && ctx.fitness.templateCount > 0) {
    suggestions.push({
      text: 'Create a training program',
      score: 0.6,
      source: 'fitness',
    });
  }

  // Has active workout
  if (ctx.fitness.hasActiveWorkout) {
    suggestions.push({
      text: 'Log my current workout',
      score: 0.8,
      source: 'fitness',
    });
  }

  return suggestions;
}

/**
 * Generate suggestions based on time of day and week
 */
export function generateTimeSuggestions(
  ctx: SuggestionContext
): SuggestionCandidate[] {
  const suggestions: SuggestionCandidate[] = [];

  // Morning - suggest creating a workout
  if (ctx.time.isMorning) {
    suggestions.push({
      text: 'Create a workout for today',
      score: 0.55,
      source: 'time',
    });
  }

  // Weekend - program creation
  if (ctx.time.isWeekend && ctx.fitness.programCount === 0) {
    suggestions.push({
      text: 'Create a weekly program',
      score: 0.6,
      source: 'time',
    });
  }

  // Evening - stats review
  if (ctx.time.isEvening) {
    suggestions.push({
      text: 'Show my weekly stats',
      score: 0.5,
      source: 'time',
    });
  }

  return suggestions;
}

/**
 * Generate default suggestions based on last intent
 * Fallback when other generators don't produce enough
 */
export function generateDefaultSuggestions(
  ctx: SuggestionContext
): SuggestionCandidate[] {
  const suggestions: SuggestionCandidate[] = [];

  // Intent-based fallbacks (lower score as they're less contextual)
  switch (ctx.conversation.lastIntent) {
    case 'QUERY_STATS':
      suggestions.push(
        { text: 'Compare to last month', score: 0.4, source: 'default' },
        { text: 'Show all my PRs', score: 0.35, source: 'default' },
        { text: 'What should I focus on?', score: 0.3, source: 'default' }
      );
      break;

    case 'ANALYZE_PLATEAU':
      suggestions.push(
        { text: 'Create a deload week', score: 0.4, source: 'default' },
        { text: 'Switch up my routine', score: 0.35, source: 'default' },
        { text: 'Add accessory work', score: 0.3, source: 'default' }
      );
      break;

    case 'ANALYZE_OVERLOAD':
      suggestions.push(
        { text: 'Show recovery tips', score: 0.4, source: 'default' },
        { text: 'Reduce my volume', score: 0.35, source: 'default' },
        { text: 'When should I deload?', score: 0.3, source: 'default' }
      );
      break;

    case 'CREATE_TEMPLATE':
      suggestions.push(
        { text: 'Add a superset', score: 0.4, source: 'default' },
        { text: 'Make it more intense', score: 0.35, source: 'default' },
        { text: 'Add warm-up sets', score: 0.3, source: 'default' }
      );
      break;

    case 'CREATE_PROGRAM':
      suggestions.push(
        { text: 'Add a rest day', score: 0.4, source: 'default' },
        { text: 'Make it 3 days/week', score: 0.35, source: 'default' },
        { text: 'Focus more on legs', score: 0.3, source: 'default' }
      );
      break;

    case 'LOG_WORKOUT':
      suggestions.push(
        { text: 'Show my progress', score: 0.4, source: 'default' },
        { text: 'Compare to last week', score: 0.35, source: 'default' },
        { text: "What's next?", score: 0.3, source: 'default' }
      );
      break;

    case 'UPDATE_GOALS':
      suggestions.push(
        { text: 'Show my current goals', score: 0.4, source: 'default' },
        { text: 'Track my progress', score: 0.35, source: 'default' },
        { text: 'Adjust my targets', score: 0.3, source: 'default' }
      );
      break;

    default:
      // Generic conversation starters
      suggestions.push(
        { text: 'Create a workout', score: 0.35, source: 'default' },
        { text: 'Show my stats', score: 0.3, source: 'default' },
        { text: 'Analyze my progress', score: 0.25, source: 'default' }
      );
  }

  return suggestions;
}
