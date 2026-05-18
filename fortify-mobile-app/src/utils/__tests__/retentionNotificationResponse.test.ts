import { getRetentionNotificationIntent } from '@/src/utils/retentionNotificationResponse';
import {
  SCHEDULED_WORKOUT_REMINDER_KIND,
  WEEKLY_RECAP_KIND,
} from '@/src/utils/workoutRetention';

const response = (data: Record<string, unknown>, identifier = 'notification-id') => ({
  notification: {
    request: {
      identifier,
      content: {
        data,
      },
    },
  },
});

describe('getRetentionNotificationIntent', () => {
  it('extracts the weekly recap week start from notification data', () => {
    const intent = getRetentionNotificationIntent(response({
      kind: WEEKLY_RECAP_KIND,
      dateKey: '2026-05-10',
    }));

    expect(intent).toMatchObject({
      id: 'notification-id',
      kind: WEEKLY_RECAP_KIND,
    });
    expect(intent?.weeklyRecapWeekStart?.toISOString().slice(0, 10)).toBe('2026-05-10');
  });

  it('accepts scheduled workout reminder notifications without a recap date', () => {
    const intent = getRetentionNotificationIntent(response({
      kind: SCHEDULED_WORKOUT_REMINDER_KIND,
      dateKey: '2026-05-18',
    }));

    expect(intent).toEqual({
      id: 'notification-id',
      kind: SCHEDULED_WORKOUT_REMINDER_KIND,
      weeklyRecapWeekStart: null,
    });
  });

  it('ignores unrelated notification payloads', () => {
    expect(getRetentionNotificationIntent(response({ kind: 'other' }))).toBeNull();
    expect(getRetentionNotificationIntent(null)).toBeNull();
  });
});
