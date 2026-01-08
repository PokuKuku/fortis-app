import { EvidenceItem } from '@/src/types/insights';

const trimTrailingZero = (value: string): string => value.replace(/\.0$/, '');

const formatCompactNumber = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) {
    return trimTrailingZero((value / 1_000_000).toFixed(1)) + 'm';
  }
  if (absValue >= 1000) {
    return trimTrailingZero((value / 1000).toFixed(1)) + 'k';
  }
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return trimTrailingZero(value.toFixed(1));
};

const HIDE_UNIT_LABELS = new Set(['workouts', 'prs', 'ratio']);

const formatUnitValue = (value: number, unit?: string): string => {
  if (unit === '%') {
    return `${trimTrailingZero(value.toFixed(1))}%`;
  }
  if (unit === 'ratio') {
    return `${trimTrailingZero(value.toFixed(2))}x`;
  }

  const normalizedUnit = unit ?? '';
  const useRaw = ['workouts', 'sets', 'prs', 'e1rm'].includes(normalizedUnit);
  const formattedNumber = useRaw ? Math.round(value).toString() : formatCompactNumber(value);
  if (normalizedUnit && !HIDE_UNIT_LABELS.has(normalizedUnit)) {
    return `${formattedNumber} ${normalizedUnit}`;
  }
  return formattedNumber;
};

export const formatEvidenceValue = (item: EvidenceItem): string => {
  return formatUnitValue(item.value, item.unit);
};

export const formatEvidenceDelta = (
  item: EvidenceItem
): { text: string; trend: 'up' | 'down' | 'flat' } | null => {
  const baseDelta =
    item.deltaValue ??
    (item.compareValue !== undefined ? item.value - item.compareValue : null);

  if (baseDelta === null || Number.isNaN(baseDelta)) {
    return null;
  }

  const trend: 'up' | 'down' | 'flat' =
    baseDelta > 0 ? 'up' : baseDelta < 0 ? 'down' : 'flat';
  const sign = baseDelta > 0 ? '+' : baseDelta < 0 ? '-' : '';
  const absDelta = Math.abs(baseDelta);

  if (item.key === 'volume_load' && item.compareValue && item.compareValue > 0) {
    const pct = (baseDelta / item.compareValue) * 100;
    const pctText = trimTrailingZero(Math.abs(pct).toFixed(1));
    return {
      text: `${sign}${pctText}%`,
      trend,
    };
  }

  const deltaText =
    item.unit === '%'
      ? `${sign}${trimTrailingZero(absDelta.toFixed(1))}%`
      : `${sign}${formatUnitValue(absDelta, item.unit)}`;

  return {
    text: deltaText,
    trend,
  };
};
