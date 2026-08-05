import type { InsightType, TrainingInsight } from '@/src/types/insights';

const SINGLETON_INSIGHT_TYPES = new Set<InsightType>([
  'WEEKLY_VERDICT_V1',
  'FATIGUE_RISK_V1',
  'IMBALANCE_FLAG_V1',
  'WORKOUT_RECAP_V1',
  'CONSISTENCY_STREAK_V1',
  'WEEKLY_VOLUME_PR_V1',
]);

const insightRecency = (insight: TrainingInsight): number => {
  const updatedAt = Date.parse(insight.updatedAt);
  if (Number.isFinite(updatedAt)) return updatedAt;
  const anchorDate = Date.parse(insight.anchorDate);
  return Number.isFinite(anchorDate) ? anchorDate : 0;
};

export function collapseSupersededInsights(insights: TrainingInsight[]): TrainingInsight[] {
  const newestByType = new Map<InsightType, TrainingInsight>();

  insights.forEach((insight) => {
    if (!SINGLETON_INSIGHT_TYPES.has(insight.type)) return;
    const current = newestByType.get(insight.type);
    if (!current || insightRecency(insight) > insightRecency(current)) {
      newestByType.set(insight.type, insight);
    }
  });

  return insights.filter((insight) => (
    !SINGLETON_INSIGHT_TYPES.has(insight.type)
    || newestByType.get(insight.type)?.id === insight.id
  ));
}
