import { Buffer } from 'buffer';
import {
  base64ToUint8Array,
  downsamplePcm16Mono,
  parseGeminiLiveMessage,
  uint8ArrayToBase64,
} from '@/src/utils/geminiLive';

describe('geminiLive', () => {
  it('maps setup completion', () => {
    expect(parseGeminiLiveMessage(JSON.stringify({ setupComplete: {} }))).toEqual([
      { type: 'setup_complete' },
    ]);
  });

  it('maps input and output transcriptions to user and coach overlays', () => {
    const actions = parseGeminiLiveMessage(JSON.stringify({
      serverContent: {
        inputTranscription: { text: 'build me a push workout' },
        outputTranscription: { text: 'I can do that.' },
      },
    }));

    expect(actions).toEqual([
      { type: 'phase', phase: 'user_speaking' },
      { type: 'transcript', speaker: 'user', text: 'build me a push workout' },
      { type: 'phase', phase: 'coach_speaking' },
      { type: 'transcript', speaker: 'coach', text: 'I can do that.' },
    ]);
  });

  it('maps audio chunks and turn completion', () => {
    const audio = Buffer.from([1, 0, 2, 0]).toString('base64');
    const actions = parseGeminiLiveMessage(JSON.stringify({
      serverContent: {
        modelTurn: {
          parts: [
            { inlineData: { mimeType: 'audio/pcm;rate=24000', data: audio } },
          ],
        },
        turnComplete: true,
      },
    }));

    expect(actions).toEqual([
      { type: 'phase', phase: 'coach_speaking' },
      { type: 'audio', base64: audio, mimeType: 'audio/pcm;rate=24000' },
      { type: 'phase', phase: 'listening' },
      { type: 'turn_complete' },
    ]);
  });

  it('round-trips PCM chunks through base64', () => {
    const chunk = new Uint8Array([0, 1, 2, 255]);
    expect(base64ToUint8Array(uint8ArrayToBase64(chunk))).toEqual(chunk);
  });

  it('downsamples Gemini 24 kHz PCM to 16 kHz PCM playback', () => {
    const input = new Uint8Array(12);
    const view = new DataView(input.buffer);
    [0, 1000, 2000, 3000, 4000, 5000].forEach((sample, index) => {
      view.setInt16(index * 2, sample, true);
    });

    const output = downsamplePcm16Mono(input, 24000, 16000);

    expect(output.byteLength).toBe(8);
    const outputView = new DataView(output.buffer);
    expect(outputView.getInt16(0, true)).toBe(0);
    expect(outputView.getInt16(2, true)).toBe(1500);
    expect(outputView.getInt16(4, true)).toBe(3000);
    expect(outputView.getInt16(6, true)).toBe(4500);
  });
});
