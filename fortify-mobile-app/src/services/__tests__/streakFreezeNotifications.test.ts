const mockGetPermissionsAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn();
const mockSetNotificationChannelAsync = jest.fn();
const mockSetNotificationHandler = jest.fn();

jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 'high' },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  scheduleNotificationAsync: (...args: unknown[]) => mockScheduleNotificationAsync(...args),
  setNotificationChannelAsync: (...args: unknown[]) => mockSetNotificationChannelAsync(...args),
  setNotificationHandler: (...args: unknown[]) => mockSetNotificationHandler(...args),
}));

import {
  configureStreakFreezeNotificationPresentation,
  notifyStreakFreezePassEarned,
  notifyStreakFreezePassRedeemed,
} from '@/src/services/streakFreezeNotifications';

describe('streak freeze notifications', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-06T12:00:00'));
    jest.clearAllMocks();
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted', granted: true });
    mockScheduleNotificationAsync.mockResolvedValue('notification-id');
    mockSetNotificationChannelAsync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('notifies the user when the fifth scheduled workout earns a pass', async () => {
    await expect(notifyStreakFreezePassEarned('2026-08-06'))
      .resolves.toBe('notification-id');

    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({
        title: '❄️ Streak Freeze Pass Earned!',
        data: { kind: 'streak-freeze-pass-earned', dateKey: '2026-08-06' },
      }),
    }));
  });

  it('notifies the user when a pass protects a missed workout', async () => {
    await notifyStreakFreezePassRedeemed('2026-08-05');

    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({
        title: '❄️ Streak Freeze Activated',
        body: expect.stringContaining('saved your progress'),
        data: { kind: 'streak-freeze-pass-redeemed', dateKey: '2026-08-05' },
      }),
    }));
  });

  it('does nothing when notifications are not permitted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied', granted: false });

    await expect(notifyStreakFreezePassEarned('2026-08-06')).resolves.toBeNull();
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('presents streak freeze notifications while the app is foregrounded', async () => {
    configureStreakFreezeNotificationPresentation();
    const handler = mockSetNotificationHandler.mock.calls[0][0];

    await expect(handler.handleNotification({
      request: { content: { data: { kind: 'streak-freeze-pass-redeemed' } } },
    })).resolves.toEqual(expect.objectContaining({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
    }));
  });
});
