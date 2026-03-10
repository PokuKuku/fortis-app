import { formatEvidenceDelta, formatEvidenceValue } from '../insightsFormat';
import { EvidenceItem } from '@/src/types/insights';

describe('insightsFormat', () => {
  it('formats evidence values with units', () => {
    const workouts: EvidenceItem = { key: 'sessions', label: 'Workouts', value: 3, unit: 'workouts' };
    const volume: EvidenceItem = { key: 'volume', label: 'Total volume', value: 1250, unit: 'lbs' };
    const percent: EvidenceItem = { key: 'delta', label: 'Change', value: 2.4, unit: '%' };

    expect(formatEvidenceValue(workouts)).toBe('3');
    expect(formatEvidenceValue(volume)).toBe('1.3k lbs');
    expect(formatEvidenceValue(percent)).toBe('2.4%');
  });

  it('formats evidence deltas with trends', () => {
    const up: EvidenceItem = {
      key: 'sessions',
      label: 'Workouts',
      value: 3,
      unit: 'workouts',
      compareValue: 2,
    };
    const down: EvidenceItem = {
      key: 'sessions',
      label: 'Workouts',
      value: 2,
      unit: 'workouts',
      compareValue: 5,
    };

    expect(formatEvidenceDelta(up)).toEqual({
      text: '+1',
      trend: 'up',
    });
    expect(formatEvidenceDelta(down)).toEqual({
      text: '-3',
      trend: 'down',
    });

    const volume: EvidenceItem = {
      key: 'volume_load',
      label: 'Total volume',
      value: 12000,
      unit: 'lbs',
      compareValue: 10000,
    };

    expect(formatEvidenceDelta(volume)).toEqual({
      text: '+20%',
      trend: 'up',
    });
  });

  it('returns null when no comparison is available', () => {
    const item: EvidenceItem = { key: 'sessions', label: 'Workouts', value: 2, unit: 'workouts' };
    expect(formatEvidenceDelta(item)).toBeNull();
  });
});
