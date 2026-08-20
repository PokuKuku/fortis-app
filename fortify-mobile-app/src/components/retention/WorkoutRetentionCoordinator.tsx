import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import type { Exercise } from '@/src/types/exercise';
import { useAuth } from '@/src/contexts/AuthContext';
import { useInAppTour } from '@/src/contexts/InAppTourContext';
import { useExerciseLookup } from '@/src/hooks/useExerciseLookup';
import { useWorkoutHistorySource } from '@/src/hooks/useWorkoutHistorySource';
import { useWorkoutRetentionPreferences } from '@/src/hooks/useWorkoutRetentionPreferences';
import { useWorkoutSchedule } from '@/src/hooks/useWorkoutSchedule';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { syncRetentionNotifications } from '@/src/services/workoutRetentionNotifications';
import {
  getLastAcknowledgedWeeklyRecapKey,
  getLastShownWeeklyRecapKey,
  setLastAcknowledgedWeeklyRecapKey,
  setLastShownWeeklyRecapKey,
} from '@/src/services/workoutRetentionPreferences';
import {
  buildWeeklyRecap,
  getDueWeeklyRecapWeekStart,
  isWeeklyRecapEligible,
  WEEKLY_RECAP_KIND,
  type WeeklyRecap,
} from '@/src/utils/workoutRetention';
import { getRetentionNotificationIntent } from '@/src/utils/retentionNotificationResponse';
import { WeeklyRecapModal } from '@/src/components/retention/WeeklyRecapModal';
import {
  notifyStreakFreezePassEarned,
  notifyStreakFreezePassRedeemed,
} from '@/src/services/streakFreezeNotifications';
import {
  getDateKey,
  getFirstMissedScheduledWorkoutDateKey,
  getLatestScheduledCompletionDateKey,
  getScheduledWorkoutCompletionCountAfterDateKey,
  getScheduledWorkoutDayStreak,
  getStreakFreezeProgressResetDateKey,
  shouldEarnStreakFreezePass,
} from '@/src/utils/workoutSchedule';

function WorkoutRetentionCoordinatorContent() {
  const { user, profile } = useAuth();
  const { scheduleDays, scheduleHistory, isLoaded: scheduleLoaded } = useWorkoutSchedule();
  const { sessions, isLoading: historyLoading } = useWorkoutHistorySource({ enabled: Boolean(user) });
  const { exercisesById, loading: exercisesLoading } = useExerciseLookup();
  const weightUnits = useWorkoutStore((state) => state.weightUnits);
  const streakPausePeriods = useWorkoutStore((state) => state.streakPausePeriods);
  const streakFreezePassAvailable = useWorkoutStore((state) => state.streakFreezePassAvailable);
  const streakFreezePassMilestoneDateKey = useWorkoutStore(
    (state) => state.streakFreezePassMilestoneDateKey
  );
  const earnStreakFreezePass = useWorkoutStore((state) => state.earnStreakFreezePass);
  const redeemStreakFreezePass = useWorkoutStore((state) => state.redeemStreakFreezePass);
  const preferences = useWorkoutRetentionPreferences();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const handledNotificationResponseIdsRef = useRef(new Set<string>());
  const [pendingWeeklyRecapWeekStart, setPendingWeeklyRecapWeekStart] = useState<Date | null>(null);
  const [weeklyRecap, setWeeklyRecap] = useState<WeeklyRecap | null>(null);
  const [weeklyRecapVisible, setWeeklyRecapVisible] = useState(false);
  const [currentDateKey, setCurrentDateKey] = useState(() => getDateKey(new Date()));
  const retentionDataReady = Boolean(user) && scheduleLoaded && !historyLoading && !exercisesLoading;

  const sessionsKey = useMemo(
    () => sessions.map((session) => `${session.localId}:${session.completedAt?.getTime() ?? 0}`).join('|'),
    [sessions]
  );
  const scheduleKey = scheduleDays.join(',');
  const scheduleHistoryKey = scheduleHistory
    .map((entry) => `${entry.effectiveDateKey}:${entry.scheduleDays.join(',')}`)
    .join('|');
  const currentStreak = useMemo(() => getScheduledWorkoutDayStreak({
    scheduleDays,
    scheduleHistory,
    sessions,
    streakPausePeriods,
  }), [scheduleDays, scheduleHistory, sessions, streakPausePeriods, currentDateKey]);
  const latestScheduledCompletionDateKey = useMemo(
    () => getLatestScheduledCompletionDateKey({ scheduleDays, scheduleHistory, sessions }),
    [scheduleDays, scheduleHistory, sessions]
  );
  const streakFreezeProgressResetDateKey = useMemo(
    () => getStreakFreezeProgressResetDateKey({
      streakFreezePassMilestoneDateKey,
      streakPausePeriods,
    }),
    [currentDateKey, streakFreezePassMilestoneDateKey, streakPausePeriods]
  );
  const scheduledCompletionsAfterFreezeProgressReset = useMemo(
    () => streakFreezeProgressResetDateKey
      ? getScheduledWorkoutCompletionCountAfterDateKey({
        afterDateKey: streakFreezeProgressResetDateKey,
        scheduleDays,
        scheduleHistory,
        sessions,
      })
      : 0,
    [scheduleDays, scheduleHistory, sessions, streakFreezeProgressResetDateKey]
  );

  const reconcileStreakFreezePass = useCallback(async () => {
    if (!retentionDataReady) return;

    if (
      latestScheduledCompletionDateKey
      && shouldEarnStreakFreezePass({
        currentStreak,
        latestScheduledCompletionDateKey,
        scheduledCompletionsAfterProgressReset: scheduledCompletionsAfterFreezeProgressReset,
        streakFreezePassAvailable,
        streakFreezeProgressResetDateKey,
      })
    ) {
      const earned = await earnStreakFreezePass(latestScheduledCompletionDateKey);
      if (earned) {
        await notifyStreakFreezePassEarned(latestScheduledCompletionDateKey);
      }
      return;
    }

    if (!streakFreezePassAvailable || !streakFreezePassMilestoneDateKey) return;
    const missedDateKey = getFirstMissedScheduledWorkoutDateKey({
      afterDateKey: streakFreezePassMilestoneDateKey,
      scheduleDays,
      scheduleHistory,
      sessions,
      streakPausePeriods,
    });
    if (!missedDateKey) return;

    const redeemed = await redeemStreakFreezePass(missedDateKey);
    if (redeemed) {
      await notifyStreakFreezePassRedeemed(missedDateKey);
    }
  }, [
    currentStreak,
    earnStreakFreezePass,
    latestScheduledCompletionDateKey,
    redeemStreakFreezePass,
    retentionDataReady,
    scheduleDays,
    scheduleHistory,
    scheduledCompletionsAfterFreezeProgressReset,
    sessions,
    streakFreezePassAvailable,
    streakFreezePassMilestoneDateKey,
    streakFreezeProgressResetDateKey,
    streakPausePeriods,
  ]);

  const syncNotifications = useCallback(() => {
    if (!preferences.isLoaded) return;
    void syncRetentionNotifications({
      scheduleDays,
      reminderEnabled: preferences.reminderEnabled,
      reminderTime: preferences.reminderTime,
      accountCreatedAt: profile?.created_at,
    });
  }, [
    preferences.isLoaded,
    preferences.reminderEnabled,
    preferences.reminderTime,
    profile?.created_at,
    scheduleKey,
    scheduleDays,
  ]);

  const buildRecapForWeek = useCallback((weekStart: Date) => buildWeeklyRecap({
    weekStart,
    scheduleDays,
    scheduleHistory,
    sessions,
    exercisesById: exercisesById as unknown as Map<string, Exercise>,
    preferredUnits: profile?.preferred_units === 'metric' ? 'metric' : 'imperial',
    weightUnits,
  }), [exercisesById, profile?.preferred_units, scheduleDays, scheduleHistory, sessions, weightUnits]);

  const maybeShowWeeklyRecap = useCallback(async (forceWeekStart?: Date | null) => {
    if (!retentionDataReady) return;
    const dueWeekStart = forceWeekStart ?? getDueWeeklyRecapWeekStart();
    if (!dueWeekStart) return;
    if (!isWeeklyRecapEligible({ weekStart: dueWeekStart, accountCreatedAt: profile?.created_at })) return;
    const recap = buildRecapForWeek(dueWeekStart);
    const lastShown = await getLastShownWeeklyRecapKey();
    const lastAcknowledged = await getLastAcknowledgedWeeklyRecapKey();
    if (!forceWeekStart && (lastShown === recap.weekKey || lastAcknowledged === recap.weekKey)) return;
    await setLastShownWeeklyRecapKey(recap.weekKey);
    setWeeklyRecap(recap);
    setWeeklyRecapVisible(true);
  }, [buildRecapForWeek, profile?.created_at, retentionDataReady]);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse | null | undefined) => {
    const intent = getRetentionNotificationIntent(response);
    if (!intent) return false;

    if (intent.id) {
      if (handledNotificationResponseIdsRef.current.has(intent.id)) {
        return true;
      }
      handledNotificationResponseIdsRef.current.add(intent.id);
    }

    router.replace('/(tabs)');

    if (intent.kind === WEEKLY_RECAP_KIND) {
      setPendingWeeklyRecapWeekStart(intent.weeklyRecapWeekStart ?? getDueWeeklyRecapWeekStart());
    }

    return true;
  }, []);

  useEffect(() => {
    syncNotifications();
  }, [syncNotifications]);

  useEffect(() => {
    void maybeShowWeeklyRecap();
  }, [maybeShowWeeklyRecap, sessionsKey, scheduleKey, scheduleHistoryKey]);

  useEffect(() => {
    void reconcileStreakFreezePass();
  }, [reconcileStreakFreezePass, currentDateKey]);

  useEffect(() => {
    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 1, 0);
    const timeout = setTimeout(() => {
      setCurrentDateKey(getDateKey(new Date()));
    }, Math.max(1000, nextDay.getTime() - now.getTime()));
    return () => clearTimeout(timeout);
  }, [currentDateKey]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previous = appStateRef.current;
      appStateRef.current = nextState;
      if ((previous === 'background' || previous === 'inactive') && nextState === 'active') {
        setCurrentDateKey(getDateKey(new Date()));
        syncNotifications();
        void maybeShowWeeklyRecap();
        void reconcileStreakFreezePass();
      }
    });
    return () => subscription.remove();
  }, [maybeShowWeeklyRecap, reconcileStreakFreezePass, syncNotifications]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response);
    });
    return () => subscription.remove();
  }, [handleNotificationResponse]);

  useEffect(() => {
    let didCancel = false;

    const handleLastNotificationResponse = async () => {
      let response: Notifications.NotificationResponse | null = null;
      try {
        response = Notifications.getLastNotificationResponse();
      } catch {
        return;
      }

      if (didCancel || !handleNotificationResponse(response)) return;

      try {
        Notifications.clearLastNotificationResponse();
      } catch {
        // Older/native builds can lack this method; duplicate protection still keeps this safe.
      }
    };

    void handleLastNotificationResponse();

    return () => {
      didCancel = true;
    };
  }, [handleNotificationResponse]);

  useEffect(() => {
    if (!pendingWeeklyRecapWeekStart || !retentionDataReady) return;

    const weekStart = pendingWeeklyRecapWeekStart;
    setPendingWeeklyRecapWeekStart(null);
    void maybeShowWeeklyRecap(weekStart);
  }, [maybeShowWeeklyRecap, pendingWeeklyRecapWeekStart, retentionDataReady]);

  const handleCloseWeeklyRecap = () => {
    const recapKey = weeklyRecap?.weekKey;
    setWeeklyRecapVisible(false);
    if (recapKey) {
      void setLastAcknowledgedWeeklyRecapKey(recapKey);
    }
  };

  return (
    <>
      <WeeklyRecapModal
        visible={weeklyRecapVisible}
        recap={weeklyRecap}
        userName={profile?.full_name}
        onClose={handleCloseWeeklyRecap}
        onDismiss={() => setWeeklyRecap(null)}
      />
    </>
  );
}

export function WorkoutRetentionCoordinator() {
  const { hasTourFinished } = useInAppTour();
  const { isDeferredHydrationComplete } = useAuth();
  const [shouldMountContent, setShouldMountContent] = useState(false);

  useEffect(() => {
    if (!hasTourFinished || !isDeferredHydrationComplete) {
      setShouldMountContent(false);
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      setShouldMountContent(true);
    });
    return () => task.cancel();
  }, [hasTourFinished, isDeferredHydrationComplete]);

  return shouldMountContent ? <WorkoutRetentionCoordinatorContent /> : null;
}
