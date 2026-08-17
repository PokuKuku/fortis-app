import assert from 'node:assert/strict';
import test from 'node:test';

import {
  extractRequestedExerciseCount,
  getScopedWorkoutFollowUp,
} from './workout-follow-up.ts';

test('scopes an affirmative workout reply to the latest offer topic', () => {
  const result = getScopedWorkoutFollowUp('Yes', [
    { role: 'user', content: 'Make me a back workout' },
    { role: 'assistant', content: "Here's a solid back workout for you." },
    {
      role: 'user',
      content: 'I have 7.5 kg weights and want to build my arms within 3 months.',
    },
    {
      role: 'assistant',
      content: 'Aim for 3-4 sets of 8-12 reps for each exercise. Would you like me to build a structured workout for you?',
    },
  ]);

  assert.ok(result);
  assert.match(result.targetText, /arms/i);
  assert.doesNotMatch(result.targetText, /back/i);
});

test('keeps assistant rep guidance out of workout constraints', () => {
  const result = getScopedWorkoutFollowUp('Yes', [
    { role: 'user', content: 'How can I grow my arms with 7.5 kg weights?' },
    {
      role: 'assistant',
      content: 'Use 8-12 reps for each exercise. Would you like me to build that arm workout?',
    },
  ]);

  assert.ok(result);
  assert.match(result.constraintText, /7\.5 kg weights/i);
  assert.doesNotMatch(result.constraintText, /8-12 reps/i);
  assert.equal(extractRequestedExerciseCount(result.constraintText), null);
});

test('still recognizes an exercise count explicitly requested by the user', () => {
  assert.equal(extractRequestedExerciseCount('Build me an arm workout with 6 exercises'), 6);
});

test('does not scope unrelated affirmations without a workout offer', () => {
  const result = getScopedWorkoutFollowUp('Yes', [
    { role: 'user', content: 'Is creatine useful?' },
    { role: 'assistant', content: 'It can help repeated high-intensity performance.' },
  ]);

  assert.equal(result, null);
});
