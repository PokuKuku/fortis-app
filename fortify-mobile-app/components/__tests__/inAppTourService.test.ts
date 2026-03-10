import { parseInAppTourState } from '@/src/services/inAppTourService';

describe('inAppTourService', () => {
  it('returns null for empty payload', () => {
    expect(parseInAppTourState(null)).toBeNull();
    expect(parseInAppTourState('')).toBeNull();
  });

  it('returns null for malformed json', () => {
    expect(parseInAppTourState('{')).toBeNull();
  });

  it('returns null for invalid shapes', () => {
    expect(parseInAppTourState(JSON.stringify({}))).toBeNull();
    expect(parseInAppTourState(JSON.stringify({ version: 1 }))).toBeNull();
    expect(parseInAppTourState(JSON.stringify({
      version: 1,
      status: 'nope',
      stepId: 'insights_intro',
      updatedAt: new Date().toISOString(),
    }))).toBeNull();
  });

  it('parses a valid state', () => {
    const now = new Date().toISOString();
    const raw = JSON.stringify({
      version: 1,
      status: 'in_progress',
      stepId: 'insights_intro',
      updatedAt: now,
    });

    expect(parseInAppTourState(raw)).toEqual({
      version: 1,
      status: 'in_progress',
      stepId: 'insights_intro',
      updatedAt: now,
    });
  });
});

