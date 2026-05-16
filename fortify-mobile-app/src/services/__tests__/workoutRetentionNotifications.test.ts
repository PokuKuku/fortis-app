const mockCancelScheduledNotificationAsync = jest.fn();
const mockGetAllScheduledNotificationsAsync = jest.fn();
const mockGetPermissionsAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn();
const mockSetNotificationChannelAsync = jest.fn();
const mockLoadRetentionNotificationIds = jest.fn();
const mockSaveRetentionNotificationIds = jest.fn();

jest.mock('expo-notifications', () => ({
  AndroidImportance: {
    DEFAULT: 'default',
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
  cancelScheduledNotificationAsync: (...args: unknown[]) => mockCancelScheduledNotificationAsync(...args),
  getAllScheduledNotificationsAsync: (...args: unknown[]) => mockGetAllScheduledNotificationsAsync(...args),
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  scheduleNotificationAsync: (...args: unknown[]) => mockScheduleNotificationAsync(...args),
  setNotificationChannelAsync: (...args: unknown[]) => mockSetNotificationChannelAsync(...args),
}));

jest.mock('@/src/services/workoutRetentionPreferences', () => ({
  loadRetentionNotificationIds: (...args: unknown[]) => mockLoadRetentionNotificationIds(...args),
  saveRetentionNotificationIds: (...args: unknown[]) => mockSaveRetentionNotificationIds(...args),
}));

import { syncRetentionNotifications } from '@/src/services/workoutRetentionNotifications';
import { SCHEDULED_WORKOUT_REMINDER_KIND, WEEKLY_RECAP_KIND } from '@/src/utils/workoutRetention';

const weekdayFromDateKey = (dateKey: string) => new Date(`${dateKey}T12:00:00`).getDay();

describe('syncRetentionNotifications', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-15T09:00:00'));
    jest.clearAllMocks();

    mockLoadRetentionNotificationIds.mockResolvedValue(['persisted-retention-id']);
    mockGetAllScheduledNotificationsAsync.mockResolvedValue([
      {
        identifier: 'stale-scheduled-workout-id',
        content: {
          title: 'Training day is here!',
          data: { kind: SCHEDULED_WORKOUT_REMINDER_KIND },
        },
        trigger: {
          channelId: 'workout-retention',
          date: new Date('2026-05-15T08:00:00'),
        },
      },
      {
        identifier: 'unrelated-id',
        content: {
          title: 'Other notification',
          data: { kind: 'other' },
        },
        trigger: {
          channelId: 'other-channel',
        },
      },
    ]);
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted', granted: true });
    mockSetNotificationChannelAsync.mockResolvedValue(undefined);
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
    mockScheduleNotificationAsync.mockImplementation(async () => `scheduled-${mockScheduleNotificationAsync.mock.calls.length}`);
    mockSaveRetentionNotificationIds.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('cancels stale scheduled workout reminders and reschedules on the selected days and time', async () => {
    await syncRetentionNotifications({
      scheduleDays: [5],
      reminderEnabled: true,
      reminderTime: { hour: 20, minute: 0 },
    });

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('persisted-retention-id');
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('stale-scheduled-workout-id');
    expect(mockCancelScheduledNotificationAsync).not.toHaveBeenCalledWith('unrelated-id');

    const scheduledWorkoutCalls = mockScheduleNotificationAsync.mock.calls.filter(([request]) => (
      request.content.data.kind === SCHEDULED_WORKOUT_REMINDER_KIND
    ));
    expect(scheduledWorkoutCalls.length).toBeGreaterThan(0);
    scheduledWorkoutCalls.forEach(([request]) => {
      const dateKey = request.content.data.dateKey as string;
      const date = request.trigger.date as Date;
      expect(weekdayFromDateKey(dateKey)).toBe(5);
      expect(date.getHours()).toBe(20);
      expect(date.getMinutes()).toBe(0);
    });

    const weeklyRecapCalls = mockScheduleNotificationAsync.mock.calls.filter(([request]) => (
      request.content.data.kind === WEEKLY_RECAP_KIND
    ));
    expect(weeklyRecapCalls).toHaveLength(3);
  });

  it('serializes overlapping syncs so duplicate batches are not left scheduled', async () => {
    mockGetAllScheduledNotificationsAsync
      .mockResolvedValueOnce([])
      .mockImplementation(async () => (
        mockScheduleNotificationAsync.mock.results.map((result, index) => ({
          identifier: result.value instanceof Promise ? `scheduled-${index}` : result.value,
          content: {
            title: 'Training day is here!',
            data: { kind: SCHEDULED_WORKOUT_REMINDER_KIND },
          },
          trigger: {
            channelId: 'workout-retention',
          },
        }))
      ));

    await Promise.all([
      syncRetentionNotifications({
        scheduleDays: [5],
        reminderEnabled: true,
        reminderTime: { hour: 20, minute: 0 },
      }),
      syncRetentionNotifications({
        scheduleDays: [5],
        reminderEnabled: true,
        reminderTime: { hour: 20, minute: 0 },
      }),
    ]);

    expect(mockGetAllScheduledNotificationsAsync).toHaveBeenCalledTimes(2);
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('scheduled-0');
  });
});
