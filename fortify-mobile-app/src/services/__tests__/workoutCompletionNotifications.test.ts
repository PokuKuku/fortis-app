const mockGetPermissionsAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn();
const mockSetNotificationChannelAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  AndroidImportance: {
    DEFAULT: 'default',
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  scheduleNotificationAsync: (...args: unknown[]) => mockScheduleNotificationAsync(...args),
  setNotificationChannelAsync: (...args: unknown[]) => mockSetNotificationChannelAsync(...args),
}));

import { scheduleWorkoutCompletionNotification } from '@/src/services/workoutCompletionNotifications';
import type { WorkoutSession } from '@/src/types/workout';

const buildSession = (completedAt: Date): WorkoutSession => ({
  localId: 'session-1',
  name: 'Upper',
  exercises: [],
  startedAt: completedAt,
  completedAt,
  isSynced: false,
} as unknown as WorkoutSession);

describe('scheduleWorkoutCompletionNotification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-18T15:00:00'));
    jest.clearAllMocks();
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted', granted: true });
    mockScheduleNotificationAsync.mockResolvedValue('completion-notification-id');
    mockSetNotificationChannelAsync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('schedules a supportive notification 30 minutes after a completed workout', async () => {
    const id = await scheduleWorkoutCompletionNotification(buildSession(new Date('2026-05-18T15:00:00')));

    expect(id).toBe('completion-notification-id');
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const request = mockScheduleNotificationAsync.mock.calls[0][0];
    expect(request.content.title).toEqual(expect.any(String));
    expect(request.content.body).toContain('!');
    expect(request.content.data).toEqual({
      kind: 'workout-completion-celebration',
      workoutId: 'session-1',
    });
    expect(request.trigger.date).toEqual(new Date('2026-05-18T15:30:00'));
  });

  it('does not schedule when notification permission is not granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied', granted: false });

    const id = await scheduleWorkoutCompletionNotification(buildSession(new Date('2026-05-18T15:00:00')));

    expect(id).toBeNull();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('does not schedule for backdated workouts whose celebration time has passed', async () => {
    const id = await scheduleWorkoutCompletionNotification(buildSession(new Date('2026-05-18T14:00:00')));

    expect(id).toBeNull();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
