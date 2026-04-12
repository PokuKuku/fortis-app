const mockInvoke = jest.fn();
const mockGetSession = jest.fn();
const mockIsSupabaseConfigured = jest.fn(() => true);

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
  isSupabaseConfigured: (...args: unknown[]) => mockIsSupabaseConfigured(...args),
}));

import { interpretExerciseVoiceAdd } from '@/src/services/exerciseVoiceService';
import { interpretWorkoutVoiceLog } from '@/src/services/workoutVoiceService';

describe('voice services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSupabaseConfigured.mockReturnValue(true);
  });

  it('invokes exercise voice add without requiring a signed-in session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockInvoke.mockResolvedValue({
      data: {
        type: 'success',
        interpretation: {
          transcript: 'bench press',
          entries: [
            {
              exerciseQuery: 'bench press',
              setCount: 3,
              confidence: 'high',
            },
          ],
        },
      },
      error: null,
      response: null,
    });

    const response = await interpretExerciseVoiceAdd({
      audioBase64: 'abc123',
      mimeType: 'audio/m4a',
      fileName: 'voice.m4a',
    });

    expect(response.type).toBe('success');
    expect(mockInvoke).toHaveBeenCalledWith('exercise-voice-add', {
      body: {
        audioBase64: 'abc123',
        mimeType: 'audio/m4a',
        fileName: 'voice.m4a',
      },
    });
    expect(mockGetSession).not.toHaveBeenCalled();
  });

  it('invokes workout voice log without requiring a signed-in session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockInvoke.mockResolvedValue({
      data: {
        type: 'success',
        interpretation: {
          transcript: '225 for 5',
          sets: 1,
          weight: 225,
          reps: 5,
          weightUnit: 'lbs',
          setType: 'normal',
          inferredSets: true,
          inferredWeightUnit: true,
          inferredSetType: true,
          missingFields: [],
          confidence: 'medium',
        },
      },
      error: null,
      response: null,
    });

    const response = await interpretWorkoutVoiceLog({
      audioBase64: 'xyz789',
      mimeType: 'audio/m4a',
      fileName: 'log.m4a',
      exerciseName: 'Bench Press',
      defaultWeightUnit: 'lbs',
    });

    expect(response.type).toBe('success');
    expect(mockInvoke).toHaveBeenCalledWith('workout-voice-log', {
      body: {
        audioBase64: 'xyz789',
        mimeType: 'audio/m4a',
        fileName: 'log.m4a',
        exerciseName: 'Bench Press',
        defaultWeightUnit: 'lbs',
      },
    });
    expect(mockGetSession).not.toHaveBeenCalled();
  });
});
