import { Linking } from 'react-native';
import { Audio } from 'expo-av';

export type MicrophonePermissionResponse = Awaited<ReturnType<typeof Audio.getPermissionsAsync>>;

export async function getMicrophonePermissionStatus(): Promise<MicrophonePermissionResponse> {
  return Audio.getPermissionsAsync();
}

export async function ensureMicrophonePermission(): Promise<MicrophonePermissionResponse> {
  const currentPermission = await getMicrophonePermissionStatus();
  if (currentPermission.granted) {
    return currentPermission;
  }

  if (currentPermission.status === 'undetermined' || currentPermission.canAskAgain) {
    return Audio.requestPermissionsAsync();
  }

  return currentPermission;
}

export async function openMicrophoneSettings(): Promise<void> {
  if (typeof Linking.openSettings === 'function') {
    await Linking.openSettings();
  }
}
