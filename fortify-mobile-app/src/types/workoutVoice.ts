import type { WeightUnit } from './workout';

export type WorkoutVoiceMissingField = 'sets' | 'weight' | 'reps';

export type WorkoutVoiceConfidence = 'high' | 'medium' | 'low';

export interface WorkoutVoiceInterpretation {
  transcript: string;
  sets: number | null;
  weight: number | null;
  reps: number | null;
  weightUnit: WeightUnit | null;
  inferredSets: boolean;
  inferredWeightUnit: boolean;
  missingFields: WorkoutVoiceMissingField[];
  confidence: WorkoutVoiceConfidence;
}

export interface WorkoutVoiceRequest {
  audioBase64: string;
  mimeType: string;
  fileName: string;
  exerciseName: string;
  defaultWeightUnit: WeightUnit;
}

export interface WorkoutVoiceResponse {
  type: 'success' | 'error';
  interpretation?: WorkoutVoiceInterpretation;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}
