export interface WorkoutConversationEntry {
  role: 'user' | 'assistant';
  content: string;
}

export const WORKOUT_FOLLOW_UP_CONFIRMATION_REGEX =
  /\b(?:yes|yeah|yep|sure|do it|build it|make it|create it|build me one|make me one|create one|put it together|that sounds good)\b/i;

export const WORKOUT_BUILD_OFFER_REGEX =
  /\b(?:want|would you like|should i|can i|i can)[\s\S]{0,100}\b(?:workout|routine|session|plan|template)\b|\b(?:build|make|create|put together)[\s\S]{0,80}\b(?:workout|routine|session|plan|template)\b/i;

export interface ScopedWorkoutFollowUp {
  targetText: string;
  constraintText: string;
}

const REQUESTED_EXERCISE_COUNT_WORDS: Record<string, number> = {
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

export function extractRequestedExerciseCount(message: string, maximum = 13): number | null {
  const normalized = message
    .toLowerCase()
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const digitMatch = normalized.match(
    /\b(\d{1,2})\s+(?:(?:\w+)\s+){0,3}(?:exercise|movement|lift)s?\b/
  );
  if (digitMatch) {
    return Math.max(3, Math.min(maximum, Number(digitMatch[1])));
  }

  const wordPattern = Object.keys(REQUESTED_EXERCISE_COUNT_WORDS).join('|');
  const wordMatch = normalized.match(
    new RegExp(`\\b(${wordPattern})\\s+(?:(?:\\w+)\\s+){0,3}(?:exercise|movement|lift)s?\\b`, 'i')
  );
  if (!wordMatch) {
    return null;
  }

  return REQUESTED_EXERCISE_COUNT_WORDS[wordMatch[1].toLowerCase()] ?? null;
}

/**
 * Bind an affirmative reply to the latest workout offer and the user turn that
 * prompted it. Older workout topics are intentionally excluded. Assistant text
 * can help identify the target, but only user-authored text supplies numeric
 * constraints such as exercise count.
 */
export function getScopedWorkoutFollowUp(
  message: string,
  history: WorkoutConversationEntry[] | undefined
): ScopedWorkoutFollowUp | null {
  if (!history?.length || !WORKOUT_FOLLOW_UP_CONFIRMATION_REGEX.test(message)) {
    return null;
  }

  for (let offerIndex = history.length - 1; offerIndex >= 0; offerIndex -= 1) {
    const offer = history[offerIndex];
    if (offer.role !== 'assistant' || !WORKOUT_BUILD_OFFER_REGEX.test(offer.content)) {
      continue;
    }

    for (let sourceIndex = offerIndex - 1; sourceIndex >= 0; sourceIndex -= 1) {
      const source = history[sourceIndex];
      if (source.role !== 'user' || !source.content.trim()) {
        continue;
      }

      return {
        targetText: [message, source.content, offer.content].join(' '),
        constraintText: [source.content, message].join(' '),
      };
    }
  }

  return null;
}
