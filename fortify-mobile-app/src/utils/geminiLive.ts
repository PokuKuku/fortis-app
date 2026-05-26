import { Buffer } from 'buffer';
import type { RealtimeCoachPhase, RealtimeTranscriptSpeaker } from '@/src/types/realtimeCoach';

export const GEMINI_INPUT_AUDIO_MIME_TYPE = 'audio/pcm;rate=16000';
export const GEMINI_OUTPUT_AUDIO_SAMPLE_RATE = 24000;
export const TWO_WAY_AUDIO_PLAYBACK_SAMPLE_RATE = 16000;

export type GeminiLiveEventAction =
  | { type: 'setup_complete' }
  | { type: 'phase'; phase: RealtimeCoachPhase }
  | { type: 'transcript'; speaker: RealtimeTranscriptSpeaker; text: string }
  | { type: 'audio'; base64: string; mimeType?: string }
  | { type: 'tool_call'; id: string; name: string; args: Record<string, unknown> }
  | { type: 'error'; message: string }
  | { type: 'turn_complete' }
  | { type: 'go_away' };

type GeminiLiveMessage = Record<string, unknown>;

const getNestedRecord = (value: unknown, key: string): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object') return null;
  const child = (value as Record<string, unknown>)[key];
  return child && typeof child === 'object' ? child as Record<string, unknown> : null;
};

const getString = (record: Record<string, unknown> | null, key: string): string => {
  const value = record?.[key];
  return typeof value === 'string' ? value : '';
};

const getArray = (record: Record<string, unknown> | null, camelKey: string, snakeKey: string): unknown[] => {
  const value = record?.[camelKey] ?? record?.[snakeKey];
  return Array.isArray(value) ? value : [];
};

const coerceToolArgs = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : {};
    } catch {
      return {};
    }
  }

  return {};
};

const getToolCalls = (message: GeminiLiveMessage): Array<{ id: string; name: string; args: Record<string, unknown> }> => {
  const toolCall = getNestedRecord(message, 'toolCall') ?? getNestedRecord(message, 'tool_call');
  return getArray(toolCall, 'functionCalls', 'function_calls').flatMap((call) => {
    if (!call || typeof call !== 'object') return [];
    const callRecord = call as Record<string, unknown>;
    const name = typeof callRecord.name === 'string' ? callRecord.name : '';
    if (!name) return [];
    return [{
      id: typeof callRecord.id === 'string' ? callRecord.id : name,
      name,
      args: coerceToolArgs(callRecord.args ?? callRecord.arguments ?? callRecord.argsJson ?? callRecord.args_json),
    }];
  });
};

const getAudioParts = (serverContent: Record<string, unknown>): Array<{ base64: string; mimeType?: string }> => {
  const modelTurn = getNestedRecord(serverContent, 'modelTurn');
  const parts = Array.isArray(modelTurn?.parts) ? modelTurn.parts : [];
  return parts.flatMap((part) => {
    const inlineData = getNestedRecord(part, 'inlineData') ?? getNestedRecord(part, 'inline_data');
    const base64 = getString(inlineData, 'data');
    if (!base64) return [];
    return [{
      base64,
      mimeType: getString(inlineData, 'mimeType') || getString(inlineData, 'mime_type') || undefined,
    }];
  });
};

export function parseGeminiLiveMessage(raw: string): GeminiLiveEventAction[] {
  let message: GeminiLiveMessage;
  try {
    message = JSON.parse(raw) as GeminiLiveMessage;
  } catch {
    return [];
  }

  const actions: GeminiLiveEventAction[] = [];

  if (message.setupComplete) {
    actions.push({ type: 'setup_complete' });
  }

  for (const toolCall of getToolCalls(message)) {
    actions.push({ type: 'tool_call', ...toolCall });
  }

  const serverContent = getNestedRecord(message, 'serverContent');
  if (serverContent) {
    const inputTranscription = getNestedRecord(serverContent, 'inputTranscription');
    const inputText = getString(inputTranscription, 'text').trim();
    if (inputText) {
      actions.push({ type: 'phase', phase: 'user_speaking' });
      actions.push({ type: 'transcript', speaker: 'user', text: inputText });
    }

    const outputTranscription = getNestedRecord(serverContent, 'outputTranscription');
    const outputText = getString(outputTranscription, 'text').trim();
    if (outputText) {
      actions.push({ type: 'phase', phase: 'coach_speaking' });
      actions.push({ type: 'transcript', speaker: 'coach', text: outputText });
    }

    for (const audioPart of getAudioParts(serverContent)) {
      actions.push({ type: 'phase', phase: 'coach_speaking' });
      actions.push({ type: 'audio', ...audioPart });
    }

    if (serverContent.interrupted === true) {
      actions.push({ type: 'phase', phase: 'listening' });
      actions.push({ type: 'turn_complete' });
    }

    if (serverContent.turnComplete === true) {
      actions.push({ type: 'phase', phase: 'listening' });
      actions.push({ type: 'turn_complete' });
    }
  }

  const error = getNestedRecord(message, 'error');
  if (error) {
    actions.push({
      type: 'error',
      message: getString(error, 'message') || 'Voice Coach hit an error.',
    });
  }

  if (message.goAway) {
    actions.push({ type: 'go_away' });
  }

  return actions;
}

export function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

export function uint8ArrayToBase64(data: Uint8Array): string {
  return Buffer.from(data).toString('base64');
}

export function downsamplePcm16Mono(
  input: Uint8Array,
  inputRate = GEMINI_OUTPUT_AUDIO_SAMPLE_RATE,
  outputRate = TWO_WAY_AUDIO_PLAYBACK_SAMPLE_RATE
): Uint8Array {
  if (inputRate === outputRate) {
    return input;
  }

  const inputView = new DataView(input.buffer, input.byteOffset, input.byteLength);
  const inputSamples = Math.floor(input.byteLength / 2);
  const outputSamples = Math.max(1, Math.floor(inputSamples * outputRate / inputRate));
  const output = new Uint8Array(outputSamples * 2);
  const outputView = new DataView(output.buffer);
  const ratio = inputRate / outputRate;

  for (let i = 0; i < outputSamples; i += 1) {
    const sourceIndex = i * ratio;
    const leftIndex = Math.floor(sourceIndex);
    const rightIndex = Math.min(inputSamples - 1, leftIndex + 1);
    const fraction = sourceIndex - leftIndex;
    const left = inputView.getInt16(leftIndex * 2, true);
    const right = inputView.getInt16(rightIndex * 2, true);
    const sample = Math.round(left + (right - left) * fraction);
    outputView.setInt16(i * 2, sample, true);
  }

  return output;
}
