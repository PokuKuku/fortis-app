/**
 * Training Insights Types
 *
 * TypeScript interfaces for the Insights feature.
 * Matches the Supabase schema and follows patterns from ai.ts.
 *
 * Key principle: Server-truth model - insights are computed server-side
 * and persisted. Mobile only renders persisted insights.
 */

// ============================================
// Insight Type Enums (versioned)
// ============================================

/**
 * All supported insight types (versioned for schema evolution)
 */
export const INSIGHT_TYPES = [
  'WEEKLY_VERDICT_V1',
  'LIFT_STALL_RISK_V1',
  'FATIGUE_RISK_V1',
  'IMBALANCE_FLAG_V1',
] as const;
export type InsightType = (typeof INSIGHT_TYPES)[number];

/**
 * Insight severity levels
 */
export const SEVERITIES = ['low', 'medium', 'high'] as const;
export type InsightSeverity = (typeof SEVERITIES)[number];

/**
 * Insight time windows
 */
export const WINDOWS = ['7d', '4w', '12w'] as const;
export type InsightWindow = (typeof WINDOWS)[number];

/**
 * Insight status
 */
export const INSIGHT_STATUSES = ['active', 'dismissed'] as const;
export type InsightStatus = (typeof INSIGHT_STATUSES)[number];

export const INSIGHT_FEEDBACK_RATINGS = ['helpful', 'not_helpful'] as const;
export type InsightFeedbackRating = (typeof INSIGHT_FEEDBACK_RATINGS)[number];

// ============================================
// Evidence Schema
// ============================================

/**
 * Evidence item supporting an insight
 * Each insight should have 2-4 evidence bullets with real numbers
 */
export interface EvidenceItem {
  /** Stable machine key (e.g., 'volume_load', 'best_e1rm', 'sessions') */
  key: string;
  /** Human-readable UI label */
  label: string;
  /** Primary numeric value */
  value: number;
  /** Unit of measurement (lb, kg, sets, workouts, %, e1rm) */
  unit: string;
  /** Optional comparison value (e.g., last week's value) */
  compareValue?: number;
  /** Optional delta value (value - compareValue) */
  deltaValue?: number;
  /** Source view/table (e.g., 'weekly_workout_volume', 'exercise_weekly_agg') */
  source?: string;
  /** Time period (e.g., 'this_week', 'last_week', 'last_4w', 'prev_4w') */
  period?: string;
}

// ============================================
// Recommendation Schema
// ============================================

/**
 * Recommendation action types
 */
export const RECOMMENDATION_TYPES = [
  'ADD_SETS',
  'DELOAD',
  'CHANGE_REP_RANGE',
  'INCREASE_FREQUENCY',
  'SWAP_ACCESSORY',
] as const;
export type RecommendationType = (typeof RECOMMENDATION_TYPES)[number];

/**
 * Rationale keys explaining why a recommendation is made
 */
export const RATIONALE_KEYS = [
  'STALL_LOW_STIMULUS',
  'STALL_TECHNIQUE_VARIATION',
  'FATIGUE_ACCUMULATION',
  'IMBALANCE_UNDERDOSED',
  'CONSISTENCY_LOW',
] as const;
export type RationaleKey = (typeof RATIONALE_KEYS)[number];

/**
 * Recommendation for action the user could take
 */
export interface Recommendation {
  /** Type of action recommended */
  type: RecommendationType;
  /** Action-specific payload (typed by action type) */
  payload: Record<string, unknown>;
  /** Rationale for the recommendation */
  rationaleKey: RationaleKey;
}

// ============================================
// Conservatism Thresholds
// ============================================

/**
 * Conservatism levels for insight sensitivity
 * - chill: Higher thresholds, fewer alerts
 * - standard: Balanced defaults
 * - aggressive: Lower thresholds, more proactive alerts
 */
export const CONSERVATISM_LEVELS = ['chill', 'standard', 'aggressive'] as const;
export type ConservatismLevel = (typeof CONSERVATISM_LEVELS)[number];

/**
 * Threshold configuration for insight generation
 */
export interface ThresholdConfig {
  /** Volume spike week-over-week threshold (%) */
  volumeSpikeWoW: number;
  /** e1RM drop threshold for fatigue (%) */
  e1rmDropForFatigue: number;
  /** Flat e1RM threshold for stall detection (%) over 3 exposures */
  stallFlatE1rmPct: number;
  /** Minimum exposures required before generating insights */
  minExposures: number;
  /** Maximum sets to suggest adding per week */
  suggestionAddSetsMax: number;
}

/**
 * Threshold values by conservatism level
 * From TRAINING_INTELLIGENCE_ROADMAP.md
 */
export const CONSERVATISM_THRESHOLDS: Record<ConservatismLevel, ThresholdConfig> = {
  chill: {
    volumeSpikeWoW: 40,
    e1rmDropForFatigue: -2.5,
    stallFlatE1rmPct: 0.0,
    minExposures: 3,
    suggestionAddSetsMax: 1,
  },
  standard: {
    volumeSpikeWoW: 30,
    e1rmDropForFatigue: -2.0,
    stallFlatE1rmPct: 0.5,
    minExposures: 3,
    suggestionAddSetsMax: 2,
  },
  aggressive: {
    volumeSpikeWoW: 20,
    e1rmDropForFatigue: -1.5,
    stallFlatE1rmPct: 1.0,
    minExposures: 3,
    suggestionAddSetsMax: 2,
  },
};

/**
 * Global caps for recommendations
 */
export const RECOMMENDATION_CAPS = {
  /** Never recommend more than 10% weekly volume increase in one step */
  maxVolumeIncreasePct: 10,
  /** Deload recommendation: reduce sets by this range for 1 week */
  deloadReductionPctMin: 20,
  deloadReductionPctMax: 30,
} as const;

// ============================================
// Training Insight Types
// ============================================

/**
 * Training insight (camelCase for client use)
 */
export interface TrainingInsight {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;

  /** Insight type (versioned) */
  type: InsightType;
  /** Time window for analysis */
  window: InsightWindow;
  /** Anchor date (week start for weekly insights) */
  anchorDate: string;
  /** Dedupe key: 'global' | 'exercise:<uuid>' | 'muscle:<group>' */
  subjectKey: string;

  /** Severity level */
  severity: InsightSeverity;
  /** Display status */
  status: InsightStatus;

  /** Insight title */
  title: string;
  /** One-sentence summary */
  summary: string;
  /** Evidence bullets (2-4 items) */
  evidence: EvidenceItem[];
  /** Recommended actions (can be empty in MVP) */
  recommendation: Recommendation[];

  /** Schema version for backward compatibility */
  schemaVersion: string;

  /** Optional: exercise ID for filtering (not part of dedupe key) */
  exerciseId?: string;
  /** Optional: muscle group for filtering (not part of dedupe key) */
  muscleGroup?: string;
}

/**
 * Training insight DTO (snake_case for Supabase)
 */
export interface TrainingInsightDTO {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;

  type: string;
  window: string;
  anchor_date: string;
  subject_key: string;

  severity: string;
  status: string;

  title: string;
  summary: string;
  evidence: EvidenceItem[];
  recommendation: Recommendation[];

  schema_version: string;

  exercise_id?: string;
  muscle_group?: string;
}

// ============================================
// Conversion Utilities
// ============================================

/**
 * Convert DTO to client model
 */
export function dtoToTrainingInsight(dto: TrainingInsightDTO): TrainingInsight {
  return {
    id: dto.id,
    userId: dto.user_id,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    type: dto.type as InsightType,
    window: dto.window as InsightWindow,
    anchorDate: dto.anchor_date,
    subjectKey: dto.subject_key,
    severity: dto.severity as InsightSeverity,
    status: dto.status as InsightStatus,
    title: dto.title,
    summary: dto.summary,
    evidence: dto.evidence,
    recommendation: dto.recommendation,
    schemaVersion: dto.schema_version,
    exerciseId: dto.exercise_id,
    muscleGroup: dto.muscle_group,
  };
}

/**
 * Convert client model to DTO
 */
export function trainingInsightToDTO(insight: TrainingInsight): TrainingInsightDTO {
  return {
    id: insight.id,
    user_id: insight.userId,
    created_at: insight.createdAt,
    updated_at: insight.updatedAt,
    type: insight.type,
    window: insight.window,
    anchor_date: insight.anchorDate,
    subject_key: insight.subjectKey,
    severity: insight.severity,
    status: insight.status,
    title: insight.title,
    summary: insight.summary,
    evidence: insight.evidence,
    recommendation: insight.recommendation,
    schema_version: insight.schemaVersion,
    exercise_id: insight.exerciseId,
    muscle_group: insight.muscleGroup,
  };
}

// ============================================
// Subject Key Utilities
// ============================================

/**
 * Create a subject key for an exercise-specific insight
 */
export function exerciseSubjectKey(exerciseId: string): string {
  return `exercise:${exerciseId}`;
}

/**
 * Create a subject key for a muscle group insight
 */
export function muscleSubjectKey(muscleGroup: string): string {
  return `muscle:${muscleGroup}`;
}

/**
 * Global subject key constant
 */
export const GLOBAL_SUBJECT_KEY = 'global';

/**
 * Parse a subject key to extract type and value
 */
export function parseSubjectKey(
  subjectKey: string
): { type: 'global' } | { type: 'exercise'; exerciseId: string } | { type: 'muscle'; muscleGroup: string } {
  if (subjectKey === GLOBAL_SUBJECT_KEY) {
    return { type: 'global' };
  }
  if (subjectKey.startsWith('exercise:')) {
    return { type: 'exercise', exerciseId: subjectKey.slice(9) };
  }
  if (subjectKey.startsWith('muscle:')) {
    return { type: 'muscle', muscleGroup: subjectKey.slice(7) };
  }
  // Fallback to global for unknown format
  return { type: 'global' };
}
