import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { WeeklyProgressCarousel } from '@/src/components/program/WeeklyProgressCarousel';
import { StreakPercentileCelebrationModal } from '@/src/components/retention/StreakPercentileCelebrationModal';
import { PAYWALL_PLACEMENTS } from '@/src/components/superwall/paywallPlacements';
import { useWorkoutStore } from '@/src/store/workoutStore';
import {
  DEV_HOME_TEST_CONTROLS_VISIBLE_KEY,
  PENDING_HOME_WORKOUT_CELEBRATION_KEY,
} from '@/src/constants/storageKeys';
import { getScopedItem, removeScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { saveDevHomeTestControlsVisible } from '@/src/services/devPreferencesService';

const mockRunProFeature = jest.fn();
let mockIsPro = false;

jest.mock('@/src/components/superwall/useProFeatureGate', () => ({
  useProFeatureGate: jest.fn(() => ({
    isPro: mockIsPro,
    runProFeature: mockRunProFeature,
  })),
}));

jest.mock('@/src/components/tour/TourAnchor', () => ({
  TourAnchor: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
  },
  NotificationFeedbackType: {
    Success: 'success',
  },
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
}));

describe('WeeklyProgressCarousel streak paywall', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockIsPro = false;
    mockRunProFeature.mockResolvedValue(false);
    useWorkoutStore.getState().resetStore();
    await Promise.all([
      removeScopedItem(PENDING_HOME_WORKOUT_CELEBRATION_KEY),
      removeScopedItem(DEV_HOME_TEST_CONTROLS_VISIBLE_KEY),
    ]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens the workout streak placement from the Go Pro button', () => {
    const { getByLabelText } = render(
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[1, 2, 3]}
          sessions={[]}
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );

    fireEvent.press(getByLabelText('Go Pro to view workout streak'));

    expect(mockRunProFeature).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: PAYWALL_PLACEMENTS.workoutStreak,
        params: expect.objectContaining({
          action: 'view_workout_streak',
          source: 'weekly_progress',
        }),
      }),
      expect.any(Function),
    );
  });

  it('opens streak options and pauses the streak for pro users', () => {
    mockIsPro = true;
    const today = new Date();

    const { getByLabelText, getByText } = render(
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[]}
          sessions={[
            {
              localId: 'session-today',
              name: 'Today',
              startedAt: today,
              completedAt: today,
              exercises: [],
            } as any,
          ]}
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );

    fireEvent.press(getByLabelText('Open workout streak options'));
    fireEvent.press(getByText('Pause'));

    expect(useWorkoutStore.getState().isStreakPaused).toBe(true);
    expect(useWorkoutStore.getState().pausedStreakCount).toBe(1);
    expect(useWorkoutStore.getState().streakPausesUsedThisMonth).toBe(1);
    expect(getByText('2 left this month')).toBeTruthy();
    expect(getByText('Pauses reset next month.')).toBeTruthy();
    expect(getByText('Earn at a 5-workout streak')).toBeTruthy();
    expect(getByText('Paused')).toBeTruthy();
  });

  it('previews a streak increase from the development-only test button', () => {
    mockIsPro = true;
    const today = new Date();

    const view = render(
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[]}
          sessions={[
            {
              localId: 'session-today',
              name: 'Today',
              startedAt: today,
              completedAt: today,
              exercises: [],
            } as any,
          ]}
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );

    fireEvent.press(view.getByLabelText('Test streak increase'));

    expect(view.getByTestId('streak-number-current').props.children).toBe(2);
    expect(view.getByTestId('streak-number-outgoing').props.children).toBe(1);
  });

  it('hides every home test control when the developer preference is disabled', async () => {
    mockIsPro = true;

    const view = render(
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[]}
          sessions={[]}
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );

    await act(async () => {
      await saveDevHomeTestControlsVisible(false);
    });

    await waitFor(() => {
      expect(view.queryByLabelText('Test streak percentile celebration')).toBeNull();
      expect(view.queryByLabelText('Test completed day animation')).toBeNull();
      expect(view.queryByLabelText('Test streak increase')).toBeNull();
    });
  });

  it('previews a completed-day transition from the development-only test button', async () => {
    const view = render(
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[]}
          sessions={[]}
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );

    fireEvent.press(view.getByLabelText('Test completed day animation'));

    await waitFor(() => {
      expect(view.queryAllByTestId('completed-day-check-glow').length).toBeGreaterThan(0);
    });
  });

  it('replaces a past frozen scheduled-day circle with the Frost snowflake', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-08T12:00:00-04:00'));
    useWorkoutStore.setState({
      streakPausePeriods: [{
        startDateKey: '2026-08-05',
        endDateKey: '2026-08-05',
      }],
    });

    const view = render(
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[3]}
          sessions={[]}
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );

    const frozenDay = view.getByLabelText('Wednesday, Aug 5, frozen scheduled workout day');
    expect(frozenDay).toBeTruthy();
    fireEvent.press(frozenDay);
    expect(view.getByText('Scheduled workout frozen')).toBeTruthy();

  });

  it('replays both celebrations on the first focused visit after a scheduled workout', async () => {
    mockIsPro = true;
    const completedAt = new Date();
    const completedSession = {
      localId: 'newly-completed-session',
      name: 'Scheduled workout',
      notes: '',
      startedAt: completedAt,
      completedAt,
      exercises: [],
      isSynced: false,
    } as any;
    await setScopedItem(
      PENDING_HOME_WORKOUT_CELEBRATION_KEY,
      JSON.stringify({
        sessionLocalId: completedSession.localId,
        completedAt: completedAt.toISOString(),
      })
    );

    const view = render(
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[completedAt.getDay()]}
          sessions={[completedSession]}
          isFocused
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(view.getByText("YOU'RE ON FIRE!")).toBeTruthy();
      expect(view.getByLabelText('1 day streak')).toBeTruthy();
    });
    expect(view.queryAllByTestId('completed-day-check-glow')).toHaveLength(0);
    expect(view.queryByTestId('streak-number-outgoing')).toBeNull();

    fireEvent.press(view.getByLabelText('Continue from streak celebration'));

    await waitFor(() => {
      expect(view.getByTestId('streak-number-outgoing').props.children).toBe(0);
    });
    expect(view.queryAllByTestId('completed-day-check-glow').length).toBeGreaterThan(0);
  });

  it('keeps a streak milestone queued while a higher-priority completion modal is visible', async () => {
    const completedAt = new Date();
    const completedSession = {
      localId: 'deferred-celebration-session',
      name: 'Challenge-completing workout',
      notes: '',
      startedAt: completedAt,
      completedAt,
      exercises: [],
      isSynced: false,
    } as any;
    await setScopedItem(
      PENDING_HOME_WORKOUT_CELEBRATION_KEY,
      JSON.stringify({
        sessionLocalId: completedSession.localId,
        completedAt: completedAt.toISOString(),
      })
    );

    const renderCarousel = (deferMilestoneCelebration: boolean) => (
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[completedAt.getDay()]}
          sessions={[completedSession]}
          isFocused
          deferMilestoneCelebration={deferMilestoneCelebration}
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );
    const view = render(renderCarousel(true));

    await waitFor(async () => {
      expect(await getScopedItem(PENDING_HOME_WORKOUT_CELEBRATION_KEY)).not.toBeNull();
    });
    expect(view.queryByTestId('streak-percentile-modal')).toBeNull();

    view.rerender(renderCarousel(false));

    await waitFor(() => {
      expect(view.getByTestId('streak-percentile-modal')).toBeTruthy();
    });
  });

  it('does not replay a stale celebration for a second workout on the same day', async () => {
    mockIsPro = true;
    const firstCompletedAt = new Date('2026-08-06T09:00:00-04:00');
    const secondCompletedAt = new Date('2026-08-06T18:00:00-04:00');
    const sessions = [
      {
        localId: 'second-workout',
        name: 'Second workout',
        notes: '',
        startedAt: secondCompletedAt,
        completedAt: secondCompletedAt,
        exercises: [],
        isSynced: false,
      },
      {
        localId: 'first-workout',
        name: 'First workout',
        notes: '',
        startedAt: firstCompletedAt,
        completedAt: firstCompletedAt,
        exercises: [],
        isSynced: false,
      },
    ] as any;
    await setScopedItem(
      PENDING_HOME_WORKOUT_CELEBRATION_KEY,
      JSON.stringify({
        sessionLocalId: 'second-workout',
        completedAt: secondCompletedAt.toISOString(),
      })
    );

    const view = render(
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[secondCompletedAt.getDay()]}
          sessions={sessions}
          isFocused
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );

    await waitFor(async () => {
      expect(await getScopedItem(PENDING_HOME_WORKOUT_CELEBRATION_KEY)).toBeNull();
    });
    expect(view.queryByTestId('streak-percentile-modal')).toBeNull();
  });

  it('cycles the development-only percentile modal preview', async () => {
    const view = render(
      <ThemeProvider>
        <WeeklyProgressCarousel
          scheduleDays={[]}
          sessions={[]}
          onEditSchedule={jest.fn()}
        />
      </ThemeProvider>
    );

    fireEvent.press(view.getByLabelText('Test streak percentile celebration'));
    expect(view.getByLabelText('1 day streak')).toBeTruthy();

    fireEvent.press(view.getByLabelText('Continue from streak celebration'));
    await waitFor(() => {
      expect(view.queryAllByTestId('completed-day-check-glow').length).toBeGreaterThan(0);
    });

    fireEvent.press(view.getByLabelText('Test streak percentile celebration'));
    expect(view.getByLabelText('2 day streak')).toBeTruthy();

    fireEvent.press(view.getByLabelText('Continue from streak celebration'));
    const closingModal = view.UNSAFE_getByType(StreakPercentileCelebrationModal);
    expect(closingModal.props.visible).toBe(false);
    expect(closingModal.props.streak).toBe(2);
  });
});
