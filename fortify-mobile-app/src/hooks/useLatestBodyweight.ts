import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';

type BodyweightResult = {
  bodyweightKg: number | null;
  loading: boolean;
};

const LBS_TO_KG = 1 / 2.20462;
const inFlightByUser = new Map<string, Promise<number | null>>();

const fetchLatestBodyweightKg = (userId: string): Promise<number | null> => {
  const existing = inFlightByUser.get(userId);
  if (existing) return existing;

  const request = (async () => {
    const { data, error } = await supabase
      .from('user_body_metrics')
      .select('weight, unit, recorded_at')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;
    const entry = data[0] as { weight: number; unit: 'kg' | 'lb' };
    if (!entry?.weight || entry.weight <= 0) return null;
    return entry.unit === 'kg' ? entry.weight : entry.weight * LBS_TO_KG;
  })().finally(() => {
    inFlightByUser.delete(userId);
  });

  inFlightByUser.set(userId, request);
  return request;
};

export function useLatestBodyweight(): BodyweightResult {
  const { user } = useAuth();
  const [bodyweightKg, setBodyweightKg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadBodyweight = async () => {
      if (!user?.id || !isSupabaseConfigured()) {
        if (isMounted) {
          setBodyweightKg(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const weightKg = await fetchLatestBodyweightKg(user.id);
        if (!isMounted) return;
        setBodyweightKg(weightKg);
      } catch (err) {
        if (isMounted) {
          console.warn('Failed to load bodyweight:', err);
          setBodyweightKg(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBodyweight();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return { bodyweightKg, loading };
}
