import { useMemo } from 'react';
import { GET_STARTED_TEMPLATE_ID } from '@/src/constants/inAppTour';
import { useWorkoutStore } from '@/src/store/workoutStore';

export function useGetStartedStatus() {
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const completedSessions = useWorkoutStore((s) => s.completedSessions);

  const hasCompletedGetStarted = useMemo(
    () => completedSessions.some((session) => session.programId === GET_STARTED_TEMPLATE_ID),
    [completedSessions]
  );

  const isGetStartedActive = activeSession?.programId === GET_STARTED_TEMPLATE_ID;

  return {
    hasCompletedGetStarted,
    isGetStartedActive,
  };
}

