import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';
import { HAS_REQUESTED_NOTIFICATIONS_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

type NotificationPermission = {
  status: string;
  granted: boolean;
  canAskAgain?: boolean;
  ios?: {
    providesAppNotificationSettings?: boolean;
  };
};

const NOTIFICATION_PERMISSION_REQUEST = {
  ios: {
    allowAlert: true,
    allowBadge: true,
    allowSound: true,
    provideAppNotificationSettings: true,
  },
} as const;

const isGranted = ({ granted, status }: NotificationPermission) => (
  granted || status === 'granted'
);

const canRequestPermission = ({ granted, status, canAskAgain = true }: NotificationPermission) => (
  !isGranted({ granted, status }) && canAskAgain
);

export async function getNotificationPermissionStatus(): Promise<NotificationPermission | null> {
  if (typeof Notifications.getPermissionsAsync !== 'function') {
    return null;
  }

  return Notifications.getPermissionsAsync();
}

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (typeof Notifications.requestPermissionsAsync !== 'function') {
    return null;
  }

  return Notifications.requestPermissionsAsync(NOTIFICATION_PERMISSION_REQUEST);
}

export async function openNotificationSettings(): Promise<void> {
  if (typeof Linking.openSettings === 'function') {
    await Linking.openSettings();
  }
}

export async function requestNotificationPermissionIfNeeded(): Promise<NotificationPermission | null> {
  const permission = await getNotificationPermissionStatus();
  if (!permission) return null;

  if (isGranted(permission) && permission.ios?.providesAppNotificationSettings !== true) {
    return await requestNotificationPermission();
  }

  if (!canRequestPermission(permission)) {
    return permission;
  }

  const alreadyRequested = await getScopedItem(HAS_REQUESTED_NOTIFICATIONS_KEY);
  if (permission.status !== 'undetermined' && alreadyRequested === 'true') {
    return permission;
  }

  const nextPermission = await requestNotificationPermission();
  if (!nextPermission) return permission;

  await setScopedItem(HAS_REQUESTED_NOTIFICATIONS_KEY, 'true');
  return nextPermission;
}
