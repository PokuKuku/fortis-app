const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockGetScopedItem = jest.fn();
const mockSetScopedItem = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissionsAsync(...args),
}));

jest.mock('@/src/utils/scopedStorage', () => ({
  getScopedItem: (...args: unknown[]) => mockGetScopedItem(...args),
  setScopedItem: (...args: unknown[]) => mockSetScopedItem(...args),
}));

import { HAS_REQUESTED_NOTIFICATIONS_KEY } from '@/src/constants/storageKeys';
import { requestNotificationPermissionIfNeeded } from '@/src/services/notificationPermissionService';

const expectedPermissionRequest = {
  ios: {
    allowAlert: true,
    allowBadge: true,
    allowSound: true,
    provideAppNotificationSettings: true,
  },
};

describe('requestNotificationPermissionIfNeeded', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetScopedItem.mockResolvedValue(null);
    mockSetScopedItem.mockResolvedValue(undefined);
    mockRequestPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
    });
  });

  it('requests permission when iOS is still undetermined even if local storage says it already asked', async () => {
    mockGetPermissionsAsync.mockResolvedValue({
      status: 'undetermined',
      granted: false,
      canAskAgain: true,
    });
    mockGetScopedItem.mockResolvedValue('true');

    const permission = await requestNotificationPermissionIfNeeded();

    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockRequestPermissionsAsync).toHaveBeenCalledWith(expectedPermissionRequest);
    expect(mockSetScopedItem).toHaveBeenCalledWith(HAS_REQUESTED_NOTIFICATIONS_KEY, 'true');
    expect(permission).toEqual({
      status: 'granted',
      granted: true,
      canAskAgain: true,
    });
  });

  it('records that the native prompt was shown when the user denies it', async () => {
    mockGetPermissionsAsync.mockResolvedValue({
      status: 'undetermined',
      granted: false,
      canAskAgain: true,
    });
    mockRequestPermissionsAsync.mockResolvedValue({
      status: 'denied',
      granted: false,
      canAskAgain: false,
    });

    const permission = await requestNotificationPermissionIfNeeded();

    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockRequestPermissionsAsync).toHaveBeenCalledWith(expectedPermissionRequest);
    expect(mockSetScopedItem).toHaveBeenCalledWith(HAS_REQUESTED_NOTIFICATIONS_KEY, 'true');
    expect(permission).toEqual({
      status: 'denied',
      granted: false,
      canAskAgain: false,
    });
  });

  it('does not request again after a determinate denied permission was already tracked', async () => {
    mockGetPermissionsAsync.mockResolvedValue({
      status: 'denied',
      granted: false,
      canAskAgain: true,
    });
    mockGetScopedItem.mockResolvedValue('true');

    await requestNotificationPermissionIfNeeded();

    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockSetScopedItem).not.toHaveBeenCalled();
  });

  it('requests the iOS app notification settings link for already-granted users missing it', async () => {
    mockGetPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
      ios: {
        providesAppNotificationSettings: false,
      },
    });
    mockRequestPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
      ios: {
        providesAppNotificationSettings: true,
      },
    });

    await expect(requestNotificationPermissionIfNeeded()).resolves.toEqual({
      status: 'granted',
      granted: true,
      canAskAgain: true,
      ios: {
        providesAppNotificationSettings: true,
      },
    });

    expect(mockRequestPermissionsAsync).toHaveBeenCalledWith(expectedPermissionRequest);
    expect(mockSetScopedItem).not.toHaveBeenCalled();
  });

  it('does not request when iOS says it cannot ask again', async () => {
    mockGetPermissionsAsync.mockResolvedValue({
      status: 'denied',
      granted: false,
      canAskAgain: false,
    });

    await requestNotificationPermissionIfNeeded();

    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockGetScopedItem).not.toHaveBeenCalled();
  });
});
