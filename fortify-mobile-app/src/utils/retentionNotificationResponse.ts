import { isValid, parseISO } from 'date-fns';
import {
  SCHEDULED_WORKOUT_REMINDER_KIND,
  WEEKLY_RECAP_KIND,
  type RetentionNotificationKind,
} from '@/src/utils/workoutRetention';

type NotificationResponseLike = {
  notification: {
    request: {
      identifier?: string;
      content: {
        data?: Record<string, unknown> | null;
      };
    };
  };
};

export type RetentionNotificationIntent = {
  id: string | null;
  kind: RetentionNotificationKind;
  weeklyRecapWeekStart: Date | null;
};

const parseWeekStartDate = (dateKey: unknown): Date | null => {
  if (typeof dateKey !== 'string' || dateKey.trim().length === 0) {
    return null;
  }

  const parsed = parseISO(`${dateKey}T00:00:00`);
  return isValid(parsed) ? parsed : null;
};

export function getRetentionNotificationIntent(
  response: NotificationResponseLike | null | undefined
): RetentionNotificationIntent | null {
  const request = response?.notification.request;
  if (!request) return null;

  const data = request?.content.data;
  const kind = data?.kind;

  if (kind !== WEEKLY_RECAP_KIND && kind !== SCHEDULED_WORKOUT_REMINDER_KIND) {
    return null;
  }

  return {
    id: request.identifier ?? null,
    kind,
    weeklyRecapWeekStart: kind === WEEKLY_RECAP_KIND
      ? parseWeekStartDate(data?.dateKey)
      : null,
  };
}
