import { collapseSupersededInsights } from '@/src/utils/insightLifecycle';
import type { InsightType, TrainingInsight } from '@/src/types/insights';

const insight = (
  id: string,
  type: InsightType,
  updatedAt: string,
  subjectKey: string = 'global',
): TrainingInsight => ({
  id,
  type,
  updatedAt,
  subjectKey,
  anchorDate: updatedAt.slice(0, 10),
} as TrainingInsight);

describe('collapseSupersededInsights', () => {
  it('keeps only the newest singleton insight of each type', () => {
    const olderWeekly = insight('weekly-old', 'WEEKLY_VERDICT_V1', '2026-07-20T12:00:00.000Z');
    const newerWeekly = insight('weekly-new', 'WEEKLY_VERDICT_V1', '2026-07-27T12:00:00.000Z');
    const olderImbalance = insight('imbalance-old', 'IMBALANCE_FLAG_V1', '2026-07-21T12:00:00.000Z', 'muscle:back');
    const newerImbalance = insight('imbalance-new', 'IMBALANCE_FLAG_V1', '2026-07-28T12:00:00.000Z', 'muscle:quads');

    expect(collapseSupersededInsights([
      olderWeekly,
      newerWeekly,
      olderImbalance,
      newerImbalance,
    ])).toEqual([newerWeekly, newerImbalance]);
  });

  it('preserves separate exercise-specific stall risks', () => {
    const benchRisk = insight('stall-bench', 'LIFT_STALL_RISK_V1', '2026-07-28T12:00:00.000Z', 'exercise:bench');
    const squatRisk = insight('stall-squat', 'LIFT_STALL_RISK_V1', '2026-07-28T12:00:00.000Z', 'exercise:squat');

    expect(collapseSupersededInsights([benchRisk, squatRisk])).toEqual([
      benchRisk,
      squatRisk,
    ]);
  });
});
