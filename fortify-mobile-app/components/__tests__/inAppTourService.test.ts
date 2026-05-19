import { markInProgressTourSkipped, parseInAppTourState } from '@/src/services/inAppTourService';

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

  it('marks an interrupted tour skipped while preserving the last step', () => {
    const skippedAt = '2026-05-19T17:57:13.000Z';
    const state = {
      version: 12,
      status: 'in_progress' as const,
      stepId: 'welcome',
      updatedAt: '2026-05-19T17:56:00.000Z',
    };

    expect(markInProgressTourSkipped(state, skippedAt)).toEqual({
      version: 12,
      status: 'skipped',
      stepId: 'welcome',
      updatedAt: skippedAt,
    });
  });
});
