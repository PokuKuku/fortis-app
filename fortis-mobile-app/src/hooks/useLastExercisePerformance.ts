import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';

export interface LastPerformance {
  setCount: number;
  weight: number;
  exerciseId: string;
}

/**
 * Hook to fetch the user's last performance for a specific exercise.
 * Returns the number of sets and the weight from the last set of the most recent session.
 */
export function useLastExercisePerformance(exerciseId: string | undefined) {
  const [lastPerformance, setLastPerformance] = useState<LastPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exerciseId) {
      setLastPerformance(null);
      setLoading(false);
      return;
    }

    const fetchLastPerformance = async () => {
      setLoading(true);

      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLastPerformance(null);
          setLoading(false);
          return;
        }

        // Find the most recent completed session containing this exercise
        // Then get all non-warmup sets for that exercise in that session
        const { data: sets, error } = await supabase
          .from('workout_sets')
          .select(`
            id,
            weight,
            set_number,
            is_warmup,
            session_id,
            workout_sessions!inner (
              id,
              user_id,
              completed_at
            )
          `)
          .eq('exercise_id', exerciseId)
          .eq('workout_sessions.user_id', user.id)
          .not('workout_sessions.completed_at', 'is', null)
          .eq('is_warmup', false)
          .order('workout_sessions(completed_at)', { ascending: false })
          .order('set_number', { ascending: false });

        if (error) {
          console.error('Error fetching last performance:', error);
          setLastPerformance(null);
          setLoading(false);
          return;
        }

        if (!sets || sets.length === 0) {
          setLastPerformance(null);
          setLoading(false);
          return;
        }

        // Get the session_id of the most recent session
        const mostRecentSessionId = sets[0].session_id;

        // Filter sets to only include those from the most recent session
        const setsFromLastSession = sets.filter(s => s.session_id === mostRecentSessionId);

        // Count sets and get weight from the last set (highest set_number)
        const setCount = setsFromLastSession.length;
        const lastSetWeight = setsFromLastSession[0]?.weight ?? 0;

        setLastPerformance({
          setCount,
          weight: lastSetWeight,
          exerciseId,
        });
      } catch (err) {
        console.error('Error in useLastExercisePerformance:', err);
        setLastPerformance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLastPerformance();
  }, [exerciseId]);

  return { lastPerformance, loading };
}
