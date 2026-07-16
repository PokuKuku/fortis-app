import { useAIStore } from '@/src/store/aiStore';
import * as aiService from '@/src/services/aiService';

jest.mock('@/src/services/aiService', () => ({
  sendAIMessage: jest.fn(),
  getRateLimitStatus: jest.fn(),
}));

jest.mock('@/src/utils/scopedStorage', () => ({
  getScopedItem: jest.fn(() => Promise.resolve(null)),
  setScopedItem: jest.fn(() => Promise.resolve()),
  removeScopedItem: jest.fn(() => Promise.resolve()),
}));

describe('useAIStore workout templates', () => {
  beforeEach(() => {
    useAIStore.setState({
      conversation: null,
      isSendingMessage: false,
      error: null,
      lastFailedMessage: null,
      rateLimitStatus: null,
    });
    jest.clearAllMocks();
  });

  it('attaches generated workout templates to assistant messages and marks them saved', async () => {
    (aiService.sendAIMessage as jest.Mock).mockResolvedValue({
      type: 'answer',
      requestId: 'req-1',
      answer: {
        text: 'I built an upper workout for you.',
        citations: [],
        workoutTemplate: {
          name: 'Upper Builder',
          description: 'Balanced upper body session.',
          focus: 'Upper Body',
          estimatedDurationMinutes: 50,
          exercises: [
            {
              exerciseId: 'ex-1',
              exerciseName: 'Cable Pulldown',
              sets: 3,
              reps: '8-12',
              restSeconds: 90,
            },
            {
              exerciseId: 'ex-2',
              exerciseName: 'Cable Seated Row',
              sets: 3,
              reps: '10-12',
              restSeconds: 75,
            },
            {
              exerciseId: 'ex-3',
              exerciseName: 'Dumbbell Shoulder Press',
              sets: 3,
              reps: '8-10',
              restSeconds: 90,
            },
          ],
        },
      },
    });

    const response = await useAIStore.getState().sendMessage(
      'FORTIS_ANALYST',
      'Make me an upper body workout'
    );

    expect(response.type).toBe('answer');

    const conversation = useAIStore.getState().conversation;
    expect(conversation?.messages).toHaveLength(2);

    const assistantMessage = conversation?.messages[1];
    expect(assistantMessage?.role).toBe('assistant');
    expect(assistantMessage?.workoutTemplate?.name).toBe('Upper Builder');
    expect(assistantMessage?.savedWorkoutTemplateId).toBeNull();

    await useAIStore.getState().markWorkoutTemplateSaved(assistantMessage!.id, 'template-123');

    const savedConversation = useAIStore.getState().conversation;
    expect(savedConversation?.messages[1]?.savedWorkoutTemplateId).toBe('template-123');
  });

  it('does not attach malformed workout templates to assistant messages', async () => {
    (aiService.sendAIMessage as jest.Mock).mockResolvedValue({
      type: 'answer',
      requestId: 'req-2',
      answer: {
        text: 'Your consistency has improved recently.',
        citations: [],
        workoutTemplate: {
          name: 'Not a real workout',
        },
      },
    });

    await useAIStore.getState().sendMessage(
      'FORTIS_ANALYST',
      "How consistent have I been recently and what's my current streak?"
    );

    const assistantMessage = useAIStore.getState().conversation?.messages[1];
    expect(assistantMessage?.workoutTemplate).toBeUndefined();
  });

  it('renames stale generated workout titles to match a new workout request', async () => {
    (aiService.sendAIMessage as jest.Mock).mockResolvedValue({
      type: 'answer',
      requestId: 'req-back',
      answer: {
        text: 'I built a back workout for you.',
        citations: [],
        workoutTemplate: {
          name: 'Chest Strength Workout (1)',
          description: 'A comprehensive workout focusing on back strength and upper_back.',
          focus: 'Back',
          estimatedDurationMinutes: 50,
          exercises: [
            {
              exerciseId: 'ex-1',
              exerciseName: 'Lat Pulldown',
              sets: 4,
              reps: '6-10',
              restSeconds: 90,
            },
            {
              exerciseId: 'ex-2',
              exerciseName: 'Seated Cable Row',
              sets: 4,
              reps: '8-12',
              restSeconds: 90,
            },
          ],
        },
      },
    });

    await useAIStore.getState().sendMessage(
      'GENERAL_CHAT',
      'make me a back workout'
    );

    const assistantMessage = useAIStore.getState().conversation?.messages[1];
    expect(assistantMessage?.workoutTemplate?.name).toBe('Back Strength Workout');
    expect(assistantMessage?.workoutTemplate?.focus).toBe('Back');
    expect(assistantMessage?.workoutTemplate?.description).toContain('upper back');
  });

  it.each([
    ['forearms', 'Forearms', 'Dumbbell Wrist Curl'],
    ['biceps', 'Biceps', 'Dumbbell Bicep Curl'],
    ['triceps', 'Triceps', 'Cable Triceps Pushdown'],
    ['calves', 'Calves', 'Standing Calf Raise'],
  ])('preserves %s as the requested focus for generated workout cards', async (requestFocus, expectedFocus, exerciseName) => {
    (aiService.sendAIMessage as jest.Mock).mockResolvedValue({
      type: 'answer',
      requestId: `req-${requestFocus}`,
      answer: {
        text: `I built a ${requestFocus} workout for you.`,
        citations: [],
        workoutTemplate: {
          name: 'Upper Body Workout',
          description: `A focused ${requestFocus} session.`,
          focus: expectedFocus,
          estimatedDurationMinutes: 35,
          exercises: [
            {
              exerciseId: `ex-${requestFocus}-1`,
              exerciseName,
              sets: 3,
              reps: '12-15',
              restSeconds: 60,
            },
          ],
        },
      },
    });

    await useAIStore.getState().sendMessage(
      'GENERAL_CHAT',
      `Make me a ${requestFocus} workout`
    );

    const assistantMessage = useAIStore.getState().conversation?.messages[1];
    expect(assistantMessage?.workoutTemplate?.name).toBe(`${expectedFocus} Workout`);
    expect(assistantMessage?.workoutTemplate?.focus).toBe(expectedFocus);
  });

  it('does not render raw provider JSON errors in chat messages', async () => {
    (aiService.sendAIMessage as jest.Mock).mockResolvedValue({
      type: 'error',
      requestId: 'req-3',
      error: {
        code: 'INTERNAL_ERROR',
        message: `OpenAI API error: {
          "error": {
            "message": "This model's maximum context length is 128000 tokens.",
            "type": "invalid_request_error",
            "code": "context_length_exceeded"
          }
        }`,
        retryable: true,
      },
    });

    await useAIStore.getState().sendMessage(
      'GENERAL_CHAT',
      'Add incline smith press'
    );

    const assistantMessage = useAIStore.getState().conversation?.messages[1];
    expect(assistantMessage?.content).toBe(
      'That edit pulled in too much context. I trimmed it down, please try again.'
    );
    expect(assistantMessage?.content).not.toContain('OpenAI API error');
    expect(assistantMessage?.content).not.toContain('context_length_exceeded');
    expect(useAIStore.getState().error).toBe(
      'That edit pulled in too much context. I trimmed it down, please try again.'
    );
  });

  it('keeps connection failures out of the conversation and exposes a retry', async () => {
    (aiService.sendAIMessage as jest.Mock).mockResolvedValue({
      type: 'error',
      requestId: 'req-connection',
      error: {
        code: 'CONNECTION_INTERRUPTED',
        message: 'Your connection was interrupted before Fortis could respond. Please try again.',
        retryable: true,
      },
    });

    await useAIStore.getState().sendMessage('GENERAL_CHAT', 'Review my workout');

    expect(useAIStore.getState().conversation?.messages).toHaveLength(1);
    expect(useAIStore.getState().conversation?.messages[0]?.role).toBe('user');
    expect(useAIStore.getState().lastFailedMessage).not.toBeNull();
  });

  it('blocks duplicate sends while an AI response is already in progress', async () => {
    let resolveResponse: (value: unknown) => void = () => undefined;
    (aiService.sendAIMessage as jest.Mock).mockImplementation(() => (
      new Promise((resolve) => {
        resolveResponse = resolve;
      })
    ));

    const firstRequest = useAIStore.getState().sendMessage(
      'FORTIS_ANALYST',
      'Explain this insight and suggest what I should do next week.'
    );
    const secondResponse = await useAIStore.getState().sendMessage(
      'FORTIS_ANALYST',
      'Explain this insight and suggest what I should do next week.'
    );

    expect(secondResponse.type).toBe('error');
    expect(secondResponse.error?.message).toBe('An AI response is already in progress.');
    expect(aiService.sendAIMessage).toHaveBeenCalledTimes(1);
    expect(useAIStore.getState().conversation?.messages).toHaveLength(1);

    resolveResponse({
      type: 'answer',
      requestId: 'req-duplicate-guard',
      answer: {
        text: 'Here is the insight explanation.',
        citations: [],
      },
    });
    await firstRequest;

    expect(useAIStore.getState().conversation?.messages).toHaveLength(2);
  });
});
