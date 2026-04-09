import { useAIStore } from '@/src/store/aiStore';
import * as aiService from '@/src/services/aiService';

jest.mock('@/src/services/aiService', () => ({
  sendAIMessage: jest.fn(),
  getRateLimitStatus: jest.fn(),
}));

jest.mock('@/src/utils/scopedStorage', () => ({
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
});
