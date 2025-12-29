import { INTENT_CONFIG, AIIntent } from '@/src/types/ai';
import { getIntentLabel, isWriteIntent } from '@/src/services/aiService';

/**
 * Current active intents.
 * Note: CREATE_PROGRAM and CREATE_TEMPLATE were removed in favor of
 * a simplified ANALYZE_HISTORY-only approach.
 */
const ALL_INTENTS: AIIntent[] = [
  'ANALYZE_HISTORY',
];

const WRITE_INTENTS: AIIntent[] = [
  // No write intents currently active
];

describe('AI intents', () => {
  it('keeps intent config in sync with allowed intents', () => {
    expect(Object.keys(INTENT_CONFIG).sort()).toEqual([...ALL_INTENTS].sort());
  });

  it('flags write intents correctly', () => {
    WRITE_INTENTS.forEach((intent) => {
      expect(isWriteIntent(intent)).toBe(true);
    });

    const readIntents = ALL_INTENTS.filter((intent) => !WRITE_INTENTS.includes(intent));
    readIntents.forEach((intent) => {
      expect(isWriteIntent(intent)).toBe(false);
    });
  });

  it('provides labels for all intents', () => {
    ALL_INTENTS.forEach((intent) => {
      const label = getIntentLabel(intent);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });
});
