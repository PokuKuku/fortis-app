export type ExerciseVoiceConfidence = 'high' | 'medium' | 'low';

export interface ExerciseVoiceEntry {
  exerciseQuery: string;
  setCount: number | null;
  confidence: ExerciseVoiceConfidence;
}

export interface ExerciseVoiceInterpretation {
  transcript: string;
  entries: ExerciseVoiceEntry[];
}

export interface ExerciseVoiceRequest {
  audioBase64: string;
  mimeType: string;
  fileName: string;
}

export type ExerciseVoiceResponse =
  | {
      type: 'success';
      interpretation: ExerciseVoiceInterpretation;
    }
  | {
      type: 'error';
      error: {
        code: string;
        message: string;
        retryable: boolean;
      };
    };
