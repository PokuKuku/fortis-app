/**
 * Training Insights Service
 *
 * Handles fetching and refreshing server-generated insights.
 */

import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { TrainingInsightDTO, TrainingInsight, dtoToTrainingInsight, InsightType, InsightFeedbackRating } from '@/src/types/insights';

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

export async function fetchTrainingInsights(): Promise<TrainingInsight[] | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('training_insights')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(25);

  if (error || !data) {
    console.warn('[Insights] Failed to fetch insights:', error?.message);
    return null;
  }

  return (data as TrainingInsightDTO[]).map(dtoToTrainingInsight);
}

export async function refreshTrainingInsights(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase.functions.invoke('training-insights', {
    body: { type: 'all' },
  });

  if (error) {
    console.warn('[Insights] Failed to refresh training insights:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function dismissInsight(insightId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('training_insights')
    .update({ status: 'dismissed' })
    .eq('id', insightId)
    .eq('user_id', user.id);

  if (error) {
    console.warn('[Insights] Failed to dismiss insight:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function snoozeInsightType(
  type: InsightType,
  days: number = 14
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const untilDate = new Date();
  untilDate.setDate(untilDate.getDate() + days);

  const { error: snoozeError } = await supabase
    .from('training_insight_snoozes')
    .upsert(
      {
        user_id: user.id,
        type,
        snoozed_until: toIsoDate(untilDate),
      },
      { onConflict: 'user_id,type' }
    );

  if (snoozeError) {
    console.warn('[Insights] Failed to snooze insight type:', snoozeError.message);
    return { success: false, error: snoozeError.message };
  }

  await supabase
    .from('training_insights')
    .update({ status: 'dismissed' })
    .eq('user_id', user.id)
    .eq('type', type)
    .eq('status', 'active');

  return { success: true };
}

export async function submitInsightFeedback(params: {
  insightId: string;
  type: InsightType;
  rating: InsightFeedbackRating;
  anchorDate?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('training_insight_feedback')
    .insert({
      user_id: user.id,
      insight_id: params.insightId,
      type: params.type,
      rating: params.rating,
      anchor_date: params.anchorDate,
    });

  if (error) {
    console.warn('[Insights] Failed to submit feedback:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
