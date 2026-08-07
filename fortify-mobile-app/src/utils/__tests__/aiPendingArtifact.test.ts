import { inferPendingAIArtifact } from '@/src/utils/aiPendingArtifact';
import type { AIConversationMessage } from '@/src/types/ai';

const message = (
  role: 'user' | 'assistant',
  content: string,
  artifacts: Partial<AIConversationMessage> = {}
): AIConversationMessage => ({
  id: `${role}-${content}`,
  role,
  content,
  intent: 'GENERAL_CHAT',
  createdAt: '2026-08-07T00:00:00.000Z',
  ...artifacts,
});

describe('inferPendingAIArtifact', () => {
  it('recognizes direct workout and program requests', () => {
    expect(inferPendingAIArtifact('Make me a back workout', [])).toBe('workout');
    expect(inferPendingAIArtifact('Build me a push pull legs program', [])).toBe('program');
    expect(inferPendingAIArtifact('Make me a push pull legs split', [])).toBe('program');
  });

  it('keeps exploratory coaching on the normal loading state', () => {
    expect(inferPendingAIArtifact('What workout routine is best for MMA?', [])).toBeNull();
  });

  it('inherits workout generation from an assistant offer', () => {
    const history = [
      message('user', 'What workout routine is best for MMA?'),
      message('assistant', 'Would you like me to build a structured workout for you?'),
    ];

    expect(inferPendingAIArtifact('Yes', history)).toBe('workout');
  });

  it('inherits program generation from an assistant offer', () => {
    const history = [
      message('assistant', 'Would you like me to build a four-day training program for you?'),
    ];

    expect(inferPendingAIArtifact('Yes', history)).toBe('program');
  });

  it('uses the latest artifact for referential edits', () => {
    const history = [
      message('assistant', 'Here is your program.', {
        programTemplate: {
          name: 'Strength Plan',
          description: 'Four training days.',
          durationWeeks: 6,
          workouts: [],
        },
      }),
    ];

    expect(inferPendingAIArtifact('Make it bodyweight', history)).toBe('program');
  });
});
