import type { InsightType } from '@/src/types/insights';

export type InsightChartMetric = 'progress' | 'volume' | 'frequency';

type InsightChartMapping = {
  defaultTab: InsightChartMetric;
  sparklineMetric: InsightChartMetric;
  sparklineLabel: string;
};

const INSIGHT_EVIDENCE_ORDER: Partial<Record<InsightType, string[]>> = {
  WEEKLY_VERDICT_V1: ['volume_load', 'sessions', 'prs'],
  LIFT_STALL_RISK_V1: ['best_e1rm', 'volume_load', 'exposures'],
  FATIGUE_RISK_V1: ['volume_load', 'best_e1rm', 'sessions'],
};

const DEFAULT_MAPPING: InsightChartMapping = {
  defaultTab: 'volume',
  sparklineMetric: 'volume',
  sparklineLabel: 'Weekly volume',
};

const INSIGHT_CHART_MAPPING: Record<InsightType, InsightChartMapping> = {
  WEEKLY_VERDICT_V1: {
    defaultTab: 'volume',
    sparklineMetric: 'volume',
    sparklineLabel: 'Weekly volume',
  },
  LIFT_STALL_RISK_V1: {
    defaultTab: 'progress',
    sparklineMetric: 'progress',
    sparklineLabel: 'e1RM',
  },
  FATIGUE_RISK_V1: {
    defaultTab: 'volume',
    sparklineMetric: 'volume',
    sparklineLabel: 'Weekly volume',
  },
  IMBALANCE_FLAG_V1: {
    defaultTab: 'frequency',
    sparklineMetric: 'frequency',
    sparklineLabel: 'Weekly sessions',
  },
};

export const getInsightChartMapping = (type: InsightType): InsightChartMapping => {
  return INSIGHT_CHART_MAPPING[type] ?? DEFAULT_MAPPING;
};

export const getInsightEvidenceOrder = (type: InsightType): string[] => {
  return INSIGHT_EVIDENCE_ORDER[type] ?? [];
};
