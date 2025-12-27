import { INTENT_CONFIG, AIIntent } from '@/src/types/ai';
import { getIntentLabel, isWriteIntent } from '@/src/services/aiService';

const ALL_INTENTS: AIIntent[] = [
  'QUERY_STATS',
  'QUERY_HISTORY',
  'ANALYZE_PLATEAU',
  'CREATE_PROGRAM',
  'MODIFY_PROGRAM',
  'CREATE_TEMPLATE',
  'MODIFY_TEMPLATE',
];

const READ_INTENTS: AIIntent[] = [
  'QUERY_STATS',
  'QUERY_HISTORY',
  'ANALYZE_PLATEAU',
];

const WRITE_INTENTS: AIIntent[] = [
  'CREATE_PROGRAM',
  'MODIFY_PROGRAM',
  'CREATE_TEMPLATE',
  'MODIFY_TEMPLATE',
];

describe('AI intents', () => {
  it('keeps intent config in sync with allowed intents', () => {
    expect(Object.keys(INTENT_CONFIG).sort()).toEqual([...ALL_INTENTS].sort());
  });

  it('flags read intents as non-write', () => {
    READ_INTENTS.forEach((intent) => {
      expect(isWriteIntent(intent)).toBe(false);
    });
  });

  it('flags write intents as write', () => {
    WRITE_INTENTS.forEach((intent) => {
      expect(isWriteIntent(intent)).toBe(true);
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
